from openai import OpenAI

from app.core.config import settings


client = OpenAI(
    api_key=settings.nvidia_api_key,
    base_url="https://integrate.api.nvidia.com/v1"
)


def generate_embedding(text: str) -> list[float]:
    response = client.embeddings.create(
        model="nvidia/nemotron-3-embed-1b",
        input=text
    )

    return response.data[0].embedding