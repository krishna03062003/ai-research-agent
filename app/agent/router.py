from app.services.gemini_service import generate_gemini_answer


VALID_ROUTES = {
    "DOCUMENT",
    "WEB",
    "CREATIVE",
    "GENERAL",
    "CALCULATOR",
}


async def classify_question(
    question: str
) -> str:

    question = question.strip()

    if not question:
        return "GENERAL"

    prompt = f"""
You are the intent classifier for an AI Research Assistant.

Your job is ONLY to classify the user's question.

Return exactly ONE of these category names:

DOCUMENT
WEB
CREATIVE
GENERAL
CALCULATOR

Do NOT answer the question.
Do NOT explain your decision.
Return ONLY the category name.

=========================================================
CATEGORY DEFINITIONS
=========================================================

DOCUMENT

Choose DOCUMENT when the user asks about:
- uploaded documents, resumes, CVs, or PDFs
- what a document or resume says
- specific persons, candidates, job titles, companies, experience, education, skills, contact info, or facts that relate to an uploaded document/resume
- questions referring to "this resume", "the document", "the PDF", "the file", "the candidate", "the author"

Strong indicators include phrases such as:

- according to the document
- according to the PDF
- in this resume / according to the resume
- who is the person in this resume
- how many years of experience does [Name] have
- what does the document say
- what does the PDF say
- explain from the document
- based on the document
- in the uploaded file
- from the uploaded document
- what does this file say

Also choose DOCUMENT when the user's question asks about a specific person, career background, experience, or specialized information that is intended to be answered from the uploaded document.

Important:
If the user asks about a document, resume, or a specific individual's experience/profile, prefer DOCUMENT. If the document does not contain the answer, the system will automatically fall back to web search.

Examples:

"Who is the person mentioned in this resume?"
→ DOCUMENT

"How many years of experience does Aparna Khatri have?"
→ DOCUMENT

"According to the document, what is the capital of Japan?"
→ DOCUMENT



WEB

Choose WEB when the answer should be researched from the
internet or requires current/external information.

Choose WEB for:

- latest information
- current information
- today's information
- recent events
- news
- current versions
- current prices
- current companies
- current products
- current people or public figures
- current laws or regulations
- websites
- external sources
- facts that need verification
- information unlikely to be contained in the uploaded document

Examples:

"What is the latest version of Python?"
→ WEB

"What is the current price of an iPhone?"
→ WEB

"What happened in the latest OpenAI news?"
→ WEB


CREATIVE

Choose CREATIVE when the user asks the assistant to CREATE
original content.

Examples:

- write a poem
- write a shayari
- write a story
- write an email
- create a caption
- generate ideas
- write a paragraph
- create original content

Example:

"Write a romantic Urdu shayari."
→ CREATIVE


CALCULATOR

Choose CALCULATOR when the primary purpose of the question
is mathematical calculation.

Examples:

"25 percent of 800"
→ CALCULATOR

"100 + 50"
→ CALCULATOR

"500 * 20 / 100"
→ CALCULATOR

"Calculate 15% of 2000"
→ CALCULATOR


GENERAL

Choose GENERAL for stable, simple knowledge questions that
do not require:

- uploaded documents
- web research
- creative generation
- calculation

Examples:

"What is Python?"
→ GENERAL

"What is a variable?"
→ GENERAL

"What is an operating system?"
→ GENERAL


=========================================================
IMPORTANT PRIORITY RULES
=========================================================

When multiple categories seem possible, use this priority:

1. DOCUMENT
2. CALCULATOR
3. CREATIVE
4. WEB
5. GENERAL

However, use the priority only when the user's wording
actually supports that category.

DOCUMENT has highest priority when the user explicitly
references the uploaded document.

For example:

"According to the document, calculate 25 percent of 800."

→ DOCUMENT

because the user explicitly asks according to the document.

For a normal calculation:

"What is 25 percent of 800?"

→ CALCULATOR

For a creative request:

"Write a romantic poem about Python."

→ CREATIVE

For a current fact:

"What is the latest Python version?"

→ WEB


=========================================================
CLASSIFICATION RULES
=========================================================

1. Return ONLY one valid category.

2. Never return multiple categories.

3. Never explain your decision.

4. Never answer the user's question.

5. Do not use outside knowledge to answer the question.

6. Focus only on the user's intent.

7. If the user explicitly refers to an uploaded document,
   classify as DOCUMENT.

8. If the question requires current/external information,
   classify as WEB.

9. If the user asks to create original content,
   classify as CREATIVE.

10. If the main task is mathematical calculation,
    classify as CALCULATOR.

11. Otherwise classify as GENERAL.


=========================================================
USER QUESTION
=========================================================

{question}

=========================================================
OUTPUT
=========================================================

Return exactly one of:

DOCUMENT
WEB
CREATIVE
GENERAL
CALCULATOR
"""

    result = await generate_gemini_answer(
        prompt
    )

    route = result.strip().upper()

    # ---------------------------------------------------------
    # Validate Gemini's classification
    # ---------------------------------------------------------

    if route in VALID_ROUTES:
        return route

    # ---------------------------------------------------------
    # Safety fallback
    # ---------------------------------------------------------

    print(
        f"Router: invalid classification received: {route}"
    )

    return "GENERAL"