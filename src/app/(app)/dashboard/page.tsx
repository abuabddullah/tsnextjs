"use client";
import { signOut } from "next-auth/react";

const Dashboard = () => {
  return (
    <div>
      Dashboard
      <button
        onClick={() => signOut()}
        className="w-full md:w-auto bg-slate-100 text-black"

        //   variant="outline"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
