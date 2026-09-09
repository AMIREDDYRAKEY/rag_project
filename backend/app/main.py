from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.database import Base, engine, get_db

from app.routes.ask import router as ask_router
from app.routes.documents import router as document_router
from app.routes.search import router as search_router

# Import all models
from app.models.organization import Organization
from app.models.role import Role
from app.models.user import User
from app.models.document import Document
from app.models.document_permission import DocumentPermission
from app.models.chunk import Chunk


@asynccontextmanager
async def lifespan(app: FastAPI):

    print("=" * 50)
    print("DATABASE INITIALIZATION")
    print("=" * 50)

    # Create all tables
    Base.metadata.create_all(bind=engine)

    print("Database tables initialized")

    yield


app = FastAPI(
    title="Secure Enterprise RAG API",
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://rag-project-flame.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(document_router)
app.include_router(search_router)
app.include_router(ask_router)


@app.get("/")
def root():
    return {
        "message": "Secure Enterprise RAG API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/health/database")
def database_health(
    db: Session = Depends(get_db)
):
    result = db.execute(text("SELECT 1"))

    return {
        "database": "connected",
        "result": result.scalar()
    }