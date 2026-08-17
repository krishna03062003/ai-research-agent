from app.services.embedding_service import create_embeddings
from app.services.vector_store import search_documents


def calculate_confidence(
    best_distance: float,
    gap: float
) -> float:
    """
    Calculate a calibrated retrieval confidence score based on
    semantic cosine distance and separation margin.
    Typical Gemini cosine distance ranges:
    - 0.00 - 0.65: High match (80% - 100%)
    - 0.65 - 0.85: Good/Moderate match (55% - 80%)
    - 0.85 - 0.98: Broad match (30% - 55%)
    - > 0.98: Weak match (< 30%)
    """
    if best_distance is None:
        return 0.0

    # Smooth normalized distance confidence
    dist_confidence = max(0.0, min(1.0, (1.02 - best_distance) / 0.55))
    gap_confidence = max(0.0, min(1.0, (gap or 0.0) / 0.12))

    confidence = (dist_confidence * 0.85) + (gap_confidence * 0.15)
    return round(max(0.05, min(1.0, confidence)), 3)


async def retrieve_documents(
    question: str,
    n_results: int = 8
):

    # ---------------------------------------------------------
    # 1. Create query embedding
    # ---------------------------------------------------------
    embeddings = await create_embeddings(
        [question]
    )

    if not embeddings:
        return {
            "found": False,
            "confidence": 0.0,
            "best_distance": None,
            "second_distance": None,
            "gap": 0.0,
            "results": {}
        }

    query_embedding = embeddings[0]

    # ---------------------------------------------------------
    # 2. Search vector database
    # ---------------------------------------------------------
    results = search_documents(
        query_embedding,
        n_results
    )

    # ---------------------------------------------------------
    # 3. Extract distances
    # ---------------------------------------------------------
    distances = results.get(
        "distances",
        [[]]
    )[0]

    if not distances:
        return {
            "found": False,
            "confidence": 0.0,
            "best_distance": None,
            "second_distance": None,
            "gap": 0.0,
            "results": results
        }

    best_distance = distances[0]
    second_distance = distances[1] if len(distances) > 1 else None

    if second_distance is not None:
        gap = second_distance - best_distance
    else:
        gap = 0.0

    confidence = calculate_confidence(
        best_distance,
        gap
    )

    # Candidate chunks exist in collection
    found = len(distances) > 0

    return {
        "found": found,
        "confidence": confidence,
        "best_distance": best_distance,
        "second_distance": second_distance,
        "gap": gap,
        "results": results
    }