from app.services.retrieval_service import retrieve_documents
from app.services.gemini_service import generate_gemini_answer
from app.services.vector_store import get_all_documents, get_collection_stats


DOCUMENT_NOT_FOUND = (
    "I could not find this information in the provided document."
)


def is_summary_request(question: str) -> bool:
    """Check if the user is asking to summarize the document/resume."""
    q = question.strip().lower()
    summary_triggers = [
        "summarize this",
        "summarize the pdf",
        "summarize the document",
        "summarize my resume",
        "summarize this resume",
        "summarize it",
        "give me a summary",
        "summary of my resume",
        "summary of the document",
        "summary of this resume",
        "summary of this pdf",
        "summary of the pdf",
        "brief summary",
        "overview of this resume",
        "overview of the document",
        "what is this document about",
        "what is this pdf about",
        "give me the main points",
        "main points of this",
    ]
    return any(trigger in q for trigger in summary_triggers)


async def generate_document_summary(question: str) -> dict:
    """Generate a comprehensive, structured summary of the uploaded document."""
    doc_data = get_all_documents(limit=50)
    chunks = doc_data.get("documents", [])
    metadatas = doc_data.get("metadatas", [])

    if not chunks:
        return {
            "found": False,
            "answer": "No document content is currently available to summarize.",
            "citations": [],
            "confidence": 0.0
        }

    full_text = "\n\n".join(chunks[:35])
    
    citations = []
    for i, chunk in enumerate(chunks[:5]):
        meta = metadatas[i] if i < len(metadatas) else {}
        citations.append({
            "page": meta.get("page", 1),
            "source": meta.get("source", "Document.pdf"),
            "text": chunk[:200] + "..." if len(chunk) > 200 else chunk
        })

    prompt = f"""
You are an expert document analysis assistant.

USER REQUEST:
{question}

DOCUMENT CONTENT:
{full_text}

INSTRUCTIONS:
1. Provide a clear, structured, and informative summary of the document.
2. If this is a resume/CV, highlight:
   - Candidate Name / Title (if present)
   - Professional Summary / Core Expertise
   - Key Work Experience & Companies
   - Technical & Professional Skills
   - Education & Certifications (if present)
3. Base everything strictly on the document text provided above.
4. Do NOT invent, assume, or add information not present in the document.
5. Format your response cleanly using Markdown headings and bullet points.
"""

    summary = await generate_gemini_answer(prompt)

    return {
        "found": True,
        "answer": summary.strip(),
        "confidence": 1.0,
        "citations": citations,
        "best_distance": 0.0,
        "gap": 0.0
    }


