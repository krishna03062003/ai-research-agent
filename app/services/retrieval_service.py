from app.services.embedding_service import create_embeddings
from app.services.vector_store import search_documents


# ---------------------------------------------------------
# Retrieval configuration
# ---------------------------------------------------------

DISTANCE_THRESHOLD = 0.88
MIN_GAP = 0.05


def calculate_confidence(
    best_distance: float,
    gap: float
) -> float:

    """
    Calculate a retrieval confidence score based on
    semantic distance and separation margin.
    """

    # Normalized distance confidence (0.40 -> 1.0, 0.90 -> 0.0)
    distance_confidence = max(
        0.0,
        min(
            1.0,
            (0.90 - best_distance) / 0.50
        )
    )

    gap_confidence = max(
        0.0,
        min(
            1.0,
            gap / 0.15
        )
    )

    confidence = (
        distance_confidence * 0.80
        + gap_confidence * 0.20
    )

    return round(
        confidence,
        3
    )


async def retrieve_documents(
    question: str,
    n_results: int = 5
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

    # ---------------------------------------------------------
    # 4. Best result
    # ---------------------------------------------------------

    best_distance = distances[0]

    # ---------------------------------------------------------
    # 5. Second-best result
    # ---------------------------------------------------------

    second_distance = (
        distances[1]
        if len(distances) > 1
        else None
    )

    # ---------------------------------------------------------
    # 6. Calculate result separation
    # ---------------------------------------------------------

    if second_distance is not None:

        gap = (
            second_distance
            - best_distance
        )

    else:

        gap = 0.0

    # ---------------------------------------------------------
    # 7. Calculate confidence
    # ---------------------------------------------------------

    confidence = calculate_confidence(
        best_distance,
        gap
    )

    # ---------------------------------------------------------
    # 8. Determine whether candidate documents exist
    # ---------------------------------------------------------

    found = (
        best_distance
        <= DISTANCE_THRESHOLD
    )

    # ---------------------------------------------------------
    # 9. Return structured retrieval result
    # ---------------------------------------------------------

    return {
        "found": found,
        "confidence": confidence,
        "best_distance": best_distance,
        "second_distance": second_distance,
        "gap": gap,
        "results": results
    }