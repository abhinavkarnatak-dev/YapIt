import { User } from '@/context/AppContext';
import { CornerDownRight, CornerUpLeft, MessageCircle, Plus, Search, UserCircle, X } from 'lucide-react';
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
    <aside className={`fixed z-20 sm:static top-0 left-0 h-screen w-80 bg-gray-900 border-r border-gray-700 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}>
      <div className='p-6 border-b border-gray-700'>
        <div className='sm:hidden flex ustify-end mb-0'>
          <button onClick={() => setSidebarOpen(false)} className='p-2 hover:bg-gray-700 rounded-lg transition-colors'>
            <X className='w-5 h-5 text-gray-300' />
          </button>
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='p-2 justify-between'>
              <MessageCircle className='w-5 h-5 text-white' />
            </div>
            <h2 className='text-xl font-bold text-white'>{showAllUsers ? "New Chat" : "Messages"}</h2>
          </div>
          <button className={`p-2.5 rounded-lg transition-colors ${showAllUsers ? " bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white cursor-pointer"}`} onClick={() => setShowAllUsers((prev) => !prev)}>
            {showAllUsers ? <X className='w-4 h-4' /> : <Plus className='w-4 h-4' />}
          </button>
        </div>
      </div>

      <div className='flex-1 overflow-hidden px-4 py-2'>
        {
          showAllUsers ? <div className='space-y-4 h-full'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input type='text' placeholder='Search users' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500' />
            </div>
            <div className='space-y-2 overflow-y-auto h-full pb-4'>
              {
                users?.filter((user) => user._id !== loggedInUser?._id && user.name.toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
                  <div key={user._id} className='flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer' onClick={() => {
                    setSelectedUser(user._id);
                    setSidebarOpen(false);
                  }}>
                    <div className='w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center'>
                      {
                        user.profilePic ? <img src={user.profilePic} alt={user.name} className='w-10 h-10 rounded-full object-cover' /> : <span className='w-10 h-10 flex items-center justify-center text-white font-bold'>{user.name.charAt(0).toUpperCase()}{user.name.charAt(user.name.length - 1).toUpperCase()}</span>
                      }
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-white font-bold'>{user.name}</h3>
                      <p></p> { /* To show online status */}
                    </div>
                  </div>
                ))
              }
            </div>
          </div> : (
            chats && chats.length > 0 ? <div className='space-y-2 overflow-y-auto h-full pb-4'>
              {chats.map((chat) => {
                const latestMessage = chat.chat.latestMessge
                const isSelected = selectedUser === chat.chat._id;
                const isSentByMe = latestMessage?.senderId === loggedInUser?._id;
                const unseenCount = chat.chat.unseenCount || 0

                return <button key={chat.chat._id} onClick={() => {
                  setSelectedUser(chat.chat._id);
                  setSidebarOpen(false);
                }} className={`w-full text-left p-4 rounded-lg transition-colors ${isSelected ? "bg-blue-600 border border-blue-500" : "border-gray-700 hover:bg-gray-600"}`}>
                  <div className='flex items-center gap-3'>
                    <div className='relative'>
                      <div className='w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center'>
                        {/* TODO: Add profile pic  and online status*/}

                      </div>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between mb-1'>
                        <span className={`font-semibold truncate ${isSelected ? "text-white" : "text-gray-200"}`}>
                          {chat.user.name}
                        </span>
                        {unseenCount > 0 &&
                          <div className="bg-green-600 text-white text-xs font-bold rounded-full min-w-22px h-5.5 flex items-center justify-center px-2">
                            {unseenCount > 99 ? "99+" : unseenCount}
                          </div>
                        }
                      </div>
                      {
                        latestMessage && (
                          <div className='flex items-center gap-2'>
                            {isSentByMe ? <CornerUpLeft size={14} className='text-blue-400 text-shrink-0' /> : <CornerDownRight size={14} className='text-green-400 text-shrink-0' />}
                            <span className={"text-sm text-gray-400 flex-1 truncate"}>
                              {latestMessage.text}
                            </span>
                          </div>
                        )
                      }
                    </div>
                  </div>
                </button>
              })}
            </div> : <div></div>
          )
        }
      </div>
    </aside>
  )
}

export default ChatSidebar