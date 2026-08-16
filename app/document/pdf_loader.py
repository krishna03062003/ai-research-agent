import pymupdf


def extract_pages_from_pdf(
    file_path: str
) -> list[dict]:

    if not file_path:

        raise ValueError(
            "PDF file path cannot be empty."
        )

    pages = []

    # ---------------------------------------------------------
    # Open PDF safely
    # ---------------------------------------------------------

    document = pymupdf.open(
        file_path
    )

    try:

        # -----------------------------------------------------
        # Extract text page by page
        # -----------------------------------------------------

        for page_number, page in enumerate(
            document,
            start=1
        ):

            text = page.get_text(
                "text"
            )

            if not text:
                continue

            text = text.strip()

            if not text:
                continue

            pages.append({
                "page": page_number,
                "text": text
            })

    finally:

        # -----------------------------------------------------
        # Always close the PDF
        # -----------------------------------------------------

        document.close()

    return pages