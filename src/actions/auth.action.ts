"use server";

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, message: "Username atau password salah." };
    }
    return { success: false, message: "Terjadi kesalahan. Coba lagi." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}