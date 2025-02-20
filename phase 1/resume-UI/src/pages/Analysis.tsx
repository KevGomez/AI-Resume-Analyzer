import { useEffect, useState, FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resumeService, Resume } from "../services/resumeService";
import { Loading } from "../components/common/Loading";
import { auth } from "../config/firebase";
import {
  DocumentIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

interface Message {
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
  id?: number;
}

interface SkillsResponse {
  skills: Record<string, string[]>;
}

const Analysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const resumeId = new URLSearchParams(location.search).get("id");
  const [resume, setResume] = useState<Resume | null>(null);
  const [skills, setSkills] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");

  // Check authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const loadResume = async () => {
      if (!resumeId) {
        setError("No resume selected");
        setIsLoading(false);
        return;
      }

      try {
        const [resumeData, skillsData] = await Promise.all([
          resumeService.getResumeDetails(Number(resumeId)),
          resumeService.getResumeSkills(Number(resumeId)),
        ]);

        console.log("Resume Data:", resumeData);
        console.log("Skills Data:", skillsData);

        setResume(resumeData);
        // Process skills data from the response
        if (
          skillsData &&
          skillsData.skills &&
          typeof skillsData.skills === "object"
        ) {
          const processedSkills: Record<string, string[]> = {};
          Object.entries(skillsData.skills).forEach(([category, skillList]) => {
            if (Array.isArray(skillList)) {
              processedSkills[category] = skillList;
            } else {
              processedSkills[category] = [];
            }
          });
          setSkills(processedSkills);
        } else {
          console.warn("Invalid skills data received:", skillsData);
          setSkills({});
        }
      } catch (err) {
        console.error("Error loading resume:", err);
        if (err instanceof Error && err.message.includes("401")) {
          navigate("/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load resume");
      } finally {
        setIsLoading(false);
      }
    };

    loadResume();
  }, [resumeId, navigate]);

  const formatCategory = (category: string): string => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resumeId || !question.trim()) return;

    const userMessage = question.trim();
    setQuestion("");

    // Create a unique ID for this message pair
    const messageId = Date.now();

    // Add user message immediately
    const newUserMessage: Message = {
      role: "user",
      content: userMessage,
      id: messageId,
    };
    setMessages((prev) => [...prev, newUserMessage]);

    // Add temporary thinking message
    const thinkingMessage: Message = {
      role: "assistant",
      content: "Thinking...",
      isLoading: true,
      id: messageId,
    };
    setMessages((prev) => [...prev, thinkingMessage]);

    try {
      const response = await resumeService.askQuestion(
        Number(resumeId),
        userMessage
      );

      // Replace the thinking message with the actual response
      setMessages((prev) => {
        const messagesWithoutThinking = prev.filter(
          (msg) => msg.id !== messageId || msg.role !== "assistant"
        );
        return [
          ...messagesWithoutThinking,
          {
            role: "assistant",
            content: response.answer,
            id: messageId,
          } as Message,
        ];
      });
    } catch (error) {
      console.error("Error asking question:", error);
      if (error instanceof Error && error.message.includes("401")) {
        navigate("/login");
        return;
      }
      // Remove thinking message and add error message
      setMessages((prev) => {
        const messagesWithoutThinking = prev.filter(
          (msg) => msg.id !== messageId || msg.role !== "assistant"
        );
        return [
          ...messagesWithoutThinking,
          {
            role: "assistant",
            content:
              "Sorry, I couldn't process your question. Please try again.",
            id: messageId,
          } as Message,
        ];
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" text="Loading analysis..." />
      </div>
    );
  }

  if (error || !resumeId) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-white/30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-white">
          {error || "No resume selected"}
        </h3>
        <p className="mt-2 text-white/70">
          Please upload a new resume to analyze.
        </p>
        <button
          onClick={() => navigate("/upload")}
          className="mt-6 px-4 py-2 text-sm text-white/90 hover:text-white bg-primary-500/20 hover:bg-primary-500/30 rounded-lg transition-colors duration-200"
        >
          Upload Resume
        </button>
      </div>
    );
  }

  if (!resume) {
    return <div>No resume found</div>;
  }

  return (
    <div className="flex-1 w-full min-h-screen bg-dark-400">
      <div className="w-full h-full px-6 py-8">
        {/* Resume File Name */}
        <div className="flex items-center gap-2 mb-8">
          <DocumentIcon className="w-5 h-5 text-primary-500" />
          <h2 className="text-xl font-semibold text-white">
            {resume.filename}
          </h2>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skills Section */}
          <div className="bg-dark-300/30 backdrop-blur-sm rounded-lg p-8 h-full">
            <div className="flex items-center gap-2 mb-6">
              <SparklesIcon className="w-5 h-5 text-primary-500" />
              <h3 className="text-lg font-semibold text-white">
                Identified Skills
              </h3>
            </div>
            {Object.entries(skills).length > 0 ? (
              Object.entries(skills).map(([category, skillList]) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h4 className="text-md font-medium text-white/80 mb-3">
                    {formatCategory(category)}
                  </h4>
                  <div className="bg-dark-200/40 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(skillList) &&
                        skillList.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-dark-100/30 text-white/90 text-sm rounded-full border border-white/10 hover:border-primary-500/50 transition-colors"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-white/70">No skills found</p>
              </div>
            )}
          </div>

          {/* Chat Section */}
          <div className="bg-dark-300/30 backdrop-blur-sm rounded-lg p-8 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary-500" />
              <h3 className="text-lg font-semibold text-white">
                Ask Questions
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[400px]">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary-500/20 text-white"
                        : "bg-dark-200/40 text-white/90"
                    }`}
                  >
                    {message.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce"></div>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question about the resume..."
                  className="flex-1 bg-dark-200/40 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-primary-500/50"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "..." : "Ask"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
