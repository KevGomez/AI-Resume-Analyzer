// User related types
export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  createdAt?: string;
}

// Resume related types
export interface ResumeUpload {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
  status: "pending" | "analyzed";
  analysis?: ResumeAnalysis;
}

export interface ResumeAnalysis {
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  improvements: string[];
  jobRecommendations: JobRecommendation[];
}

export interface ExperienceItem {
  company: string;
  position: string;
  duration: string;
  highlights: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  year: string;
}

export interface JobRecommendation {
  title: string;
  company: string;
  matchScore: number;
  description: string;
}

// Component Props Types
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Error Types
export interface AuthErrorType extends Error {
  code?: string;
  name: "AuthError";
}

// Service Response Types
export interface UploadResponse {
  id: string;
  fileUrl: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData extends LoginFormData {
  fullName: string;
}
