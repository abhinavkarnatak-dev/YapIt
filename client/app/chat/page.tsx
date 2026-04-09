"use client";

import React, { useEffect, useState, useRef } from 'react'
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
import { useSocket } from '@/context/SocketContext';
import { Plus, Search, X } from 'lucide-react';

export interface Message {
  _id: string;
  chatId: string;
  sender: string;
  text?: string;
  image?: {
    url: string;
    publicId: string;
  }
  document?: {
    url: string;
    originalName: string;
    size: number;
    format: string;
  }
  messageType: "text" | "image" | "document";
  seen: boolean;
  seenAt?: string;
  deletedBy?: string[];
  deletedForEveryone?: boolean;
  linkPreview?: {
    title?: string;
    description?: string;
    image?: { url: string };
    logo?: { url: string };
    publisher?: string;
  };
  isEdited?: boolean;
  editHistory?: { text: string; editedAt: string }[];
  createdAt: string;
}

const ChatPage = () => {
  const { isAuth, userLoading, logoutUser, chats, user: loggedInUser, fetchChats, setChats } = useAppData();
  const { socket, onlineUsers } = useSocket();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const [internalLoading, setInternalLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (userLoading) {
      interval = setInterval(() => {
        setLoadingProgress((prev) => (prev >= 85 ? 85 : prev + 15));
      }, 50);
    } else {
      setLoadingProgress(100);
      const timeout = setTimeout(() => {
        setInternalLoading(false);
      }, 400);
      return () => clearTimeout(timeout);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userLoading]);

  const sendSoundRef = useRef<HTMLAudioElement | null>(null);
  const receiveSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    sendSoundRef.current = new Audio("/sendMessage.mp3");
    receiveSoundRef.current = new Audio("/receiveMessage.mp3");
  }, []);

  const router = useRouter();

  const activeChat = chats?.find(c => c.chat._id === selectedUser);
  const activeChatUserId = activeChat?.user?._id;

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

  const handleSendMessage = async (imageFile: File | null) => {
    if (!message.trim() && !imageFile) return;
    if (!selectedUser) return;

    const token = Cookies.get("token");
    try {
      if (editingMessageId) {
        const { data } = await axios.put(`${chat_service}/api/v1/message/edit/${editingMessageId}`, {
          text: message.trim()
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setMessages(prev => prev?.map(m => m._id === editingMessageId ? {
          ...m,
          text: message.trim(),
          isEdited: true,
          linkPreview: data.updatedMessage.linkPreview
        } : m) || null);

        setMessage("");
        setEditingMessageId(null);
        fetchChats();

        if (socket && activeChatUserId) {
          socket.emit("stop_typing", { senderId: loggedInUser?._id, receiverId: activeChatUserId });
        }
        return;
      }

      let savedMessageData;

      if (imageFile) {
        const formData = new FormData();
        formData.append("chatId", selectedUser);
        if (message.trim()) {
          formData.append("text", message.trim());
        }
        formData.append("file", imageFile);

        const { data } = await axios.post(`${chat_service}/api/v1/message`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
        });
        savedMessageData = data.savedMessage;
      } else {
        const { data } = await axios.post(`${chat_service}/api/v1/message`, {
          chatId: selectedUser,
          text: message
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        savedMessageData = data.savedMessage;
      }

      setMessages(prev => prev ? [...prev, savedMessageData] : [savedMessageData]);
      setMessage("");
      fetchChats();

      if (sendSoundRef.current) {
        sendSoundRef.current.currentTime = 0;
        sendSoundRef.current.play().catch(e => console.log("Audio play prevented:", e));
      }

      if (socket && activeChatUserId) {
        socket.emit("stop_typing", { senderId: loggedInUser?._id, receiverId: activeChatUserId });
      }
    } catch (error) {
      console.log("Failed to send message", error);
      toast.error("Failed to send message");
    }
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
          return prev.map(m => m._id === messageId ? { ...m, deletedForEveryone: true, text: "", image: undefined, document: undefined } : m);
        }
      });
      toast.success("Message deleted");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete message");
    }
  }

  const handleEditRequest = (messageId: string, currentText: string) => {
    setEditingMessageId(messageId);
    setMessage(currentText);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("new_message", (newMessage: Message) => {
      if (selectedUser && newMessage.chatId === selectedUser) {
        newMessage.seen = true;
        setMessages(prev => prev ? [...prev, newMessage] : [newMessage]);

        if (receiveSoundRef.current) {
          receiveSoundRef.current.currentTime = 0;
          receiveSoundRef.current.play().catch(e => console.log("Audio play prevented:", e));
        }

        const token = Cookies.get("token");
        axios.put(`${chat_service}/api/v1/message/seen/${selectedUser}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(() => {
          fetchChats();
        }).catch(err => {
          console.log("Error marking as seen:", err);
          fetchChats();
        });
      } else {
        fetchChats();
      }
    });

    socket.on("message_deleted", (data: { messageId: string, chatId: string }) => {
      if (selectedUser && data.chatId === selectedUser) {
        setMessages(prev => prev?.map(msg =>
          msg._id === data.messageId
            ? { ...msg, deletedForEveryone: true, text: '', image: undefined, document: undefined }
            : msg
        ) || []);
      }
      fetchChats();
    });

    socket.on("message_edited", (data: { messageId: string, chatId: string, text: string, linkPreview: any, isEdited: boolean }) => {
      if (selectedUser && data.chatId === selectedUser) {
        setMessages(prev => prev?.map(msg =>
          msg._id === data.messageId
            ? { ...msg, text: data.text, linkPreview: data.linkPreview, isEdited: data.isEdited }
            : msg
        ) || []);
      }
      fetchChats();
    });

    socket.on("messages_seen", ({ chatId, seenAt }) => {
      if (selectedUser === chatId) {
        setMessages(prev => {
          if (!prev) return prev;
          return prev.map(msg => ({ ...msg, seen: true, seenAt: msg.seenAt || seenAt }));
        });
      }
    });

    socket.on("typing", ({ senderId }) => {
      setTypingUsers(prev => prev.includes(senderId) ? prev : [...prev, senderId]);
      if (activeChatUserId === senderId) {
        setIsTyping(true);
      }
    });

    socket.on("stop_typing", ({ senderId }) => {
      setTypingUsers(prev => prev.filter(id => id !== senderId));
      if (activeChatUserId === senderId) {
        setIsTyping(false);
      }
    });

    socket.on("user_profile_updated", () => {
      fetchChats();
    });

    return () => {
      socket.off("new_message");
      socket.off("messages_seen");
      socket.off("typing");
      socket.off("stop_typing");
      socket.off("user_profile_updated");
      socket.off("message_deleted");
      socket.off("message_edited");
    };
  }, [socket, selectedUser, activeChatUserId, fetchChats]);

  useEffect(() => {
    if (selectedUser) {
      fetchChat();
    }
  }, [selectedUser]);

  if (internalLoading || !isAuth) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-surface font-body">
        <div className="flex flex-col items-center justify-center gap-8 animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center shadow-sm">
            <h1 className="text-5xl font-black italic text-primary drop-shadow-sm">Y!</h1>
          </div>
          <div className="flex flex-col items-center gap-3">
            <p className="text-on-surface-variant font-bold tracking-[0.2em] uppercase text-[10px]">Loading Messages...</p>
            <div className="w-48 h-1 bg-surface-container-highest rounded-full overflow-hidden relative">
              <div
                className="absolute top-0 bottom-0 left-0 bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOnline = activeChatUserId ? onlineUsers.includes(activeChatUserId) : false;

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
        typingUsers={typingUsers}
      />
      <div className='flex-1 flex flex-col bg-surface relative'>
        <div className='px-6 pt-4'>
          <ChatHeader
            user={activeChat?.user || null}
            setSidebarOpen={setSidebarOpen}
            isTyping={isTyping}
            isOnline={isOnline}
          />
        </div>

        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center relative relative">
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-[0.03]">
              <div className="w-[40vw] h-[40vw] rounded-full border-[40px] border-primary"></div>
            </div>
            <button
              onClick={() => { setIsSearchModalOpen(true); setSearchQuery(""); }}
              className="relative z-10 w-20 h-20 bg-primary text-on-primary rounded-[24px] shadow-[0_10px_25px_-5px_rgba(var(--primary-rgb),0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 animate-in fade-in zoom-in-75 cursor-pointer hover:rotate-90 group"
              title="Start a new chat"
            >
              <Plus size={36} className="transition-transform duration-300 group-hover:scale-110" />
            </button>
            <p className="relative z-10 mt-6 text-on-surface-variant font-medium text-lg animate-in fade-in slide-in-from-bottom-4 delay-150">Select a friend to start chatting</p>
          </div>
        ) : (
          <>
            <ChatMessages
              selectedUser={selectedUser}
              messages={messages}
              loggedInUser={loggedInUser}
              onDeleteMessage={handleDeleteMessage}
              onEditMessage={handleEditRequest}
              isTyping={isTyping}
            />
            <ChatInput
              message={message}
              setMessage={setMessage}
              onSendMessage={handleSendMessage}
              socket={socket}
              receiverId={activeChatUserId}
              senderId={loggedInUser?._id}
              editingMessageId={editingMessageId}
              setEditingMessageId={setEditingMessageId}
            />
          </>
        )}
      </div>

      {isSearchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200 p-4"
          onClick={() => setIsSearchModalOpen(false)}
        >
          <div
            className="bg-surface-container-lowest w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-8 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-outline-variant/20 flex items-center gap-3 bg-surface-container-lowest relative z-10 shadow-sm">
              <div className="flex-1 flex items-center gap-3 bg-surface-container-high rounded-full px-5 py-3 border border-outline-variant/30 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-inner">
                <Search size={20} className="text-primary" />
                <input
                  type="text"
                  placeholder="Search friends..."
                  className="bg-transparent border-none outline-none text-on-surface w-full text-[15px] placeholder:text-on-surface-variant/60"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1">
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="p-3 text-on-surface-variant hover:text-error bg-surface-container hover:bg-error/10 rounded-full transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 overscroll-contain">
              {chats?.filter(c => c.user.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="text-center flex flex-col items-center justify-center h-48 opacity-70">
                  <Search size={40} className="text-on-surface-variant/50 mb-4" />
                  <p className="text-on-surface font-semibold">No friends found.</p>
                  <p className="text-on-surface-variant text-sm mt-1">Try a different name</p>
                </div>
              ) : (
                chats?.filter(c => c.user.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                  <button
                    key={c.chat._id}
                    onClick={() => { setSelectedUser(c.chat._id); setIsSearchModalOpen(false); }}
                    className="w-full flex items-center gap-4 p-3 hover:bg-surface-container-highest rounded-2xl transition-all cursor-pointer text-left active:scale-[0.98]"
                  >
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-full border border-outline-variant/30 overflow-hidden shrink-0 bg-surface-variant flex items-center justify-center shadow-sm">
                        {c.user.profilePic ? (
                          <img src={c.user.profilePic} alt={c.user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-bold text-on-surface-variant">{c.user.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      {onlineUsers.includes(c.user._id) ? (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-surface-container-lowest"></div>
                      ) : (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-outline rounded-full border-2 border-surface-container-lowest flex items-center justify-center opacity-80">
                          <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-surface-container-lowest">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 justify-center">
                      <span className="font-bold text-on-surface text-base">{c.user.name}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default ChatPage