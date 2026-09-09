
from uuid import UUID

from pgvector.sqlalchemy import Vector
from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Chunk(Base):
    __tablename__ = "chunks"

    # Primary key
    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
    )

    # Related document
    document_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey(
            "documents.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    # Position of the chunk inside the document
    chunk_index: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        default=0,
    )

    # Actual chunk text
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # Vector embedding
    # Must match the dimension produced by your embedding model.
    embedding: Mapped[list[float] | None] = mapped_column(
        Vector(2048),
        nullable=True,
    )

    # Relationship with Document
    document = relationship(
        "Document",
        back_populates="chunks",
    )
