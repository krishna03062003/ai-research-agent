const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Send a user question to the assistant backend.
 */
export async function askQuestion(question) {
  const response = await fetch(`${API_BASE_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check backend connection and health.
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
    });
    if (!response.ok) return { status: "unhealthy" };
    return response.json();
  } catch (error) {
    return { status: "disconnected", error: error.message };
  }
}

/**
 * Get active document indexing status.
 */
export async function getDocumentStatus() {
  const response = await fetch(`${API_BASE_URL}/documents/status`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch document status");
  }

  return response.json();
}

/**
 * Upload and ingest a PDF document.
 */
export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to upload document");
  }

  return response.json();
}

/**
 * Clear the current ChromaDB document collection.
 */
export async function resetDocuments() {
  const response = await fetch(`${API_BASE_URL}/documents/reset`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to reset document collection");
  }

  return response.json();
}
