import api from '../lib/axios';

export interface DatabaseChatUser {
  userId: number;
  fullName: string;
  emailAddress: string;
  avatar: string;
  bioDetails?: string;
  trustRating: number;
  totalReviewsReceived?: number;
  skillsCanTeach: string[];
  skillsWantsToLearn: string[];
  lastMessage: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline: boolean;
}

export interface DatabaseMessage {
  messageId: number;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  receiverId: number;
  receiverName: string;
  receiverAvatar: string;
  messageBody: string;
  sentTimestamp: string;
  isRead: boolean;
  isMe: boolean;
}

export const chatService = {
  async getDatabaseUsers(): Promise<DatabaseChatUser[]> {
    try {
      const response = await api.get('/messages/users');
      return response.data.data || response.data || [];
    } catch (err) {
      console.warn('Could not fetch real users from backend, fallback to local database pool:', err);
      return [];
    }
  },

  async getAdminUsers(): Promise<DatabaseChatUser[]> {
    try {
      const response = await api.get('/admin/users');
      return response.data.data || response.data || [];
    } catch (err) {
      console.warn('Could not fetch all users for admin from API:', err);
      return [];
    }
  },

  async getAdminConnections(): Promise<any[]> {
    try {
      const response = await api.get('/admin/connections');
      return response.data.data || response.data || [];
    } catch (err) {
      console.warn('Could not fetch all connections for admin from API:', err);
      return [];
    }
  },

  async getMessageHistory(partnerId: number | string): Promise<DatabaseMessage[]> {
    try {
      const response = await api.get(`/messages/${partnerId}`);
      return response.data.data || response.data || [];
    } catch (err) {
      console.warn(`Could not fetch message history for partner ${partnerId} from API:`, err);
      return [];
    }
  },

  async sendMessage(receiverId: number | string, messageBody: string): Promise<DatabaseMessage | null> {
    try {
      const numId = typeof receiverId === 'string' ? parseInt(receiverId.replace(/\D/g, ''), 10) || 1 : receiverId;
      const response = await api.post('/messages', {
        receiverId: numId,
        messageBody: messageBody.trim(),
      });
      return response.data.data || response.data || null;
    } catch (err) {
      console.warn('Could not post message to API backend:', err);
      return null;
    }
  },

  async markAsRead(partnerId: number | string): Promise<void> {
    try {
      const numId = typeof partnerId === 'string' ? parseInt(partnerId.replace(/\D/g, ''), 10) || 1 : partnerId;
      await api.put(`/messages/${numId}/read`);
    } catch {
      // Ignored
    }
  },

  async deleteMessage(messageId: number | string): Promise<boolean> {
    try {
      const numId = typeof messageId === 'string' ? parseInt(messageId.replace(/\D/g, ''), 10) : messageId;
      if (!numId || isNaN(numId)) return false;
      const response = await api.delete(`/messages/${numId}`);
      return response.data?.success ?? true;
    } catch (err) {
      console.warn('Could not delete message via API:', err);
      return false;
    }
  },

  async deleteConversation(partnerId: number | string): Promise<boolean> {
    try {
      const numId = typeof partnerId === 'string' ? parseInt(partnerId.replace(/\D/g, ''), 10) : partnerId;
      if (!numId || isNaN(numId)) return false;
      const response = await api.delete(`/messages/conversations/${numId}`);
      return response.data?.success ?? true;
    } catch (err) {
      console.warn('Could not delete conversation via API:', err);
      return false;
    }
  },
};
