import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # investigator | custodian | auditor | admin
    created_at = Column(DateTime, default=datetime.utcnow)


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String, nullable=False)
    storage_path = Column(String, nullable=False)  # local path now, S3 key later
    sha256_hash = Column(String, nullable=False)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    custody_events = relationship("CustodyEvent", back_populates="evidence")


class CustodyEvent(Base):
    """
    Append-only chain-of-custody log. Each event links to the hash of the
    previous event for this piece of evidence, so the chain is tamper-evident:
    editing or deleting a past row breaks every hash after it.
    """

    __tablename__ = "custody_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evidence_id = Column(UUID(as_uuid=True), ForeignKey("evidence.id"), nullable=False)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)  # upload | verify | verify_mismatch | access
    timestamp = Column(DateTime, default=datetime.utcnow)
    prev_event_hash = Column(String, nullable=True)  # null for the first event
    event_hash = Column(String, nullable=False)  # sha256(prev_event_hash + this row's data)

    evidence = relationship("Evidence", back_populates="custody_events")
