import asyncio

from app.services.rag_service import answer_question


async def main():
    question = "What does the document say about romantic poetry?"

    answer = await answer_question(question)

    print("\n===== RAG ANSWER =====\n")
    print(answer)


asyncio.run(main())