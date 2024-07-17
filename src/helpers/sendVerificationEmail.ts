import { resend } from "@/lib/resend";
import { ApiResponseType } from "@/types/ApiResponseTypes";
import VerificationEmailTemplate from "../../emailsTemplates/VerificationEmailTemplate";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponseType> {
  try {
    await resend.emails.send({
      from: "dev@hiteshchoudhary.com",
      to: email,
      subject: "Mystery Message Verification Code",
      react: VerificationEmailTemplate({ username, otp: verifyCode }),
    });
    return { success: true, message: "Verification email sent successfully." };
  } catch (emailError) {
    console.error("Error sending verification email:", emailError);
    return { success: false, message: "Failed to send verification email." };
  }
}
