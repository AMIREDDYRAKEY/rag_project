from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.ask import AskRequest, AskResponse
from app.services.rag import ask_question
from app.db.database import get_db


router = APIRouter(
    prefix="/ask",
    tags=["RAG"]
)


@router.post("/", response_model=AskResponse)
def ask(
    request: AskRequest,
    db: Session = Depends(get_db)
):

    return ask_question(
        db=db,
        question=request.question,
        organization_id=request.organization_id,
        user_id=request.user_id,
        top_k=request.top_k
    )