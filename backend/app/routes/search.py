from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.retrieval import retrieve_chunks


router = APIRouter(
    prefix="/search",
    tags=["Search"]
)


@router.get("/")
def search_documents(
    query: str,
    organization_id: UUID,
    user_id: UUID,
    top_k: int = 3,
    db: Session = Depends(get_db)
):
    if not query.strip():
        raise HTTPException(
            status_code=400,
            detail="Query cannot be empty"
        )

    if top_k < 1 or top_k > 20:
        raise HTTPException(
            status_code=400,
            detail="top_k must be between 1 and 20"
        )

    results = retrieve_chunks(
        db=db,
        query=query,
        organization_id=str(organization_id),
        user_id=str(user_id),
        top_k=top_k
    )

    return {
        "query": query,
        "organization_id": str(organization_id),
        "user_id": str(user_id),
        "results": [
            {
                "chunk_id": str(row.id),
                "document_id": str(row.document_id),
                "chunk_index": row.chunk_index,
                "content": row.content,
                "distance": float(row.distance)
            }
            for row in results
        ]
    }