from urllib.parse import urlparse


OFFICIAL_DOMAINS = {
    "python.org",
    "ai.google.dev",
    "developers.google.com",
    "openai.com",
    "github.com",
}


def normalize_domain(url: str) -> str:

    domain = urlparse(url).netloc.lower()

    if domain.startswith("www."):
        domain = domain[4:]

    return domain


def is_subdomain_of(
    domain: str,
    official_domain: str
) -> bool:

    return (
        domain == official_domain
        or domain.endswith("." + official_domain)
    )


def get_source_type(url: str) -> str:

    domain = normalize_domain(url)

    # Government websites
    if (
        domain.endswith(".gov")
        or ".gov." in domain
    ):
        return "GOVERNMENT"

    # Academic websites
    if (
        domain.endswith(".edu")
        or ".edu." in domain
    ):
        return "ACADEMIC"

    # Official websites and subdomains
    for official_domain in OFFICIAL_DOMAINS:

        if is_subdomain_of(
            domain,
            official_domain
        ):
            return "OFFICIAL"

    # Documentation websites
    if domain.startswith("docs."):
        return "DOCUMENTATION"

    # Wikipedia
    if (
        domain == "wikipedia.org"
        or domain.endswith(".wikipedia.org")
    ):
        return "WIKIPEDIA"

    # YouTube
    if (
        domain == "youtube.com"
        or domain.endswith(".youtube.com")
        or domain == "youtu.be"
    ):
        return "VIDEO"

    # Social media
    if (
        domain == "facebook.com"
        or domain.endswith(".facebook.com")
        or domain == "instagram.com"
        or domain.endswith(".instagram.com")
    ):
        return "SOCIAL"

    # Medium
    if (
        domain == "medium.com"
        or domain.endswith(".medium.com")
    ):
        return "BLOG"

    return "GENERAL"


def is_time_sensitive_query(
    question: str
) -> bool:

    """
    Determine whether the user's question depends
    on current or recent information.

    This flag will be used by the web-search layer
    for query-aware source selection.
    """

    keywords = {
        "latest",
        "current",
        "today",
        "recent",
        "newest",
        "now",
        "up-to-date",
    }

    question_lower = question.lower()

    return any(
        keyword in question_lower
        for keyword in keywords
    )


def get_freshness_score(
    result: dict
) -> float:

    """
    Return a freshness score between 0 and 1.

    Tavily may not always provide a publication date.
    In that case we return a neutral score instead of
    guessing the age of the source.
    """

    published_date = result.get(
        "published_date"
    )

    if not published_date:
        return 0.5

    # We currently do not parse or guess dates here.
    # A real date-aware implementation will be added
    # once Tavily's date format is verified.
    return 0.5


def rank_sources(
    results: list[dict]
) -> list[dict]:

    priority = {
        "GOVERNMENT": 6,
        "ACADEMIC": 6,
        "OFFICIAL": 6,
        "DOCUMENTATION": 5,
        "WIKIPEDIA": 3,
        "GENERAL": 2,
        "BLOG": 1,
        "VIDEO": 1,
        "SOCIAL": 0,
    }

    ranked = []

    for result in results:

        source_type = get_source_type(
            result.get("url", "")
        )

        authority_score = priority.get(
            source_type,
            1
        )

        relevance_score = result.get(
            "score",
            0
        )

        max_authority = 6

        authority_normalized = (
            authority_score / max_authority
        )

        freshness_score = get_freshness_score(
            result
        )

        final_score = (
            authority_normalized * 0.60
            + relevance_score * 0.30
            + freshness_score * 0.10
        )

        item = result.copy()

        item["source_type"] = source_type

        item["authority_score"] = (
            authority_score
        )

        item["authority_normalized"] = (
            authority_normalized
        )

        item["relevance_score"] = (
            relevance_score
        )

        item["freshness_score"] = (
            freshness_score
        )

        item["final_score"] = (
            final_score
        )

        ranked.append(item)

    ranked.sort(
        key=lambda x: x["final_score"],
        reverse=True
    )

    return ranked


def select_sources(
    ranked_results: list[dict],
    max_sources: int = 3
) -> list[dict]:

    if not ranked_results:
        return []

    selected = []

    # ---------------------------------------------------------
    # First: prefer authoritative sources
    # ---------------------------------------------------------

    for result in ranked_results:

        source_type = result.get(
            "source_type"
        )

        final_score = result.get(
            "final_score",
            0
        )

        if final_score < 0.45:
            continue

        if source_type in {
            "GOVERNMENT",
            "ACADEMIC",
            "OFFICIAL",
            "DOCUMENTATION",
        }:
            selected.append(result)

        if len(selected) >= max_sources:
            return selected

    # ---------------------------------------------------------
    # Second: fill remaining slots with best sources
    # ---------------------------------------------------------

    for result in ranked_results:

        if result in selected:
            continue

        final_score = result.get(
            "final_score",
            0
        )

        if final_score < 0.45:
            continue

        selected.append(result)

        if len(selected) >= max_sources:
            break

    return selected