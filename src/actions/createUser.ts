"use server";

import dbConnect from "@/lib/mongodb";
import User from "@/schemas/User";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function createUser(prevState: any, formdata: FormData) {
  try {
    await dbConnect();

    const userEmail = formdata.get("email");

    const user = await User.findOne({ email: userEmail });

    if (user) {
      return {
        status: false,
        message: "User already exist",
      };
    }

    const password = formdata.get("password");

    if (!password) {
      return {
        status: false,
        message: "Password is required",
      };
    }

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
