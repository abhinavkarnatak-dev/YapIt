import { User } from '@/context/AppContext';
import { CornerDownRight, CornerUpLeft, LogOut, MessageCircle, Plus, Search, UserCircle, X } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react'

interface ChatSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showAllUsers: boolean;
  setShowAllUsers: (show: boolean | ((prev: boolean) => boolean)) => void;
  users: User[] | null;
  loggedInUser: User | null;
  chats: any[] | null
  selectedUser: string | null;
  setSelectedUser: (userId: string | null) => void;
  handleLogout: () => void;
}

const ChatSidebar = ({ sidebarOpen, setSidebarOpen, showAllUsers, setShowAllUsers, users, loggedInUser, chats, selectedUser, setSelectedUser, handleLogout }: ChatSidebarProps) => {

  const [searchQuery, setSearchQuery] = useState<string>("");

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
            <h2 className='text-xl font-bold text-on-surface font-headline'>{showAllUsers ? "New Chat" : "Messages"}</h2>
          </div>
          <button className={`p-2.5 rounded-full shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-surface cursor-pointer ${showAllUsers ? "bg-surface-variant hover:bg-surface-container-highest focus:ring-surface-variant text-on-surface" : "bg-primary hover:scale-[1.02] active:scale-95 focus:ring-primary text-on-primary shadow-primary/20"}`} onClick={() => setShowAllUsers((prev) => !prev)}>
            {showAllUsers ? <X className='w-4 h-4' /> : <Plus className='w-4 h-4' />}
          </button>
        </div>
      </div>

      <div className='flex-1 overflow-hidden px-4 py-2'>
        {
          showAllUsers ? <div className='space-y-4 h-full'>
            <div className='relative pt-2'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-outline mt-1' />
              <input type='text' placeholder='Search users' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='w-full pl-10 pr-4 py-2.5 bg-surface-container-high border border-outline-variant rounded-full text-on-surface placeholder-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body' />
            </div>
            <div className='space-y-2 overflow-y-auto h-full pb-4'>
              {
                users?.filter((user) => user._id !== loggedInUser?._id && user.name.toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
                  <div key={user._id} className='flex items-center gap-3 p-3 hover:bg-surface-container-high rounded-xl cursor-pointer transition-colors' onClick={() => {
                    setSelectedUser(user._id);
                    setSidebarOpen(false);
                  }}>
                    <div className='w-11 h-11 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-base shadow-sm'>
                      {
                        user.profilePic ? <img src={user.profilePic} alt={user.name} className='w-11 h-11 rounded-full object-cover' /> : <span>{user.name.charAt(0).toUpperCase()}{user.name.charAt(user.name.length - 1).toUpperCase()}</span>
                      }
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-on-surface font-bold text-[15px]'>{user.name}</h3>
                      { /* To show online status */}
                    </div>
                  </div>
                ))
              }
            </div>
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
                }} className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer ${isSelected ? "bg-primary-container/30 border border-primary/20 shadow-[0_4px_12px_rgba(106,28,246,0.05)]" : "border-transparent hover:bg-surface-container-high"}`}>
                  <div className='flex items-center gap-3.5'>
                    <div className='relative'>
                      <div className='w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center shadow-sm text-on-surface-variant font-bold text-lg border border-outline-variant/30'>
                        {
                          chat.user?.profilePic ? <img src={chat.user.profilePic} alt={chat.user.name} className='w-12 h-12 rounded-full object-cover' /> : <span>{(chat.user?.name && chat.user.name.length > 0) ? `${chat.user.name.charAt(0).toUpperCase()}${chat.user.name.charAt(chat.user.name.length - 1).toUpperCase()}` : ''}</span>
                        }
                      </div>
                    </div>
                    <div className='flex-1 min-w-0'>
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
      <div className='p-4 border-t border-surface-container-highest space-y-1.5'>
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
    </aside>
  )
}

export default ChatSidebar