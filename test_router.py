import asyncio

from app.agent.router import classify_question


async def main():

    questions = [
        "What does the document say about romantic poetry?",
        "What is the capital of Japan?",
        "Write a beautiful romantic Urdu shayari.",
        "Calculate 25 percent of 800."
    ]

    for question in questions:

        result = await classify_question(question)

        print("\nQuestion:", question)
        print("Route:", result)


asyncio.run(main())