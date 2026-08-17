import uuid

import chromadb


# =========================================================
# ChromaDB client
# =========================================================

client = chromadb.PersistentClient(
    path="./chroma_db"
)


# =========================================================
# Document collection
# =========================================================

collection = client.get_or_create_collection(
    name="documents"
)


# =========================================================
# Add documents
# =========================================================

def add_documents(
    chunks: list[str],
    embeddings: list[list[float]],
    metadatas: list[dict]
):

    # ---------------------------------------------------------
    # Validate input
    # ---------------------------------------------------------

    if not chunks:
        return 0

    if not embeddings:
        return 0

    if len(chunks) != len(embeddings):

        raise ValueError(
            "Number of chunks and embeddings "
            "must be the same."
        )

    if len(metadatas) != len(chunks):

        raise ValueError(
            "Number of chunks and metadatas "
            "must be the same."
        )

    # ---------------------------------------------------------
    # Generate unique IDs
    # ---------------------------------------------------------

    ids = [
        f"chunk_{uuid.uuid4().hex}"
        for _ in chunks
    ]

    # ---------------------------------------------------------
    # Store documents
    # ---------------------------------------------------------

    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas
    )

    return len(chunks)


# =========================================================
# Search documents
# =========================================================

def search_documents(
    query_embedding: list[float],
    n_results: int = 3
):

    if not query_embedding:

        return {
            "ids": [[]],
            "documents": [[]],
            "metadatas": [[]],
            "distances": [[]]
        }

    if n_results <= 0:

        return {
            "ids": [[]],
            "documents": [[]],
            "metadatas": [[]],
            "distances": [[]]
        }

    # ---------------------------------------------------------
    # Prevent requesting more results than available documents
    # ---------------------------------------------------------

    collection_count = collection.count()

    if collection_count == 0:

        return {
            "ids": [[]],
            "documents": [[]],
            "metadatas": [[]],
            "distances": [[]]
        }

    n_results = min(
        n_results,
        collection_count
    )

    # ---------------------------------------------------------
    # Similarity search
    # ---------------------------------------------------------

    results = collection.query(
        query_embeddings=[
            query_embedding
        ],
        n_results=n_results
    )

    return results


# =========================================================
# Reset collection
# =========================================================

def reset_collection():

    global collection

    try:

        client.delete_collection(
            name="documents"
        )

    except Exception:

        # Collection may not exist.
        pass

    collection = client.get_or_create_collection(
        name="documents"
    )


# =========================================================
# Collection stats
# =========================================================

def get_collection_stats():

    count = collection.count()

    if count == 0:
        return {
            "has_document": False,
            "filename": None,
            "chunks_count": 0
        }

    try:
        peek = collection.peek(limit=1)
        metadatas = peek.get("metadatas", [])
        filename = None
        if metadatas and len(metadatas) > 0:
            filename = metadatas[0].get("source")

        return {
            "has_document": True,
            "filename": filename,
            "chunks_count": count
        }
    except Exception:
        return {
            "has_document": True,
            "filename": None,
            "chunks_count": count
        }


# =========================================================
# Get all documents (for full summarization)
# =========================================================

def get_all_documents(limit: int = 50):

    count = collection.count()

    if count == 0:
        return {
            "documents": [],
            "metadatas": []
        }

    limit = min(limit, count)
    results = collection.get(
        limit=limit,
        include=["documents", "metadatas"]
    )

    return {
        "documents": results.get("documents", []),
        "metadatas": results.get("metadatas", [])
    }