import { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useChat } from '../../hooks/useChat';
import { ConversationList } from '../../components/chat/ConversationList';
import { ChatWindow } from '../../components/chat/ChatWindow';

export function MessagesPage() {
  const {
    conversations,
    activeConversation,
    activeConversationId,
    selectConversation,
    sendMessage,
    sendTyping,
    deleteMessage,
    deleteConversation,
    isTyping,
    isSignalRConnected,
  } = useChat();

  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const handleSelect = (id: string) => {
    selectConversation(id);
    setMobileView('chat');
  };

  return (
    <DashboardLayout>
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden h-[calc(100vh-140px)] flex flex-col md:flex-row">
        {/* Left Conversation List */}
        <div className={`h-full ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-shrink-0`}>
          <ConversationList
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={handleSelect}
            onDeleteConversation={deleteConversation}
            isLive={isSignalRConnected}
          />
        </div>

        {/* Right Active Chat Window */}
        <div className={`h-full flex-1 ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
          <ChatWindow
            conversation={activeConversation}
            onSendMessage={sendMessage}
            onTyping={sendTyping}
            onDeleteMessage={deleteMessage}
            onDeleteConversation={deleteConversation}
            isTyping={isTyping}
            onBackMobile={() => setMobileView('list')}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
