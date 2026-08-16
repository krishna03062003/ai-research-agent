import { useState, useEffect, useCallback } from "react";
import { getDocumentStatus, uploadDocument, resetDocuments } from "../services/api";

export function useDocument() {
  const [documentStatus, setDocumentStatus] = useState({
    has_document: false,
    filename: null,
    chunks_count: 0,
    loading: true,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getDocumentStatus();
      setDocumentStatus({
        has_document: data.has_document || false,
        filename: data.filename || null,
        chunks_count: data.chunks_count || 0,
        loading: false,
      });
      setUploadError(null);
    } catch (err) {
      setDocumentStatus((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleUpload = async (file) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const result = await uploadDocument(file);
      await fetchStatus();
      return result;
    } catch (err) {
      setUploadError(err.message || "Failed to upload file");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetDocuments();
      await fetchStatus();
    } catch (err) {
      setUploadError(err.message || "Failed to reset document");
      throw err;
    }
  };

  return {
    documentStatus,
    isUploading,
    uploadError,
    setUploadError,
    refreshStatus: fetchStatus,
    uploadFile: handleUpload,
    resetDocument: handleReset,
  };
}
