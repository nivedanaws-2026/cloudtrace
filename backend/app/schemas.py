import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    # bcrypt only uses the first 72 bytes, so cap there instead of silently truncating.
    password: str = Field(min_length=8, max_length=72)


class UserOut(BaseModel):
    id: uuid.UUID
    email: str          # was: EmailStr
    role: str
    is_active: bool
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
