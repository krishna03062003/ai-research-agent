import re

from app.agent.router import classify_question

from app.services.rag_service import answer_question, answer_question_detailed
from app.services.web_search_service import web_search_answer, web_search_answer_detailed
from app.services.gemini_service import generate_gemini_answer
from app.services.calculator_service import calculate


async def process_question_detailed(
    question: str
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
            "document_citations": []
        }

    # =========================================================
    # 2. Classify the question
    # =========================================================

    route = await classify_question(
        question
    )

    # Normalize router output
    route = route.strip().upper()

    print("\n" + "#" * 60)
    print(f"[AGENT DEBUG] Question: '{question}'")
    print(f"[AGENT DEBUG] Route: {route}")
    print("#" * 60)

    # =========================================================
    # 3. DOCUMENT route
    # =========================================================

    if route == "DOCUMENT":

        doc_result = await answer_question_detailed(
            question
        )

        # Document contains a reliable answer
        if doc_result is not None:

            print(f"[AGENT DEBUG] Document answer found. Returning RAG result.")

            return {
                "question": question,
                "answer": doc_result.get("answer", ""),
                "route": "DOCUMENT",
                "confidence": doc_result.get("confidence"),
                "sources": [],
                "document_citations": doc_result.get("citations", []),
                "metadata": {
                    "best_distance": doc_result.get("best_distance"),
                    "gap": doc_result.get("gap")
                }
            }

        # Document does not contain
        # a sufficiently relevant answer -> Fallback to Web
        print(
            "[AGENT DEBUG] Document answered NOT FOUND -> Executing fallback to Web Search..."
        )

        web_result = await web_search_answer_detailed(
            question
        )

        return {
            "question": question,
            "answer": web_result.get("answer", ""),
            "route": "WEB (Fallback)",
            "confidence": None,
            "sources": web_result.get("sources", []),
            "document_citations": []
        }

    # =========================================================
    # 4. WEB route
    # =========================================================

    if route == "WEB":

        web_result = await web_search_answer_detailed(
            question
        )

        return {
            "question": question,
            "answer": web_result.get("answer", ""),
            "route": "WEB",
            "confidence": None,
            "sources": web_result.get("sources", []),
            "document_citations": []
        }

    # =========================================================
    # 5. CREATIVE route
    # =========================================================

    if route == "CREATIVE":

        answer = await generate_gemini_answer(
            question
        )

        return {
            "question": question,
            "answer": answer,
            "route": "CREATIVE",
            "confidence": None,
            "sources": [],
            "document_citations": []
        }

    # =========================================================
    # 6. GENERAL route
    # =========================================================

    if route == "GENERAL":

        answer = await generate_gemini_answer(
            question
        )

        return {
            "question": question,
            "answer": answer,
            "route": "GENERAL",
            "confidence": None,
            "sources": [],
            "document_citations": []
        }

    # =========================================================
    # 7. CALCULATOR route
    # =========================================================

    if route == "CALCULATOR":

        try:

            expression = question

            # -------------------------------------------------
            # Natural-language percentage conversion
            # -------------------------------------------------

            if "percent" in question.lower():

                match = re.search(
                    r"(\d+(?:\.\d+)?)\s*percent\s*of\s*(\d+(?:\.\d+)?)",
                    question.lower()
                )

                if match:

                    percentage = float(
                        match.group(1)
                    )

                    number = float(
                        match.group(2)
                    )

                    expression = (
                        f"{percentage} "
                        f"* {number} / 100"
                    )

            # -------------------------------------------------
            # Calculate expression
            # -------------------------------------------------

            result = calculate(
                expression
            )

            return {
                "question": question,
                "answer": f"The answer is {result}",
                "route": "CALCULATOR",
                "confidence": 1.0,
                "sources": [],
                "document_citations": [],
                "metadata": {
                    "expression": expression,
                    "result": result
                }
            }

        except Exception as error:

            print(
                f"Calculator error: {error}"
            )

            return {
                "question": question,
                "answer": "I could not calculate that expression.",
                "route": "CALCULATOR",
                "confidence": None,
                "sources": [],
                "document_citations": []
            }

    # =========================================================
    # 8. Unknown route
    # =========================================================

    print(
        f"Agent: unknown route received: {route}"
    )

    return {
        "question": question,
        "answer": "I could not determine how to handle this question.",
        "route": "UNKNOWN",
        "confidence": None,
        "sources": [],
        "document_citations": []
    }


async def process_question(
    question: str
) -> str:

    result = await process_question_detailed(
        question
    )

    return result.get("answer", "")