import { FirebaseError } from "firebase/app";
import { AuthErrorType } from "../types";

type FirebaseAuthErrorCode =
  | "auth/email-already-in-use"
  | "auth/user-not-found"
  | "auth/wrong-password"
  | "auth/invalid-email"
  | "auth/weak-password"
  | "auth/too-many-requests"
  | "auth/network-request-failed";

export const getAuthErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    const code = error.code as FirebaseAuthErrorCode;
    switch (code) {
      case "auth/email-already-in-use":
        return "This email is already registered";
      case "auth/user-not-found":
        return "No account found with this email";
      case "auth/wrong-password":
        return "Invalid password";
      case "auth/invalid-email":
        return "Invalid email address";
      case "auth/weak-password":
        return "Password should be at least 6 characters";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later";
      case "auth/network-request-failed":
        return "Network error. Please check your connection";
      default:
        return "An error occurred during authentication";
    }
  }

  if ((error as AuthErrorType)?.name === "AuthError") {
    return (error as AuthErrorType).message;
  }

  return "An unexpected error occurred";
};
