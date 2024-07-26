import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect.ts";
import UserModel from "@/model/User.model";

export const authOptions: NextAuthOptions = {
  providers: [
    // CredentialsProvider for email-pass authentication
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        // it generates a form with email,pass input field
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        // this function can have access of credentials of CredentialsProvider
        await dbConnect();
        try {
          // find user based on either email or username as credentials.identifier
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });
          // throwing error is mendatory for each failed operation
          if (!user) {
            throw new Error("No user found with this email");
          }
          if (!user.isVerified) {
            throw new Error("Please verify your account before logging in");
          }
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error("Incorrect password");
          }
        } catch (err: any) {
          throw new Error(err);
        }
      },
    }),
  ],
  callbacks: {
    // deliver infos that rcvd from [CredentialsProvider's-user -> token -> session.user]
    async jwt({ token, user }) {
      if (user) {
        // need to declare custom types in "next-auth" for _id,isVerified,isAcceptingMessages,username or will give err path: src\types\next-auth.d.ts
        token._id = user._id?.toString(); // Convert ObjectId to string
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    // these acivity is applied for only login
    signIn: "/sign-in",
  },
};
