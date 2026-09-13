from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class DocumentPermission(Base):
    __tablename__ = "document_permissions"

    # =========================
    # Primary Key
    # =========================
    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
    )

    # =========================
    # Document
    # =========================
    document_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey(
            "documents.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    # =========================
    # User
    # =========================
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    # =========================
    # Permissions
    # =========================
    can_read: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    can_download: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    # =========================
    # Created At
    # =========================
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # =========================
    # Relationships
    # =========================

    document = relationship(
        "Document",
        back_populates="permissions",
    )

    user = relationship(
        "User",
        back_populates="document_permissions",
    )