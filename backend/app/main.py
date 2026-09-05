from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.routes.ask import router as ask_router
from app.routes.documents import router as document_router
from app.routes.search import router as search_router

# Import models so SQLAlchemy knows about them
from app.models.organization import Organization
from app.models.role import Role
from app.models.user import User
from app.models.document import Document
from app.models.document_permission import DocumentPermission
from app.models.chunk import Chunk

app = FastAPI(
    title="Secure Enterprise RAG API",
    version="1.0.0"
)

# ── CORS ─────────────────────────────────────────────────────────────────────
# Allow the Vite dev server (port 5173) to reach the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ],
    allow_credentials=True,
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