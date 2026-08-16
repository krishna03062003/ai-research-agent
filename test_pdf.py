from app.document.pdf_loader import extract_text_from_pdf
from app.document.chunker import create_chunks
from app.services.embedding_service import create_embeddings


text = extract_text_from_pdf("documents/sample.pdf")

chunks = create_chunks(text)

embeddings = create_embeddings(chunks)

print("Total chunks:", len(chunks))
print("Embedding shape:", embeddings.shape)
print("First embedding:")
print(embeddings[0])