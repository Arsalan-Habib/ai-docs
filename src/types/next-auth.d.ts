import NextAuth from "next-auth/next";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: {
      email: string;
      name: string;
    };
  }
}
