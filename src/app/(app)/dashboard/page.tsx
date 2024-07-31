"use client";

import { MessageCard } from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/model/User.model";
import { AcceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponseType } from "@/types/ApiResponseTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

/* 
import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AcceptMessageSchema } from '@/schemas/acceptMessageSchema'; */

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const { toast } = useToast();

  // hadle delete of message from MessageCard.tsx
  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const { data: session } = useSession(); // geeting the user from session

  // validating toggle-"AcceptingMessage" or not
  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });

  const { register, watch, setValue } = form; // ???
  const acceptMessages = watch("acceptMessages"); // এটা UI থেকে toogle-button কে দেখে তার অবস্থার সাপেক্ষে "acceptMessages" variable এর value define করে

  // Handle switch change [UI -> DB] || UI এর switch-কে toggle করার সাথে-সাথে db তে একটা post req দিয়ে "isAcceptingMessages" এর value opposite করে দেয়
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponseType>(
        "/api/accept-messages",
        {
          acceptMessages: !acceptMessages, // acceptMessages এর value UI এর switch-কে toggle করে opposite করে body এর ভিতরে করে backend এ দেয়
        }
      );
      setValue("acceptMessages", !acceptMessages); // UI এর switch-কে toggle করে দেয়া opposite value কে "acceptMessages" variable এর value define করে
      toast({
        title: response.data.message,
        variant: "default",
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponseType>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ??
          "Failed to update message settings",
        variant: "destructive",
      });
    }
  };

  // ["useCallback" is optional we can make the func without useCallback] fetchAcceptMessages [DB -> UI] (not invooked if no user) || handleSwitchChange trigger করার সাথে সাথেই db থেকে "isAcceptingMessages" এর value কে GET করে নিয়ে এসে UI এর switch-এর উপরে তার প্রতিক্রিয়া জাহির করে
  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponseType>("/api/accept-messages");
      setValue("acceptMessages", response.data.isAcceptingMessages);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponseType>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ??
          "Failed to fetch message settings",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  // ["useCallback" is optional we can make the func without useCallback] get all messsages for the user in DB  (not invooked if no user)
  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      // refresh-btn এ click করলে একটা boolean-value আসবে যেটা refresh-parm accept করবে
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get<ApiResponseType>("/api/get-messages");
        setMessages(response.data.messages || []);
        if (refresh) {
          // ??? "refresh" কই থেকে আসল?
          toast({
            title: "Refreshed Messages",
            description: "Showing latest messages",
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponseType>;
        toast({
          title: "Error",
          description:
            axiosError.response?.data.message ?? "Failed to fetch messages",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessages, toast]
  );

  // Fetch initial state from the server
  useEffect(() => {
    if (!session || !session.user) return;

    fetchMessages(); // invoke if user available
    fetchAcceptMessages(); // invoke if user available
  }, [session, setValue, toast, fetchAcceptMessages, fetchMessages]);

  if (!session || !session.user) {
    return <div></div>;
  }

  const { username } = session.user as User;

  const baseUrl = `${window.location.protocol}//${window.location.host}`; // collecting "http" // "localhost:3000/"
  const profileUrl = `${baseUrl}/u/${username}`; // making like : "http://localhost:3000/u/username"

  // copying url to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl); // এখানে "navigator.clipboard.writeText()" টা js এর একটা default function like "window.হাবিজাবি"
    toast({
      title: "URL Copied!",
      description: "Profile URL has been copied to clipboard.",
    });
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{" "}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register("acceptMessages")} // cause form is destructured as {register,watch,setValue}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? "On" : "Off"}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={message?._id}
              message={message}
              handleDeleteMessage={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
