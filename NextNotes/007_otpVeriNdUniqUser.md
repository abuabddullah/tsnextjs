# Username এর validity ও uniqness check

## check-username-unique

- filepath: src\app\api\check-username-unique\route.ts
- - explanation:
- - - dffddffdgfdsdf56as4df564asdf65sd4sdfgfsdf

<pre>
/** এইখানে ২ ধরনের কাজ করা হবে 
 * username valid কিনা + uniq কিনা check করা হবে, 
 * invalid হলে frontend এ input-field এর নিচে quick এরর reply এর ব্যবস্থা করতে হবে
*/

import dbConnect from '@/lib/dbConnect.ts';
import UserModel from '@/model/User.model';
import { usernameValidation } from '@/schemas/signUpSchema';
import { z } from 'zod';

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
      username: searchParams.get('username'),// asif
    };

// step-2: search is queryParams meets the schema-requirement
    const result = UsernameQuerySchema.safeParse(queryParams); // returns true || false
    console.log(result) // home work
    console.log(result.error) // home work
    console.log(result.data) // home work

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(', ')
              : 'Invalid query parameters',
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
          message: 'Username is already taken',
        },
        { status: 200 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'Username is unique',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking username:', error);
    return Response.json(
      {
        success: false,
        message: 'Error checking username',
      },
      { status: 500 }
    );
  }
}

</pre>

## verify otp code valid and not expired

- filepath: src\app\api\verify-code\route.ts
- - explanation:
- - - dffdgfdsdf56as4df564asdf65sd4sdf

<pre>
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export async function POST(request: Request) {
  // Connect to the database
  await dbConnect();

  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username); // to decode user-got from url which prevents any unwanted decoding like %20
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if the code is correct and not expired
    const isCodeValid = user.verifyCode === code; // check db এর verifyCode আর recently url থেকে প্রাপ্ত code same 
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date(); // check db এর verifyCodeExpiry বর্তমান সময়ের চেয়ে বেশি আছে

    if (isCodeValid && isCodeNotExpired) {
      // Update the user's verification status
      user.isVerified = true;
      await user.save();

      return Response.json(
        { success: true, message: 'Account verified successfully' },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      // Code has expired
      return Response.json(
        {
          success: false,
          message:
            'Verification code has expired. Please sign up again to get a new code.',
        },
        { status: 400 }
      );
    } else {
      // Code is incorrect
      return Response.json(
        { success: false, message: 'Incorrect verification code' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying user:', error);
    return Response.json(
      { success: false, message: 'Error verifying user' },
      { status: 500 }
    );
  }
}

</pre>
