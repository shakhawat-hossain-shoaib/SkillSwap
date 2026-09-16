import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Conversation } from '../../data/messages';
import { Search, BrainCircuit, ShieldCheck, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import toast from 'react-hot-toast';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onDeleteConversation?: (id: string, partnerName: string) => void;
  isLive?: boolean;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onDeleteConversation,
  isLive = true,
}: ConversationListProps) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(
    (c) =>
      c.partnerName.toLowerCase().includes(search.toLowerCase()) ||
      c.partnerRole.toLowerCase().includes(search.toLowerCase()) ||
      c.skillOffered.toLowerCase().includes(search.toLowerCase()) ||
      c.skillWanted.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full md:w-80 border-r border-gray-200 bg-white flex flex-col h-full">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-base text-gray-900">Barter Messages</h2>
            <span
              className={`flex h-2 w-2 rounded-full ${
                isLive ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-400'
              }`}
              title={isLive ? 'Live Real-Time Active' : 'Live Syncing'}
            />
          </div>
          <Link
            to="/exchanges"
            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-1 text-[11px] font-bold"
            title="Propose new AI skill swap"
          >
            <BrainCircuit className="h-3.5 w-3.5" />
            <span>AI Swap</span>
          </Link>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search peer or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 chat-scroll">
        {filtered.length > 0 ? (
          filtered.map((conv) => {
            const isActive = conv.id === activeId;
            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full p-4 flex items-start gap-3 text-left transition-colors cursor-pointer group relative ${
                  isActive ? 'bg-primary-50/80 border-l-4 border-primary-600' : 'hover:bg-gray-50'
                }`}
              >
                {/* Avatar + Online Indicator */}
                <div className="relative flex-shrink-0">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-xs select-none">
                    {conv.partnerAvatar}
                  </div>
                  {conv.isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>

                {/* Text Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-xs text-gray-900 truncate flex items-center gap-1">
                      {conv.partnerName}
                      <ShieldCheck className="h-3 w-3 text-accent-500 flex-shrink-0" />
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-400 font-medium group-hover:hidden">
                        {conv.lastMessageTime}
                      </span>
                      {onDeleteConversation && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete conversation with ${conv.partnerName}? All chat history will be cleared.`)) {
                              onDeleteConversation(conv.id, conv.partnerName);
                              toast.success(`Conversation with ${conv.partnerName} deleted`);
                            }
                          }}
                          className="hidden group-hover:flex p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete conversation"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 truncate mb-1.5 font-normal">
                    {conv.lastMessage || 'No messages yet'}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
                      {conv.skillOffered}
                    </span>

                    {conv.unreadCount > 0 && (
                      <span className="h-4.5 min-w-[18px] px-1 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-gray-400 space-y-3">
            <MessageSquare className="h-8 w-8 text-gray-300 mx-auto" />
            <p className="font-semibold text-gray-600">No active barter chats yet</p>
            <p className="text-[11px] text-gray-400">
              Propose an AI skill swap to be paired with a mentor or peer!
            </p>
            <Link to="/exchanges">
              <Button variant="outline" size="sm" className="text-xs">
                <BrainCircuit className="h-3.5 w-3.5 mr-1" /> Propose AI Swap
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
