# Sign-in with NextAuth

> links:
>
> -

## Installation

> 1. run the bellow code in terminal
>
>    ```jsx
>    npm install next-auth
>    ```

## Next-Auth Summary:

> **Summary:**
>
> - **প্রথমে আমাদের nextAuth এর সাহায্যে login করা যায় এমন একটা environment বানাতে হবে । এর জন্য src\app\api\auth\[...nextauth]\options.ts ফাইল এ https://next-auth.js.org/providers/credentials#example---username--password, https://next-auth.js.org/configuration/callbacks#session-callback, https://next-auth.js.org/configuration/pages এর সাহায্যে session তৈরি করব আর সেই সেশনটাকে Context Api এর সাহায্যে পুরো project জুড়ে Provide করব in the mean time আমাদের middleware function এর সাহায্যে protected route এর কার্যক্রম করতে হবে যাতে user সের্ফ allowed route গুলো তে visit করতে পারে**
>
> steps:
>
> 1. src\app\api\auth\[...nextauth]\*\*options.ts** file এ **authOptions\*\* বানাব যার basic-structure হচ্ছে
>
>    ```jsx
>    export const authOptions: NextAuthOptions = {
>        providers: [
>          GitHubProvider({
>            clientId: process.env.GITHUB_ID,
>            clientSecret: process.env.GITHUB_SECRET
>          }),
>          GoogleProvider({
>            clientId: process.env.GOOGLE_CLIENT_ID,
>            clientSecret: process.env.GOOGLE_CLIENT_SECRET
>          }),
>          FacebookProvider({
>            clientId: process.env.FACEBOOK_CLIENT_ID,
>            clientSecret: process.env.FACEBOOK_CLIENT_SECRET
>          }),
>          CredentialsProvider({............
>          ............
>          }),
>        ],
>        callbacks: {},
>        session: {},
>        secret: process.env.NEXTAUTH_SECRET,
>        pages: {},
>      };
>    ```
>
>    1. src\app\api\auth\[...nextauth]\*\*options.ts** এ authOptions.providers থেকে আমরা identifier i.e **user\*\* পাব আর সেই user এর সাহায্যে আমরা callbacks func-এ session এর ভিতরে necessary information ফিক্স করব
>
>       ```jsx
>
>       import { NextAuthOptions } from "next-auth";
>       import CredentialsProvider from "next-auth/providers/credentials";
>       import bcrypt from "bcryptjs";
>       import dbConnect from "@/lib/dbConnect.ts";
>       import UserModel from "@/model/User.model";
>
>       export const authOptions: NextAuthOptions = {
>         providers: [
>           // CredentialsProvider for email-pass authentication
>           CredentialsProvider({
>             id: "credentials",
>             name: "Credentials",
>             credentials: {
>               // it generates a form with email,pass input field
>               email: { label: "Email", type: "text" },
>               password: { label: "Password", type: "password" },
>             },
>             async authorize(credentials: any): Promise<any> {
>               // this function can have access of credentials of CredentialsProvider
>               await dbConnect();
>               try {
>                 // find user based on either email or username as credentials.identifier
>                 const user = await UserModel.findOne({
>                   $or: [
>                     { email: credentials.identifier },
>                     { username: credentials.identifier },
>                   ],
>                 });
>                 // throwing error is mendatory for each failed operation
>                 if (!user) {
>                   throw new Error("No user found with this email");
>                 }
>                 if (!user.isVerified) {
>                   throw new Error("Please verify your account before logging in");
>                 }
>                 const isPasswordCorrect = await bcrypt.compare(
>                   credentials.password,
>                   user.password
>                 );
>                 if (isPasswordCorrect) {
>                   return user;
>                 } else {
>                   throw new Error("Incorrect password");
>                 }
>               } catch (err: any) {
>                 throw new Error(err);
>               }
>             },
>           }),
>         ],
>         callbacks: {
>           // deliver infos that rcvd from [CredentialsProvider's-user -> token -> session.user]
>           async jwt({ token, user }) {
>             if (user) {
>               // need to declare custom types in "next-auth" for _id,isVerified,isAcceptingMessages,username or will give err path: src\types\next-auth.d.ts
>               token._id = user._id?.toString(); // Convert ObjectId to string
>               token.isVerified = user.isVerified;
>               token.isAcceptingMessages = user.isAcceptingMessages;
>               token.username = user.username;
>             }
>             return token;
>           },
>           async session({ session, token }) {
>             if (token) {
>               session.user._id = token._id;
>               session.user.isVerified = token.isVerified;
>               session.user.isAcceptingMessages = token.isAcceptingMessages;
>               session.user.username = token.username;
>             }
>             return session;
>           },
>         },
>         session: {
>           strategy: "jwt",
>         },
>         secret: process.env.NEXTAUTH_SECRET,
>         pages: {
>           // these acivity is applied for only login
>           signIn: "/sign-in",
>         },
>       };
>
>       ```
>
>       - for options.ts and route.ts : https://next-auth.js.org/providers/credentials#example---username--password
>       - src for call back: https://next-auth.js.org/configuration/callbacks#session-callback
>       - src for pages : https://next-auth.js.org/configuration/pages
>         - এখানে অনেক errror দিচ্ছে কারন credentials থেকে যে user কে আমরা return করেছি সেটার ভিতরে এই **\_id/isVerified/isAcceptingMessages/username field গুলোর type** ডিক্লেয়ার করা নেই যা করতে হবে src\types\*\*next-auth.d.ts** ফাইলে এবং সেখানে মুলোত next-auth এর default feature এ কিছু modify করতে হবে **declare module\*\* key এর সাহায্যে
>           - src1: https://next-auth.js.org/getting-started/typescript#main-module
>           - src2: https://next-auth.js.org/getting-started/typescript#submodules > ![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/7d9e2ba8-83b7-45af-9811-f07fb6a7a7e2/efd51081-751d-46c6-90d5-6d2347fb61a1/Untitled.png)
>
> 2. এবার src\app\api\auth\[...nextauth]\*\*route.ts** ফাইলে এ **authOptions** কে import করে তার সাহাযে **handler** বানিয়ে তাকে as **GET** & **POST\*\* হিসেবে export করে দিতেহবে
>
>    1. export করার সময় এই **GET/POST** verbs ই লিখতে হবে না হলে কাজ করবে না
>
>       ```jsx
>       import NextAuth from "next-auth/next";
>       import { authOptions } from "./options";
>
>       const handler = NextAuth(authOptions); // এটাকে handler নামেই রাখতে হবে
>
>       export { handler as GET, handler as POST }; // export করার সময় এই GET/POST verbs ই লিখতে হবে না হলে কাজ করবে না
>       ```
>
> 3. protected route handling with middle ware function

- src for creating **context** with **SessionProvider** : https://next-auth.js.org/getting-started/client#sessionprovider
- src for rapping **SessionProvider** by **context**: src\app\*\*layout.tsx\*\*
- using **session** by **useSession** : **src\app\(app)\dashboard\page.tsx** & **src\components\Navbar.tsx**

<!-- This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details. -->
