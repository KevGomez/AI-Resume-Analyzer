import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { validateFile, formatFileSize } from "../utils/fileUtils";
import { FILE_TYPES, FILE_EXTENSIONS, MAX_FILE_SIZE } from "../utils/constants";
import { Button } from "../components/common/Button";
import { firebaseService } from "../services/firebaseService";
import { analysisService } from "../services/analysisService";

const Upload = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // TODO: Replace with actual user ID from authentication
  const userId = "test-user-id";

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const { isValid, error: validationError } = validateFile(file);
      if (!isValid) {
        setError(validationError);
        return;
      }

      try {
        setIsUploading(true);
        setError(null);

        // Upload file to Firebase Storage
        const uploadedResume = await firebaseService.uploadResume(file, userId);

        // Trigger resume analysis
        await analysisService.analyzeResume(
          uploadedResume.id,
          uploadedResume.fileUrl
        );

        // Navigate to analysis page with the new resume ID
        navigate(`/analysis?id=${uploadedResume.id}`);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to upload resume"
        );
      } finally {
        setIsUploading(false);
      }
    },
    [navigate, userId]
  );

  // Rest of the component remains the same
  // ...
};
