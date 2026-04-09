import React, { useRef, useEffect, useState } from 'react';
import { Paperclip, Send, X, Smile, FileText } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Socket } from 'socket.io-client';

interface ChatInputProps {
  message: string;
  setMessage: (val: string) => void;
  onSendMessage: (imageFile: File | null) => void;
  socket?: Socket | null;
  receiverId?: string;
  senderId?: string;
  editingMessageId?: string | null;
  setEditingMessageId?: (id: string | null) => void;
}

const ChatInput = ({ message, setMessage, onSendMessage, socket, receiverId, senderId, editingMessageId, setEditingMessageId }: ChatInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const [isTypingLocal, setIsTypingLocal] = useState(false);

  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (target.closest('.emoji-toggle-btn')) return;
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(target)) {
        setShowEmojiPicker(false);
      }
    }

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const onEmojiClick = (emojiObject: any) => {
    setMessage(message + emojiObject.emoji);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachmentFile(file);
      if (file.type.startsWith('image/')) {
        setImagePreview(URL.createObjectURL(file));
      } else {
        setImagePreview(null);
      }
      e.target.value = '';
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];

      const allowedMimeTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ];

      if (file.type.startsWith('image/') || allowedMimeTypes.includes(file.type)) {
        setAttachmentFile(file);
        if (file.type.startsWith('image/')) {
          setImagePreview(URL.createObjectURL(file));
        } else {
          setImagePreview(null);
        }
        e.preventDefault();
      }
    }
  };

  const cancelAttachment = () => {
    setAttachmentFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleSend = () => {
    if (!message.trim() && !attachmentFile) return;
    onSendMessage(attachmentFile);
    cancelAttachment();
    setShowEmojiPicker(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTypingLocal(false);
    socket?.emit("stop_typing", { senderId, receiverId });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }

    if (socket && receiverId && senderId) {
      if (!isTypingLocal) {
        setIsTypingLocal(true);
        socket.emit("typing", { senderId, receiverId });
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop_typing", { senderId, receiverId });
        setIsTypingLocal(false);
      }, 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTypingLocal) {
        socket?.emit("stop_typing", { senderId, receiverId });
      }
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [socket, receiverId, senderId, isTypingLocal]);

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface/80 backdrop-blur-md border-t border-outline-variant/30 z-20">
      {editingMessageId && (
        <div className="mb-3 px-3 py-2 bg-surface-container-highest border border-primary/30 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-bottom-2 mx-2">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-7 bg-primary rounded-full"></div>
            <div className="flex flex-col">
              <span className="text-primary font-bold text-[11px] uppercase tracking-wider">Editing Message</span>
              <span className="text-on-surface-variant text-xs truncate max-w-[200px] sm:max-w-[400px]">Update your text below</span>
            </div>
          </div>
          <button
            onClick={() => { setEditingMessageId?.(null); setMessage(""); }}
            className="p-1.5 bg-surface-container text-on-surface-variant hover:bg-error/10 hover:text-error rounded-full transition-colors cursor-pointer border border-outline-variant/20 shadow-sm"
            title="Cancel editing"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {attachmentFile && (
        <div className="mb-3 ml-2 relative inline-block animate-in fade-in slide-in-from-bottom-2">
          <div className="p-1.5 bg-surface-container-high rounded-xl border border-outline-variant/50 shadow-sm">
            {attachmentFile.type.startsWith('image/') && imagePreview ? (
              <img src={imagePreview} alt="Attachment Preview" className="h-20 w-auto rounded-lg object-cover" />
            ) : (
              <div className="flex items-center gap-3 px-3 py-2 h-20 bg-surface-container rounded-lg">
                <FileText className="text-primary opacity-80" size={28} />
                <div className="flex flex-col max-w-[150px]">
                  <span className="text-sm font-semibold truncate text-on-surface">{attachmentFile.name}</span>
                  <span className="text-xs text-on-surface-variant">{(attachmentFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={cancelAttachment}
            className="absolute -top-2 -right-2 p-1 bg-surface shadow-md text-on-surface-variant hover:text-error rounded-full transition-colors border border-outline-variant/30 cursor-pointer hover:bg-error/10"
            title="Remove attachment"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="w-full mx-auto flex items-center gap-3 bg-surface-container-low p-2 rounded-full border border-outline-variant/50 shadow-sm transition-all focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50">
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-[calc(100%+12px)] left-2 z-50 shadow-2xl rounded-2xl overflow-hidden border border-outline-variant/20 animate-in slide-in-from-bottom-2 fade-in">
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              theme={Theme.DARK}
              searchDisabled={false}
              skinTonesDisabled
              width={300}
              height={400}
            />
          </div>
        )}

        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`emoji-toggle-btn p-2 transition-colors rounded-full cursor-pointer ${showEmojiPicker ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`}
          title="Add Emoji"
        >
          <Smile size={20} />
        </button>

        {!editingMessageId && (
          <button
            onClick={() => { fileInputRef.current?.click(); setShowEmojiPicker(false); }}
            className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-high cursor-pointer"
            title="Attach File"
          >
            <Paperclip size={20} />
          </button>
        )}

        <input
          type="file"
          accept="image/*,.pdf,.docx,.xlsx,.txt"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Type a message..."
          rows={1}
          style={{ resize: 'none' }}
          className="flex-1 bg-transparent border-none outline-none text-on-surface placeholder:text-on-surface-variant/50 text-[15px] px-2 py-0 my-auto scrollbar-thin scrollbar-thumb-outline-variant/30 scrollbar-track-transparent"
        />

        <button
          onClick={handleSend}
          disabled={!message.trim() && !attachmentFile}
          className="p-2.5 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-sm active:scale-95 cursor-pointer"
        >
          <Send size={18} className="translate-x-[1px] translate-y-[1px]" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;