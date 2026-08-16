from app.services.calculator_service import calculate


tests = [
    "25 * 800 / 100",
    "100 + 50",
    "500 - 125",
    "20 * 5",
    "100 / 4",
    "10 % 3",
]


for expression in tests:

    try:
        result = calculate(expression)

        print(
            f"{expression} = {result}"
        )

    except Exception as e:

        print(
            f"{expression} -> ERROR: {e}"
        )