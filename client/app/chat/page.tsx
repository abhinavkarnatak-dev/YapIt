"use client";

import React, { useEffect, useState } from 'react'
import { useAppData, User } from '@/context/AppContext'
import Loading from '@/components/Loading'
import { useRouter } from 'next/navigation';
import ChatSidebar from '@/components/ChatSidebar';

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
  const { isAuth, userLoading, logoutUser, chats, user: loggedInUser, users, fetchChats, setChats } = useAppData();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAllUser, setShowAllUser] = useState<boolean>(false);
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
        showAllUsers={showAllUser}
        setShowAllUsers={setShowAllUser}
        users={users}
        loggedInUser={loggedInUser}
        chats={chats}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleLogout={handleLogout}
      />
    </div>
  )
}

export default ChatPage