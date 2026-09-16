import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Send, Smile, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onTyping?: () => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, onTyping, disabled = false }: MessageInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text);
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const quickPrompts = [
    "Let's schedule a 1-hour session!",
    "Can you share the bootcamp notes?",
    "When are you free for our swap call?"
  ];

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      {/* Quick Prompts */}
      <div className="flex gap-2 mb-2.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1 flex-shrink-0">
          <Sparkles className="h-3 w-3 text-accent-500" /> Quick:
        </span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSendMessage(prompt)}
            className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-primary-50 hover:text-primary-700 text-gray-600 transition-colors text-[11px] whitespace-nowrap flex-shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            placeholder="Type your message or schedule a session... (Press Enter)"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              onTyping?.();
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all placeholder:text-gray-400"
          />
          <button
            type="button"
            className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
            title="Add emoji"
          >
            <Smile className="h-5 w-5" />
          </button>
        </div>

        <Button
          type="submit"
          disabled={!text.trim() || disabled}
          variant="cta"
          size="icon"
          className="h-12 w-12 rounded-2xl shadow-md shadow-cta-500/20 flex-shrink-0 flex items-center justify-center"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
