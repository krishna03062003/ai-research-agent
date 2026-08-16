import asyncio
import os

from app.document.pdf_loader import extract_pages_from_pdf
from app.document.chunker import create_page_chunks
from app.services.embedding_service import create_embeddings
from app.services.vector_store import (
    add_documents,
    reset_collection,
)


async def ingest_pdf(
    file_path: str
):

    # =========================================================
    # 1. Validate file
    # =========================================================

    if not file_path:

        raise ValueError(
            "PDF file path cannot be empty."
        )

    if not os.path.isfile(file_path):

        raise FileNotFoundError(
            f"PDF file not found: {file_path}"
        )

    print("Reading PDF...")

    # =========================================================
    # 2. Extract pages
    # =========================================================

    pages = extract_pages_from_pdf(
        file_path
    )

    print(
        f"Found {len(pages)} pages."
    )

    if not pages:

        raise ValueError(
            "No readable text was found in the PDF."
        )

    # =========================================================
    # 3. Create chunks
    # =========================================================

    print("Creating chunks...")

    page_chunks = create_page_chunks(
        pages
    )

    if not page_chunks:

        raise ValueError(
            "No usable text chunks were created from the PDF."
        )

    texts = [
        chunk["text"]
        for chunk in page_chunks
        if chunk.get("text")
    ]

    metadatas = [
        {
            "page": chunk["page"],
            "source": os.path.basename(
                file_path
            )
        }
        for chunk in page_chunks
        if chunk.get("text")
    ]

    print(
        f"Created {len(texts)} chunks."
    )

    # =========================================================
    # 4. Create embeddings
    # =========================================================

    print("Creating embeddings...")

    embeddings = await create_embeddings(
        texts
    )

    # ---------------------------------------------------------
    # IMPORTANT:
    # Do NOT reset Chroma if embedding failed.
    # ---------------------------------------------------------

    if not embeddings:

        raise RuntimeError(
            "No embeddings were created. "
            "Existing ChromaDB data was not changed."
        )

    if len(embeddings) != len(texts):

        raise RuntimeError(
            "Embedding count does not match "
            "the number of document chunks. "
            "Existing ChromaDB data was not changed."
        )

    print(
        f"Created {len(embeddings)} embeddings."
    )

    # =========================================================
    # 5. Reset old collection
    # =========================================================

    print("Resetting old collection...")

    reset_collection()

    # =========================================================
    # 6. Store documents
    # =========================================================

    print("Storing data in ChromaDB...")

    count = add_documents(
        chunks=texts,
        embeddings=embeddings,
        metadatas=metadatas
    )

    if count != len(texts):

        raise RuntimeError(
            "Not all document chunks were stored "
            "in ChromaDB."
        )

    print(
        f"Successfully stored {count} chunks "
        "in ChromaDB."
    )

    return {
        "success": True,
        "filename": os.path.basename(file_path),
        "pages_count": len(pages),
        "chunks_count": count
    }


# =============================================================
# Standalone ingestion
# =============================================================

if __name__ == "__main__":

    asyncio.run(
        ingest_pdf(
            "documents/sample.pdf"
        )
    )