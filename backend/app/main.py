from fastapi import FastAPI
from sqlalchemy import text

from app.database import engine, Base
from app import models  # noqa: F401  (import so tables register with Base)
from app.auth_routes import router as auth_router
from app.evidence_routes import router as evidence_router

app = FastAPI(title="CloudTrace API")
app.include_router(auth_router)
app.include_router(evidence_router, tags=["evidence"])


@app.on_event("startup")
def on_startup():
    # Dev convenience only — Alembic migrations replace this before production use.
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health_check():
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ok"}
