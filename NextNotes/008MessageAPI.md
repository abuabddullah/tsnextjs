# 08 Message API with aggregation pipeline [03:48:47](https://www.youtube.com/watch?v=zLJoVRleOuc&t=13727s)

## is user accepting messages

> filepath: **src\app\api\accept-messages\route.ts**
>
> ### POST ফাংশন:
>
> 1. **কোডের উদ্দেশ্য:**
>    - **frontend থেকে প্রাপ্ত বহারকারীর মেসেজ গ্রহণের ইচ্ছা / স্ট্যাটাস আপডেট করা।**
> 2. **ইমপোর্ট এবং ডেটাবেস কানেকশন:**
>    - `getServerSession`, `authOptions`, `dbConnect`, `UserModel`, এবং `User` মডিউলগুলো ইমপোর্ট করা।
>    - `POST` ফাংশনের মধ্যে প্রথমেই `dbConnect` ফাংশন ব্যবহার করে ডেটাবেসের সাথে কানেক্ট করা।
> 3. **সেশন যাচাই:**
>    - `getServerSession(authOptions)` ব্যবহার করে সেশন গ্রহণ করা।
>    - যদি সেশন বা সেশনের ব্যবহারকারী না থাকে, তাহলে ৪০১ স্ট্যাটাস কোড সহ "Not authenticated" মেসেজ সহ রেসপন্স করা।
> 4. **রেকুয়েস্ট থেকে ডেটা গ্রহণ:**
>    - `await request.json()` ব্যবহার করে রেকুয়েস্ট থেকে `acceptMessages` গ্রহণ করা।
> 5. **ব্যবহারকারীর মেসেজ গ্রহণের স্ট্যাটাস আপডেট:**
>    - `UserModel.findByIdAndUpdate(userId, { isAcceptingMessages: acceptMessages }, { new: true })` ব্যবহার করে ব্যবহারকারীর মেসেজ গ্রহণের স্ট্যাটাস আপডেট করা।
>    - যদি আপডেট করা না যায়, তাহলে ৪০৪ স্ট্যাটাস কোড সহ "Unable to find user to update message acceptance status" মেসেজ সহ রেসপন্স করা।
> 6. **সফল আপডেট:**
>    - যদি মেসেজ গ্রহণের স্ট্যাটাস সফলভাবে আপডেট হয়, তাহলে ২০০ স্ট্যাটাস কোড সহ "Message acceptance status updated successfully" মেসেজ সহ রেসপন্স করা।
> 7. **এরর হ্যান্ডলিং:**
>    - যদি কোনো এরর ঘটে, তাহলে কনসোলে এরর মেসেজ লগ করা এবং ৫০০ স্ট্যাটাস কোড সহ "Error updating message acceptance status" মেসেজ সহ রেসপন্স করা।
>
> ### GET ফাংশন:
>
> 1. **কোডের উদ্দেশ্য:**
>    - **ব্যবহারকারীর মেসেজ গ্রহণের স্ট্যাটাস(ইচ্ছা) রিট্রিভ করা(db থেকে frontend এ জানানো)।**
>      - এর সাপেক্ষে আমরা user মেসেজ নিতে চায় কিনা, পাঠানো যাবে কিনা তা define করব
> 2. **ইমপোর্ট এবং ডেটাবেস কানেকশন:**
>    - `dbConnect` এবং `getServerSession` ব্যবহার করে ডেটাবেসের সাথে কানেক্ট করা এবং সেশন গ্রহণ করা।
> 3. **সেশন যাচাই:**
>    - `getServerSession(authOptions)` ব্যবহার করে সেশন গ্রহণ করা।
>    - যদি সেশন বা সেশনের ব্যবহারকারী না থাকে, তাহলে ৪০১ স্ট্যাটাস কোড সহ "Not authenticated" মেসেজ সহ রেসপন্স করা।
> 4. **ব্যবহারকারী রিট্রিভ:**
>    - `UserModel.findById(user._id)` ব্যবহার করে ডাটাবেজ থেকে ব্যবহারকারী রিট্রিভ করা।
>    - যদি ব্যবহারকারী না পাওয়া যায়, তাহলে ৪০৪ স্ট্যাটাস কোড সহ "User not found" মেসেজ সহ রেসপন্স করা।
> 5. **মেসেজ গ্রহণের স্ট্যাটাস রিট্রিভ:**
>    - সফলভাবে ব্যবহারকারী পাওয়া গেলে, ২০০ স্ট্যাটাস কোড সহ `isAcceptingMessages` সহ রেসপন্স করা।
> 6. **এরর হ্যান্ডলিং:**
>    - যদি কোনো এরর ঘটে, তাহলে কনসোলে এরর মেসেজ লগ করা এবং ৫০০ স্ট্যাটাস কোড সহ "Error retrieving message acceptance status" মেসেজ সহ রেসপন্স করা।
>      ```jsx
>      import { getServerSession } from "next-auth/next";
>      import { authOptions } from "../auth/[...nextauth]/options";
>      import dbConnect from "@/lib/dbConnect";
>      import UserModel from "@/model/User";
>      import { User } from "next-auth";
>
>      export async function POST(request: Request) {
>        // Connect to the database
>        await dbConnect();
>
>        const session = await getServerSession(authOptions);
>        const user: User = session?.user;
>        if (!session || !session.user) {
>          return Response.json(
>            { success: false, message: "Not authenticated" },
>            { status: 401 }
>          );
>        }
>
>        const userId = user._id;
>        const { acceptMessages } = await request.json(); // এখানে frontend থেকে পাই, acceptMessages:true || false
>
>        try {
>          // Update the user's message acceptance status
>          const updatedUser = await UserModel.findByIdAndUpdate(
>            userId,
>            { isAcceptingMessages: acceptMessages },
>            { new: true } // এই "new: true" এর কারনে আমরা updatedUser এ latestUpdatedUser টা পাব
>          );
>
>          if (!updatedUser) {
>            // check if User found or not
>            return Response.json(
>              {
>                success: false,
>                message:
>                  "Unable to find user to update message acceptance status",
>              },
>              { status: 404 }
>            );
>          }
>
>          // Successfully updated message acceptance status
>          return Response.json(
>            {
>              success: true,
>              message: "Message acceptance status updated successfully",
>              updatedUser,
>            },
>            { status: 200 }
>          );
>        } catch (error) {
>          console.error("Error updating message acceptance status:", error);
>          return Response.json(
>            {
>              success: false,
>              message: "Error updating message acceptance status",
>            },
>            { status: 500 }
>          );
>        }
>      }
>
>      export async function GET(request: Request) {
>        // Connect to the database
>        await dbConnect();
>
>        // Get the user session
>        const session = await getServerSession(authOptions);
>        const user = session?.user;
>
>        // Check if the user is authenticated
>        if (!session || !user) {
>          return Response.json(
>            { success: false, message: "Not authenticated" },
>            { status: 401 }
>          );
>        }
>
>        try {
>          // Retrieve the user from the database using the ID
>          const foundUser = await UserModel.findById(user._id);
>
>          if (!foundUser) {
>            // User not found
>            return Response.json(
>              { success: false, message: "User not found" },
>              { status: 404 }
>            );
>          }
>
>          // Return the user's message acceptance status
>          return Response.json(
>            {
>              success: true,
>              isAcceptingMessages: foundUser.isAcceptingMessages, // এটা একটা boolean value পাঠাচ্চছে
>            },
>            { status: 200 }
>          );
>        } catch (error) {
>          console.error("Error retrieving message acceptance status:", error);
>          return Response.json(
>            {
>              success: false,
>              message: "Error retrieving message acceptance status",
>            },
>            { status: 500 }
>          );
>        }
>      }
>      ```

