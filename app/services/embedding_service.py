from google import genai

from app.config import GEMINI_API_KEY


# =========================================================
# Gemini client
# =========================================================

client = genai.Client(
    api_key=GEMINI_API_KEY
)


EMBEDDING_MODEL = "gemini-embedding-001"


# =========================================================
# Create embeddings
# =========================================================

async def create_embeddings(
    chunks: list[str]
) -> list[list[float]]:

    # ---------------------------------------------------------
    # Validate input
    # ---------------------------------------------------------

    if not chunks:

        return []

    # Remove empty chunks
    clean_chunks = [
        chunk.strip()
        for chunk in chunks
        if chunk and chunk.strip()
    ]

    if not clean_chunks:

        return []

    # ---------------------------------------------------------
    # Generate embeddings
    # ---------------------------------------------------------

    try:

        response = await client.aio.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=clean_chunks
        )

    except Exception as error:

        print(
            f"Embedding API error: {error}"
        )

        return []

    # ---------------------------------------------------------
    # Validate response
    # ---------------------------------------------------------

    if not response or not response.embeddings:

        print(
            "Embedding API returned no embeddings."
        )

        return []

    embeddings = []

    for embedding in response.embeddings:

        if embedding is None:
            continue

        values = embedding.values

        if values:

            embeddings.append(
                values
            )

    return embeddings