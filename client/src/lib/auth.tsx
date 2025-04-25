import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential
} from "firebase/auth";
import { useLocation } from "wouter";
import { apiRequest } from "./queryClient";
import { auth, googleProvider } from "./firebase";

interface AuthContextType {
  user: FirebaseUser | null;
  userRole: string | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, role: string, firstName: string, lastName: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user role from backend
        try {
          const response = await fetch(`/api/users/email/${firebaseUser.email}`);
          if (response.ok) {
            const userData = await response.json();
            setUserRole(userData.role);
            
            // Redirect based on role
            if (userData.role === "resident") {
              setLocation("/resident");
            } else if (userData.role === "driver") {
              setLocation("/driver");
            } else if (userData.role === "admin") {
              setLocation("/admin");
            }
          } else {
            setUserRole(null);
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setLocation]);

  const signUp = async (
    email: string, 
    password: string, 
    role: string, 
    firstName: string, 
    lastName: string
  ) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user in backend
      await apiRequest("POST", "/api/users", {
        email: email,
        username: email.split("@")[0],
        password: "firebase-auth", // we don't store the actual password, just a placeholder
        role,
        firstName,
        lastName
      });
      
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      // Use popup for Google Sign-In
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if user exists in backend, if not create one
      try {
        const response = await fetch(`/api/users/email/${result.user.email}`);
        if (!response.ok) {
          // User doesn't exist, create one with appropriate fields
          const names = result.user.displayName?.split(' ') || ['User'];
          const firstName = names[0];
          const lastName = names.length > 1 ? names.slice(1).join(' ') : '';
          
          await apiRequest("POST", "/api/users", {
            email: result.user.email!,
            username: result.user.email!.split("@")[0],
            password: "firebase-auth", // Just a placeholder
            role: "resident", // Default role for Google sign-ins
            firstName: firstName,
            lastName: lastName,
            profileImageUrl: result.user.photoURL || ''
          });
          
          console.log("New user created for Google sign-in:", result.user.email);
        } else {
          console.log("Existing user found for Google sign-in:", result.user.email);
        }
      } catch (err) {
        console.error("Error checking/creating user in backend:", err);
      }
      
      return result;
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError(err.message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setLocation("/auth");
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    userRole,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
