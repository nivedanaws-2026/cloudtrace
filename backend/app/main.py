from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
import os

from app.database import engine, Base, SessionLocal
from app import models  # noqa: F401  (import so tables register with Base)
from app.auth import hash_password
from app.auth_routes import router as auth_router
from app.evidence_routes import router as evidence_router

app = FastAPI(title="CloudTrace API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(evidence_router, tags=["evidence"])


@app.on_event("startup")
def on_startup():
    # Dev convenience only — Alembic migrations replace this before production use.
    Base.metadata.create_all(bind=engine)

    # Bootstrap the first admin account, since public signup can no longer
    # create admin/custodian/auditor accounts (see auth_routes.py). Set
    # ADMIN_EMAIL and ADMIN_PASSWORD in .env to enable this. Runs once —
    # skipped silently if an admin already exists or the env vars aren't set.
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    if admin_email and admin_password:
        db = SessionLocal()
        try:
            existing_admin = db.query(models.User).filter(models.User.role == "admin").first()
            if not existing_admin:
                admin = models.User(
                    email=admin_email,
                    password_hash=hash_password(admin_password),
                    role="admin",
                    is_active=True,
                )
                db.add(admin)
                db.commit()
                print(f"[startup] Bootstrapped first admin account: {admin_email}")
        finally:
            db.close()


@app.get("/health")
def health_check():
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ok"}
