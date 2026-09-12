import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.hashing import sha256_of_file, compute_event_hash

router = APIRouter()

STORAGE_DIR = os.getenv("LOCAL_STORAGE_DIR", "storage")
os.makedirs(STORAGE_DIR, exist_ok=True)


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


@router.post("/evidence/upload")
async def upload_evidence(
    uploaded_by: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    contents = await file.read()
    file_hash = sha256_of_file(contents)

    storage_path = os.path.join(STORAGE_DIR, f"{uuid.uuid4()}_{file.filename}")
    with open(storage_path, "wb") as f:
        f.write(contents)

    evidence = models.Evidence(
        filename=file.filename,
        storage_path=storage_path,
        sha256_hash=file_hash,
        uploaded_by=uploaded_by,
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    _log_custody_event(db, evidence.id, uploaded_by, action="upload")

    return {
        "evidence_id": str(evidence.id),
        "filename": evidence.filename,
        "sha256_hash": evidence.sha256_hash,
    }


@router.post("/evidence/{evidence_id}/verify")
def verify_evidence(evidence_id: uuid.UUID, actor_id: uuid.UUID, db: Session = Depends(get_db)):
    evidence = db.query(models.Evidence).filter(models.Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    if not os.path.exists(evidence.storage_path):
        raise HTTPException(status_code=410, detail="Stored file is missing")

    with open(evidence.storage_path, "rb") as f:
        current_hash = sha256_of_file(f.read())

    matches = current_hash == evidence.sha256_hash
    action = "verify" if matches else "verify_mismatch"
    _log_custody_event(db, evidence.id, actor_id, action=action)

    return {
        "evidence_id": str(evidence.id),
        "original_hash": evidence.sha256_hash,
        "current_hash": current_hash,
        "integrity_intact": matches,
    }


@router.get("/evidence/{evidence_id}/custody-chain")
def get_custody_chain(evidence_id: uuid.UUID, db: Session = Depends(get_db)):
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
