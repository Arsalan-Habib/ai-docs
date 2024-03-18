import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/schemas/User";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXT_AUTH_SECRET,
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  providers: [
    CredentialsProvider({
      name: "User Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password as string;
        // const client = await clientPromise;
        await dbConnect();

        const user = await User.findOne({ email });

        if (!user) {
          return Promise.resolve(null);
        }

        const isPasswordCorrect = bcrypt.compareSync(password, user.hash);

        if (isPasswordCorrect) {
          return Promise.resolve(user);
        } else {
          return Promise.reject("invalid user");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      // console.log("in jwt",token)
      return token;
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken as string;
      await dbConnect();

      if (session.user) {
        const sessionUser = await User.findOne({ email: session.user.email });

        session.user.name = `${sessionUser?.profile?.firstName} ${sessionUser?.profile?.lastName}`;
        session.user.id = sessionUser._id.toString();
      }

      return session;
    },
    async signIn({ user }) {
      console.log("inside callback");
      await dbConnect();
      console.log("connected", user);
      const u = await User.findOne({ email: user.email });
      const email = user.email;
      const name = user.name;
      if (!u) {
        const newUser = await User.create({
          email,
          profile: {
            firstName: name,
          },
        });

        await newUser.save();
      }
      return true;
    },
  },
};
