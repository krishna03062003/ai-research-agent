from google import genai

from app.config import GEMINI_API_KEY, GEMINI_MODEL


# =========================================================
# Gemini client
# =========================================================

client = genai.Client(
    api_key=GEMINI_API_KEY
)


# =========================================================
# Gemini text generation
# =========================================================

async def generate_gemini_answer(
    question: str
) -> str:

    if not question or not question.strip():
        return "I received an empty prompt."

    try:
        interaction = await client.aio.interactions.create(
            model=GEMINI_MODEL,
            input=question
        )

        answer = interaction.output_text

        if not answer:
            return "Gemini returned an empty response."

        return answer.strip()

    except Exception as error:
        error_message = str(error).lower()

        # -----------------------------------------------------
        # Rate limit / quota
        # -----------------------------------------------------
        if (
            "429" in error_message
            or "quota" in error_message
            or "rate limit" in error_message
            or "too_many_requests" in error_message
        ):
            print("Gemini: API quota/rate limit exceeded.")
            return (
                "Gemini API quota has been exceeded. "
                "Please try again after the quota resets."
            )

        # -----------------------------------------------------
        # Other Gemini/API errors
        # -----------------------------------------------------
        print(f"Gemini API error: {error}")
        return (
            "I could not generate an answer "
            "because the Gemini API request failed."
        )


# =========================================================
# Gemini web-enabled generation
# =========================================================

async def generate_web_answer(
    question: str
) -> str:

    if not question or not question.strip():
        return "I received an empty prompt."

    try:
        interaction = await client.aio.interactions.create(
            model=GEMINI_MODEL,
            input=question,
            tools=[
                {
                    "type": "google_search"
                }
            ]
        )

        answer = interaction.output_text

        if not answer:
            return "Gemini returned an empty response."

        return answer.strip()

    except Exception as error:
        error_message = str(error).lower()

        if (
            "429" in error_message
            or "quota" in error_message
            or "rate limit" in error_message
            or "too_many_requests" in error_message
        ):
            print("Gemini Web: API quota/rate limit exceeded.")
            return (
                "Gemini API quota has been exceeded. "
                "Please try again after the quota resets."
            )

        print(f"Gemini Web API error: {error}")
        return (
            "I could not generate the web answer "
            "because the Gemini API request failed."
        )