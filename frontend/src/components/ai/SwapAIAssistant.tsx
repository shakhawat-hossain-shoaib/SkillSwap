import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Bot,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';
import { swapAiService, type SwapAiMessage } from '../../services/swapAiService';

const QUICK_PROMPTS = [
  'How does SkillSwap work?',
  'How can one find a skill match?',
  'How do peer bootcamps work?',
  'Is SkillSwap completely free?',
];

const INITIAL_MESSAGE: SwapAiMessage = {
  id: 'welcome-1',
  sender: 'assistant',
  text: `👋 **Hi, I'm SwapAI!** Your dedicated SkillSwap assistant.\n\nI can help you understand **how SkillSwap works**, **how to find skill matches**, and **how to learn in peer bootcamps**.\n\n*Note: I'm strictly specialized in SkillSwap and only answer questions about our platform.* How can I help you today?`,
  timestamp: 'Just now',
};

export function SwapAIAssistant() {
  const location = useLocation();

  // Only render on user-facing pages, never in the admin dashboard / admin portal
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<SwapAiMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasOpened(true);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: SwapAiMessage = {
      id: 'u-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await swapAiService.askSwapAi(query, messages);

      const aiMsg: SwapAiMessage = {
        id: 'ai-' + Date.now(),
        sender: 'assistant',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: SwapAiMessage = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        text: "I'm having trouble connecting right now. Feel free to ask about how SkillSwap works or finding a skill match!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  // Helper to render simple markdown-like bold and bullet formatting
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-xs leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Heading
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-sm text-gray-900 mt-2 mb-1 flex items-center gap-1">
                {line.replace('### ', '')}
              </h4>
            );
          }

          // Bullet point
          if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
            const clean = line.trim().replace(/^[-•]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 text-gray-700">
                <span className="text-primary-600 font-bold">•</span>
                <span dangerouslySetInnerHTML={{ __html: parseBold(clean) }} />
              </div>
            );
          }

          // Numbered list
          if (/^\d+\.\s/.test(line.trim())) {
            const num = line.trim().match(/^(\d+\.)\s*/)?.[1];
            const clean = line.trim().replace(/^\d+\.\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 text-gray-700 dark:text-slate-300">
                <span className="font-bold text-primary-600 dark:text-accent-400 flex-shrink-0">{num}</span>
                <span dangerouslySetInnerHTML={{ __html: parseBold(clean) }} />
              </div>
            );
          }

          return (
            <p key={idx} className="text-gray-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: parseBold(line) }} />
          );
        })}
      </div>
    );
  };

  const parseBold = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-600 dark:text-slate-400">$1</em>');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Floating Chat Assistant Modal */}
      {isOpen && (
        <div className="w-[360px] sm:w-[410px] h-[540px] max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200/80 dark:border-slate-800 flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-6 duration-200 transition-colors">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-accent-700 p-4 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <Sparkles className="h-5 w-5 text-accent-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-base tracking-tight">SwapAI</h3>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-accent-500/30 text-accent-200 border border-accent-400/30">
                    Guide
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-primary-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online • SkillSwap Assistant</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                title="Reset conversation"
                className="p-1.5 rounded-xl hover:bg-white/10 text-primary-200 hover:text-white transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close SwapAI"
                className="p-1.5 rounded-xl hover:bg-white/10 text-primary-200 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Prompt Filtering Guardrail Notice */}
          <div className="bg-primary-50/80 dark:bg-slate-800/80 border-b border-primary-100/60 dark:border-slate-700/60 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-primary-900 dark:text-accent-300">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-accent-600 dark:text-accent-400" />
              Filtered for SkillSwap topics only
            </span>
            <span className="text-[10px] text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-wider">
              SwapAI
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/60 dark:bg-slate-950/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 flex-shrink-0 flex items-center justify-center text-white shadow-xs">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-primary-900 dark:bg-primary-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-tl-xs shadow-xs text-gray-800 dark:text-slate-100'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <p className="text-xs leading-relaxed">{msg.text}</p>
                  ) : (
                    renderFormattedText(msg.text)
                  )}

                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-primary-200' : 'text-gray-400 dark:text-slate-500'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center">
                <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 flex-shrink-0 flex items-center justify-center text-white shadow-xs animate-pulse">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 p-3 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[11px] text-gray-400 dark:text-slate-400 ml-1 font-medium">SwapAI is typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Suggestions */}
          <div className="px-3 pt-2 pb-1 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto text-[11px]">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-slate-700 hover:text-primary-800 dark:hover:text-white text-gray-600 dark:text-slate-300 text-[11px] font-medium transition-colors flex-shrink-0 flex items-center gap-1 whitespace-nowrap disabled:opacity-50"
              >
                <HelpCircle className="h-3 w-3 text-accent-500" />
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask about how SkillSwap works, matching..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-primary-700 to-accent-600 hover:from-primary-800 hover:to-accent-700 text-white flex items-center justify-center shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                title="Send to SwapAI"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 bg-gradient-to-r from-primary-900 via-primary-800 to-accent-600 hover:from-primary-950 hover:to-accent-700 text-white px-4 py-3 rounded-full shadow-xl shadow-primary-900/20 hover:shadow-2xl hover:scale-105 transition-all duration-200 border border-white/20 active:scale-95"
        title="Open SwapAI Assistant"
      >
        <div className="relative">
          <Sparkles className="h-5 w-5 text-accent-300 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
        </div>

        <span className="font-display font-bold text-xs tracking-tight text-white">
          {isOpen ? 'Close SwapAI' : 'SwapAI'}
        </span>

        {!isOpen && !hasOpened && (
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-accent-500/40 text-accent-100 border border-accent-300/30">
            Ask Questions
          </span>
        )}

        {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-primary-200" /> : <MessageSquare className="h-3.5 w-3.5 text-primary-200" />}
      </button>
    </div>
  );
}
