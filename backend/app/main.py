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

    print("=" * 60)
    print("DATABASE INITIALIZATION")
    print("=" * 60)

    try:
        with engine.begin() as conn:

            # Check which database FastAPI is connected to
            database = conn.execute(
                text("SELECT current_database()")
            ).scalar()

            user = conn.execute(
                text("SELECT current_user")
            ).scalar()

            schema = conn.execute(
                text("SELECT current_schema()")
            ).scalar()

            search_path = conn.execute(
                text("SHOW search_path")
            ).scalar()

            print("DATABASE:", database)
            print("USER:", user)
            print("SCHEMA:", schema)
            print("SEARCH PATH:", search_path)

            # Check pgvector extension
            vector_extension = conn.execute(
                text("""
                    SELECT
                        extname,
                        extversion,
                        extnamespace::regnamespace AS extension_schema
                    FROM pg_extension
                    WHERE extname = 'vector'
                """)
            ).fetchall()

            print("VECTOR EXTENSION:", vector_extension)

            # Check vector data type
            vector_type = conn.execute(
                text("""
                    SELECT
                        n.nspname AS schema_name,
                        t.typname AS type_name
                    FROM pg_type t
                    JOIN pg_namespace n
                        ON n.oid = t.typnamespace
                    WHERE t.typname = 'vector'
                """)
            ).fetchall()

            print("VECTOR TYPE:", vector_type)

            # Create all tables
            Base.metadata.create_all(bind=conn)

        print("Database tables initialized successfully")

    except Exception as e:
        print("=" * 60)
        print("DATABASE INITIALIZATION FAILED")
        print("=" * 60)
        print(type(e).__name__, ":", str(e))
        raise

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