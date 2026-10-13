import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.hashing import sha256_of_file, compute_event_hash
from app.auth import get_current_user, require_role

router = APIRouter()

STORAGE_DIR = os.getenv("LOCAL_STORAGE_DIR", "storage")
os.makedirs(STORAGE_DIR, exist_ok=True)

MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_MB", "50")) * 1024 * 1024  # default 50 MB


def _now_utc_naive() -> datetime:
    """UTC 'now' as a naive datetime, matching what the DB column stores."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _event_hash_for(prev_hash, evidence_id, actor_id, action, timestamp: datetime) -> str:
    # The hash is computed from the SAME timestamp that is stored in the row,
    # so the whole chain can be recomputed and checked later (see chain-verify).
    return compute_event_hash(prev_hash, str(evidence_id), str(actor_id), action, timestamp.isoformat())


def _log_custody_event(db: Session, evidence_id: uuid.UUID, actor_id: uuid.UUID, action: str):
    """Append a new custody event, chained to the last one for this evidence."""
    last_event = (
        db.query(models.CustodyEvent)
        .filter(models.CustodyEvent.evidence_id == evidence_id)
        .order_by(models.CustodyEvent.timestamp.desc())
        .first()
    )
    prev_hash = last_event.event_hash if last_event else None
    timestamp = _now_utc_naive()

    event = models.CustodyEvent(
        evidence_id=evidence_id,
        actor_id=actor_id,
        action=action,
        timestamp=timestamp,
        prev_event_hash=prev_hash,
        event_hash=_event_hash_for(prev_hash, evidence_id, actor_id, action, timestamp),
    )
    db.add(event)
    db.commit()
    return event


def _assert_can_access(evidence: models.Evidence, current_user: models.User):
    """
    Ownership check. Auditors and admins can access any evidence (they need
    full visibility to audit/administer). Investigators and custodians can
    only access evidence they personally uploaded.
    """
    if current_user.role in ("auditor", "admin"):
        return
    if evidence.uploaded_by == current_user.id:
        return
    raise HTTPException(status_code=403, detail="You are not authorized to access this evidence")


def _get_evidence_or_404(db: Session, evidence_id: uuid.UUID) -> models.Evidence:
    evidence = db.query(models.Evidence).filter(models.Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return evidence


def _summary(e: models.Evidence, uploader_email: str | None) -> dict:
    return {
        "id": str(e.id),
        "evidence_id": str(e.id),
        "filename": e.filename,
        "sha256_hash": e.sha256_hash,
        "uploaded_by": str(e.uploaded_by),
        "uploaded_email": uploader_email or "",
        "uploaded_at": e.uploaded_at,
    }


def _rows_to_summaries(db: Session, evidence_rows) -> list[dict]:
    ids = {e.uploaded_by for e in evidence_rows}
    emails = {}
    if ids:
        emails = {u.id: u.email for u in db.query(models.User).filter(models.User.id.in_(ids)).all()}
    return [_summary(e, emails.get(e.uploaded_by)) for e in evidence_rows]


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

    # Never trust the client filename for the path: it may contain "../" etc.
    # The file is stored under a random UUID key; the display name lives in the DB.
    display_name = os.path.basename((file.filename or "").replace("\\", "/")) or "unnamed"
    storage_path = os.path.join(STORAGE_DIR, str(uuid.uuid4()))
    with open(storage_path, "wb") as f:
        f.write(contents)

    evidence = models.Evidence(
        filename=display_name,
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


# NOTE: fixed-path routes (/mine, /all) must stay above the /{evidence_id} routes.
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
    return _rows_to_summaries(db, items)


@router.get("/evidence/all")
def list_all_evidence(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin", "auditor")),
):
    """Admin/auditor-only: list every piece of evidence in the system."""
    items = db.query(models.Evidence).order_by(models.Evidence.uploaded_at.desc()).all()
    return _rows_to_summaries(db, items)


@router.get("/evidence/{evidence_id}")
def get_evidence(
    evidence_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    evidence = _get_evidence_or_404(db, evidence_id)
    _assert_can_access(evidence, current_user)
    return _rows_to_summaries(db, [evidence])[0]


@router.post("/evidence/{evidence_id}/verify")
def verify_evidence(
    evidence_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    evidence = _get_evidence_or_404(db, evidence_id)
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


@router.get("/evidence/{evidence_id}/download")
def download_evidence(
    evidence_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Retrieve the stored file. Every download is itself a custody event."""
    evidence = _get_evidence_or_404(db, evidence_id)
    _assert_can_access(evidence, current_user)

    if not os.path.exists(evidence.storage_path):
        raise HTTPException(status_code=410, detail="Stored file is missing")

    _log_custody_event(db, evidence.id, current_user.id, action="access")
    return FileResponse(
        evidence.storage_path,
        filename=evidence.filename,
        media_type="application/octet-stream",
    )


def _events_for(db: Session, evidence_id: uuid.UUID):
    return (
        db.query(models.CustodyEvent)
        .filter(models.CustodyEvent.evidence_id == evidence_id)
        .order_by(models.CustodyEvent.timestamp.asc())
        .all()
    )


@router.get("/evidence/{evidence_id}/custody-chain")
def get_custody_chain(
    evidence_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    evidence = _get_evidence_or_404(db, evidence_id)
    _assert_can_access(evidence, current_user)

    return [
        {
            "action": e.action,
            "actor_id": str(e.actor_id),
            "timestamp": e.timestamp,
            "event_hash": e.event_hash,
            "prev_event_hash": e.prev_event_hash,
        }
        for e in _events_for(db, evidence_id)
    ]


@router.get("/evidence/{evidence_id}/chain-verify")
def verify_custody_chain(
    evidence_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Recompute every event hash in order and check each one links to the
    previous. Detects edited, deleted or reordered custody rows.
    """
    evidence = _get_evidence_or_404(db, evidence_id)
    _assert_can_access(evidence, current_user)

    events = _events_for(db, evidence_id)
    prev_hash = None
    for index, e in enumerate(events):
        expected = _event_hash_for(prev_hash, e.evidence_id, e.actor_id, e.action, e.timestamp)
        if e.prev_event_hash != prev_hash or e.event_hash != expected:
            return {
                "evidence_id": str(evidence_id),
                "chain_valid": False,
                "events_checked": len(events),
                "first_broken_index": index,
            }
        prev_hash = e.event_hash

    return {
        "evidence_id": str(evidence_id),
        "chain_valid": True,
        "events_checked": len(events),
        "first_broken_index": None,
    }