async def answer_question_detailed(
    question: str
) -> dict:

    print("\n" + "=" * 60)
    print(f"[RAG DEBUG] Query: '{question}'")

    # ---------------------------------------------------------
    # 1. Check for Document Summarization Request
    # ---------------------------------------------------------
    if is_summary_request(question):
        print("[RAG DEBUG] Handling query as DOCUMENT SUMMARIZATION...")
        summary_result = await generate_document_summary(question)
        print("=" * 60 + "\n")
        return summary_result

    # ---------------------------------------------------------
    # 2. Check collection size
    # ---------------------------------------------------------
    stats = get_collection_stats()
    chunk_count = stats.get("chunks_count", 0)

    # For compact documents (<= 16 chunks, like resumes and short PDFs),
    # use full document context to guarantee zero missing facts across pages.
    if chunk_count <= 16:
        print(f"[RAG DEBUG] Small document ({chunk_count} chunks): using complete context.")
        doc_data = get_all_documents(limit=25)
        chunks = doc_data.get("documents", [])
        metadatas = doc_data.get("metadatas", [])

        if not chunks:
            return {
                "found": False,
                "answer": None,
                "confidence": 0.0,
                "citations": []
            }

        context = "\n\n".join(chunks)
        citations = [
            {
                "page": metadatas[i].get("page", 1) if i < len(metadatas) else 1,
                "source": metadatas[i].get("source", "Document.pdf") if i < len(metadatas) else "Document.pdf",
                "text": chunk[:200] + "..." if len(chunk) > 200 else chunk
            }
            for i, chunk in enumerate(chunks[:5])
        ]
        conf = 0.95
        best_dist = 0.0
        gap = 0.0
    else:
        # Standard vector similarity retrieval for larger multi-page documents
        print(f"RAG: retrieving top candidate chunks from {chunk_count} total chunks...")
        results = await retrieve_documents(
            question,
            n_results=8
        )

        if not results.get("found", False):
            print("[RAG DEBUG] Relevance Decision: REJECTED (No candidates)")
            print("=" * 60 + "\n")
            return {
                "found": False,
                "answer": None,
                "confidence": 0.0,
                "citations": [],
                "best_distance": None,
                "gap": 0.0
            }

        retrieval_results = results.get("results", {})
        documents = retrieval_results.get("documents", [])
        metadatas = retrieval_results.get("metadatas", [])
        distances = retrieval_results.get("distances", [])

        if not documents or not documents[0]:
            return {
                "found": False,
                "answer": None,
                "confidence": 0.0,
                "citations": []
            }

        documents = documents[0]
        metadatas = metadatas[0] if metadatas and metadatas[0] else []
        distances = distances[0] if distances and distances[0] else []

        best_dist = results.get("best_distance")
        gap = results.get("gap")
        conf = results.get("confidence")

        context_parts = []
        citations = []

        for i, document in enumerate(documents):
            if document and document.strip():
                context_parts.append(document.strip())
                meta = metadatas[i] if i < len(metadatas) else {}
                dist_val = distances[i] if i < len(distances) else None
                dist_str = f"{dist_val:.4f}" if dist_val is not None else "N/A"

                citations.append({
                    "page": meta.get("page"),
                    "source": meta.get("source"),
                    "text": document.strip()[:200] + "..." if len(document.strip()) > 200 else document.strip()
                })

        if not context_parts:
            return {
                "found": False,
                "answer": None,
                "confidence": 0.0,
                "citations": []
            }

        context = "\n\n".join(context_parts)

    # ---------------------------------------------------------
    # 3. Document QA & Analysis Prompt
    # ---------------------------------------------------------
    prompt = f"""
You are an expert document question-answering and analysis assistant.

USER QUESTION:
{question}

DOCUMENT CONTEXT:
{context}

INSTRUCTIONS:
1. Answer using ONLY information grounded in the DOCUMENT CONTEXT.
2. For factual questions (e.g. skills, experience, tools, projects, companies, dates, facts):
   - Answer directly based on what is stated in the document context.
   - If the user asks whether a specific skill or term is mentioned (e.g. "Does this resume mention Python?"):
     - State directly YES or NO based on the document text.
3. For suitability, qualification, or role evaluation questions:
   - Evaluate the candidate/subject based strictly on the skills, projects, and background present in the document.
   - Do NOT require the literal phrase "eligible" or "suitable" to appear in the PDF.
   - Clearly distinguish factual resume information from your assessment.
4. For compound questions with multiple parts:
   - Answer each sub-question clearly and directly.
5. If the requested information is genuinely NOT mentioned or present anywhere in the DOCUMENT CONTEXT:
   Respond exactly:
   "{DOCUMENT_NOT_FOUND}"
6. NEVER invent, hallucinate, or assume qualifications, tools, or facts not present in the DOCUMENT CONTEXT.
7. Format your response cleanly using Markdown.
"""

    print("RAG: evaluating document context with Gemini...")
    answer = await generate_gemini_answer(prompt)

    if not answer or not answer.strip():
        print("[RAG DEBUG] Relevance Decision: REJECTED (Empty answer from Gemini)")
        print("=" * 60 + "\n")
        return {
            "found": False,
            "answer": None,
            "confidence": conf,
            "citations": citations,
            "best_distance": best_dist,
            "gap": gap
        }

    answer_clean = answer.strip()

    if answer_clean == DOCUMENT_NOT_FOUND or DOCUMENT_NOT_FOUND in answer_clean:
        print("[RAG DEBUG] Relevance Decision: REJECTED (Information not present in document)")
        print("=" * 60 + "\n")
        return {
            "found": False,
            "answer": None,
            "confidence": conf,
            "citations": citations,
            "best_distance": best_dist,
            "gap": gap
        }

    print("[RAG DEBUG] Relevance Decision: ACCEPTED")
    print(f"[RAG DEBUG] Final Answer: \"{answer_clean[:120]}...\"")
    print("=" * 60 + "\n")

    return {
        "found": True,
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

    if not result.get("found", False):
        return None

    return result.get("answer")