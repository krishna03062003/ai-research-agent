import asyncio

from app.services.retrieval_service import retrieve_documents


async def main():

    question = "What does the document say about romantic poetry?"

    results = await retrieve_documents(question)

    print("\n===== RETRIEVAL RESULTS =====\n")

    print("Found:", results["found"])
    print("Confidence:", round(results["confidence"], 3))
    print("Best Distance:", results["best_distance"])
    print("Second Distance:", results["second_distance"])
    print("Gap:", round(results["gap"], 3))

    documents = results["results"]["documents"][0]
    distances = results["results"]["distances"][0]

    for i, document in enumerate(documents):

        print(f"\n--- Result {i + 1} ---")
        print(f"Distance: {distances[i]}")
        print("Text:")
        print(document[:1000])


asyncio.run(main())