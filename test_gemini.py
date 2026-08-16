import asyncio

from app.services.gemini_service import generate_gemini_answer


async def main():

    answer = await generate_gemini_answer(
        "Reply with exactly: Gemini API is working."
    )

    print("\n===== GEMINI TEST =====\n")
    print(answer)


asyncio.run(main())