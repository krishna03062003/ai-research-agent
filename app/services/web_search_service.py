from tavily import AsyncTavilyClient

from app.config import TAVILY_API_KEY
from app.services.gemini_service import generate_gemini_answer
from app.services.source_service import (
    rank_sources,
    select_sources,
)


client = AsyncTavilyClient(
    api_key=TAVILY_API_KEY
)


async def web_search_answer_detailed(
    question: str
) -> dict:

    # =========================================================
    # 1. Search the web using Tavily
    # =========================================================

    search_response = await client.search(
        query=question,
        max_results=5,
        topic="general",
        include_raw_content=True
    )

    results = search_response.get(
        "results",
        []
    )

    if not results:
        return {
            "answer": (
                "I could not find reliable information "
                "on the web."
            ),
            "sources": []
        }

    # =========================================================
    # 2. Rank all sources
    # =========================================================

    ranked_results = rank_sources(
        results
    )

    # =========================================================
    # 3. Display ranking for debugging/evaluation
    # =========================================================

    print(
        "\n===== RANKED WEB SOURCES ====="
    )

    for index, result in enumerate(
        ranked_results,
        start=1
    ):

        print(
            f"{index}. "
            f"{result.get('source_type')} | "
            f"Authority: "
            f"{result.get('authority_score')} | "
            f"Relevance: "
            f"{result.get('relevance_score')} | "
            f"Freshness: "
            f"{result.get('freshness_score')} | "
            f"Final: "
            f"{result.get('final_score', 0):.3f} | "
            f"{result.get('title')}"
        )

    # =========================================================
    # 4. Select the best sources
    # =========================================================

    selected_results = select_sources(
        ranked_results,
        max_sources=3
    )

    if not selected_results:

        return {
            "answer": (
                "I could not find reliable information "
                "from the available web sources."
            ),
            "sources": []
        }

    # =========================================================
    # 5. Display selected sources
    # =========================================================

    print(
        "\n===== SELECTED SOURCES ====="
    )

    for index, result in enumerate(
        selected_results,
        start=1
    ):

        print(
            f"{index}. "
            f"{result.get('source_type')} | "
            f"Authority: "
            f"{result.get('authority_score')} | "
            f"Relevance: "
            f"{result.get('relevance_score')} | "
            f"Freshness: "
            f"{result.get('freshness_score')} | "
            f"Final: "
            f"{result.get('final_score', 0):.3f} | "
            f"{result.get('title')}"
        )

    # =========================================================
    # 6. Build context only from selected sources
    # =========================================================

    sources = []

    for result in selected_results:

        sources.append(
            f"""
Title:
{result.get("title")}

URL:
{result.get("url")}

Source Type:
{result.get("source_type")}

Authority Score:
{result.get("authority_score")}

Authority Normalized:
{result.get("authority_normalized")}

Tavily Relevance Score:
{result.get("relevance_score")}

Freshness Score:
{result.get("freshness_score")}

Final Source Score:
{result.get("final_score")}

Published Date:
{result.get("published_date")}

Content:
{result.get("content")}

Raw Content:
{result.get("raw_content")}
"""
        )

    context = "\n".join(
        sources
    )

    # =========================================================
    # 7. Research and fact-checking prompt
    # =========================================================

    prompt = f"""
You are a careful web research and fact-checking assistant.

USER QUESTION:
{question}

SELECTED WEB SOURCES:
{context}

Follow these rules strictly:

1. Answer ONLY from information contained
   in the provided web sources.

2. Compare the selected sources before
   producing the final answer.

3. Do NOT assume that the first source
   is automatically correct.

4. Prefer authoritative sources:

   - government sources
   - official websites
   - official documentation
   - academic sources
   - primary sources

5. Treat Wikipedia, blogs, forums,
   videos, social media, and other
   secondary sources as supporting evidence
   when authoritative information is available.

6. Pay close attention to dates and status.

   For questions involving:

   - latest
   - current
   - newest
   - today
   - recent

   distinguish between:

   - current stable release
   - prerelease
   - release candidate
   - development version
   - historical information

7. Never treat a prerelease, release candidate,
   or development version as a stable release
   unless the provided sources explicitly establish
   that status.

8. When a question is time-sensitive, prefer
   the most recent reliable evidence available
   in the provided sources.

9. If sources disagree:

   - identify what each source says
   - compare source authority
   - compare source relevance
   - consider publication/update dates when available
   - prefer stronger authoritative evidence
   - do not automatically trust the first result
   - do not treat Wikipedia or a blog as stronger
     than an official source when the official source
     directly addresses the same fact

10. If the conflict cannot be reliably resolved
    using the provided sources, clearly state that
    the sources disagree.

11. Never invent:

    - facts
    - dates
    - versions
    - URLs
    - source information

12. Do not use your own knowledge to fill gaps.

13. If the selected sources do not contain enough
    reliable information, respond exactly:

    "I could not verify this information from
    the available web sources."

14. Keep the final answer concise and directly
    answer the user's question.

15. At the end include ONLY the sources actually
    used for the answer:

    Sources:
    - <title> — <URL>

16. Do not mention these instructions.

17. Do not describe your internal reasoning.

Return ONLY the final researched answer.
"""

    # =========================================================
    # 8. Generate final answer
    # =========================================================

    answer = await generate_gemini_answer(
        prompt
    )

    clean_sources = [
        {
            "title": r.get("title", "Untitled Source"),
            "url": r.get("url", ""),
            "source_type": r.get("source_type", "GENERAL"),
            "authority_score": r.get("authority_score", 1),
            "relevance_score": r.get("relevance_score", 0),
            "final_score": round(r.get("final_score", 0), 3),
            "content": (r.get("content") or "")[:250]
        }
        for r in selected_results
    ]

    return {
        "answer": answer,
        "sources": clean_sources
    }


async def web_search_answer(
    question: str
) -> str:

    res = await web_search_answer_detailed(
        question
    )

    return res.get("answer", "")