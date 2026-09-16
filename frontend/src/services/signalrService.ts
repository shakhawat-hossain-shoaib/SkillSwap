import * as signalR from '@microsoft/signalr';

type MessageCallback = (message: any) => void;
type MessageDeleteCallback = (messageId: number) => void;
type ConversationDeleteCallback = (partnerId: number) => void;
type TypingCallback = (senderId: number) => void;

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private messageListeners: MessageCallback[] = [];
  private messageDeleteListeners: MessageDeleteCallback[] = [];
  private conversationDeleteListeners: ConversationDeleteCallback[] = [];
  private sentListeners: MessageCallback[] = [];
  private typingListeners: TypingCallback[] = [];
  private connectionChangeListeners: ((connected: boolean) => void)[] = [];
  private isConnecting = false;

  public async connect(): Promise<boolean> {
    const token = localStorage.getItem('token');
    if (!token) return false;

    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return true;
    }

    if (this.isConnecting) return false;

    this.isConnecting = true;

    // Use API base URL (stripping /api if present) or default ASP.NET backend ports
    const rawUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5080';
    const baseUrl = rawUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
    const hubUrl = `${baseUrl}/hubs/chat`;

    try {
      if (this.connection) {
        try {
          await this.connection.stop();
        } catch {
          // ignore previous stopped connection
        }
      }

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => localStorage.getItem('token') || '',
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect([0, 1000, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      this.connection.on('ReceiveMessage', (msg) => {
        this.messageListeners.forEach((cb) => cb(msg));
      });

      this.connection.on('MessageDeleted', (messageId) => {
        this.messageDeleteListeners.forEach((cb) => cb(messageId));
      });

      this.connection.on('ConversationDeleted', (partnerId) => {
        this.conversationDeleteListeners.forEach((cb) => cb(partnerId));
      });

      this.connection.on('MessageSent', (msg) => {
        this.sentListeners.forEach((cb) => cb(msg));
      });

      this.connection.on('UserTyping', (senderId) => {
        this.typingListeners.forEach((cb) => cb(senderId));
      });

      this.connection.onreconnected(() => {
        console.log('SignalR Live Chat reconnected.');
        this.connectionChangeListeners.forEach((cb) => cb(true));
      });

      this.connection.onreconnecting(() => {
        console.warn('SignalR Live Chat reconnecting...');
        this.connectionChangeListeners.forEach((cb) => cb(false));
      });

      this.connection.onclose(() => {
        this.connectionChangeListeners.forEach((cb) => cb(false));
      });

      await this.connection.start();
      console.log('SignalR Live Chat connected successfully.');
      this.isConnecting = false;
      this.connectionChangeListeners.forEach((cb) => cb(true));
      return true;
    } catch (err) {
      console.warn('SignalR connection failed (backend might be offline, using REST/local fallback):', err);
      this.isConnecting = false;
      this.connectionChangeListeners.forEach((cb) => cb(false));
      return false;
    }
  }

  public async disconnect() {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (err) {
        console.error('Error disconnecting SignalR', err);
      }
      this.connection = null;
    }
  }

  public onMessageDeleted(callback: MessageDeleteCallback) {
    this.messageDeleteListeners.push(callback);
    return () => {
      this.messageDeleteListeners = this.messageDeleteListeners.filter((cb) => cb !== callback);
    };
  }

  public onConversationDeleted(callback: ConversationDeleteCallback) {
    this.conversationDeleteListeners.push(callback);
    return () => {
      this.conversationDeleteListeners = this.conversationDeleteListeners.filter((cb) => cb !== callback);
    };
  }

  public onReceiveMessage(callback: MessageCallback) {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter((cb) => cb !== callback);
    };
  }

  public onMessageSent(callback: MessageCallback) {
    this.sentListeners.push(callback);
    return () => {
      this.sentListeners = this.sentListeners.filter((cb) => cb !== callback);
    };
  }

  public onUserTyping(callback: TypingCallback) {
    this.typingListeners.push(callback);
    return () => {
      this.typingListeners = this.typingListeners.filter((cb) => cb !== callback);
    };
  }

  public onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionChangeListeners.push(callback);
    // Immediately notify with current state
    callback(this.isConnected());
    return () => {
      this.connectionChangeListeners = this.connectionChangeListeners.filter((cb) => cb !== callback);
    };
  }

  public async sendMessage(receiverId: number, messageText: string): Promise<boolean> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('SendMessage', receiverId, messageText);
        return true;
      } catch (err) {
        console.error('Error sending message via SignalR', err);
      }
    }
    return false;
  }

  public async deleteMessage(messageId: number): Promise<boolean> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('DeleteMessage', messageId);
        return true;
      } catch (err) {
        console.error('Error deleting message via SignalR', err);
      }
    }
    return false;
  }

  public async sendTyping(receiverId: number): Promise<boolean> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('SendTyping', receiverId);
        return true;
      } catch (err) {
        // Ignore typing error
      }
    }
    return false;
  }

  public isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export const signalRService = new SignalRService();
