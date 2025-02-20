import {
  ref,
  push,
  set,
  get,
  query,
  orderByChild,
  equalTo,
  limitToLast,
} from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { database, storage } from "../config/firebase";

export interface ResumeUpload {
  id: string;
  fileName: string;
  uploadDate: string;
  status: "processing" | "analyzed";
  userId: string;
  fileUrl: string;
  analysis?: {
    skills: string[];
    gaps: string[];
    score: number;
    recommendations: string[];
  };
}

class FirebaseService {
  async getResumeHistory(userId: string): Promise<ResumeUpload[]> {
    try {
      const resumesRef = ref(database, "resumes");
      const userResumesQuery = query(
        resumesRef,
        orderByChild("userId"),
        equalTo(userId),
        limitToLast(5)
      );

      const snapshot = await get(userResumesQuery);
      const resumes: ResumeUpload[] = [];

      snapshot.forEach((child) => {
        resumes.push({
          id: child.key!,
          ...child.val(),
        });
      });

      return resumes.sort(
        (a, b) =>
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );
    } catch (error) {
      console.error("Error fetching resume history:", error);
      return [];
    }
  }

  async uploadResume(file: File, userId: string): Promise<ResumeUpload> {
    try {
      // Upload file to Firebase Storage
      const fileRef = storageRef(storage, `resumes/${userId}/${file.name}`);
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      // Create entry in Realtime Database
      const resumesRef = ref(database, "resumes");
      const newResumeRef = push(resumesRef);

      const resumeData: ResumeUpload = {
        id: newResumeRef.key!,
        userId,
        fileName: file.name,
        fileUrl,
        uploadDate: new Date().toISOString(),
        status: "processing",
      };

      await set(newResumeRef, resumeData);
      return resumeData;
    } catch (error) {
      console.error("Error uploading resume:", error);
      throw error;
    }
  }

  async getResumeById(resumeId: string): Promise<ResumeUpload | null> {
    try {
      const resumeRef = ref(database, `resumes/${resumeId}`);
      const snapshot = await get(resumeRef);

      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.key!,
        ...snapshot.val(),
      };
    } catch (error) {
      console.error("Error getting resume:", error);
      throw error;
    }
  }

  async updateResumeAnalysis(
    resumeId: string,
    analysis: ResumeUpload["analysis"]
  ) {
    try {
      const resumeRef = ref(database, `resumes/${resumeId}`);
      await set(
        resumeRef,
        {
          analysis,
          status: "analyzed",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating resume analysis:", error);
      throw error;
    }
  }
}

export const firebaseService = new FirebaseService();
