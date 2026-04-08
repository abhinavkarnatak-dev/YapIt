"use client";

import React, { useEffect, useState } from 'react'
import { chat_service, useAppData, User } from '@/context/AppContext'
import Loading from '@/components/Loading'
import { useRouter } from 'next/navigation';
import ChatSidebar from '@/components/ChatSidebar';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import axios from 'axios';
import ChatHeader from '@/components/ChatHeader';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';

export interface Message {
  _id: string;
  chatId: string;
  sender: string;
  text?: string;
  image?: {
    url: string;
    publicId: string;
  }
  messageType: "text" | "image";
  seen: boolean;
  seenAt?: string;
  deletedBy?: string[];
  deletedForEveryone?: boolean;
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

  async function fetchChat() {
    const token = Cookies.get("token");
    if (!token) {
      toast.error("Please login again");
      logoutUser();
      router.push("/login");
      return;
    }

    try {
      const { data } = await axios.get(`${chat_service}/api/v1/message/${selectedUser}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessages(data.messages);
      await fetchChats();
    } catch (error) {
      console.log(error);
      toast.error("Failed to load messages");
    }
  }

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser) return;
    console.log("TODO: Implement Send text message: ", message);
    setMessage("");
  };

  const handleImageUpload = async (file: File) => {
    if (!selectedUser) return;
    console.log("TODO: Implement Upload image file: ", file.name);
  };

  const handleDeleteMessage = async (messageId: string, type: "everyone" | "me") => {
    try {
      const token = Cookies.get("token");
      await axios.delete(`${chat_service}/api/v1/message/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { type }
      });
      
      setMessages(prev => {
        if (!prev) return null;
        if (type === "me") {
          return prev.filter(m => m._id !== messageId);
        } else {
          return prev.map(m => m._id === messageId ? { ...m, deletedForEveryone: true, text: "", image: undefined } : m);
        }
      });
      toast.success("Message deleted");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete message");
    }
  }

  useEffect(() => {
    if (selectedUser) {
      fetchChat();
    }
  }, [selectedUser]);

  if (userLoading || !isAuth) {
    return <Loading />
  }

  return (
    <div className='h-screen flex bg-surface text-on-surface overflow-hidden relative font-body'>
      <ChatSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        loggedInUser={loggedInUser}
        chats={chats}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleLogout={handleLogout}
      />
      <div className='flex-1 flex flex-col bg-surface relative'>
        <div className='px-6 pt-4'>
          <ChatHeader 
            user={chats?.find(c => c.chat._id === selectedUser)?.user || null}
            setSidebarOpen={setSidebarOpen}
            isTyping={isTyping}
          />
        </div>
        <ChatMessages 
          selectedUser={selectedUser} 
          messages={messages} 
          loggedInUser={loggedInUser}
          onDeleteMessage={handleDeleteMessage}
        />
        {selectedUser && (
          <ChatInput 
            message={message}
            setMessage={setMessage}
            onSendMessage={handleSendMessage}
            onImageUpload={handleImageUpload}
          />
        )}
      </div>
    </div>
  )
}

export default ChatPage