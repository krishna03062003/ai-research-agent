import re

from app.agent.router import classify_question
from app.services.rag_service import answer_question_detailed
from app.services.web_search_service import web_search_answer_detailed
from app.services.gemini_service import generate_gemini_answer
from app.services.calculator_service import calculate
from app.services.vector_store import get_collection_stats


async def process_question_detailed(
    question: str,
    force_route: str | None = None
) -> dict:

    # =========================================================
    # 1. Validate user input
    # =========================================================
    question = question.strip()

    if not question:
        return {
            "question": question,
            "answer": "Please enter a question.",
            "route": "GENERAL",
            "confidence": None,
            "sources": [],
            "document_citations": [],
            "can_search_web": False,
            "original_question": question
        }

    # =========================================================
    # 2. Classify the question (or use force_route if user confirmed)
    # =========================================================
    if force_route and force_route.strip().upper() in ["WEB", "DOCUMENT", "CALCULATOR", "CREATIVE", "GENERAL"]:
        route = force_route.strip().upper()
        print(f"[AGENT] Using user-confirmed route override: {route}")
    else:
        route = await classify_question(question)
        route = route.strip().upper()

    print("\n" + "#" * 60)
    print(f"[AGENT DEBUG] Question: '{question}'")
    print(f"[AGENT DEBUG] Route: {route}")
    print("#" * 60)

    # =========================================================
    # 3. DOCUMENT route
    # =========================================================
    if route == "DOCUMENT":
        stats = get_collection_stats()
        if not stats.get("has_document", False):
            return {
                "question": question,
                "answer": "No document is currently uploaded. Please upload a PDF to ask questions about it, or ask for general/web research.",
                "route": "DOCUMENT",
                "confidence": None,
                "sources": [],
                "document_citations": [],
                "can_search_web": True,
                "original_question": question
            }

        doc_result = await answer_question_detailed(question)

        # Document contains an answer
        if doc_result and doc_result.get("found", False) and doc_result.get("answer"):
            print("[AGENT DEBUG] Document answer found. Returning RAG result.")
            return {
                "question": question,
                "answer": doc_result.get("answer", ""),
                "route": "DOCUMENT",
                "confidence": doc_result.get("confidence"),
                "sources": [],
                "document_citations": doc_result.get("citations", []),
                "can_search_web": False,
                "original_question": question,
                "metadata": {
                    "best_distance": doc_result.get("best_distance"),
                    "gap": doc_result.get("gap")
                }
            }

        # Document does NOT contain the requested information
        print("[AGENT DEBUG] Document information NOT found in uploaded document.")

        return {
            "question": question,
            "answer": "This information is not mentioned in the uploaded document.",
            "route": "DOCUMENT",
            "confidence": doc_result.get("confidence", 0.0) if doc_result else 0.0,
            "sources": [],
            "document_citations": [],
            "can_search_web": True,
            "original_question": question
        }

    # =========================================================
    # 4. WEB route
    # =========================================================
    if route == "WEB":
        try:
            web_result = await web_search_answer_detailed(question)
            return {
                "question": question,
                "answer": web_result.get("answer", ""),
                "route": "WEB",
                "confidence": None,
                "sources": web_result.get("sources", []),
                "document_citations": [],
                "can_search_web": False,
                "original_question": question
            }
        except Exception as error:
            print(f"[AGENT ERROR] Web search error: {error}")
            return {
                "question": question,
                "answer": "I encountered an issue while searching the web. Please try again or rephrase your query.",
                "route": "WEB",
                "confidence": None,
                "sources": [],
                "document_citations": [],
                "can_search_web": False,
                "original_question": question
            }

    # =========================================================
    # 5. CREATIVE route
    # =========================================================
    if route == "CREATIVE":
        try:
            answer = await generate_gemini_answer(question)
            return {
                "question": question,
                "answer": answer,
                "route": "CREATIVE",
                "confidence": None,
                "sources": [],
                "document_citations": [],
                "can_search_web": False,
                "original_question": question
            }
        except Exception as error:
            print(f"[AGENT ERROR] Creative generation error: {error}")
            return {
                "question": question,
                "answer": "I could not generate the creative response at this moment. Please try again.",
                "route": "CREATIVE",
                "confidence": None,
                "sources": [],
                "document_citations": [],
                "can_search_web": False,
                "original_question": question
            }

    # =========================================================
    # 6. GENERAL route
    # =========================================================
    if route == "GENERAL":
        try:
            answer = await generate_gemini_answer(question)
            return {
                "question": question,
                "answer": answer,
                "route": "GENERAL",
                "confidence": None,
                "sources": [],
                "document_citations": [],
                "can_search_web": False,
                "original_question": question
            }
        except Exception as error:
            print(f"[AGENT ERROR] General QA error: {error}")
            return {
                "question": question,
                "answer": "I could not answer this question at this moment. Please try again.",
                "route": "GENERAL",
                "confidence": None,
                "sources": [],
                "document_citations": [],
                "can_search_web": False,
                "original_question": question
            }

    # =========================================================
    # 7. CALCULATOR route
    # =========================================================
    if route == "CALCULATOR":
        try:
            expression = question

            # Natural-language percentage conversion
            if "percent" in question.lower() or "%" in question:
                match = re.search(
                    r"(\d+(?:\.\d+)?)\s*(?:percent|%)\s*(?:of)?\s*(\d+(?:\.\d+)?)",
                    question.lower()
                )
                if match:
                    percentage = float(match.group(1))
                    number = float(match.group(2))
                    expression = f"{percentage} * {number} / 100"

            # Clean leading calculation prefixes
            expression_clean = re.sub(r"^(?:what\s+is\s+|calculate\s+|solve\s+)", "", expression, flags=re.IGNORECASE).rstrip("?").strip()
            if expression_clean:
                expression = expression_clean

            result = calculate(expression)

            return {
                "question": question,
                "answer": f"The answer is {result}",
                "route": "CALCULATOR",
                "confidence": 1.0,
                "sources": [],
                "document_citations": [],
                "can_search_web": False,
                "original_question": question,
                "metadata": {
                    "expression": expression,
                    "result": result
                }
            }

        except Exception as error:
            print(f"[AGENT ERROR] Calculator error: {error}")
            return {
                "question": question,
                "answer": "I could not calculate that mathematical expression.",
                "route": "CALCULATOR",
                "confidence": None,
                "sources": [],
                "document_citations": [],
                "can_search_web": False,
                "original_question": question
            }

    # =========================================================
    # 8. Unknown route
    # =========================================================
    print(f"Agent: unknown route received: {route}")
    return {
        "question": question,
        "answer": "I could not determine how to handle this question.",
        "route": "UNKNOWN",
        "confidence": None,
        "sources": [],
        "document_citations": [],
        "can_search_web": False,
        "original_question": question
    }


async def process_question(
    question: str
) -> str:
    result = await process_question_detailed(question)
    return result.get("answer", "")