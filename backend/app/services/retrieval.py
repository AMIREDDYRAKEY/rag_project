from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.chunk import Chunk
from app.models.document import Document
from app.models.document_permission import DocumentPermission
from app.services.embeddings import generate_embedding


def retrieve_chunks(
    db: Session,
    query: str,
    organization_id: str,
    user_id: str,
    top_k: int = 3
):
    query_embedding = generate_embedding(query)

    distance = Chunk.embedding.cosine_distance(query_embedding)

    # Documents belonging to the organization
    # OR documents explicitly permitted to the user
    allowed_documents = (
        select(Document.id)
        .outerjoin(
            DocumentPermission,
            DocumentPermission.document_id == Document.id
        )
        .where(
            Document.organization_id == organization_id,
            (
                (Document.owner_id == user_id)
                |
                (
                    (DocumentPermission.user_id == user_id)
                    &
                    (DocumentPermission.can_read.is_(True))
                )
            )
        )
    )

    statement = (
        select(
            Chunk.id,
            Chunk.document_id,
            Chunk.chunk_index,
            Chunk.content,
            distance.label("distance")
        )
        .where(
            Chunk.embedding.is_not(None),
            Chunk.document_id.in_(allowed_documents)
        )
        .order_by(distance)
        .limit(top_k)
    )

    results = db.execute(statement).all()

    return results