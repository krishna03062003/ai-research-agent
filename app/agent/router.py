import re
from app.services.gemini_service import generate_gemini_answer
from app.services.vector_store import get_collection_stats


VALID_ROUTES = {
    "DOCUMENT",
    "WEB",
    "CREATIVE",
    "GENERAL",
    "CALCULATOR",
}


def _fast_path_classify(question: str, has_doc: bool) -> str | None:
    """
    Ultra-fast heuristic classification for clear-cut intents.
    Returns category name if matched with high confidence, else None.
    """
    q = question.strip().lower()

    # 1. CALCULATOR Fast Path
    math_calc_pattern = r"^(?:what\s+is\s+|calculate\s+|solve\s+)?[\d\.\s\+\-\*\/\(\)\^\%]+(?:\s*\?)?$"
    percent_pattern = r"^(?:what\s+is\s+|calculate\s+)?\d+(?:\.\d+)?\s*(?:%|percent)\s*of\s*\d+(?:\.\d+)?\s*\??$"
    
    if re.match(percent_pattern, q) or (re.match(math_calc_pattern, q) and any(op in q for op in ["+", "-", "*", "/", "%", "^"]) and not any(w in q for w in ["poem", "resume", "pdf", "version", "salary", "news", "role", "candidate"])):
        return "CALCULATOR"

    # 2. WEB Fast Path (Market/current external queries)
    # Distinguish person-specific salary from general role/market salary
    is_market_salary = (
        "salary range for" in q 
        or "expected salary range" in q 
        or "expected salary for" in q 
        or "average salary for" in q 
        or "market salary" in q 
        or "salary in india" in q 
        or "developer earn" in q 
        or "engineer earn" in q
        or "engineer in india" in q
    )
    if is_market_salary:
        return "WEB"

    web_indicators = [
        "latest version of", "latest python version", "latest openai news",
        "current ai job market", "current price of", "today's weather",
        "latest news about", "who won the latest"
    ]
    if any(wi in q for wi in web_indicators):
        return "WEB"

    # 3. DOCUMENT Fast Path (when document is active)
    if has_doc:
        doc_explicit_indicators = [
            "this resume", "my resume", "the resume", "this pdf", "the pdf",
            "this doc", "this document", "the document", "the uploaded file",
            "the uploaded document", "uploaded pdf", "in the resume", "in this resume",
            "from the resume", "from the document", "from this document", "from the pdf",
            "according to the document", "according to the pdf", "according to the resume",
            "summarize this", "summarize the pdf", "summarize the document", "summarize my resume",
            "summarize this resume", "summarize it", "give me a summary of my resume",
            "give me a summary of the document", "summary of this resume", "summary of the document",
            "summary of this pdf", "summary of the pdf",
            "does this resume mention", "does the resume mention", "does the document mention",
            "does this pdf mention", "does it mention", "is it mentioned in the resume",
            "how many years of experience are mentioned", "how much experience does this resume have",
            "how much experience is mentioned", "how many years of experience does",
            "what skills are listed", "what skills are in this resume", "what projects are in this resume",
            "what projects are mentioned", "projects are mentioned", "skills are mentioned",
            "what companies has the candidate worked at", "who is the person in this resume",
            "who is mentioned in this resume", "candidate's current salary", "candidate's salary",
            "salary of the candidate", "salary does this person earn", "what is krishna's salary",
            "candidate have experience", "does this candidate have", "does the candidate have",
            "is this person eligible", "is this candidate eligible", "is the candidate eligible",
            "eligible for", "suitable for", "suitability for", "fit for an ai role", "fit for a",
            "eligible for ai role", "eligible for an ai role", "eligible for the role",
            "strengths of this candidate", "qualifications of the candidate"
        ]

        if any(indicator in q for indicator in doc_explicit_indicators):
            return "DOCUMENT"

        # Check if question mentions candidate / person / resume terms combined with skills or suitability
        resume_terms = ["resume", "candidate", "person", "applicant", "profile", "document", "pdf"]
        analysis_terms = ["eligible", "suitable", "fit", "qualification", "skills", "experience", "projects", "python", "docker", "ai role", "ml", "genai", "llm", "salary"]
        if any(rt in q for rt in resume_terms) and any(at in q for at in analysis_terms):
            return "DOCUMENT"

    # 4. CREATIVE Fast Path
    creative_indicators = [
        "write a poem", "write a shayari", "write a story", "compose a poem",
        "write an urdu shayari", "write a romantic", "write a song", "write a script"
    ]
    if any(q.startswith(ci) or f" {ci}" in q for ci in creative_indicators):
        return "CREATIVE"

    return None


