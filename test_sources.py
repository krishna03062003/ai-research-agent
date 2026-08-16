from app.services.source_service import rank_sources


def main():

    results = [
        {
            "title": "Python Developer's Guide",
            "url": "https://devguide.python.org/versions",
            "score": 0.80,
            "content": "Status of Python versions"
        },
        {
            "title": "Python Wikipedia",
            "url": "https://en.wikipedia.org/wiki/Python",
            "score": 0.95,
            "content": "Python information"
        },
        {
            "title": "Random Blog",
            "url": "https://example.com/python-blog",
            "score": 0.90,
            "content": "Python article"
        },
        {
            "title": "YouTube Video",
            "url": "https://youtube.com/watch?v=test",
            "score": 0.99,
            "content": "Python video"
        },
    ]

    ranked = rank_sources(results)

    print("\n===== RANKED SOURCES =====\n")

    for index, result in enumerate(ranked, start=1):

        print(
            f"{index}. "
            f"{result['source_type']} | "
            f"Authority: {result['authority_score']} | "
            f"Relevance: {result['score']} | "
            f"Final: {result['final_score']:.3f} | "
            f"{result['title']}"
        )


if __name__ == "__main__":
    main()