export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface Conversation {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  partnerRole: string;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  skillOffered: string;
  skillWanted: string;
  messages: ChatMessage[];
}

// Clean initial state: real conversations are populated from registered database users
export const initialConversations: Conversation[] = [];

export const simulatedReplies: Record<string, string[]> = {};
