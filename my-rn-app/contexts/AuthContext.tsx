import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  role: "parent" | "teacher" | "admin";
  school?: string;
  grade?: string;
  relationship?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", authUser.id)
        .single();

      if (error && error.code === "PGRST116") {
        // Profile doesn't exist, create it
        const pendingData = (window as any).pendingUserData;

        const newProfile = {
          user_id: authUser.id,
          full_name: pendingData?.name || "",
          role: "parent",
          locale: "en",
        };

        const { data: createdProfile, error: createError } = await supabase
          .from("profiles")
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error("Error creating profile:", createError);
          // Continue with basic user data
          setUser({
            id: authUser.id,
            email: authUser.email || "",
            full_name: pendingData?.name || "",
            role: "parent",
            school: "",
            grade: "",
          });
        } else {
          setUser({
            id: authUser.id,
            email: authUser.email || "",
            full_name: createdProfile.full_name || "",
            role: createdProfile.role || "parent",
            school: createdProfile.school || "",
            grade: createdProfile.grade || "",
          });
        }

        // Clear pending data
        delete (window as any).pendingUserData;
      } else if (error) {
        console.error("Error loading profile:", error);
        setLoading(false);
        return;
      } else {
        // Profile exists
        setUser({
          id: authUser.id,
          email: authUser.email || "",
          full_name: profile?.full_name || "",
          role: profile?.role || "parent",
          school: profile?.school || "",
          grade: profile?.grade || "",
        });
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true);

      // Start the minimum 2-second delay for smooth UX
      const startTime = Date.now();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Profile will be created automatically when the user is authenticated
      // and loadUserProfile is called from the auth state change listener

      // Store user data temporarily for profile creation
      if (data.user) {
        // Store in session storage or state for later use
        (window as any).pendingUserData = userData;
      }

      // Ensure minimum 2-second delay has passed for smooth UX
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 2000 - elapsed);

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      throw new Error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Add a small delay to ensure state update is processed
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Start the minimum 2-second delay for cache initialization
      const startTime = Date.now();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Ensure minimum 2-second delay has passed for smooth UX
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 2000 - elapsed);

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      throw new Error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error("Sign out error:", error);
      throw new Error(error.message || "Failed to sign out");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    try {
      if (!user) throw new Error("No user logged in");

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;

      setUser({ ...user, ...updates });
    } catch (error: any) {
      console.error("Update profile error:", error);
      throw new Error(error.message || "Failed to update profile");
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
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
