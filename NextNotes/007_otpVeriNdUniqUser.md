# Username এর validity ও uniqness check

## check-username-unique

- filepath: src\app\api\check-username-unique\route.ts

### explanation:

নিশ্চিতভাবে, নিচে আমি bullet point আকারে এই কোডের বিস্তারিত বর্ণনা করেছি:

1. **কোডের উদ্দেশ্য:**

   - **ব্যবহারকারীর নামের বৈধতা যাচাই করা।**
   - **ব্যবহারকারীর নাম ইউনিক (একমাত্র) কিনা তা যাচাই করা।**
   - **ইনভ্যালিড হলে ফ্রন্টএন্ডে ইনপুট ফিল্ডের নিচে দ্রুত এরর রিপ্লাই দেখানো।**

2. **ইমপোর্ট এবং স্কিমা তৈরির ধাপ:**

   - `dbConnect`, `UserModel`, `usernameValidation`, এবং `zod` মডিউলগুলো ইমপোর্ট করা।
   - `UsernameQuerySchema` নামক একটি স্কিমা তৈরির জন্য `zod` ব্যবহার করা, যা `usernameValidation` ব্যবহার করে।

3. **ডেটাবেস কানেকশন:**

   - `GET` ফাংশনের মধ্যে প্রথমেই `dbConnect` ফাংশন ব্যবহার করে ডেটাবেসের সাথে কানেক্ট করা।

4. **ইউআরএল থেকে কোয়েরি প্যারামিটার গ্রহণ:**

   - `new URL(request.url)` ব্যবহার করে ইউআরএল থেকে কোয়েরি প্যারামিটার (যেমন: `username`) গ্রহণ করা।

5. **কোয়েরি প্যারামিটার স্কিমা যাচাই:**

   - `UsernameQuerySchema.safeParse(queryParams)` ব্যবহার করে কোয়েরি প্যারামিটার স্কিমার সাথে মিলছে কিনা যাচাই করা।
   - যদি স্কিমার সাথে না মেলে, তাহলে এরর মেসেজ তৈরি করে ৪০০ স্ট্যাটাস কোড সহ রেসপন্স করা।

6. **ব্যবহারকারীর নাম ইউনিক কিনা যাচাই:**

   - `UserModel.findOne({ username, isVerified: true })` ব্যবহার করে যাচাই করা যে কোন ভেরিফাইড ব্যবহারকারী এই নামটি ব্যবহার করছেন কিনা।
   - যদি নামটি আগে থেকেই ব্যবহার হয়ে থাকে, তাহলে ২০০ স্ট্যাটাস কোড সহ "Username is already taken" মেসেজ সহ রেসপন্স করা।
   - যদি নামটি ইউনিক হয়, তাহলে ২০০ স্ট্যাটাস কোড সহ "Username is unique" মেসেজ সহ রেসপন্স করা।

7. **এরর হ্যান্ডলিং:**
   - যদি কোনো এরর ঘটে, তাহলে কনসোলে এরর মেসেজ লগ করা এবং ৫০০ স্ট্যাটাস কোড সহ "Error checking username" মেসেজ সহ রেসপন্স করা।

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

### explanation:

নিশ্চিতভাবে, নিচে আমি bullet point আকারে এই কোডের বিস্তারিত বর্ণনা করেছি:

1. **কোডের উদ্দেশ্য:**

   - **ব্যবহারকারীর নাম এবং যাচাইকরণ কোড যাচাই করা।**
   - **যাচাইকরণ কোড সঠিক এবং মেয়াদোত্তীর্ণ না হলে ব্যবহারকারীর অ্যাকাউন্ট যাচাই করা।**

2. **ইমপোর্ট এবং ডেটাবেস কানেকশন:**

   - `dbConnect` এবং `UserModel` মডিউলগুলো ইমপোর্ট করা।
   - `POST` ফাংশনের মধ্যে প্রথমেই `dbConnect` ফাংশন ব্যবহার করে ডেটাবেসের সাথে কানেক্ট করা।

3. **রেকুয়েস্ট থেকে ডেটা গ্রহণ:**

   - `await request.json()` ব্যবহার করে রেকুয়েস্ট থেকে `username` এবং `code` গ্রহণ করা।
   - `decodeURIComponent(username)` ব্যবহার করে ইউআরএল এনকোডিং থেকে `username` ডিকোড করা।

4. **ব্যবহারকারী অনুসন্ধান:**

   - `UserModel.findOne({ username: decodedUsername })` ব্যবহার করে ডাটাবেজে `username` এর সাথে মিল আছে কিনা তা খোঁজা।
   - যদি ব্যবহারকারী না পাওয়া যায়, তাহলে ৪০৪ স্ট্যাটাস কোড সহ "User not found" মেসেজ সহ রেসপন্স করা।

5. **যাচাইকরণ কোড এবং মেয়াদ যাচাই:**

   - **কোড সঠিক কিনা যাচাই:** `user.verifyCode === code` ব্যবহার করে যাচাইকরণ কোড মিল আছে কিনা যাচাই করা।
   - **কোড মেয়াদোত্তীর্ণ না কিনা যাচাই:** `new Date(user.verifyCodeExpiry) > new Date()` ব্যবহার করে যাচাইকরণ কোডের মেয়াদ বর্তমান সময়ের চেয়ে বেশি কিনা যাচাই করা।

6. **যাচাইকরণ সফল হলে:**

   - যদি কোড সঠিক এবং মেয়াদোত্তীর্ণ না হয়, তাহলে `user.isVerified = true` ব্যবহার করে ব্যবহারকারীকে যাচাইকৃত হিসাবে আপডেট করা।
   - `await user.save()` ব্যবহার করে পরিবর্তনগুলো সংরক্ষণ করা।
   - ২০০ স্ট্যাটাস কোড সহ "Account verified successfully" মেসেজ সহ রেসপন্স করা।

7. **যাচাইকরণ কোড মেয়াদোত্তীর্ণ হলে:**

   - যদি কোড মেয়াদোত্তীর্ণ হয়, তাহলে ৪০০ স্ট্যাটাস কোড সহ "Verification code has expired. Please sign up again to get a new code." মেসেজ সহ রেসপন্স করা।

8. **যাচাইকরণ কোড ভুল হলে:**

   - যদি কোড সঠিক না হয়, তাহলে ৪০০ স্ট্যাটাস কোড সহ "Incorrect verification code" মেসেজ সহ রেসপন্স করা।

9. **এরর হ্যান্ডলিং:**
   - যদি কোনো এরর ঘটে, তাহলে কনসোলে এরর মেসেজ লগ করা এবং ৫০০ স্ট্যাটাস কোড সহ "Error verifying user" মেসেজ সহ রেসপন্স করা।

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
