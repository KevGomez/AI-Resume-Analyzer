import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { validateFile, formatFileSize } from "../utils/fileUtils";
import { FILE_TYPES, FILE_EXTENSIONS, MAX_FILE_SIZE } from "../utils/constants";
import { Button } from "../components/common/Button";
import { resumeService } from "../services/resumeService";
import { notificationService } from "../services/notificationService";
import { auth } from "../config/firebase";

const Upload = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const { isValid, error: validationError } = validateFile(file);
      if (!isValid && validationError) {
        setError(validationError);
        return;
      }

      try {
        setIsUploading(true);
        setError(null);

        const result = await resumeService.uploadResume(file);
        console.log("Upload successful:", result);

        // Add notifications for successful upload
        notificationService.addResumeUploadNotifications(
          result.resume_id,
          file.name
        );

        // Navigate to analysis page with the new resume ID
        navigate(`/analysis?id=${result.resume_id}`);
      } catch (err) {
        console.error("Upload error:", err);
        if (err instanceof Error && err.message.includes("401")) {
          navigate("/login");
          return;
        }
        setError(
          err instanceof Error ? err.message : "Failed to upload resume"
        );

        // Add error notification
        notificationService.addNotification({
          title: "Upload Failed",
          message:
            err instanceof Error
              ? err.message
              : "Failed to upload resume. Please try again.",
          type: "alert",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [navigate]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    disabled: isUploading,
  });

  const handleButtonClick = () => {
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12 mt-12">
        <h1 className="text-4xl font-display font-bold mb-4">
          <span className="bg-gradient-to-r from-primary-400 to-accent-400 text-transparent bg-clip-text">
            Upload Your Resume
          </span>
        </h1>
        <p className="text-white/70">
          Upload your resume and let our AI analyze it for you
        </p>
      </div>

      <div className="bg-dark-300/30 backdrop-blur-sm border border-white/10 rounded-xl p-8">
        <div
          {...getRootProps()}
          className={`
            relative p-8 border-2 border-dashed rounded-lg transition-all duration-200 mb-6
            ${
              isDragActive
                ? "border-primary-400 bg-primary-500/10"
                : "border-white/20 hover:border-primary-400/50"
            }
            ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            <div className="mb-4">
              <svg
                className={`mx-auto h-12 w-12 ${
                  isDragActive ? "text-primary-400" : "text-white/50"
                }`}
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
            </div>
            <div className="text-white/70">
              <p className="text-sm">
                {isUploading
                  ? "Uploading your resume..."
                  : "Drag and drop your resume here, or click to select"}
              </p>
              <p className="text-xs mt-2">
                Supported formats: {Object.values(FILE_EXTENSIONS).join(", ")}
              </p>
              <p className="text-xs mt-1">
                Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <Button
          type="button"
          fullWidth
          size="lg"
          isLoading={isUploading}
          loadingText="Uploading..."
          disabled={isUploading}
          onClick={handleButtonClick}
        >
          Select Resume
        </Button>
      </div>
    </div>
  );
};

export default Upload;
