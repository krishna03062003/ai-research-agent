import asyncio

from tavily import AsyncTavilyClient

from app.config import TAVILY_API_KEY


client = AsyncTavilyClient(
    api_key=TAVILY_API_KEY
)


async def main():

    question = "What is the latest version of Python?"

    response = await client.search(
        query=question,
        max_results=5,
        topic="general",
        include_raw_content=True
    )

    results = response.get(
        "results",
        []
    )

    print("\n===== TAVILY RESULT METADATA =====\n")

    for index, result in enumerate(
        results,
        start=1
    ):

        print(
            f"--- Result {index} ---"
        )

        print(
            "Title:",
            result.get("title")
        )

        print(
            "URL:",
            result.get("url")
        )

        print(
            "Score:",
            result.get("score")
        )

        print(
            "Published Date:",
            result.get("published_date")
        )

        print(
            "Raw Content:",
            result.get("raw_content")
        )

        print()


if __name__ == "__main__":

    asyncio.run(main())