## Get-message api

> filepath : **src\app\api\get-messages\route.ts**
>
> ### explanation:
>
> 1. **কোডের উদ্দেশ্য:**
>    - **ব্যবহারকারীর মেসেজগুলো রিট্রিভ করা এবং ক্রিয়েশন টাইমের ক্রম অনুযায়ী সাজানো।**
> 2. **ইমপোর্ট এবং ডেটাবেস কানেকশন:**
>    - `dbConnect`, `UserModel`, `mongoose`, `User`, `getServerSession`, এবং `authOptions` মডিউলগুলো ইমপোর্ট করা।
>    - `GET` ফাংশনের মধ্যে প্রথমেই `dbConnect` ফাংশন ব্যবহার করে ডেটাবেসের সাথে কানেক্ট করা।
> 3. **সেশন যাচাই:**
>    - `getServerSession(authOptions)` ব্যবহার করে সেশন গ্রহণ করা।
>    - যদি সেশন বা সেশনের ব্যবহারকারী না থাকে, তাহলে ৪০১ স্ট্যাটাস কোড সহ "Not authenticated" মেসেজ সহ রেসপন্স করা।
> 4. **ব্যবহারকারীর আইডি তৈরি:**
>    - `_user._id` থেকে `mongoose.Types.ObjectId` ব্যবহার করে `userId` তৈরি করা।
>      - এই method নরমাল id কে MongoDB ObjectId তে convert করে যা আমাদের কে mongodb aggregation-pipeline এ লাগবে
> 5. **ব্যবহারকারীর মেসেজগুলো রিট্রিভ:**
>    - `UserModel.aggregate` ব্যবহার করে ব্যবহারকারীর মেসেজগুলো সংগ্রহ করা:
>      - **`$match`**: ব্যবহারকারীর আইডি মিলিয়ে মেসেজগুলো নির্বাচন করা।
>        - এটি একটি ফিল্টার স্টেজ। এটি কেবলমাত্র সেই ডকুমেন্টগুলো নির্বাচন করবে যেগুলোর `_id` `userId` এর সমান।
>        - উদাহরণ:
>          ```jsx
>          javascriptCopy code
>          { $match: { _id: userId } }
>
>          ```
>        - এটি নিশ্চিত করবে যে আমরা শুধু নির্দিষ্ট ব্যবহারকারীর ডেটা প্রসেস করছি।
>      - **`$unwind`**: মেসেজগুলো আলাদা আলাদা করে ভেঙ্গে ফেলা।
>        - এটি একটি ডকুমেন্টের অ্যারে ফিল্ডকে এক্সপ্লোড (ভেঙ্গে ফেলা) করে প্রতিটি উপাদানকে আলাদা আলাদা ডকুমেন্টে পরিণত করে।উদাহরণ:
>          ```jsx
>          {
>            $unwind: "$messages";
>          }
>          ```
>        - ধরুন একটি ব্যবহারকারীর ডকুমেন্টে মেসেজগুলোর একটি অ্যারে আছে:
>          ```jsx
>          { "_id": "60c72b2f9b1d8b001c8e4d9a", "messages": [ { "text": "Hello", "createdAt": "2023-01-01T00:00:00Z" }, { "text": "Hi", "createdAt": "2023-02-01T00:00:00Z" } ]
>          }
>          ```
>        - $unwind করার পর এই ডকুমেন্টটি দুটি ডকুমেন্টে পরিণত হবে
>          ```jsx
>          { "_id": "60c72b2f9b1d8b001c8e4d9a", "messages": { "text": "Hello", "createdAt": "2023-01-01T00:00:00Z" } }
>          { "_id": "60c72b2f9b1d8b001c8e4d9a", "messages": { "text": "Hi", "createdAt": "2023-02-01T00:00:00Z" } }
>          ```
>        - **$sort:**
>      - **`$sort`**: মেসেজগুলো `createdAt` টাইমস্ট্যাম্প অনুযায়ী সাজানো (নতুন থেকে পুরাতন)।
>      - **`$group`**: ব্যবহারকারীর আইডি অনুযায়ী মেসেজগুলো আবার গ্রুপ করা এবং মেসেজগুলো একটি অ্যারের মধ্যে পুশ করা।
> 6. **ব্যবহারকারী না পাওয়া গেলে:**
>    - যদি ব্যবহারকারী না পাওয়া যায় অথবা মেসেজ না থাকে, তাহলে ৪০৪ স্ট্যাটাস কোড সহ "User not found" মেসেজ সহ রেসপন্স করা।
> 7. **সফল রিট্রিভ:**
>    - যদি ব্যবহারকারীর মেসেজগুলো সফলভাবে রিট্রিভ হয়, তাহলে ২০০ স্ট্যাটাস কোড সহ মেসেজগুলো রেসপন্স করা।
> 8. **এরর হ্যান্ডলিং:**
>    - যদি কোনো এরর ঘটে, তাহলে কনসোলে এরর মেসেজ লগ করা এবং ৫০০ স্ট্যাটাস কোড সহ "Internal server error" মেসেজ সহ রেসপন্স করা।
