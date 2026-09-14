import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.hashing import sha256_of_file, compute_event_hash
from app.auth import get_current_user, require_role

router = APIRouter()

STORAGE_DIR = os.getenv("LOCAL_STORAGE_DIR", "storage")
os.makedirs(STORAGE_DIR, exist_ok=True)

MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_MB", "50")) * 1024 * 1024  # default 50 MB


def _log_custody_event(db: Session, evidence_id: uuid.UUID, actor_id: uuid.UUID, action: str):
    """Append a new custody event, chained to the last one for this evidence."""
    last_event = (
        db.query(models.CustodyEvent)
        .filter(models.CustodyEvent.evidence_id == evidence_id)
        .order_by(models.CustodyEvent.timestamp.desc())
        .first()
    )
    prev_hash = last_event.event_hash if last_event else None
    timestamp = datetime.now(timezone.utc).isoformat()

    event_hash = compute_event_hash(prev_hash, str(evidence_id), str(actor_id), action, timestamp)

    event = models.CustodyEvent(
        evidence_id=evidence_id,
        actor_id=actor_id,
        action=action,
        prev_event_hash=prev_hash,
        event_hash=event_hash,
    )
    db.add(event)
    db.commit()
    return event


def _assert_can_access(evidence: models.Evidence, current_user: models.User):
    """
    Ownership check. Auditors and admins can access any evidence (they need
    full visibility to audit/administer). Investigators and custodians can
    only access evidence they personally uploaded — being logged in with the
    right role isn't enough on its own; you also need to be the party who
    handled this specific piece of evidence.
    """
    if current_user.role in ("auditor", "admin"):
        return
    if evidence.uploaded_by == current_user.id:
        return
    raise HTTPException(status_code=403, detail="You are not authorized to access this evidence")


@router.post("/evidence/upload")
async def upload_evidence(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("investigator", "custodian", "admin")),
):
    contents = await file.read()

    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds the {MAX_UPLOAD_BYTES // (1024*1024)} MB upload limit",
        )

    file_hash = sha256_of_file(contents)

    storage_path = os.path.join(STORAGE_DIR, f"{uuid.uuid4()}_{file.filename}")
    with open(storage_path, "wb") as f:
        f.write(contents)

    evidence = models.Evidence(
        filename=file.filename,
        storage_path=storage_path,
        sha256_hash=file_hash,
        uploaded_by=current_user.id,
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    _log_custody_event(db, evidence.id, current_user.id, action="upload")

    return {
        "evidence_id": str(evidence.id),
        "filename": evidence.filename,
        "sha256_hash": evidence.sha256_hash,
    }


@router.post("/evidence/{evidence_id}/verify")
def verify_evidence(
    evidence_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    evidence = db.query(models.Evidence).filter(models.Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    _assert_can_access(evidence, current_user)

    if not os.path.exists(evidence.storage_path):
        raise HTTPException(status_code=410, detail="Stored file is missing")

    with open(evidence.storage_path, "rb") as f:
        current_hash = sha256_of_file(f.read())

    matches = current_hash == evidence.sha256_hash
    action = "verify" if matches else "verify_mismatch"
    _log_custody_event(db, evidence.id, current_user.id, action=action)

    return {
        "evidence_id": str(evidence.id),
        "original_hash": evidence.sha256_hash,
        "current_hash": current_hash,
        "integrity_intact": matches,
    }


@router.get("/evidence/{evidence_id}/custody-chain")
def get_custody_chain(
    evidence_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    evidence = db.query(models.Evidence).filter(models.Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    _assert_can_access(evidence, current_user)

    events = (
        db.query(models.CustodyEvent)
        .filter(models.CustodyEvent.evidence_id == evidence_id)
        .order_by(models.CustodyEvent.timestamp.asc())
        .all()
    )
    return [
        {
            "action": e.action,
            "actor_id": str(e.actor_id),
            "timestamp": e.timestamp,
            "event_hash": e.event_hash,
            "prev_event_hash": e.prev_event_hash,
        }
        for e in events
    ]


def _evidence_summary(e: models.Evidence) -> dict:
    return {
        "evidence_id": str(e.id),
        "filename": e.filename,
        "sha256_hash": e.sha256_hash,
        "uploaded_by": str(e.uploaded_by),
        "uploaded_at": e.uploaded_at,
    }


@router.get("/evidence/mine")
def list_my_evidence(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """List evidence uploaded by the logged-in user."""
    items = (
        db.query(models.Evidence)
        .filter(models.Evidence.uploaded_by == current_user.id)
        .order_by(models.Evidence.uploaded_at.desc())
        .all()
    )
    return [_evidence_summary(e) for e in items]


@router.get("/evidence/all")
def list_all_evidence(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin", "auditor")),
):
    """Admin/auditor-only: list every piece of evidence in the system,
    regardless of who uploaded it."""
    items = db.query(models.Evidence).order_by(models.Evidence.uploaded_at.desc()).all()
    return [_evidence_summary(e) for e in items]
