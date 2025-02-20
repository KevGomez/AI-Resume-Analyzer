import { api } from "./api";
import { firebaseService, ResumeUpload } from "./firebaseService";

export interface AIAnalysisResponse {
  skills: string[];
  experience: {
    company: string;
    position: string;
    duration: string;
    highlights: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    year: string;
  }[];
  improvements: string[];
  jobRecommendations: {
    title: string;
    company: string;
    matchScore: number;
    description: string;
  }[];
}

export const analysisService = {
  async analyzeResume(resumeId: string, fileUrl: string): Promise<void> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // For now, simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate API response
      const mockAnalysis: AIAnalysisResponse = {
        skills: ["JavaScript", "React", "TypeScript", "Node.js", "Python"],
        experience: [
          {
            company: "Example Corp",
            position: "Senior Developer",
            duration: "2020 - Present",
            highlights: [
              "Led development of key features",
              "Improved performance by 50%",
              "Mentored junior developers",
            ],
          },
        ],
        education: [
          {
            institution: "University of Technology",
            degree: "Bachelor of Computer Science",
            year: "2019",
          },
        ],
        improvements: [
          "Add more quantifiable achievements",
          "Include certifications section",
          "Elaborate on technical projects",
        ],
        jobRecommendations: [
          {
            title: "Senior Full Stack Developer",
            company: "Tech Solutions Inc",
            matchScore: 85,
            description:
              "Looking for an experienced developer with React and Node.js skills...",
          },
        ],
      };

      // Update Firebase with analysis results
      await firebaseService.updateResumeAnalysis(resumeId, mockAnalysis);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      throw error;
    }
  },

  // This method will be used when the Flask backend is ready
  async analyzeResumeWithAPI(resumeId: string, fileUrl: string): Promise<void> {
    try {
      const response = await api.post<AIAnalysisResponse>("/api/analyze", {
        resumeId,
        fileUrl,
      });

      // Update Firebase with analysis results from API
      await firebaseService.updateResumeAnalysis(resumeId, response.data);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      throw error;
    }
  },
};
