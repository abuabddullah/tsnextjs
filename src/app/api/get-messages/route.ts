import dbConnect from "@/lib/dbConnect.ts";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User.model";

export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user: User = session?.user;

  if (!session || !_user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }
  const userId = new mongoose.Types.ObjectId(_user._id); // এই method নরমাল id কে ObjectId তে convert করে যা আমাদের কে mongodb aggregation-pipeline এ লাগবে
  try {
    const user = await UserModel.aggregate([
      { $match: { _id: userId } }, // $match: এটি কেবলমাত্র সেই ডকুমেন্টগুলো নির্বাচন করবে যেগুলোর _id userId এর সমান।
      { $unwind: "$messages" }, // $unwind: এটি একটি ডকুমেন্টের অ্যারে ফিল্ডকে ভেঙ্গে ফেলা ও প্রতিটি উপাদানকে আলাদা আলাদা ডকুমেন্টে পরিণত করে।
      { $sort: { "messages.createdAt": -1 } }, // $sort: এটি মেসেজগুলোকে createdAt এর ভিত্তিতে সাজাবে, যেখানে নতুন মেসেজগুলো প্রথমে থাকবে।
      { $group: { _id: "$_id", messages: { $push: "$messages" } } }, // $group: এটি সব মেসেজগুলোকে আবার একটি অ্যারেতে পরিণত করবে। এখানে _id ব্যবহারকারীর _id হবে এবং messages একটি অ্যারে হবে যেখানে সব মেসেজগুলো থাকবে।
    ]).exec(); // এখানে একটা array return পাব i.e user=[{_id:USERIDxxxxxxxxxxx,messages:[]}]

    if (!user || user.length === 0) {
      return Response.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    return Response.json(
      { messages: user[0].messages },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
