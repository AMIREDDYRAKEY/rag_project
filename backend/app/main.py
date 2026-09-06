from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.database import Base, engine, get_db
from app.routes.ask import router as ask_router
from app.routes.documents import router as document_router
from app.routes.search import router as search_router

# Import models so SQLAlchemy knows about them (required for create_all)
from app.models.organization import Organization
from app.models.role import Role
from app.models.user import User
from app.models.document import Document
from app.models.document_permission import DocumentPermission
from app.models.chunk import Chunk


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create all tables on startup (idempotent — safe to run every boot)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Secure Enterprise RAG API",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
# Open to all origins — Starlette doesn't support wildcard subdomains like
# "https://*.vercel.app", so we use "*" for the public API.
# NOTE: allow_credentials must be False when allow_origins=["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(document_router)
app.include_router(search_router)
app.include_router(ask_router)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Secure Enterprise RAG API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/health/database")
def database_health(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT 1"))
    return {"database": "connected", "result": result.scalar()}