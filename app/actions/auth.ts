"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { createSession, deleteSession } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/schemas/auth";

export type AuthState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string;
} | null;

export async function register(_state: AuthState, formData: FormData): Promise<AuthState> {
  const validatedFields = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  await connectToDatabase();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return { message: "An account with this email already exists." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "customer",
  });

  await createSession(user._id.toString(), user.role);
  redirect("/");
}

export async function login(_state: AuthState, formData: FormData): Promise<AuthState> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  await connectToDatabase();

  const user = await User.findOne({ email });
  if (!user) {
    return { message: "Invalid email or password." };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return { message: "Invalid email or password." };
  }

  await createSession(user._id.toString(), user.role);
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
