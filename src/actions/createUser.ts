"use server";

import dbConnect from "@/lib/mongodb";
import User from "@/schemas/User";
import { sleep } from "@/utils";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(3, { message: "Password must be at least 3 characters" }),
    confirmPassword: z.string(),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });

export async function createUser(prevState: any, formdata: FormData) {
  try {
    await dbConnect();

    const userEmail = formdata.get("email");

    const user = await User.findOne({ email: userEmail });

    if (user) {
      return {
        status: false,
        message: "Email address already exist",
      };
    }

    const validatedFields = schema.safeParse({
      email: userEmail,
      password: formdata.get("password"),
      confirmPassword: formdata.get("confirmPassword"),
    });

    if (!validatedFields.success) {
      return {
        status: false,
        message: "",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }
    const password = formdata.get("password");

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password as string, salt);

    const newUserData = {
      email: formdata.get("email"),
      hash,
      salt,
      profile: {
        firstName: formdata.get("firstName"),
        lastName: formdata.get("lastName"),
      },
    };

    await User.create(newUserData);
  } catch (error) {
    console.log("error", error);

    throw new Error("Failed to create user");
  }
  redirect("/signin");
}
