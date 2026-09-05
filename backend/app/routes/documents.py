from fastapi import APIRouter, File, Header, UploadFile
from uuid import UUID


router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    organization_id: UUID = Header(..., alias="organization-id"),
    owner_id: UUID = Header(..., alias="owner-id"),
):
    return {
        "message": "Upload endpoint working",
        "filename": file.filename,
        "organization_id": str(organization_id),
        "owner_id": str(owner_id)
    }