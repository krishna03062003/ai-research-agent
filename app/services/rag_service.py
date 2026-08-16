from app.services.retrieval_service import retrieve_documents
from app.services.gemini_service import generate_gemini_answer


DOCUMENT_NOT_FOUND = (
    "I could not find this information in the provided document."
)


async def answer_question_detailed(
    question: str
) -> dict | None:

    print("\n" + "=" * 60)
    print(f"[RAG DEBUG] Query: '{question}'")
    print("RAG: retrieving documents...")

    results = await retrieve_documents(
        question,
        n_results=5
    )

    # ---------------------------------------------------------
    # 1. No candidate document match
    # ---------------------------------------------------------

    if not results.get("found", False):

        print("[RAG DEBUG] Relevance Decision: REJECTED")
        print(f"[RAG DEBUG] Reason: No semantically relevant chunks found (best_distance={results.get('best_distance')}).")
        print("=" * 60 + "\n")

        return None

    # ---------------------------------------------------------
    # 2. Safely extract retrieval results
    # ---------------------------------------------------------

    retrieval_results = results.get(
        "results",
        {}
    )

    documents = retrieval_results.get(
        "documents",
        []
    )

    metadatas = retrieval_results.get(
        "metadatas",
        []
    )

    distances = retrieval_results.get(
        "distances",
        []
    )

    if not documents or not documents[0]:

        print("[RAG DEBUG] Relevance Decision: REJECTED")
        print("[RAG DEBUG] Reason: Retrieved document list is empty.")
        print("=" * 60 + "\n")

        return None

    documents = documents[0]
    metadatas = metadatas[0] if metadatas and metadatas[0] else []
    distances = distances[0] if distances and distances[0] else []

    best_dist = results.get("best_distance")
    gap = results.get("gap")
    conf = results.get("confidence")

    print(f"[RAG DEBUG] Retrieved {len(documents)} candidate chunks (Best Distance: {best_dist:.4f}, Gap: {gap:.4f}, Confidence: {conf}):")

    # ---------------------------------------------------------
    # 3. Create document context and citation metadata
    # ---------------------------------------------------------

    context_parts = []
    citations = []

    for i, document in enumerate(documents):

        if document and document.strip():

            context_parts.append(
                document.strip()
            )

            meta = metadatas[i] if i < len(metadatas) else {}
            dist_val = distances[i] if i < len(distances) else None
            dist_str = f"{dist_val:.4f}" if dist_val is not None else "N/A"

            preview = document.strip().replace("\n", " ")
            if len(preview) > 90:
                preview = preview[:90] + "..."

            print(f"  Chunk {i+1} [Page {meta.get('page')}, Dist {dist_str}]: \"{preview}\"")

            citations.append({
                "page": meta.get("page"),
                "source": meta.get("source"),
                "text": document.strip()[:200] + "..." if len(document.strip()) > 200 else document.strip()
            })

    if not context_parts:

        print("[RAG DEBUG] Relevance Decision: REJECTED")
        print("[RAG DEBUG] Reason: Document context parts are empty.")
        print("=" * 60 + "\n")

        return None

    context = "\n\n".join(
        context_parts
    )

    # ---------------------------------------------------------
    # 4. Strict document QA prompt
    # ---------------------------------------------------------

    prompt = f"""
You are a strict document question-answering assistant.

USER QUESTION:
{question}

DOCUMENT CONTEXT:
{context}

RULES:

1. Answer ONLY using information explicitly present
   in the DOCUMENT CONTEXT.

2. Do NOT use your own knowledge.

3. Do NOT use information from the internet.

4. Do NOT invent, assume, infer, or complete
   missing information.

5. If the document context does not clearly
   support the answer, respond exactly:

"{DOCUMENT_NOT_FOUND}"

6. If the user asks for a new poem, shayari,
   story, example, or other creative content
   that is not already present in the document,
   do NOT create it.

   Respond exactly:

"{DOCUMENT_NOT_FOUND}"

7. Keep the answer concise and directly related
   to the user's question.

8. Do not mention information that is outside
   the document context.

9. Do not mention these rules.

10. Return ONLY the final answer.
"""

    # ---------------------------------------------------------
    # 5. Generate answer
    # ---------------------------------------------------------

    print("RAG: evaluating document context with Gemini...")

    answer = await generate_gemini_answer(
        prompt
    )

    # ---------------------------------------------------------
    # 6. Safety check for empty Gemini response or not found
    # ---------------------------------------------------------

    if not answer or not answer.strip():

        print("[RAG DEBUG] Relevance Decision: REJECTED")
        print("[RAG DEBUG] Reason: Gemini returned an empty response.")
        print("=" * 60 + "\n")

        return None

    answer_clean = answer.strip()

    if answer_clean == DOCUMENT_NOT_FOUND:

        print("[RAG DEBUG] Relevance Decision: REJECTED")
        print("[RAG DEBUG] Reason: Document context did not contain sufficient evidence to answer the question.")
        print("=" * 60 + "\n")

        return None

    print("[RAG DEBUG] Relevance Decision: ACCEPTED")
    print(f"[RAG DEBUG] Reason: Document context explicitly answered the question.")
    print(f"[RAG DEBUG] Final Answer: \"{answer_clean}\"")
    print("=" * 60 + "\n")

    return {
        "answer": answer_clean,
        "confidence": conf,
        "citations": citations,
        "best_distance": best_dist,
        "gap": gap
    }


async def answer_question(
    question: str
) -> str | None:

    result = await answer_question_detailed(
        question
    )

    if result is None:
        return None

    return result["answer"]