export const FILE_TYPES = {
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
} as const;

export const FILE_EXTENSIONS = {
  PDF: '.pdf',
  DOC: '.doc',
  DOCX: '.docx',
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ROUTES = {
  HOME: '/',
  UPLOAD: '/upload',
  ANALYSIS: '/analysis',
} as const;

export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File size exceeds 10MB limit',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a PDF, DOC, or DOCX file',
  UPLOAD_FAILED: 'Failed to upload resume. Please try again',
  ANALYSIS_FAILED: 'Failed to analyze resume. Please try again',
} as const; 