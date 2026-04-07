import { chat_service, useAppData, user_service, User } from '@/context/AppContext';
import { CornerDownRight, CornerUpLeft, LogOut, MessageCircle, Plus, Search, UserCircle, X, Check, Mail, UserPlus, Inbox, Trash2 } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react'
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

interface ChatSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  loggedInUser: User | null;
  chats: any[] | null
  selectedUser: string | null;
  setSelectedUser: (userId: string | null) => void;
  handleLogout: () => void;
}

const ChatSidebar = ({ sidebarOpen, setSidebarOpen, loggedInUser, chats, selectedUser, setSelectedUser, handleLogout }: ChatSidebarProps) => {

  const { incomingReqs, fetchIncomingReqs, fetchChats } = useAppData();
  const [activeView, setActiveView] = useState<'chats' | 'add-friend'>('chats');
  const [addFriendTab, setAddFriendTab] = useState<'send' | 'incoming'>('send');
  
  const [emailQuery, setEmailQuery] = useState<string>("");
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean, otherUserId: string, chatRoomId: string, name: string } | null>(null);

  const handleLookupUser = async () => {
    if (!emailQuery) return;
    setIsLoading(true);
    setFoundUser(null);
    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(`${user_service}/api/v1/user/email`, { email: emailQuery }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFoundUser(data.user);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "User not found");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!foundUser) return;
    setIsLoading(true);
    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(`${user_service}/api/v1/user/request/send`, { email: foundUser.email }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(data.message);
      setFoundUser(null);
      setEmailQuery("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(`${user_service}/api/v1/user/request/accept`, { requestId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(data.message);
      await fetchIncomingReqs();
      await fetchChats();
      setActiveView('chats');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(`${user_service}/api/v1/user/request/reject`, { requestId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(data.message);
      await fetchIncomingReqs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    }
  };

  const handleUnfriendClick = (e: React.MouseEvent, otherUserId: string, chatRoomId: string, name: string) => {
    e.stopPropagation();
    setDeleteConfirmation({ isOpen: true, otherUserId, chatRoomId, name });
  };

  const executeUnfriend = async (otherUserId: string, chatRoomId: string) => {
    setIsLoading(true);
    try {
      const token = Cookies.get("token");
      const { data } = await axios.delete(`${user_service}/api/v1/user/unfriend`, {
        data: { otherUserId },
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(data.message);
      if (selectedUser === chatRoomId) {
        setSelectedUser(null);
      }
      await fetchChats();
      setDeleteConfirmation(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to unfriend user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className={`fixed z-20 sm:static top-0 left-0 h-screen w-80 bg-surface-container border-r border-surface-container-highest transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col font-body`}>
      <div className='p-6 border-b border-surface-container-highest'>
        <div className='sm:hidden flex justify-end mb-0'>
          <button onClick={() => setSidebarOpen(false)} className='p-2 hover:bg-surface-container-highest rounded-lg transition-colors cursor-pointer'>
            <X className='w-5 h-5 text-on-surface-variant' />
          </button>
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 flex items-center justify-center bg-primary/10 rounded-full'>
              <MessageCircle className='w-5 h-5 text-primary' />
            </div>
            <h2 className='text-xl font-bold text-on-surface font-headline'>{activeView === 'add-friend' ? "Add Friends" : "Messages"}</h2>
          </div>
          <button className={`p-2.5 rounded-full shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-surface cursor-pointer relative ${activeView === 'add-friend' ? "bg-surface-variant hover:bg-surface-container-highest focus:ring-surface-variant text-on-surface" : "bg-primary hover:scale-[1.02] active:scale-95 focus:ring-primary text-on-primary shadow-primary/20"}`} onClick={() => setActiveView(activeView === 'chats' ? 'add-friend' : 'chats')}>
            {activeView === 'add-friend' ? <X className='w-4 h-4' /> : <Plus className='w-4 h-4' />}
            {activeView !== 'add-friend' && incomingReqs && incomingReqs.length > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-error rounded-full border-2 border-surface-container"></span>
            )}
          </button>
        </div>
      </div>

      <div className='flex-1 overflow-hidden px-4 py-2 flex flex-col'>
        {
          activeView === 'add-friend' ? <div className='flex flex-col h-full'>
            <div className='flex p-1 bg-surface-container-highest rounded-lg mt-2 mb-4'>
              <button onClick={() => setAddFriendTab('send')} className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${addFriendTab === 'send' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'} cursor-pointer`}>
                Send Request
              </button>
              <button onClick={() => setAddFriendTab('incoming')} className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${addFriendTab === 'incoming' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'} cursor-pointer`}>
                Requests {incomingReqs && incomingReqs.length > 0 && <span className="text-[10px] bg-error text-on-error px-1.5 py-0.5 rounded-full">{incomingReqs.length}</span>}
              </button>
            </div>

            {addFriendTab === 'send' && (
              <div className='flex-1 overflow-y-auto space-y-4 px-1'>
                <div className='space-y-3'>
                  <p className='text-sm text-on-surface-variant'>Connect securely using their email address.</p>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-outline' />
                    <input type='email' placeholder="Friend's email" value={emailQuery} onChange={(e) => setEmailQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLookupUser()} className='w-full pl-10 pr-4 py-2.5 bg-surface-container-high border border-outline-variant rounded-xl text-on-surface placeholder-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body text-sm' />
                  </div>
                  <button onClick={handleLookupUser} disabled={isLoading || !emailQuery} className='w-full py-2.5 bg-primary-container text-on-primary-container font-bold rounded-xl hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'>
                    {isLoading ? "Searching..." : "Find User"}
                  </button>
                </div>

                {foundUser && (
                  <div className='mt-6 p-4 bg-surface-container-high rounded-xl border border-primary/20 space-y-4 animate-in fade-in slide-in-from-bottom-2'>
                    <div className='flex items-center gap-3 justify-center'>
                      <div className='w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xl shadow-sm shrink-0 overflow-hidden'>
                        {foundUser.profilePic ? <img src={foundUser.profilePic} alt={foundUser.name} className='w-14 h-14 rounded-full object-cover' /> : <span>{foundUser.name.charAt(0).toUpperCase()}{foundUser.name.charAt(foundUser.name.length - 1).toUpperCase()}</span>}
                      </div>
                      <div className='flex flex-col'>
                        <h3 className='text-on-surface font-bold text-lg'>{foundUser.name}</h3>
                        <span className='text-xs text-on-surface-variant'>{foundUser.email}</span>
                      </div>
                    </div>
                    <button onClick={handleSendRequest} disabled={isLoading} className='w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-block transition-transform hover:scale-[1.02] cursor-pointer'>
                      <UserPlus className='w-4 h-4' /> Send Request
                    </button>
                  </div>
                )}
              </div>
            )}

            {addFriendTab === 'incoming' && (
              <div className='flex-1 overflow-y-auto space-y-2 pb-4'>
                {!incomingReqs || incomingReqs.length === 0 ? (
                  <div className='flex flex-col items-center justify-center h-40 text-center'>
                    <Inbox className='w-8 h-8 text-outline mb-2 opacity-60' />
                    <p className='text-on-surface-variant text-sm'>No pending requests</p>
                  </div>
                ) : (
                  incomingReqs.map((req) => (
                    <div key={req._id} className='p-3 bg-surface-container-high rounded-xl flex items-center justify-between gap-2 border border-outline-variant/30'>
                      <div className='flex items-center gap-3 min-w-0 flex-1'>
                        <div className='w-10 h-10 rounded-full shrink-0 bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm shadow-sm'>
                          {req.sender.profilePic ? <img src={req.sender.profilePic} alt={req.sender.name} className='w-10 h-10 rounded-full object-cover' /> : <span>{req.sender.name.charAt(0).toUpperCase()}</span>}
                        </div>
                        <div className='min-w-0'>
                          <h3 className='text-on-surface font-bold text-[14px] truncate'>{req.sender.name}</h3>
                          <p className='text-xs text-on-surface-variant truncate'>Wants to connect</p>
                        </div>
                      </div>
                      <div className='flex items-center gap-1 shrink-0'>
                        <button onClick={() => handleRejectRequest(req._id)} className='p-2 hover:bg-error/10 text-outline hover:text-error rounded-lg transition-colors cursor-pointer' title="Reject Request">
                          <X className='w-4 h-4' />
                        </button>
                        <button onClick={() => handleAcceptRequest(req._id)} className='p-2 bg-primary/10 hover:bg-primary text-primary hover:text-on-primary rounded-lg transition-colors cursor-pointer shrink-0' title="Accept Request">
                          <Check className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div> : (
            chats && chats.length > 0 ? <div className='space-y-1.5 overflow-y-auto h-full pb-4 pt-1'>
              {chats.map((chat) => {
                const latestMessage = chat.chat.latestMessage
                const isSelected = selectedUser === chat.chat._id;
                const isSentByMe = latestMessage?.sender === loggedInUser?._id;
                const unseenCount = chat.chat.unseenCount || 0

                return <button key={chat.chat._id} onClick={() => {
                  setSelectedUser(chat.chat._id);
                  setSidebarOpen(false);
                }} className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer group/chat relative ${isSelected ? "bg-primary-container/30 border border-primary/20 shadow-[0_4px_12px_rgba(106,28,246,0.05)]" : "border-transparent hover:bg-surface-container-high"}`}>
                  <div className='flex items-center gap-3.5'>
                    <div className='relative'>
                      <div className='w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center shadow-sm text-on-surface-variant font-bold text-lg border border-outline-variant/30 overflow-hidden shrink-0'>
                        {
                          chat.user?.profilePic ? <img src={chat.user.profilePic} alt={chat.user.name} className='w-full h-full object-cover' /> : <span>{(chat.user?.name && chat.user.name.length > 0) ? `${chat.user.name.charAt(0).toUpperCase()}${chat.user.name.charAt(chat.user.name.length - 1).toUpperCase()}` : ''}</span>
                        }
                      </div>
                    </div>
                    <div className='flex-1 min-w-0 pr-6'>
                      <div className='flex items-center justify-between mb-0.5'>
                        <span className={`font-semibold truncate text-[15px] ${isSelected ? "text-on-surface" : "text-on-surface"}`}>
                          {chat.user.name}
                        </span>
                        {unseenCount > 0 &&
                          <div className="bg-primary text-on-primary text-[10px] font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1.5 ml-2 shadow-sm">
                            {unseenCount > 99 ? "99+" : unseenCount}
                          </div>
                        }
                      </div>
                      {
                        latestMessage && (
                          <div className='flex items-center gap-1.5'>
                            {isSentByMe ? <CornerUpLeft size={14} className='text-primary shrink-0 opacity-80' /> : <CornerDownRight size={14} className='text-secondary shrink-0 opacity-80' />}
                            <span className={`text-[13px] flex-1 truncate ${isSelected ? "text-on-surface-variant" : "text-outline"}`}>
                              {latestMessage.text}
                            </span>
                          </div>
                        )
                      }
                    </div>
                  </div>
                  
                  <div className="absolute right-0 top-0 bottom-0 w-24 bg-surface-container-highest/40 backdrop-blur-[3px] opacity-0 group-hover/chat:opacity-100 transition-all rounded-r-xl pointer-events-none z-10 [mask-image:linear-gradient(to_left,black_40%,transparent_100%)]"></div>
                  
                  <button 
                    onClick={(e) => handleUnfriendClick(e, chat.user._id, chat.chat._id, chat.user.name)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-error/15 backdrop-blur-md text-error hover:bg-error hover:text-on-error rounded-lg opacity-0 group-hover/chat:opacity-100 transition-all shadow-sm z-20 cursor-pointer"
                    title="Unfriend and Delete Chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </button>
              })}
            </div> : <div className='flex flex-col items-center justify-center h-full text-center'>
              <div className='p-5 bg-surface-container-highest rounded-full mb-4 opacity-70'>
                <MessageCircle className='w-8 h-8 text-outline' />
              </div>
              <p className='text-on-surface font-semibold text-lg font-headline'>No chats yet</p>
              <p className='text-on-surface-variant text-sm mt-1 max-w-[80%] leading-snug'>Start a conversation by adding a user via the plus button.</p>
            </div>
          )
        }
      </div>
      <div className='p-4 border-t border-surface-container-highest space-y-1.5 shrink-0'>
        <Link href="/profile" className='flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer group'>
          <div className='p-2 bg-surface-container-highest rounded-lg group-hover:bg-primary/10 transition-colors'>
            <UserCircle className='w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors' />
          </div>
          <span className='text-on-surface font-semibold text-sm'>Profile</span>
        </Link>
        <button onClick={handleLogout} className='w-full flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-error-container/30 transition-colors text-error group cursor-pointer'>
          <div className='p-2 bg-error/10 rounded-lg group-hover:bg-error transition-colors'>
            <LogOut className='w-5 h-5 text-error group-hover:text-on-error transition-colors' />
          </div>
          <span className='font-semibold text-sm'>Logout</span>
        </button>
      </div>

      {/* Unfriend Confirmation Modal */}
      {deleteConfirmation?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface-container rounded-3xl p-7 max-w-sm w-[90%] shadow-2xl border border-surface-container-highest animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-error" />
            </div>
            <h3 className="text-xl font-bold font-headline text-on-surface mb-2">Unfriend {deleteConfirmation.name}?</h3>
            <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
              This action is permanent. You will instantly erase your entire chat history and sever your connection across all devices.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setDeleteConfirmation(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                onClick={() => executeUnfriend(deleteConfirmation.otherUserId, deleteConfirmation.chatRoomId)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-error text-on-error hover:scale-[1.02] active:scale-95 transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Yes, Unfriend"}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default ChatSidebar