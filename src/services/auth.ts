import { supabase } from "./supabase";
import { User } from "@supabase/supabase-js";

export const registerUser = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  if (!data.user) throw new Error("Registration failed");
  
  return data.user;
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  if (!data.user) throw new Error("Login failed");
  
  return data.user;
};

export const logoutUser = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const resendVerificationEmail = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });
  if (error) throw error;
};
