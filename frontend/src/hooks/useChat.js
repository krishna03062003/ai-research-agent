import { useState, useCallback } from "react";
import { askQuestion } from "../services/api";

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (questionText, { forceRoute = null } = {}) => {
    const trimmed = questionText.trim();
    if (!trimmed || isLoading) return;

    const userMessageId = `user_${Date.now()}`;
    const userMessage = {
      id: userMessageId,
      sender: "user",
      content: forceRoute === "WEB" ? `[Web Search] ${trimmed}` : trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    setCurrentStep(
      forceRoute === "WEB"
        ? "Searching authoritative web sources..."
        : "Classifying query intent..."
    );

    const stepTimer1 = setTimeout(() => {
      setCurrentStep(
        forceRoute === "WEB"
          ? "Ranking & verifying web evidence..."
          : "Executing research & vector search..."
      );
    }, 1200);

    const stepTimer2 = setTimeout(() => {
      setCurrentStep("Synthesizing verified response...");
    }, 2400);

    try {
      const response = await askQuestion(trimmed, forceRoute);

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const assistantMessage = {
        id: `assistant_${Date.now()}`,
        sender: "assistant",
        content: response.answer || "No response received.",
        route: response.route || "GENERAL",
        confidence: response.confidence,
        sources: response.sources || [],
        document_citations: response.document_citations || [],
        metadata: response.metadata || {},
        can_search_web: response.can_search_web || false,
        original_question: response.original_question || trimmed,
        actionTaken: null,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      const errorMessage = {
        id: `error_${Date.now()}`,
        sender: "assistant",
        content: `**Error**: ${err.message || "An unexpected error occurred while processing your request."}`,
        isError: true,
        route: "GENERAL",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setCurrentStep(null);
    }
  }, [isLoading]);

  const handleConfirmWebSearch = useCallback((msgId, originalQuestion) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId ? { ...msg, actionTaken: "yes" } : msg
      )
    );
    sendMessage(originalQuestion, { forceRoute: "WEB" });
  }, [sendMessage]);

  const handleDismissWebSearch = useCallback((msgId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId ? { ...msg, actionTaken: "no" } : msg
      )
    );
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    currentStep,
    error,
    sendMessage,
    clearChat,
    handleConfirmWebSearch,
    handleDismissWebSearch,
  };
}
