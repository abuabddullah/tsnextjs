import NextAuth from "next-auth/next";
import { authOptions } from "./options";

const handler = NextAuth(authOptions); // এটাকে handler নামেই রাখতে হবে

export { handler as GET, handler as POST }; // export করার সময় এই GET/POST verbs ই লিখতে হবে না হলে কাজ করবে না
