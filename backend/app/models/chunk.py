from uuid import UUID

from pgvector.sqlalchemy import Vector
from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Chunk(Base):

    __tablename__ = "chunks"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True
    )

    document_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False
    )

    chunk_index: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        default=0
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    embedding = mapped_column(
        Vector(2048),
        nullable=True
    )

    document = relationship(
        "Document",
        back_populates="chunks"
    )