import { User } from '@/context/AppContext'
import { MenuIcon, UserCircle } from 'lucide-react'
import React from 'react'

interface ChatHeaderProps {
    user: User | null,
    setSidebarOpen: (open: boolean) => void
    isTyping: boolean,
    isOnline?: boolean
}

const ChatHeader = ({ user, setSidebarOpen, isTyping, isOnline = true }: ChatHeaderProps) => {
    return (
        <div className='flex items-center justify-between pb-4 border-b border-surface-container-highest'>
            <div className='flex items-center gap-3'>
                <div className='sm:hidden block z-30 mr-2'>
                    <button className='p-2.5 bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/30 shadow-sm' onClick={() => setSidebarOpen(true)}>
                        <MenuIcon className='w-5 h-5 text-on-surface-variant' />
                    </button>
                </div>

                {user ? (
                    <>
                        <div className='relative'>
                            <div className='w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center shadow-sm text-on-surface-variant font-bold text-lg border-2 border-primary/20 overflow-hidden shrink-0'>
                                {user.profilePic ? (
                                    <img src={user.profilePic} alt={user.name} className='w-full h-full object-cover' />
                                ) : (
                                    <span className="text-primary font-bold">{user.name ? `${user.name.charAt(0).toUpperCase()}${user.name.charAt(user.name.length - 1).toUpperCase()}` : ''}</span>
                                )}
                            </div>
                            {isOnline ? (
                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-surface"></div>
                            ) : (
                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-outline rounded-full border-2 border-surface flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-surface">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </div>
                            )}
                        </div>

                        <div className='flex flex-col'>
                            <h2 className='text-lg font-bold text-on-surface leading-tight'>{user.name}</h2>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className='w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant/30'>
                            <UserCircle className='w-7 h-7 text-outline' />
                        </div>
                        <div className='flex flex-col'>
                            <h2 className='text-lg font-bold text-on-surface'>Select a conversation</h2>
                            <p className='text-xs text-on-surface-variant'>Choose a chat to start messaging</p>
                        </div>
                    </div>
                )}
        </div>
    </div>
  )
}

export default ChatHeader