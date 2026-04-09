import { User } from '@/context/AppContext'
import { MenuIcon, UserCircle, X } from 'lucide-react'
import React from 'react'

interface ChatHeaderProps {
    user: User | null,
    sidebarOpen: boolean,
    setSidebarOpen: (open: boolean) => void
    isTyping: boolean,
    isOnline?: boolean
}

const ChatHeader = ({ user, sidebarOpen, setSidebarOpen, isTyping, isOnline = true }: ChatHeaderProps) => {
    return (
        <div className='flex items-center justify-between pb-4 border-b border-surface-container-highest'>
            <div className='flex items-center gap-3 h-12'>
                <div className='sm:hidden block z-50 mr-2 absolute right-5 top-5'>
                    <button className='p-2.5 bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/30 shadow-sm relative' onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? (
                            <X className='w-5 h-5 transition-colors text-primary' />
                        ) : (
                            <MenuIcon className='w-5 h-5 transition-colors text-on-surface-variant' />
                        )}
                    </button>
                </div>

                {user ? (
                    <>
                        <div className='relative'>
                            {user.email === 'system@yapit.com' ? (
                                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shadow-sm border border-outline-variant/30 shrink-0 relative overflow-hidden">
                                    <span className="text-on-secondary-container font-bold text-xl font-headline italic">Y!</span>
                                </div>
                            ) : (
                                <>
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
                                </>
                            )}
                        </div>

                        <div className='flex flex-col'>
                            <h2 className='text-base md:text-lg font-bold text-on-surface leading-tight'>{user.name}</h2>
                            {user.email === 'system@yapit.com' && (
                                <p className="text-xs md:text-sm text-secondary font-medium">System Message</p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="hidden md:flex items-center gap-3">
                        <div className='w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant/30'>
                            <UserCircle className='w-7 h-7 text-outline' />
                        </div>
                        <div className='flex flex-col'>
                            <h2 className='text-base md:text-lg font-bold text-on-surface'>No chat selected</h2>
                            <p className='text-xs md:text-sm text-on-surface-variant'>Pick a conversation or start a new one</p>
                        </div>
                    </div>
                )}
        </div>
    </div>
  )
}

export default ChatHeader