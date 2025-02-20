import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { firebaseService, ResumeUpload } from "../../services/firebaseService";

interface SidebarProps {
  userId: string;
  selectedResumeId?: string;
  onResumeSelect: (resumeId: string) => void;
}

const Sidebar = ({
  userId,
  selectedResumeId,
  onResumeSelect,
}: SidebarProps) => {
  const [resumes, setResumes] = useState<ResumeUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadResumes = async () => {
      try {
        const history = await firebaseService.getResumeHistory(userId);
        setResumes(history);
      } catch (error) {
        console.error("Error loading resume history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadResumes();
  }, [userId]);

  return (
    <aside className="w-80 h-full bg-dark-300/30 backdrop-blur-sm border-r border-white/10">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">Resume History</h2>
        <p className="text-sm text-white/60 mt-1">
          View and manage your resume analyses
        </p>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-10rem)] overflow-y-auto">
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-8">
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
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-4 text-white/70 text-sm">
                No resume uploads yet
              </p>
              <button
                onClick={() => navigate("/upload")}
                className="mt-4 px-4 py-2 text-sm text-white/90 hover:text-white bg-primary-500/20 hover:bg-primary-500/30 rounded-lg transition-colors duration-200"
              >
                Upload Resume
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <button
                  key={resume.id}
                  onClick={() => onResumeSelect(resume.id)}
                  className={`w-full group text-left p-4 rounded-xl transition-all duration-200 ${
                    selectedResumeId === resume.id
                      ? "bg-primary-500/20 border border-primary-500/50"
                      : "hover:bg-dark-200/50 border border-transparent hover:border-white/10"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className={`p-2 rounded-lg ${
                          selectedResumeId === resume.id
                            ? "bg-primary-500/20"
                            : "bg-dark-200/50 group-hover:bg-dark-200"
                        }`}
                      >
                        <svg
                          className={`h-4 w-4 ${
                            resume.status === "analyzed"
                              ? "text-green-500"
                              : "text-yellow-500"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          {resume.status === "analyzed" ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          )}
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate mb-1">
                        {resume.fileName}
                      </p>
                      <div className="flex items-center text-xs text-white/50 space-x-2">
                        <span>
                          {format(new Date(resume.uploadDate), "MMM d, yyyy")}
                        </span>
                        <span>•</span>
                        <span>
                          {format(new Date(resume.uploadDate), "h:mm a")}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            resume.status === "analyzed"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-yellow-500/10 text-yellow-500"
                          }`}
                        >
                          {resume.status === "analyzed"
                            ? "Analyzed"
                            : "Processing"}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-dark-300/30 backdrop-blur-sm">
        <button
          onClick={() => navigate("/upload")}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Upload New Resume</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