async def classify_question(
    question: str
) -> str:

    question = question.strip()

    if not question:
        return "GENERAL"

    stats = get_collection_stats()
    has_doc = stats.get("has_document", False)

    # ---------------------------------------------------------
    # Fast path check
    # ---------------------------------------------------------
    fast_route = _fast_path_classify(question, has_doc)
    if fast_route:
        print(f"[ROUTER] Fast-path selected: {fast_route} for '{question}'")
        return fast_route

    # ---------------------------------------------------------
    # Gemini Intent Classification Prompt
    # ---------------------------------------------------------
    doc_context_info = (
        "NOTE: An uploaded document (e.g. PDF/Resume) IS currently active in the system."
        if has_doc
        else "NOTE: No uploaded document is currently active."
    )

    prompt = f"""
You are the intent classifier for an AI Research & Document Assistant.

{doc_context_info}

Your job is ONLY to classify the user's question into exactly ONE category:
DOCUMENT
WEB
CREATIVE
GENERAL
CALCULATOR

Return ONLY the category name. Do NOT answer the question. Do NOT explain.

=========================================================
CATEGORY CRITERIA & PRIORITY
=========================================================

1. DOCUMENT (Highest Priority when active document exists and question relates to it):
- Questions referring to "this PDF", "this document", "my resume", "this resume", "the uploaded file", "the candidate", "the author", "this person".
- Questions asking to summarize the document/resume (e.g., "Summarize this PDF", "Summarize my resume", "Summarize it").
- Questions about experience, education, skills, projects, companies, certifications, or facts of the person in the document (e.g., "Does this resume mention Python?", "How many years of experience are mentioned?", "What projects are in this resume?", "Does this candidate have experience with Docker?").
- Compound questions asking multiple resume/document questions (e.g., "Does this resume mention Python? And is this person eligible for AI role?").
- Candidate suitability/eligibility assessments (e.g., "Is this person eligible for an AI role?", "Is this candidate suitable for a developer role?").
- Person-specific queries (e.g., "What is Krishna's salary?", "What salary does this person earn?", "What is the candidate's current salary?").
- Any question grounded in the uploaded document.

2. CALCULATOR:
- Mathematical calculations, percentage questions, arithmetic (e.g. "What is 25 * 48?", "Calculate 25 percent of 800", "100 + 50").

3. CREATIVE:
- Generating original creative content: poems, stories, shayari, scripts, creative writing (e.g. "Write a short poem about AI", "Write a romantic Urdu shayari").

4. WEB:
- Current, live, or time-sensitive external facts, news, latest software versions, stock/market prices (e.g. "What is the latest Python version?", "Current AI job market", "Latest OpenAI news").
- Role/market salary questions across industry/geography (e.g. "What is the expected salary range for an entry-level Python Developer in India?", "What is the expected salary range for an entry-level AI engineer in India?").
- Note: Person-specific salary ("Krishna's salary", "this candidate's salary") is DOCUMENT. Role/market general salary is WEB.

5. GENERAL:
- Stable general knowledge, technical concepts, definitions, explanations (e.g. "Explain what recursion is", "What is an operating system?", "What is Python?").

=========================================================
USER QUESTION:
{question}
=========================================================

Return ONLY one word (DOCUMENT, WEB, CREATIVE, GENERAL, or CALCULATOR):
"""

    result = await generate_gemini_answer(prompt)
    route = result.strip().upper()

    # Clean any potential markdown/formatting
    for valid_route in VALID_ROUTES:
        if valid_route in route:
            return valid_route

    print(f"Router: invalid classification received: {route}, defaulting to GENERAL")
    return "GENERAL"