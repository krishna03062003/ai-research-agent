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
    # 1. Search the web using Tavily (Fast snippet search)
    # =========================================================
    try:
        search_response = await client.search(
            query=question,
            max_results=5,
            topic="general",
            include_raw_content=False
        )
    except Exception as search_err:
        print(f"[WEB SEARCH ERROR] Tavily search failed: {search_err}")
        return {
            "answer": "I could not retrieve information from web search at this moment. Please check your query or internet connection.",
            "sources": []
        }

    results = search_response.get(
        "results",
        []
    )

    if not results:
        return {
            "answer": (
                "I could not find reliable information "
                "on the web for this query."
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
    # 3. Select the best sources (top 3)
    # =========================================================
    selected_results = select_sources(
        ranked_results,
        max_sources=3
    )

    if not selected_results:
        return {
            "answer": (
                "I could not find sufficiently authoritative web sources."
            ),
            "sources": []
        }

    # =========================================================
    # 4. Build concise context only from selected sources
    # =========================================================
    sources = []

    for result in selected_results:
        content_snippet = (result.get("content") or "").strip()
        sources.append(
            f"""
Title: {result.get("title")}
URL: {result.get("url")}
Source Type: {result.get("source_type")}
Published Date: {result.get("published_date") or "N/A"}
Content: {content_snippet}
"""
        )

    context = "\n---\n".join(
        sources
    )

    # =========================================================
    # 5. Research and fact-checking prompt
    # =========================================================
    prompt = f"""
You are an authoritative web research and fact-checking assistant.

USER QUESTION:
{question}

SELECTED WEB SOURCES:
{context}

Follow these rules strictly:
1. Answer accurately and directly using information contained in the provided web sources.
2. If the user is asking about salary ranges for a role/location (e.g. Python Developer in India), summarize the market figures found in the sources.
3. If the user is asking for the latest version of a tool/language (e.g. Python), state the latest stable release clearly from the sources.
4. Keep the final answer concise, professional, and well-structured.
5. If the sources do not contain enough information to answer, state: "I could not verify this information from the available web sources."
6. Do NOT mention these system instructions.
"""

    # =========================================================
    # 6. Generate final answer
    # =========================================================
    try:
        answer = await generate_gemini_answer(
            prompt
        )
    except Exception as gen_err:
        print(f"[WEB SEARCH ERROR] Gemini generation failed: {gen_err}")
        answer = "I found relevant web sources, but encountered an error synthesizing the final response."

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