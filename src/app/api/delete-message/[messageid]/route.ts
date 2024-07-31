/* import UserModel from '@/model/User';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import { User } from 'next-auth';
import { Message } from '@/model/User';
import { NextRequest } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/options'; */

import dbConnect from "@/lib/dbConnect.ts";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import UserModel from "@/model/User.model";

export async function DELETE(
  request: Request,
  { params }: { params: { messageid: string } }
) {
  const messageId = params.messageid;
  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user: User = session?.user; // ": User" টাইপটি next-auth প্যাকেজে ডিক্লেয়ার করা হয়েছে src\types\next-auth.d.ts এ . ": User" টা "_user" টাইপকে নির্দিষ্ট করছে যাতে TypeScript এটিকে User টাইপ হিসেবে বুঝতে পারে।
  if (!session || !_user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const updateResult = await UserModel.updateOne(
      { _id: _user._id }, // কোয়েরি: নির্দিষ্ট `_id` এর ডকুমেন্ট খোঁজা
      { $pull: { messages: { _id: messageId } } } // আপডেট: `messages` অ্যারের মধ্যে নির্দিষ্ট `_id` এর মেসেজ মুছে ফেলা
    );

    if (updateResult.modifiedCount === 0) {
      return Response.json(
        { message: "Message not found or already deleted", success: false },
        { status: 404 }
      );
    }

    return Response.json(
      { message: "Message deleted", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting message:", error);
    return Response.json(
      { message: "Error deleting message", success: false },
      { status: 500 }
    );
  }
}
