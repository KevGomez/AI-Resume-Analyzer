import { api } from "./api";
import { isJobOrResumeRelated, DEFAULT_RESPONSES } from "../utils/chatUtils";

export interface ResumeAnalysis {
  skills: {
    [category: string]: string[];
  };
  extracted_text: string;
  confidence_scores: {
    [skill: string]: number;
  };
}

export interface Resume {
  id: number;
  filename: string;
  file_type: string;
  created_at: string;
  skills: string[];
}

export interface FilterCriteria {
  skills: string[];
  education_levels: string[];
  min_experience: number | null;
  max_experience: number | null;
}

export interface FilteredResume {
  id: number;
  filename: string;
  created_at: string;
  years_of_experience: number;
  education_level: string;
  skills: {
    [category: string]: string[];
  };
  education: {
    degree: string;
    field: string;
    institution: string;
    graduation_year: number;
    gpa: number;
  }[];
}

export const resumeService = {
  async uploadResume(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<{
      status: string;
      message: string;
      resume_id: number;
      skills: {
        [category: string]: string[];
      };
    }>("/api/resumes/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  async getResumes() {
    const response = await api.get<{
      status: string;
      resumes: Resume[];
    }>("/api/resumes/list");
    return response.data.resumes;
  },

  async getResumeDetails(id: number) {
    const response = await api.get<{
      status: string;
      resume: Resume;
    }>(`/api/resumes/${id}`);
    return response.data.resume;
  },

  async getResumeSkills(id: number) {
    const response = await api.get<{
      [category: string]: string[];
    }>(`/api/resumes/${id}/skills`);
    return response.data;
  },

  async deleteResume(id: number) {
    const response = await api.delete<{
      message: string;
    }>(`/api/resumes/${id}`);
    return response.data;
  },

  async askQuestion(resumeId: number, question: string) {
    if (!isJobOrResumeRelated(question)) {
      return { answer: DEFAULT_RESPONSES.OUT_OF_SCOPE };
    }

    const response = await api.post<{
      answer: string;
    }>("/api/chat/ask", {
      resume_id: resumeId,
      question: question,
    });
    return response.data;
  },

  async getAIResponse(question: string) {
    if (!isJobOrResumeRelated(question)) {
      return DEFAULT_RESPONSES.OUT_OF_SCOPE;
    }

    const defaultResponse = getDefaultResponse(question);
    if (defaultResponse) {
      return defaultResponse;
    }

    const response = await api.post<{
      answer: string;
    }>("/api/chat/ask", {
      question: question,
    });
    return response.data.answer;
  },

  async filterResumes(criteria: FilterCriteria) {
    const response = await api.post<{
      total: number;
      resumes: FilteredResume[];
    }>("/api/resumes/filter", criteria);
    return response.data;
  },
};
