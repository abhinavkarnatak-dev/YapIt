import { Message } from '@/app/chat/page';
import { User } from '@/context/AppContext';
import { Trash2, Ban, MoreVertical, CheckCheck } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react'

interface ChatMessagesProps {
  selectedUser: string | null;
  messages: Message[] | null;
  loggedInUser: User | null;
  onDeleteMessage: (messageId: string, type: "everyone" | "me") => void;
}

const ChatMessages = ({ messages, selectedUser, loggedInUser, onDeleteMessage }: ChatMessagesProps) => {
  const [activeOptions, setActiveOptions] = useState<{ id: string, view: 'menu' | 'delete' } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className='h-screen flex-1 overflow-y-auto px-6 py-4 space-y-4 pb-20'>
      {messages?.map((message) => {
        const isMe = message.sender === loggedInUser?._id;

        return (
          <div key={message._id} className={`flex items-start gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
            
            {message.deletedForEveryone ? (
              <div className={`flex flex-col px-4 py-2 bg-surface-container border border-outline-variant/30 text-on-surface-variant rounded-2xl italic shadow-sm opacity-80 ${isMe ? "rounded-tr-sm" : "rounded-tl-sm"}`}>
                <div className="flex items-center gap-2 pt-0.5">
                  <Ban size={14} className="opacity-70 shrink-0" />
                  <span className="text-[15px] leading-relaxed pr-6">
                    {isMe ? "You deleted this message" : "This message was deleted"}
                  </span>
                </div>
                <div className="flex items-center justify-end mt-0.5 text-[11px] font-medium opacity-70">
                  <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ) : (
              <div className={`relative group/message max-w-[70%] ${message.messageType === 'image' ? 'p-1.5' : 'px-4 py-2.5'} rounded-2xl flex flex-col shadow-sm transition-all ${isMe ? "bg-primary text-on-primary rounded-tr-sm" : "bg-surface-container-highest text-on-surface rounded-tl-sm border border-outline-variant/30"}`}>
                {message.messageType === 'image' && message.image && (
                  <img src={message.image.url} alt="Shared" className="w-full h-auto max-h-72 object-cover rounded-xl" />
                )}
                {message.text && (
                  <p className={`text-[15px] leading-relaxed break-words ${message.messageType === 'image' ? 'px-2 pb-0 pt-1.5' : ''}`}>
                    {message.text}
                  </p>
                )}

                {/* Timestamp & Ticks Footer */}
                <div className={`flex items-center justify-end gap-1 mt-0.5 text-[11px] font-medium ${message.messageType === 'image' && !message.text ? 'absolute bottom-3 right-3 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full text-white z-10' : (isMe ? 'text-on-primary/80' : 'text-on-surface-variant/80')}`}>
                  <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && (
                    <CheckCheck size={14} className={message.seen ? "text-[#4ade80]" : "opacity-70"} />
                  )}
                </div>

                {/* Gradient blur overlay block... */}
                <div className={`absolute right-0 top-0 bottom-0 w-24 ${isMe ? 'bg-primary/50' : 'bg-surface-container-highest/80'} backdrop-blur-[3px] opacity-0 group-hover/message:opacity-100 transition-all rounded-r-2xl pointer-events-none z-10 [mask-image:linear-gradient(to_left,black_20%,transparent_100%)] ${isMe ? "rounded-tr-sm" : ""}`}></div>
                
                {/* Menu Button & Dropdown Wrapper */}
                <div className="absolute right-2 top-2 z-20 flex flex-col items-end">
                  <button 
                    onClick={() => setActiveOptions(activeOptions?.id === message._id ? null : { id: message._id, view: 'menu' })} 
                    className={`p-1 bg-surface-container-high/60 backdrop-blur-md text-on-surface hover:bg-surface-container-highest rounded-full opacity-0 ${activeOptions?.id === message._id ? 'opacity-100' : 'group-hover/message:opacity-100'} transition-all shadow-sm cursor-pointer relative z-10`}
                    title="Message options"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Integrated Options Menu */}
                  {activeOptions?.id === message._id && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setActiveOptions(null)}></div>
                      <div className={`absolute top-full z-40 w-48 bg-surface-container-highest border border-outline-variant/30 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] overflow-hidden mt-1 ${isMe ? "right-0" : "right-0"} animate-in fade-in slide-in-from-top-2 duration-150`}>
                        
                        {activeOptions.view === 'menu' ? (
                          <div className="py-1">
                            <button 
                              onClick={() => setActiveOptions({ id: message._id, view: 'delete' })} 
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-error/10 text-error flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <Trash2 size={16}/> Delete message
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="px-4 py-2 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container/30 border-b border-outline-variant/10">Delete Message?</div>
                            <button 
                              onClick={() => { onDeleteMessage(message._id, "me"); setActiveOptions(null); }} 
                              className="w-full text-left px-4 py-2.5 text-sm hover:backdrop-brightness-95 text-on-surface transition-colors cursor-pointer"
                            >
                              Delete for me
                            </button>
                            {isMe && (
                              <button 
                                onClick={() => { onDeleteMessage(message._id, "everyone"); setActiveOptions(null); }} 
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-error/10 text-error border-t border-outline-variant/10 transition-colors cursor-pointer"
                              >
                                Delete for everyone
                              </button>
                            )}
                            <button 
                              onClick={() => setActiveOptions(null)} 
                              className="w-full text-center font-medium px-4 py-2.5 text-sm hover:bg-surface-container text-on-surface-variant border-t border-outline-variant/20 bg-surface-container-low transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default ChatMessages