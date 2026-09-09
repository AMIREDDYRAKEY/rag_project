import uuid
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, File, Header, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.db.database import SessionLocal, get_db
from app.models.document import Document
from app.models.chunk import Chunk
from app.services.file_service import extract_text_from_file, save_upload_file
from app.services.chunk_service import create_chunks
from app.services.embeddings import generate_embedding

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


# ── List documents ────────────────────────────────────────────────────────────
@router.get("/")
def list_documents(
    organization_id: UUID,
    db: Session = Depends(get_db)
):
    docs = (
        db.query(Document)
        .filter(Document.organization_id == organization_id)
        .order_by(Document.id)
        .all()
    )
    return [
        {
            "id":            str(doc.id),
            "name":          doc.filename,
            "size":          doc.file_size,
            "status":        doc.status,
            "uploaded_at":   None,   # add a created_at column later if needed
            "content_type":  doc.content_type,
        }
        for doc in docs
    ]


# ── Background processing ─────────────────────────────────────────────────────
def _process_document(doc_id: UUID, file_path: str, content_type: str = ""):
    """Chunk the file and embed each chunk — runs in background using an isolated DB session."""
    db = SessionLocal()
    try:
        text = extract_text_from_file(file_path, content_type)
        chunks = create_chunks(text)

        for idx, chunk_text in enumerate(chunks):
            embedding = generate_embedding(chunk_text)
            chunk = Chunk(
                id=uuid.uuid4(),
                document_id=doc_id,
                chunk_index=idx,
                content=chunk_text,
                embedding=embedding,
            )
            db.add(chunk)

        doc = db.get(Document, doc_id)
        if doc:
            doc.status = "processed"
        db.commit()
    except Exception as exc:
        db.rollback()
        doc = db.get(Document, doc_id)
        if doc:
            doc.status = "error"
            db.commit()
        raise exc
    finally:
        db.close()


# ── Upload document ───────────────────────────────────────────────────────────
@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    organization_id: UUID = Header(..., alias="organization-id"),
    owner_id: UUID = Header(..., alias="owner-id"),
    db: Session = Depends(get_db),
):
    # Validate file type
    allowed = {
        "application/pdf",
        "text/plain",
        "text/markdown",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }
    if file.content_type not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Allowed: pdf, txt, md, docx"
        )

    # Save file to disk
    file_path, file_size = await save_upload_file(file)

    # Persist document record
    doc = Document(
        id=uuid.uuid4(),
        organization_id=organization_id,
        owner_id=owner_id,
        filename=file.filename,
        content_type=file.content_type,
        file_size=file_size,
        storage_path=file_path,
        status="uploaded",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Kick off chunking + embedding in background
    background_tasks.add_task(_process_document, doc.id, file_path, file.content_type or "")

    return {
        "message":         "Document uploaded successfully",
        "id":              str(doc.id),
        "filename":        doc.filename,
        "organization_id": str(doc.organization_id),
        "owner_id":        str(doc.owner_id),
        "status":          doc.status,
    }


# ── Delete document ───────────────────────────────────────────────────────────
@router.delete("/{document_id}")
def delete_document(
    document_id: UUID,
    db: Session = Depends(get_db)
):
    doc = db.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted", "id": str(document_id)}