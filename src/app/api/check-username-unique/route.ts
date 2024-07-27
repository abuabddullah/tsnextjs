/** এইখানে ২ ধরনের কাজ করা হবে
 * username valid কিনা + uniq কিনা check করা হবে,
 * invalid হলে frontend এ input-field এর নিচে quick এরর reply এর ব্যবস্থা করতে হবে
 */

import dbConnect from "@/lib/dbConnect.ts";
import UserModel from "@/model/User.model";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";

// step-1: create schema with jod
const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    // url : http://localhost:3000/check-username-unique?username=asif?query2=itsQuery2example
    const { searchParams } = new URL(request.url); // may be, searchParams=username=asif?query2=itsQuery2example
    const queryParams = {
      username: searchParams.get("username"), // asif
    };

    // step-2: search is queryParams meets the schema-requirement
    const result = UsernameQuerySchema.safeParse(queryParams); // returns true || false
    console.log(result); // home work
    console.log(result.error); // home work
    console.log(result.data); // home work

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    // step-3: search is username unique or not
    const { username } = result.data;
    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    }); // checks by username and checks is any Verified user exists? true || false

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 200 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is unique",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username:", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      { status: 500 }
    );
  }
}
