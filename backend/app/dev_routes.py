"""
TEMPORARY: lets you create a user without real auth so you can test the
upload/verify flow now. This whole file gets deleted once JWT + bcrypt
signup/login exists (step 2) — it has no password hashing and no login,
it's just a stand-in so evidence rows have a valid uploaded_by.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models

router = APIRouter()


@router.post("/dev/users")
def create_test_user(email: str, role: str = "investigator", db: Session = Depends(get_db)):
    user = models.User(email=email, password_hash="TEMPORARY-NO-AUTH-YET", role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": str(user.id), "email": user.email, "role": user.role}
