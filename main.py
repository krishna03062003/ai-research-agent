import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services.agent_service import process_question, process_question_detailed
from app.services.vector_store import get_collection_stats, reset_collection
from ingest import ingest_pdf


app = FastAPI(
    title="AI Research & Document Assistant",
    description="AI-powered document research and question-answering assistant",
    version="1.0.0"
)

# =========================================================
# CORS Middleware
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Question(BaseModel):
    question: str
    force_route: str | None = None


@app.get("/")
async def home():
    return {
        "message": "AI Research & Document Assistant is running"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }


@app.post("/ask")
async def ask_question(data: Question):

    result = await process_question_detailed(
        data.question,
        force_route=data.force_route
    )

    return {
        "question": data.question,
        "answer": result.get("answer", ""),
        "route": result.get("route", "GENERAL"),
        "confidence": result.get("confidence"),
        "sources": result.get("sources", []),
        "document_citations": result.get("document_citations", []),
        "metadata": result.get("metadata", {}),
        "can_search_web": result.get("can_search_web", False),
        "original_question": result.get("original_question", data.question)
    }


# =========================================================
# Document Management Endpoints
# =========================================================

@app.get("/documents/status")
async def document_status():

    stats = get_collection_stats()
    return stats


@app.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )

    os.makedirs("documents", exist_ok=True)
    saved_path = os.path.join("documents", file.filename)

    try:
        with open(saved_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        ingestion_result = await ingest_pdf(saved_path)

        return {
            "success": True,
            "filename": file.filename,
            "pages_count": ingestion_result.get("pages_count", 0),
            "chunks_count": ingestion_result.get("chunks_count", 0),
            "message": f"Successfully ingested {file.filename}"
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to ingest document: {str(error)}"
        )


@app.post("/documents/reset")
async def reset_document_collection():

    reset_collection()

    return {
        "success": True,
        "message": "Document collection has been cleared."
    }