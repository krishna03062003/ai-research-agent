# =========================================================
# Create chunks from plain text
# =========================================================

def create_chunks(
    text: str,
    chunk_size: int = 1000,
    overlap: int = 200
) -> list[str]:

    if not text or not text.strip():
        return []

    if chunk_size <= 0:
        raise ValueError(
            "chunk_size must be greater than 0."
        )

    if overlap < 0:
        raise ValueError(
            "overlap cannot be negative."
        )

    if overlap >= chunk_size:
        raise ValueError(
            "overlap must be smaller than chunk_size."
        )

    text = text.strip()

    chunks = []

    start = 0
    text_length = len(text)

    while start < text_length:

        end = min(
            start + chunk_size,
            text_length
        )

        # -----------------------------------------------------
        # Prefer breaking at whitespace
        # -----------------------------------------------------

        if end < text_length:

            whitespace_position = text.rfind(
                " ",
                start,
                end
            )

            if whitespace_position > start:

                end = whitespace_position

        chunk = text[start:end].strip()

        if chunk:

            chunks.append(chunk)

        # -----------------------------------------------------
        # Move forward while keeping overlap
        # -----------------------------------------------------

        next_start = end - overlap

        if next_start <= start:

            next_start = end

        start = next_start

    return chunks


# =========================================================
# Create chunks while preserving page numbers
# =========================================================

def create_page_chunks(
    pages: list[dict],
    chunk_size: int = 1000,
    overlap: int = 200
) -> list[dict]:

    if not pages:
        return []

    if chunk_size <= 0:
        raise ValueError(
            "chunk_size must be greater than 0."
        )

    if overlap < 0:
        raise ValueError(
            "overlap cannot be negative."
        )

    if overlap >= chunk_size:
        raise ValueError(
            "overlap must be smaller than chunk_size."
        )

    chunks = []

    for page in pages:

        text = page.get(
            "text",
            ""
        )

        page_number = page.get(
            "page"
        )

        if not text or not text.strip():
            continue

        text = text.strip()

        start = 0
        text_length = len(text)

        while start < text_length:

            end = min(
                start + chunk_size,
                text_length
            )

            # -------------------------------------------------
            # Prefer breaking at whitespace
            # -------------------------------------------------

            if end < text_length:

                whitespace_position = text.rfind(
                    " ",
                    start,
                    end
                )

                if whitespace_position > start:

                    end = whitespace_position

            chunk = text[start:end].strip()

            if chunk:

                chunks.append({
                    "text": chunk,
                    "page": page_number
                })

            # -------------------------------------------------
            # Move forward while keeping overlap
            # -------------------------------------------------

            next_start = end - overlap

            if next_start <= start:

                next_start = end

            start = next_start

    return chunks