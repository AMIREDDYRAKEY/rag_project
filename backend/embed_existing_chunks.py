from sqlalchemy import select

from app.db.database import SessionLocal
from app.models.chunk import Chunk
from app.services.embeddings import generate_embedding


def embed_existing_chunks():
    db = SessionLocal()

    try:
        chunks = db.scalars(
            select(Chunk).where(
                Chunk.embedding.is_(None)
            )
        ).all()

        print(f"Found {len(chunks)} chunks without embeddings")

        for chunk in chunks:
            print(f"Embedding chunk: {chunk.id}")

            embedding = generate_embedding(chunk.content)

            chunk.embedding = embedding

            print(
                f"Generated embedding with {len(embedding)} dimensions"
            )

        db.commit()

        print("All embeddings saved successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    embed_existing_chunks()