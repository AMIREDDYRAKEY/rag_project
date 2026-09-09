
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
    print("========================================")
    print("DATABASE CONNECTION CHECK")
    print("========================================")

    try:
        with engine.connect() as conn:

            # Check database information
            db_info = conn.execute(
                text("""
                    SELECT
                        current_database(),
                        current_user,
                        current_schema()
                """)
            ).fetchone()

            print("DATABASE:", db_info[0])
            print("USER:", db_info[1])
            print("SCHEMA:", db_info[2])

            # Check PostgreSQL version
            version = conn.execute(
                text("SELECT version()")
            ).scalar()

            print("POSTGRES VERSION:", version)

            # Check pgvector extension
            vector_info = conn.execute(
                text("""
                    SELECT extname, extversion
                    FROM pg_extension
                    WHERE extname = 'vector'
                """)
            ).fetchone()

            print("VECTOR EXTENSION:", vector_info)

            if vector_info:
                print("SUCCESS: pgvector is available")
            else:
                print("ERROR: pgvector is NOT available")

            # Check vector type
            vector_type = conn.execute(
                text("""
                    SELECT typname
                    FROM pg_type
                    WHERE typname = 'vector'
                """)
            ).fetchone()

            print("VECTOR TYPE:", vector_type)

            if vector_type:
                print("SUCCESS: vector type exists")
            else:
                print("ERROR: vector type does NOT exist")

    except Exception as e:
        print("DATABASE CHECK FAILED:")
        print(type(e).__name__)
        print(str(e))

    print("========================================")

    # IMPORTANT:
    # Temporarily disabled while debugging pgvector.
    #
    # Base.metadata.create_all(bind=engine)

    yield


app = FastAPI(
    title="Secure Enterprise RAG API",
    version="1.0.0",
    lifespan=lifespan,
)


# CORS
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


# Routes
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


@app.get("/debug/database")
def debug_database(
    db: Session = Depends(get_db)
):
    # Database information
    db_info = db.execute(
        text("""
            SELECT
                current_database(),
                current_user,
                current_schema()
        """)
    ).fetchone()

    # pgvector extension
    vector_info = db.execute(
        text("""
            SELECT extname, extversion
            FROM pg_extension
            WHERE extname = 'vector'
        """)
    ).fetchone()

    # vector type
    vector_type = db.execute(
        text("""
            SELECT typname
            FROM pg_type
            WHERE typname = 'vector'
        """)
    ).fetchone()

    return {
        "database": db_info[0],
        "user": db_info[1],
        "schema": db_info[2],
        "vector_extension": (
            {
                "name": vector_info[0],
                "version": vector_info[1]
            }
            if vector_info
            else None
        ),
        "vector_type_exists": bool(vector_type)
    }
