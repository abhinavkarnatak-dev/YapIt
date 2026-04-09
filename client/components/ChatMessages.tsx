import { Message } from '@/app/chat/page';
import { User, chat_service } from '@/context/AppContext';
import { Trash2, Ban, MoreVertical, CheckCheck, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import React, { useState, useEffect, useRef } from 'react'
const UrlPreview = ({ linkPreview, url }: { linkPreview: any, url: string }) => {
  const data = linkPreview;

  if (!data || (!data.title && !data.image)) return null;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-1 mb-2 w-fit rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-low hover:opacity-95 transition-all shadow-sm select-none">
      {data.image?.url && (
        <div className="relative w-full aspect-[1.91/1] bg-surface-variant max-h-48 overflow-hidden">
          <img src={data.image.url} alt="Thumbnail" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-3">
        {data.title && <p className="text-on-surface font-bold text-xs md:text-sm line-clamp-2 leading-snug">{data.title}</p>}
        {data.description && <p className="text-on-surface-variant text-[11px] md:text-xs line-clamp-2 mt-1">{data.description}</p>}
        <span className="text-[10px] md:text-[11px] text-on-surface-variant flex items-center gap-1.5 mt-2.5 font-bold uppercase tracking-wider">
          {data.logo?.url && <img src={data.logo.url} alt="Logo" className="w-3.5 h-3.5 rounded-sm" />}
          {data.publisher || new URL(url).hostname.replace('www.', '')}
        </span>
      </div>
    </a>
  );
};

interface ChatMessagesProps {
  selectedUser: string | null;
  messages: Message[] | null;
  loggedInUser: User | null;
  onDeleteMessage: (messageId: string, type: "everyone" | "me") => void;
  onEditMessage: (messageId: string, currentText: string) => void;
  isTyping?: boolean;
}

const ChatMessages = ({ messages, selectedUser, loggedInUser, onDeleteMessage, onEditMessage, isTyping }: ChatMessagesProps) => {
  const [activeOptions, setActiveOptions] = useState<{ id: string, view: 'menu' | 'delete' } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    scrollToBottom();
    const frame = setTimeout(scrollToBottom, 150);
    return () => clearTimeout(frame);
  }, [messages, isTyping]);

  const handleDownload = async (e: React.MouseEvent, messageId: string, filename: string, fallbackUrl: string) => {
    e.preventDefault();
    e.stopPropagation();

    const toastId = toast.loading(`Initiating download for ${filename}...`);
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("No token found");

      const downloadUrl = `${chat_service}/api/v1/message/download/${messageId}?token=${token}`;

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started", { id: toastId });
    } catch (error) {
      console.log("Direct download mechanism failed or blocked, falling back to direct S3 link", error);
      toast.error("Download failed, opening link instead", { id: toastId });
      window.open(fallbackUrl, '_blank');
    }
  };

  return (
    <div className='h-screen w-screen md:w-full flex-1 overflow-y-auto px-6 py-4 space-y-4 pb-20'>
      {messages?.length === 0 && !isTyping && (
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-lg font-bold text-on-surface">Say something 👋</h2>
          <p className="text-sm text-on-surface-variant">Your conversation will appear here</p>
        </div>
      )}
      {messages?.map((message, idx) => {
        const isMe = message.sender === loggedInUser?._id;
        const isNearBottom = messages && (messages.length - idx <= 3);

        const currentMsgDate = new Date(message.createdAt);
        const prevMsgDate = idx > 0 ? new Date(messages[idx - 1].createdAt) : null;
        const showDateSeparator = !prevMsgDate || currentMsgDate.toDateString() !== prevMsgDate.toDateString();

        let dateSeparatorText = "";
        if (showDateSeparator) {
          const today = new Date();
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          today.setHours(0, 0, 0, 0);
          yesterday.setHours(0, 0, 0, 0);
          const msgDate = new Date(currentMsgDate);
          msgDate.setHours(0, 0, 0, 0);

          const diffTime = today.getTime() - msgDate.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

          if (msgDate.getTime() === today.getTime()) {
            dateSeparatorText = "Today";
          } else if (msgDate.getTime() === yesterday.getTime()) {
            dateSeparatorText = "Yesterday";
          } else if (diffDays < 7 && diffDays > 1) {
            dateSeparatorText = msgDate.toLocaleDateString('en-US', { weekday: 'long' });
          } else {
            dateSeparatorText = msgDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          }
        }

        return (
          <React.Fragment key={message._id}>
            {showDateSeparator && (
              <div className="flex justify-center my-4 md:my-5 animate-in fade-in">
                <span className="px-3 md:px-4 py-1 md:py-1.5 bg-surface-container border border-outline-variant/30 text-on-surface-variant text-[10px] md:text-[11px] font-bold uppercase tracking-widest rounded-full shadow-sm backdrop-blur-md">
                  {dateSeparatorText}
                </span>
              </div>
            )}
            <div className={`flex items-start gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} group/container`}>

              {message.deletedForEveryone ? (
                <div className={`relative group/message flex flex-col px-4 py-2 bg-surface-container border border-outline-variant/30 text-on-surface-variant rounded-2xl italic shadow-sm opacity-80 ${isMe ? "rounded-tr-sm" : "rounded-tl-sm"}`}>
                  <div className="flex items-center gap-2 pt-0.5">
                    <Ban size={14} className="opacity-70 shrink-0" />
                    <span className="text-[14px] md:text-[15px] leading-relaxed pr-6">
                      {isMe ? "You deleted this message" : "This message was deleted"}
                    </span>
                  </div>
                  <div className="flex items-center justify-end mt-0.5 text-[10px] md:text-[11px] font-medium opacity-70">
                    <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  
                  <div className="absolute right-2 top-2 z-20 flex flex-col items-end">
                    <button
                      onClick={() => setActiveOptions(activeOptions?.id === message._id ? null : { id: message._id, view: 'menu' })}
                      className={`p-1 bg-surface-container-high/60 backdrop-blur-md text-on-surface hover:bg-surface-container-highest rounded-full opacity-0 ${activeOptions?.id === message._id ? 'opacity-100' : 'group-hover/message:opacity-100'} transition-all shadow-sm cursor-pointer relative z-10`}
                      title="Message options"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeOptions?.id === message._id && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setActiveOptions(null)}></div>
                        <div className={`absolute top-full mt-1 z-40 w-48 bg-surface-container-highest border border-outline-variant/30 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] overflow-hidden ${isMe ? 'right-0' : 'left-0'} animate-in fade-in slide-in-from-top-2 duration-150`}>
                          {activeOptions.view === 'menu' ? (
                            <div className="py-1">
                              <button
                                onClick={() => setActiveOptions({ id: message._id, view: 'delete' })}
                                className="w-full text-left px-4 py-2.5 text-xs md:text-sm hover:bg-error/10 text-error flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Trash2 className='w-4 h-4 md:w-4 md:h-4' /> Delete message
                              </button>
                            </div>
                          ) : (
                            <div className="py-2 px-3">
                              <p className="text-xs text-on-surface-variant mb-2 text-center">Are you sure?</p>
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => { onDeleteMessage(message._id, "me"); setActiveOptions(null); }}
                                  className="w-full px-3 py-2 text-xs md:text-sm bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg transition-colors cursor-pointer"
                                >
                                  Delete for me
                                </button>
                                <button
                                  onClick={() => setActiveOptions(null)}
                                  className="w-full px-3 py-2 text-xs md:text-sm hover:bg-surface-container text-on-surface rounded-lg transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className={`relative group/message max-w-[65%] ${message.messageType === 'image' ? 'p-1.5' : 'px-4 py-2.5'} rounded-2xl flex flex-col shadow-sm transition-all ${isMe ? "bg-primary text-on-primary rounded-tr-sm" : "bg-surface-container-highest text-on-surface rounded-tl-sm border border-outline-variant/30"} `}>
                  {message.messageType === 'image' && message.image && (
                    <img src={message.image.url} alt="Shared" className="w-48 md:w-full h-auto max-h-72 object-cover rounded-xl" />
                  )}
                  {message.messageType === 'document' && message.document && (
                    <div onClick={(e) => handleDownload(e, message._id, message.document!.originalName, message.document!.url)} className={`max-w-full md:max-w-full flex items-center gap-3 p-3 mt-1 mb-1 rounded-xl transition-colors shadow-sm bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 cursor-pointer`}>
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0 pr-2">
                        <span className="text-xs md:text-sm font-semibold truncate text-on-surface">{message.document.originalName}</span>
                        <span className="text-[10px] md:text-[11px] text-on-surface-variant font-medium">{(message.document.size / 1024 / 1024).toFixed(2)} MB • {message.document.format}</span>
                      </div>
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-surface hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors shrink-0 shadow-sm border border-outline-variant/20">
                        <Download className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                    </div>
                  )}
                  {message.text && (
                    <div className={`min-w-18 md:min-w-0 max-w-full text-[14px] md:text-[15px] leading-relaxed break-words whitespace-pre-wrap ${message.messageType === 'image' ? 'px-2 pb-0 pt-1.5' : ''}`}>
                      {message.text.split(/(https?:\/\/[^\s]+|www\.[^\s]+)/g).map((part, i) => {
                        if (part.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/)) {
                          const href = part.startsWith('http') ? part : `https://${part}`;
                          const hasPreview = !!message.linkPreview;

                          return (
                            <React.Fragment key={i}>
                              {hasPreview && <UrlPreview linkPreview={message.linkPreview} url={href} />}
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`hover:opacity-80 transition-opacity font-semibold break-all ${isMe ? 'text-white/95' : 'text-primary'}`}
                              >
                                {part}
                              </a>
                            </React.Fragment>
                          );
                        }
                        return <React.Fragment key={i}>{part}</React.Fragment>;
                      })}
                    </div>
                  )}

                  <div className={`flex items-center justify-end gap-1 mt-0.5 text-[10px] md:text-[11px] font-medium ${message.messageType === 'image' && !message.text ? 'absolute bottom-3 right-3 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full text-white z-10' : (isMe ? 'text-on-primary/80' : 'text-on-surface-variant/80')}`}>
                    {message.isEdited && <span className="italic mr-1 opacity-80 text-[9px] md:text-[10px]">Edited</span>}
                    <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && (
                      <div className="relative group/tick flex items-center justify-center p-0.5 -m-0.5">
                        <CheckCheck
                          size={14}
                          className={message.seen ? "text-[#4ade80]" : "opacity-70"}
                        />
                        <div className="absolute bottom-full right-0 mb-1.5 px-2.5 py-1 min-w-max bg-surface-container-highest/95 backdrop-blur-md border border-outline-variant/20 text-on-surface text-[10px] font-bold tracking-wide whitespace-nowrap rounded-lg shadow-lg opacity-0 scale-95 pointer-events-none group-hover/tick:opacity-100 group-hover/tick:scale-100 transition-all origin-bottom-right z-[100] flex items-center gap-1.5">
                          {message.seen ? (message.seenAt ? `Seen at ${new Date(message.seenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Seen") : "Sent"}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`absolute right-0 top-0 w-24 h-24 max-h-full ${isMe ? 'bg-primary/50' : 'bg-surface-container-highest/80'} backdrop-blur-[3px] opacity-0 group-hover/message:opacity-100 transition-all rounded-tr-2xl pointer-events-none z-10 [mask-image:radial-gradient(100%_100%_at_top_right,black_30%,transparent_100%)] ${isMe ? "rounded-tr-sm" : ""}`}></div>

                  <div className="absolute right-2 top-2 z-20 flex flex-col items-end">
                    <button
                      onClick={() => setActiveOptions(activeOptions?.id === message._id ? null : { id: message._id, view: 'menu' })}
                      className={`p-1 bg-surface-container-high/60 backdrop-blur-md text-on-surface hover:bg-surface-container-highest rounded-full opacity-0 ${activeOptions?.id === message._id ? 'opacity-100' : 'group-hover/message:opacity-100'} transition-all shadow-sm cursor-pointer relative z-10`}
                      title="Message options"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeOptions?.id === message._id && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setActiveOptions(null)}></div>
                        <div className={`absolute ${isNearBottom ? 'bottom-full mb-1' : 'top-full mt-1'} z-40 w-48 bg-surface-container-highest border border-outline-variant/30 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] overflow-hidden ${isMe ? 'right-0' : 'left-0'} animate-in fade-in ${isNearBottom ? 'slide-in-from-bottom-2' : 'slide-in-from-top-2'} duration-150`}>

                          {activeOptions.view === 'menu' ? (
                            <div className="py-1">
                              {!isMe && message.messageType === 'image' && message.image && (
                                <button
                                  onClick={(e) => {
                                    const cleanUrl = message.image!.url.split('?')[0];
                                    const ext = cleanUrl.split('.').pop()?.toLowerCase() || 'jpg';
                                    handleDownload(e, message._id, `image-${message._id}.${ext}`, message.image!.url);
                                    setActiveOptions(null);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-xs md:text-sm hover:bg-surface-container text-on-surface flex items-center gap-2.5 transition-colors cursor-pointer border-b border-outline-variant/10"
                                >
                                  <Download className='w-4 h-4 md:w-4 md:h-4' /> Save image
                                </button>
                              )}
                              {isMe && message.text && (
                                <button
                                  onClick={() => { onEditMessage(message._id, message.text!); setActiveOptions(null); }}
                                  className="w-full text-left px-4 py-2.5 text-xs md:text-sm hover:bg-surface-container text-on-surface flex items-center gap-2.5 transition-colors cursor-pointer border-b border-outline-variant/10"
                                >
                                  <FileText className='w-4 h-4 md:w-4 md:h-4' /> Edit message
                                </button>
                              )}
                              <button
                                onClick={() => setActiveOptions({ id: message._id, view: 'delete' })}
                                className="w-full text-left px-4 py-2.5 text-xs md:text-sm hover:bg-error/10 text-error flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Trash2 className='w-4 h-4 md:w-4 md:h-4' /> Delete message
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="px-4 py-2 text-[10px] md:text-[11px] font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container/30 border-b border-outline-variant/10">Delete Message?</div>
                              <button
                                onClick={() => { onDeleteMessage(message._id, "me"); setActiveOptions(null); }}
                                className="w-full text-left px-4 py-2.5 text-xs md:text-sm hover:backdrop-brightness-95 text-on-surface transition-colors cursor-pointer"
                              >
                                Delete for me
                              </button>
                              {isMe && (
                                <button
                                  onClick={() => { onDeleteMessage(message._id, "everyone"); setActiveOptions(null); }}
                                  className="w-full text-left px-4 py-2.5 text-xs md:text-sm hover:bg-error/10 text-error border-t border-outline-variant/10 transition-colors cursor-pointer"
                                >
                                  Delete for everyone
                                </button>
                              )}
                              <button
                                onClick={() => setActiveOptions(null)}
                                className="w-full text-center font-medium px-4 py-2.5 text-xs md:text-sm hover:bg-surface-container text-on-surface-variant border-t border-outline-variant/20 bg-surface-container-low transition-colors cursor-pointer"
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
          </React.Fragment>
        );
      })}

      {isTyping && (
        <div className="flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="px-4 py-3.5 border border-outline-variant/30 rounded-2xl rounded-tl-sm bg-surface-container-high/80 text-on-surface w-fit backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-1.5 h-2">
              <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-primary/70 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-primary/70 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-primary/70 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}

export default ChatMessages