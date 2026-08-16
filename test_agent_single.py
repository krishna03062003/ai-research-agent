import asyncio

from app.services.agent_service import process_question


async def main():

    question = "What is the latest version of Python?"

    print("\n==============================")
    print("QUESTION:", question)
    print("==============================")

    answer = await process_question(question)

    print("\nANSWER:")
    print(answer)


asyncio.run(main())