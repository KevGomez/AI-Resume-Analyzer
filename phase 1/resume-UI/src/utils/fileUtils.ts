import { FILE_TYPES, MAX_FILE_SIZE, ERROR_MESSAGES } from "./constants";

export const validateFile = (
  file: File
): { isValid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE };
  }

  const isValidType = Object.values(FILE_TYPES).includes(file.type);
  if (!isValidType) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_FILE_TYPE };
  }

  return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};
