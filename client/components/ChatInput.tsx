import React, { useRef } from 'react';
import { Paperclip, Send } from 'lucide-react';

interface ChatInputProps {
  message: string;
  setMessage: (val: string) => void;
  onSendMessage: () => void;
  onImageUpload: (file: File) => void;
}

const ChatInput = ({ message, setMessage, onSendMessage, onImageUpload }: ChatInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
      e.target.value = ''; // Reset input to allow selecting the same file again if needed
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface/80 backdrop-blur-md border-t border-outline-variant/30 z-20">
      <div className="w-full mx-auto flex items-center gap-3 bg-surface-container-low p-2 rounded-full border border-outline-variant/50 shadow-sm transition-all focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50">
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-high cursor-pointer"
          title="Attach Image"
        >
          <Paperclip size={20} />
        </button>
        
        {/* Hidden file input for image uploads. accept="image/*" naturally allows Camera/Gallery selection on mobile devices */}
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden" 
        />

        {/* Input Box */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-none outline-none text-on-surface placeholder:text-on-surface-variant/50 text-[15px] px-2"
        />

        {/* Send Button */}
        <button 
          onClick={onSendMessage}
          disabled={!message.trim()}
          className="p-2.5 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-sm active:scale-95"
        >
          <Send size={18} className="translate-x-[1px] translate-y-[1px]" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
