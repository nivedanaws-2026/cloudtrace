import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str


class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class EvidenceOut(BaseModel):
    id: uuid.UUID
    filename: str
    sha256_hash: str
    uploaded_by: uuid.UUID
    uploaded_at: datetime

    class Config:
        from_attributes = True


class CustodyEventOut(BaseModel):
    id: uuid.UUID
    evidence_id: uuid.UUID
    actor_id: uuid.UUID
    action: str
    timestamp: datetime
    event_hash: str

    class Config:
        from_attributes = True
