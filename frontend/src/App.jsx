import React, { useState } from "react";
import { Menu, Sparkles, Bot, UploadCloud } from "lucide-react";
import { Sidebar } from "./components/sidebar/Sidebar";
import { UploadModal } from "./components/sidebar/UploadModal";
import { ChatContainer } from "./components/chat/ChatContainer";
import { ChatInput } from "./components/input/ChatInput";
import { useChat } from "./hooks/useChat";
import { useDocument } from "./hooks/useDocument";

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const {
    messages,
    isLoading,
    currentStep,
    sendMessage,
    clearChat,
    handleConfirmWebSearch,
    handleDismissWebSearch,
  } = useChat();

  const {
    documentStatus,
    isUploading,
    uploadError,
    uploadFile,
    resetDocument,
  } = useDocument();

  const handleSelectPrompt = (promptText) => {
    sendMessage(promptText);
  };

  return (
    <div className="app-layout">
      {/* Sidebar Component */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        documentStatus={documentStatus}
        onOpenUpload={() => setIsUploadOpen(true)}
        onResetDocument={resetDocument}
        onClearChat={clearChat}
        onSelectPrompt={handleSelectPrompt}
      />

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 25,
          }}
        />
      )}

      {/* Main Chat Workspace */}
      <main className="main-wrapper">
        {/* Mobile Header */}
        <header className="mobile-header">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: "4px",
            }}
          >
            <Menu size={22} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "var(--radius-sm)",
                background: "var(--gradient-brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              <Bot size={16} />
            </div>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.95rem" }}>
              ResearchAgent
            </span>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: "4px",
            }}
            title="Upload PDF"
          >
            <UploadCloud size={20} />
          </button>
        </header>

        {/* Chat Conversation Scroll Area */}
        <ChatContainer
          messages={messages}
          isLoading={isLoading}
          currentStep={currentStep}
          onSelectPrompt={handleSelectPrompt}
          hasDocument={documentStatus.has_document}
          documentName={documentStatus.filename}
          onConfirmWebSearch={handleConfirmWebSearch}
          onDismissWebSearch={handleDismissWebSearch}
        />

        {/* Input Bar */}
        <ChatInput
          onSendMessage={sendMessage}
          onOpenUpload={() => setIsUploadOpen(true)}
          isLoading={isLoading}
          hasDocument={documentStatus.has_document}
        />
      </main>

      {/* Upload Document Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={uploadFile}
        isUploading={isUploading}
        uploadError={uploadError}
      />
    </div>
  );
}

export default App;
