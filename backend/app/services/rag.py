from sqlalchemy import text
from sqlalchemy.orm import Session

from app.services.embeddings import generate_embedding
from app.services.llm import generate_answer


def ask_question(
    db: Session,
    question: str,
    organization_id,
    user_id,
    top_k: int = 3
):
    # ---------------------------------------------------------
    # 1. Generate embedding for the user's question
    # ---------------------------------------------------------

    query_embedding = generate_embedding(question)

    print("DEBUG: Query embedding generated")
    print("DEBUG: Embedding dimensions:", len(query_embedding))

    # ---------------------------------------------------------
    # 2. Convert embedding list to pgvector format
    # ---------------------------------------------------------

    embedding_string = "[" + ",".join(
        str(value) for value in query_embedding
    ) + "]"

    # ---------------------------------------------------------
    # 3. Secure vector similarity search
    #
    # User can retrieve only:
    # - Documents belonging to their organization
    # - Documents for which they have permission
    # - Documents with can_read = TRUE
    # ---------------------------------------------------------

    sql = text("""
        SELECT
            c.id AS chunk_id,
            c.document_id,
            d.filename AS document_name,
            c.chunk_index,
            c.content,
            c.embedding <=> CAST(:embedding AS vector) AS distance

        FROM chunks c

        JOIN documents d
            ON c.document_id = d.id

        LEFT JOIN document_permissions dp
            ON dp.document_id = d.id AND dp.user_id = :user_id

        WHERE d.organization_id = :organization_id
          AND (
                d.owner_id = :user_id
                OR (dp.user_id = :user_id AND dp.can_read = TRUE)
          )
          AND c.embedding IS NOT NULL

        ORDER BY c.embedding <=> CAST(:embedding AS vector)

        LIMIT :top_k
    """)

    # ---------------------------------------------------------
    # 4. Execute vector search
    # ---------------------------------------------------------

    results = db.execute(
        sql,
        {
            "embedding": embedding_string,
            "organization_id": str(organization_id),
            "user_id": str(user_id),
            "top_k": top_k
        }
    ).fetchall()

    # ---------------------------------------------------------
    # 5. Debug information
    # ---------------------------------------------------------

    print("========================================")
    print("RAG DEBUG")
    print("Organization ID:", organization_id)
    print("User ID:", user_id)
    print("Top K:", top_k)
    print("Retrieved rows:", len(results))

    for row in results:
        print(
            "Document:",
            row.document_name,
            "| Chunk:",
            row.chunk_index,
            "| Distance:",
            row.distance
        )

    print("========================================")

    # ---------------------------------------------------------
    # 6. No authorized documents found
    # ---------------------------------------------------------

    if not results:
        return {
            "question": question,
            "answer": (
                "I don't have enough information in the provided documents."
            ),
            "sources": []
        }

    # ---------------------------------------------------------
    # 7. Build context for the LLM
    # ---------------------------------------------------------

    context_parts = []
    sources = []

    for row in results:

        context_parts.append(
            f"""
Document: {row.document_name}
Document ID: {row.document_id}
Chunk Index: {row.chunk_index}

Content:
{row.content}
"""
        )

        # -----------------------------------------------------
        # 8. Store source information
        # -----------------------------------------------------

        sources.append({
            "chunk_id": row.chunk_id,
            "document_id": row.document_id,
            "document_name": row.document_name,
            "chunk_index": row.chunk_index,
            "distance": float(row.distance)
        })

    # ---------------------------------------------------------
    # 9. Combine retrieved chunks
    # ---------------------------------------------------------

    context = "\n\n".join(context_parts)

    print("DEBUG: Context created")
    print("DEBUG: Context length:", len(context))

    # ---------------------------------------------------------
    # 10. Generate answer using NVIDIA LLM
    # ---------------------------------------------------------

    answer = generate_answer(
        question=question,
        context=context
    )

    print("DEBUG: Answer generated successfully")

    # ---------------------------------------------------------
    # 11. Return final RAG response
    # ---------------------------------------------------------

    return {
        "question": question,
        "answer": answer,
        "sources": sources
    }