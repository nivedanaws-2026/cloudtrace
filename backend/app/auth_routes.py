from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import hash_password, verify_password, create_access_token, require_role

router = APIRouter(prefix="/auth", tags=["auth"])

ALLOWED_ROLES = {"investigator", "custodian", "auditor", "admin"}


@router.post("/signup", response_model=schemas.UserOut)
def signup(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Public self-signup. The account is created but INACTIVE — it has no
    role-based permissions and cannot log in at all until an admin approves
    it via POST /auth/approve. This is intentional: nobody gets access to
    anything just by signing up.
    """
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email already exists")

    user = models.User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        role="investigator",  # placeholder until admin sets a real role at approval time
        is_active=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm uses "username" as the field name — we treat it as email.
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Your account is pending admin approval. You cannot log in yet.",
        )

    token = create_access_token(user_id=str(user.id), role=user.role)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/pending", response_model=list[schemas.UserOut])
def list_pending_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin")),
):
    """Admin-only: see every account waiting for approval."""
    return db.query(models.User).filter(models.User.is_active == False).all()  # noqa: E712


@router.get("/users", response_model=list[schemas.UserOut])
def list_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin")),
):
    """Admin-only: see every account on the platform, active or pending."""
    return db.query(models.User).order_by(models.User.created_at.desc()).all()


@router.post("/approve", response_model=schemas.UserOut)
def approve_user(
    target_email: str,
    role: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin")),
):
    """Admin-only: activate a pending account and assign its real role.
    This is the ONLY way a new user gains any access to the system."""
    if role not in ALLOWED_ROLES:
        raise HTTPException(status_code=400, detail=f"role must be one of {sorted(ALLOWED_ROLES)}")

    target = db.query(models.User).filter(models.User.email == target_email).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    target.role = role
    target.is_active = True
    db.commit()
    db.refresh(target)
    return target


@router.post("/reject")
def reject_user(
    target_email: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin")),
):
    """Admin-only: permanently reject and delete a pending signup.
    Only works on accounts that haven't been approved yet — use /auth/revoke
    instead to deactivate an already-active account."""
    target = db.query(models.User).filter(models.User.email == target_email).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.is_active:
        raise HTTPException(
            status_code=400,
            detail="This account is already active — use /auth/revoke to deactivate it instead",
        )

    db.delete(target)
    db.commit()
    return {"detail": f"Rejected and removed signup request for {target_email}"}


@router.post("/revoke", response_model=schemas.UserOut)
def revoke_user(
    target_email: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin")),
):
    """Admin-only: deactivate a user, immediately blocking future logins."""
    target = db.query(models.User).filter(models.User.email == target_email).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    target.is_active = False
    db.commit()
    db.refresh(target)
    return target
