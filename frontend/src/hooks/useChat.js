import { useState, useCallback } from "react";
import { askQuestion } from "../services/api";

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (questionText) => {
    const trimmed = questionText.trim();
    if (!trimmed || isLoading) return;

    const userMessageId = `user_${Date.now()}`;
    const userMessage = {
      id: userMessageId,
      sender: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    setCurrentStep("Classifying query intent...");

    const stepTimer1 = setTimeout(() => {
      setCurrentStep("Executing research & vector search...");
    }, 1200);

    const stepTimer2 = setTimeout(() => {
      setCurrentStep("Synthesizing verified response...");
    }, 2400);

    try {
      const response = await askQuestion(trimmed);

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
  };
}
