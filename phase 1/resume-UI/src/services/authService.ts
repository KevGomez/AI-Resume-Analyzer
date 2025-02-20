import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { auth, database } from "../config/firebase";
import { getAuthErrorMessage } from "../utils/errorUtils";
import {
  UserProfile,
  AuthErrorType,
  LoginFormData,
  SignupFormData,
} from "../types";

export class AuthError extends Error implements AuthErrorType {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export const authService = {
  async signup({
    email,
    password,
    fullName,
  }: SignupFormData): Promise<UserProfile> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update user profile with full name
      await updateProfile(user, {
        displayName: fullName,
      });

      // Store additional user data in Realtime Database
      const userData: UserProfile = {
        uid: user.uid,
        email: user.email!,
        fullName,
        createdAt: new Date().toISOString(),
      };

      await set(ref(database, `users/${user.uid}`), userData);

      return userData;
    } catch (error) {
      const message = getAuthErrorMessage(error);
      throw new AuthError(message);
    }
  },

  async login({ email, password }: LoginFormData): Promise<UserProfile> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get user profile from Realtime Database
      const userSnapshot = await get(ref(database, `users/${user.uid}`));
      const userData = userSnapshot.val() as UserProfile;

      return userData;
    } catch (error) {
      const message = getAuthErrorMessage(error);
      throw new AuthError(message);
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      const message = getAuthErrorMessage(error);
      throw new AuthError(message);
    }
  },

  getCurrentUser(): Promise<UserProfile | null> {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (user: User | null) => {
          unsubscribe();
          if (user) {
            try {
              const userSnapshot = await get(
                ref(database, `users/${user.uid}`)
              );
              const userData = userSnapshot.val() as UserProfile;
              resolve(userData);
            } catch (error) {
              const message = getAuthErrorMessage(error);
              reject(new AuthError(message));
            }
          } else {
            resolve(null);
          }
        },
        (error) => {
          const message = getAuthErrorMessage(error);
          reject(new AuthError(message));
        }
      );
    });
  },

  onAuthStateChange(callback: (user: UserProfile | null) => void): () => void {
    return onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const userSnapshot = await get(ref(database, `users/${user.uid}`));
          const userData = userSnapshot.val() as UserProfile;
          callback(userData);
        } catch (error) {
          console.error("Error getting user data:", error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  },
};
