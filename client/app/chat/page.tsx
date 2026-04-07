"use client";

import React, { useEffect, useState } from 'react'
import { chat_service, useAppData, User } from '@/context/AppContext'
import Loading from '@/components/Loading'
import { useRouter } from 'next/navigation';
import ChatSidebar from '@/components/ChatSidebar';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import axios from 'axios';

export interface Message {
  _id: string;
  chatId: string;
  senderId: string;
  text?: string;
  image?: {
    url: string;
    public_id: string;
  }
  messageType: "text" | "image";
  seen: boolean;
  seenAt?: string;
  createdAt: string;
}

const ChatPage = () => {
  const { isAuth, userLoading, logoutUser, chats, user: loggedInUser, fetchChats, setChats } = useAppData();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingTimeOut, setTypingTimeOut] = useState<NodeJS.Timeout | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!isAuth && !userLoading) {
      router.push("/login");
    }
  }, [isAuth, router, userLoading]);

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  }

  if (userLoading || !isAuth) {
    return <Loading />
  }

  return (
    <div className='min-h-screen flex bg-gray-900 text-white overflow-hidden relative'>
      <ChatSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        loggedInUser={loggedInUser}
        chats={chats}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleLogout={handleLogout}
      />
      <div className='flex-1 flex flex-col justify-between p-4 backdrop-blur-xl bg-white/5 border-1 border-white/10'></div>
    </div>
  )
}

export default ChatPage