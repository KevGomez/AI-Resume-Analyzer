import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { resumeService, ResumeAnalysis } from "../services/resumeService";

interface UseResumeReturn {
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  uploadResume: (file: File) => Promise<void>;
  analysis: ResumeAnalysis | null;
  isAnalyzing: boolean;
  getAnalysis: (id: string) => Promise<void>;
}

export const useResume = (): UseResumeReturn => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const uploadResume = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        const { id } = await resumeService.uploadResume(file);

        // Navigate to analysis page with the resume ID
        navigate(`/analysis?id=${id}`);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to upload resume"
        );
      } finally {
        setIsUploading(false);
      }
    },
    [navigate]
  );

  const getAnalysis = useCallback(async (id: string) => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const result = await resumeService.getAnalysis(id);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get analysis");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    isUploading,
    uploadProgress,
    error,
    uploadResume,
    analysis,
    isAnalyzing,
    getAnalysis,
  };
};
