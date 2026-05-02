import Cookies from "js-cookie";
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
  if (!data.user || !data.session) throw new Error("Login failed");

  // Cookie must use path "/" so middleware sees it on every route (not limited to /login).
  Cookies.set("sb-access-token", data.session.access_token, {
    expires: 7,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  
  return data.user;
};

export const logoutUser = async (): Promise<void> => {
  Cookies.remove("sb-access-token", { path: "/" });
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
