from app.services.embeddings import generate_embedding


text = "This is a test document for Enterprise RAG."

embedding = generate_embedding(text)

print("Embedding generated successfully")
print("Dimensions:", len(embedding))
print("First 5 values:", embedding[:5])