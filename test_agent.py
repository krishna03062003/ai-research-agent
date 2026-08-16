import asyncio

from app.services.agent_service import process_question


async def main():

    questions = [
        "What does the document say about romantic poetry?",
        "What is the latest version of Python?",
        "Write a beautiful romantic Urdu shayari.",
        "What is Python?"
    ]

    for question in questions:

        print("\n==============================")
        print("QUESTION:", question)
        print("==============================")

        answer = await process_question(question)

        print("\nANSWER:")
        print(answer)


asyncio.run(main())