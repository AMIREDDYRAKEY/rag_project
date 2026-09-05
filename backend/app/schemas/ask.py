from pydantic import BaseModel
from uuid import UUID


class AskRequest(BaseModel):
    question: str
    organization_id: UUID
    user_id: UUID
    top_k: int = 3


class Source(BaseModel):
    chunk_id: UUID
    document_id: UUID
    document_name: str
    chunk_index: int
    distance: float


class AskResponse(BaseModel):
    question: str
    answer: str
    sources: list[Source]