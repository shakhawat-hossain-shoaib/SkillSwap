import { useState, useEffect, useRef } from 'react';
import type { Conversation } from '../../data/messages';
import { MessageInput } from './MessageInput';
import { VideoCallModal } from './VideoCallModal';
import { ScheduleSessionModal } from './ScheduleSessionModal';
import { Repeat, ShieldCheck, Video, Phone, Calendar, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChatWindowProps {
  conversation: Conversation | null;
  onSendMessage: (text: string) => void;
  onTyping?: () => void;
  onDeleteMessage?: (messageId: string) => void;
  onDeleteConversation?: (id: string, partnerName: string) => void;
  isTyping: boolean;
  onBackMobile?: () => void;
}

export function ChatWindow({
  conversation,
  onSendMessage,
  onTyping,
  onDeleteMessage,
  onDeleteConversation,
  isTyping,
  onBackMobile,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, isTyping]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 text-center">
        <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-4">
          <Repeat className="h-8 w-8" />
        </div>
        <h3 className="font-display font-bold text-lg text-gray-900 mb-1">
          Select a Conversation
        </h3>
        <p className="text-gray-500 text-xs max-w-xs">
          Choose a conversation from the left to coordinate swap times, lessons, and reviews.
        </p>
      </div>
    );
  }

  const handleAudioCall = () => {
    toast.success(`Starting audio swap session with ${conversation.partnerName}...`);
    setIsVideoModalOpen(true);
  };

  const handleScheduled = (details: { date: string; time: string; topic: string; duration: string }) => {
    onSendMessage(`📅 Scheduled Swap Session: "${details.topic}" on ${details.date} at ${details.time} (${details.duration})`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden relative">
      {/* Top Header */}
      <div className="h-18 px-6 py-3 border-b border-gray-200 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-3">
          {onBackMobile && (
            <button
              onClick={onBackMobile}
              className="md:hidden text-gray-400 hover:text-gray-600 font-bold text-sm"
            >
              ←
            </button>
          )}

          <div className="relative">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-xs select-none">
              {conversation.partnerAvatar}
            </div>
            {conversation.isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-gray-900">{conversation.partnerName}</h3>
              <ShieldCheck className="h-4 w-4 text-accent-500" />
            </div>
            <p className="text-xs text-gray-400">
              {conversation.partnerRole} • {conversation.isOnline ? 'Online now' : 'Offline'}
            </p>
          </div>
        </div>

        {/* Skill Swap Info Badge & Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600">
            <span className="font-semibold text-accent-700">{conversation.skillOffered}</span>
            <Repeat className="h-3 w-3 text-gray-400" />
            <span className="font-semibold text-primary-700">{conversation.skillWanted}</span>
          </div>

          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-colors"
            title="Schedule session"
          >
            <Calendar className="h-5 w-5" />
          </button>

          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-colors"
            title="Start Video Swap Call"
          >
            <Video className="h-5 w-5" />
          </button>

          <button
            onClick={handleAudioCall}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-colors"
            title="Start Audio Call"
          >
            <Phone className="h-5 w-5" />
          </button>

          {onDeleteConversation && (
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete this conversation with ${conversation.partnerName}? All chat history will be permanently cleared.`)) {
                  onDeleteConversation(conversation.id, conversation.partnerName);
                  toast.success(`Conversation with ${conversation.partnerName} deleted`);
                }
              }}
              className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Delete conversation & clear chat"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50/50 via-white to-gray-50/30 chat-scroll">
        {/* Swap agreement top pin */}
        <div className="mx-auto max-w-sm p-3 rounded-2xl bg-primary-50/70 border border-primary-100 text-center text-xs text-primary-900 shadow-xs">
          <div className="font-bold mb-0.5 flex items-center justify-center gap-1">
            <Repeat className="h-3.5 w-3.5 text-accent-600" /> Active Barter Channel
          </div>
          <p className="text-[11px] text-gray-600">
            Teaching <span className="font-semibold text-primary-800">{conversation.skillWanted}</span> ↔ Learning{' '}
            <span className="font-semibold text-accent-800">{conversation.skillOffered}</span>
          </p>
        </div>

        {conversation.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col group ${msg.isMe ? 'items-end' : 'items-start'} animate-fadeIn`}
          >
            <div className="flex items-end gap-2 max-w-[80%]">
              {!msg.isMe && (
                <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 select-none">
                  {msg.senderAvatar}
                </div>
              )}

              {/* Action delete button for sender */}
              {msg.isMe && onDeleteMessage && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this message?')) {
                      onDeleteMessage(msg.id);
                      toast.success('Message deleted');
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer self-center"
                  title="Delete message"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}

              <div
                className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                  msg.isMe
                    ? 'bg-primary-600 text-white rounded-br-xs shadow-xs'
                    : 'bg-white text-gray-800 border border-gray-200/80 rounded-bl-xs shadow-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>

            <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-gray-400 animate-fadeIn">
            <div className="h-7 w-7 rounded-xl bg-gray-200 flex items-center justify-center text-gray-600 text-[10px] font-bold">
              {conversation.partnerAvatar}
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-600 rounded-bl-xs flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" />
              <span
                className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: '0.2s' }}
              />
              <span
                className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: '0.4s' }}
              />
            </div>
            <span>{conversation.partnerName} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Message Input */}
      <MessageInput onSendMessage={onSendMessage} onTyping={onTyping} />

      {/* Interactive Modals */}
      <VideoCallModal
        partnerName={conversation.partnerName}
        partnerAvatar={conversation.partnerAvatar}
        partnerRole={conversation.partnerRole}
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />

      <ScheduleSessionModal
        partnerName={conversation.partnerName}
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onScheduled={handleScheduled}
      />
    </div>
  );
}
