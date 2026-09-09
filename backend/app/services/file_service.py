from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from pypdf import PdfReader


UPLOAD_DIR = Path("uploads")

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


async def save_upload_file(
    file: UploadFile
):
    extension = Path(file.filename).suffix

    filename = f"{uuid4()}{extension}"

    file_path = UPLOAD_DIR / filename

    content = await file.read()

    with open(file_path, "wb") as buffer:
        buffer.write(content)

    return str(file_path), len(content)


def extract_pdf_text(
    file_path: str
) -> str:
    reader = PdfReader(file_path)

    pages = []

    for page in reader.pages:

        text = page.extract_text()

        if text:
            pages.append(text)

    return "\n".join(pages)


def extract_text_from_file(
    file_path: str,
    content_type: str = ""
) -> str:
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix == ".pdf" or content_type == "application/pdf":
        return extract_pdf_text(file_path)

    # For text, markdown, or plain documents
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except Exception as exc:
        raise ValueError(f"Could not extract text from file {file_path}: {exc}")