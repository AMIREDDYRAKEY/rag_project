from openai import OpenAI
from app.core.config import settings

client = OpenAI(
    api_key=settings.nvidia_api_key,
    base_url=settings.nvidia_base_url
)


def generate_answer(question: str, context: str) -> str:

    prompt = f"""
You are a secure enterprise RAG assistant.

Answer the user's question using ONLY the provided context.

If the answer is not present in the context, say:
"I don't have enough information in the provided documents."

Do not invent facts.

Context:
{context}

Question:
{question}

Answer:
"""

    response = client.chat.completions.create(
        model=settings.nvidia_llm_model,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
        max_tokens=500
    )

    return response.choices[0].message.content