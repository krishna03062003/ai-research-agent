from app.services.gemini_service import generate_gemini_answer


async def generate_answer(
    question: str,
    provider: str = "gemini"
) -> str:

    if provider == "gemini":
        return await generate_gemini_answer(question)

    raise ValueError("Unsupported LLM provider")