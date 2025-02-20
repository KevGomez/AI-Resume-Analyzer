import { useState } from "react";
import { Button } from "../common/Button";
import { resumeService } from "../../services/resumeService";
import {
  isJobOrResumeRelated,
  getDefaultResponse,
  DEFAULT_RESPONSES,
} from "../../utils/chatUtils";

interface Message {
  id: string;
  content: string;
  type: "user" | "ai";
  timestamp: Date;
  isLoading?: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "insight" | "alert";
  timestamp: Date;
  read: boolean;
}

export const ChatPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "notifications">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      type: "user",
      timestamp: new Date(),
    };

    // Add user message
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    // Check for default responses first
    const defaultResponse = getDefaultResponse(input);
    if (defaultResponse) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: defaultResponse,
          type: "ai",
          timestamp: new Date(),
        },
      ]);
      setIsProcessing(false);
      return;
    }

    // Validate if question is job/resume related
    if (!isJobOrResumeRelated(input)) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: DEFAULT_RESPONSES.OUT_OF_SCOPE,
          type: "ai",
          timestamp: new Date(),
        },
      ]);
      setIsProcessing(false);
      return;
    }

    // Add AI loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "Analyzing your request...",
      type: "ai",
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Get AI response using the same service as Ask Anything Chatbot
      const response = await resumeService.getAIResponse(input);

      // Remove loading message and add AI response
      setMessages((prev) => {
        const withoutLoading = prev.filter((msg) => !msg.isLoading);
        return [
          ...withoutLoading,
          {
            id: (Date.now() + 2).toString(),
            content: response,
            type: "ai",
            timestamp: new Date(),
          },
        ];
      });
    } catch (error) {
      // Remove loading message and add error message
      setMessages((prev) => {
        const withoutLoading = prev.filter((msg) => !msg.isLoading);
        return [
          ...withoutLoading,
          {
            id: (Date.now() + 2).toString(),
            content: DEFAULT_RESPONSES.ERROR,
            type: "ai",
            timestamp: new Date(),
          },
        ];
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`fixed right-6 bottom-6 z-50 transition-all duration-300 ${
        isExpanded ? "w-96" : "w-auto"
      }`}
    >
      {/* Chat Panel */}
      {isExpanded && (
        <div className="mb-4 bg-dark-300/95 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-xl">
          <div className="h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">AI Assistant</h3>
                  <p className="text-xs text-white/50">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-white/50 hover:text-white transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-primary-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-white font-medium mb-2">
                    Welcome to AI Assistant
                  </h4>
                  <p className="text-white/50 text-sm">
                    Ask me anything about your resume or job search!
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.type === "user"
                          ? "bg-primary-500 text-white"
                          : "bg-dark-200 text-white/90"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 bg-dark-200 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-white/40"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                />
                <Button onClick={handleSend}>Send</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-accent-500
          flex items-center justify-center shadow-lg hover:shadow-primary-500/25
          transform hover:scale-105 transition-all duration-200
          ${isExpanded ? "rotate-180" : ""}
        `}
      >
        <svg
          className="w-7 h-7 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </button>
    </div>
  );
};
