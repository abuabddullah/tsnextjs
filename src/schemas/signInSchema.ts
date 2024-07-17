import { z } from "zod";

export const signInSchema = z.object({
  identifier: z.string(), // এখানে "identifier" মানে হচ্ছে যা দিয়ে আমরা login করব like, email/id/userNmae
  password: z.string(),
});
