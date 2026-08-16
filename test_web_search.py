import asyncio

from app.services.web_search_service import web_search_answer


async def main():

    question = "What is the latest version of Python?"

    results = await web_search_answer(question)

    print("\n===== WEB SEARCH RESULTS =====\n")
    print(results)


asyncio.run(main())