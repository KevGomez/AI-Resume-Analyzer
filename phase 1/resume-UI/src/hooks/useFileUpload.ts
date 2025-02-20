import { useState, useCallback } from "react";
import { useResume } from "../context/ResumeContext";
import { v4 as uuidv4 } from "uuid";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<void>;
  progress: UploadProgress | null;
  error: Error | null;
  isUploading: boolean;
}

export function useFileUpload(): UseFileUploadReturn {
  const { dispatch } = useResume();
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setError(null);
      setProgress(null);

      try {
        // Validate file type
        if (!file.type.includes("pdf") && !file.type.includes("docx")) {
          throw new Error("Only PDF and DOCX files are supported");
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("File size should not exceed 5MB");
        }

        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded * 100) / event.total);
            setProgress({
              loaded: event.loaded,
              total: event.total,
              percentage,
            });
          }
        };

        // Create a promise to handle the XHR request
        const uploadPromise = new Promise<string>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status === 200) {
              resolve(xhr.responseText);
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };
          xhr.onerror = () => reject(new Error("Network error occurred"));
        });

        // Send the request
        xhr.open("POST", "/api/upload");
        xhr.send(formData);

        // Wait for the upload to complete
        const response = await uploadPromise;
        const responseData = JSON.parse(response);

        // Add the resume to the context
        dispatch({
          type: "ADD_RESUME",
          payload: {
            id: uuidv4(),
            fileName: file.name,
            content: responseData.content,
            status: "idle",
          },
        });
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
      } finally {
        setIsUploading(false);
        setProgress(null);
      }
    },
    [dispatch]
  );

  return {
    uploadFile,
    progress,
    error,
    isUploading,
  };
}
