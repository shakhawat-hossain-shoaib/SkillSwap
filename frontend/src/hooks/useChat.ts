import { useState, useEffect, useCallback, useRef } from 'react';
import type { Conversation, ChatMessage } from '../data/messages';
import { chatService, type DatabaseChatUser, type DatabaseMessage } from '../services/chatService';
import { signalRService } from '../services/signalrService';

const STORAGE_KEY = 'skillswap_real_conversations';

export function useChat(initialConversationId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: Conversation[] = JSON.parse(saved);
        // Filter out any stale mock data
        return parsed.filter(
          (c) =>
            !c.id.startsWith('conv-1') &&
            !c.id.startsWith('conv-2') &&
            !c.id.startsWith('conv-3') &&
            !c.id.startsWith('conv-4') &&
            c.partnerName !== 'Alex Johnson' &&
            c.partnerName !== 'Maria Garcia' &&
            c.partnerName !== 'James Lee' &&
            c.partnerName !== 'Fatima Noor'
        );
      } catch (e) {
        console.error('Failed to parse conversations from storage', e);
      }
    }
    return [];
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    return initialConversationId || '';
  });

  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isSignalRConnected, setIsSignalRConnected] = useState<boolean>(signalRService.isConnected());
  const [, setDbUsers] = useState<DatabaseChatUser[]>([]);

  // Stable refs for event listeners
  const activeConversationIdRef = useRef(activeConversationId);
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const conversationsRef = useRef(conversations);
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Sync real conversations to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  // 1. Initial Data Fetch & SignalR Setup on Mount
  useEffect(() => {
    let isMounted = true;

    async function initSignalRAndDb() {
      try {
        // Fetch registered users from database
        const realUsers = await chatService.getDatabaseUsers();
        if (isMounted && realUsers.length > 0) {
          setDbUsers(realUsers);

          setConversations((prev) => {
            const updated = [...prev];

            for (const dbUser of realUsers) {
              const partnerIdStr = dbUser.userId.toString();
              const existingIdx = updated.findIndex((c) => c.partnerId === partnerIdStr);

              const existingConv = existingIdx >= 0 ? updated[existingIdx] : null;
              const hasExistingMessages = existingConv && existingConv.messages.length > 0;
              const lastExistingMsg = hasExistingMessages
                ? existingConv.messages[existingConv.messages.length - 1]
                : null;

              const convObj: Conversation = {
                id: `conv-db-${dbUser.userId}`,
                partnerId: partnerIdStr,
                partnerName: dbUser.fullName,
                partnerAvatar: dbUser.avatar || dbUser.fullName.slice(0, 2).toUpperCase(),
                partnerRole: dbUser.bioDetails || 'Registered Peer Swapper',
                isOnline: dbUser.isOnline,
                lastMessage: lastExistingMsg ? lastExistingMsg.text : (dbUser.lastMessage || 'Ready to swap skills!'),
                lastMessageTime: lastExistingMsg
                  ? lastExistingMsg.timestamp
                  : dbUser.lastMessageTime
                  ? new Date(dbUser.lastMessageTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Active now',
                unreadCount: existingConv ? existingConv.unreadCount : dbUser.unreadCount || 0,
                skillOffered: dbUser.skillsCanTeach?.[0] || 'Peer Skills',
                skillWanted: dbUser.skillsWantsToLearn?.[0] || 'Learning Goals',
                messages: existingConv ? existingConv.messages : [],
              };

              if (existingIdx >= 0 && existingConv) {
                updated[existingIdx] = {
                  ...convObj,
                  messages: existingConv.messages,
                };
              } else {
                updated.push(convObj);
              }
            }

            return updated;
          });

          // If no active conversation set, activate first real user
          if (!activeConversationIdRef.current && realUsers.length > 0) {
            const firstId = `conv-db-${realUsers[0].userId}`;
            setActiveConversationId(firstId);
          }
        }

        // Connect SignalR
        await signalRService.connect();
      } catch (err) {
        console.warn('Real chat initialization error:', err);
      }
    }

    initSignalRAndDb();

    // Listen to connection state changes
    const unsubscribeConn = signalRService.onConnectionChange((connected) => {
      if (isMounted) setIsSignalRConnected(connected);
    });

    // 2. Real-Time SignalR Listeners
    const unsubscribeReceive = signalRService.onReceiveMessage((msg: DatabaseMessage) => {
      const incomingMsg: ChatMessage = {
        id: String(msg.messageId || 'msg-' + Date.now()),
        senderId: String(msg.senderId),
        senderName: msg.senderName,
        senderAvatar: msg.senderAvatar,
        text: msg.messageBody,
        timestamp: new Date(msg.sentTimestamp || Date.now()).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isMe: false,
      };

      const currentActiveId = activeConversationIdRef.current;
      const currentActiveConv = conversationsRef.current.find((c) => c.id === currentActiveId);
      const isViewingThisConversation =
        currentActiveConv &&
        (currentActiveConv.partnerId === String(msg.senderId) ||
          parseInt(currentActiveConv.partnerId.replace(/\D/g, ''), 10) === msg.senderId);

      if (isViewingThisConversation) {
        chatService.markAsRead(msg.senderId);
      }

      setConversations((prev) => {
        let convMatched = false;
        const updated = prev.map((conv) => {
          const numPartner = parseInt(conv.partnerId.replace(/\D/g, ''), 10);
          const numSender =
            typeof msg.senderId === 'number'
              ? msg.senderId
              : parseInt(String(msg.senderId).replace(/\D/g, ''), 10);

          if (
            conv.partnerId === String(msg.senderId) ||
            (!isNaN(numPartner) && !isNaN(numSender) && numPartner === numSender) ||
            conv.partnerName.toLowerCase() === (msg.senderName || '').toLowerCase()
          ) {
            convMatched = true;
            const alreadyExists = conv.messages.some((m) => m.id === incomingMsg.id);
            return {
              ...conv,
              lastMessage: incomingMsg.text,
              lastMessageTime: incomingMsg.timestamp,
              unreadCount: isViewingThisConversation ? 0 : conv.unreadCount + 1,
              messages: alreadyExists ? conv.messages : [...conv.messages, incomingMsg],
            };
          }
          return conv;
        });

        if (!convMatched) {
          const newConv: Conversation = {
            id: `conv-db-${msg.senderId}`,
            partnerId: String(msg.senderId),
            partnerName: msg.senderName || 'Peer Swapper',
            partnerAvatar: msg.senderAvatar || 'PS',
            partnerRole: 'Registered Peer Swapper',
            isOnline: true,
            lastMessage: incomingMsg.text,
            lastMessageTime: incomingMsg.timestamp,
            unreadCount: isViewingThisConversation ? 0 : 1,
            skillOffered: 'Peer Skills',
            skillWanted: 'Mentorship',
            messages: [incomingMsg],
          };
          return [newConv, ...updated];
        }

        return updated;
      });
    });

    const unsubscribeSent = signalRService.onMessageSent((msg: DatabaseMessage) => {
      const sentMsg: ChatMessage = {
        id: String(msg.messageId || 'msg-' + Date.now()),
        senderId: 'u-me',
        senderName: 'You',
        senderAvatar: 'ME',
        text: msg.messageBody,
        timestamp: new Date(msg.sentTimestamp || Date.now()).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isMe: true,
      };

      setConversations((prev) => {
        const partnerIdStr = String(msg.receiverId);
        const numReceiver =
          typeof msg.receiverId === 'number'
            ? msg.receiverId
            : parseInt(String(msg.receiverId).replace(/\D/g, ''), 10);

        return prev.map((conv) => {
          const numPartner = parseInt(conv.partnerId.replace(/\D/g, ''), 10);
          if (
            conv.partnerId === partnerIdStr ||
            (!isNaN(numPartner) && !isNaN(numReceiver) && numPartner === numReceiver)
          ) {
            const alreadyExistsWithRealId = conv.messages.some((m) => m.id === sentMsg.id);
            if (alreadyExistsWithRealId) return conv;

            // Replace optimistic message if present
            const tempIdx = conv.messages.findIndex(
              (m) => m.isMe && m.id.startsWith('m-') && m.text === sentMsg.text
            );

            let newMessages: ChatMessage[];
            if (tempIdx >= 0) {
              newMessages = [...conv.messages];
              newMessages[tempIdx] = sentMsg;
            } else {
              newMessages = [...conv.messages, sentMsg];
            }

            return {
              ...conv,
              lastMessage: sentMsg.text,
              lastMessageTime: sentMsg.timestamp,
              messages: newMessages,
            };
          }
          return conv;
        });
      });
    });

    const unsubscribeDeleted = signalRService.onMessageDeleted((deletedMsgId) => {
      const deletedIdStr = String(deletedMsgId);
      setConversations((prev) =>
        prev.map((conv) => {
          const remaining = conv.messages.filter((m) => m.id !== deletedIdStr);
          if (remaining.length !== conv.messages.length) {
            const last = remaining[remaining.length - 1];
            return {
              ...conv,
              messages: remaining,
              lastMessage: last ? last.text : 'Ready to swap skills!',
              lastMessageTime: last ? last.timestamp : conv.lastMessageTime,
            };
          }
          return conv;
        })
      );
    });

    const unsubscribeConvDeleted = signalRService.onConversationDeleted((partnerId) => {
      const partnerIdStr = String(partnerId);
      setConversations((prev) => prev.filter((conv) => conv.partnerId !== partnerIdStr));
      setActiveConversationId((prevActive) => {
        const activeConv = conversationsRef.current.find((c) => c.id === prevActive);
        if (activeConv && activeConv.partnerId === partnerIdStr) {
          const remaining = conversationsRef.current.filter((c) => c.partnerId !== partnerIdStr);
          return remaining.length > 0 ? remaining[0].id : '';
        }
        return prevActive;
      });
    });

    const unsubscribeTyping = signalRService.onUserTyping((senderId) => {
      const currentActiveId = activeConversationIdRef.current;
      const currentConv = conversationsRef.current.find((c) => c.id === currentActiveId);
      if (
        currentConv &&
        (currentConv.partnerId === String(senderId) ||
          parseInt(currentConv.partnerId.replace(/\D/g, ''), 10) === senderId)
      ) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2500);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeConn();
      unsubscribeReceive();
      unsubscribeSent();
      unsubscribeDeleted();
      unsubscribeConvDeleted();
      unsubscribeTyping();
    };
  }, []);

  // 3. Load message history when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;

    const currentConv = conversations.find((c) => c.id === activeConversationId);
    if (!currentConv) return;

    const numPartnerId = parseInt(currentConv.partnerId.replace(/\D/g, ''), 10);
    if (isNaN(numPartnerId) || numPartnerId <= 0) return;

    let isSubscribed = true;

    chatService.getMessageHistory(numPartnerId).then((history: DatabaseMessage[]) => {
      if (!isSubscribed || !history) return;

      const formatted: ChatMessage[] = history.map((m: DatabaseMessage) => ({
        id: String(m.messageId),
        senderId: String(m.senderId),
        senderName: m.senderName,
        senderAvatar: m.senderAvatar,
        text: m.messageBody,
        timestamp: new Date(m.sentTimestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isMe: m.isMe,
      }));

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversationId) {
            return {
              ...c,
              messages: formatted,
              lastMessage: formatted.length > 0 ? formatted[formatted.length - 1].text : c.lastMessage,
              lastMessageTime:
                formatted.length > 0
                  ? formatted[formatted.length - 1].timestamp
                  : c.lastMessageTime,
            };
          }
          return c;
        })
      );
    });

    return () => {
      isSubscribed = false;
    };
  }, [activeConversationId]);

  // 4. Live Fallback Smart Polling (runs only when SignalR is offline or disconnected)
  useEffect(() => {
    if (!activeConversationId) return;

    const interval = setInterval(async () => {
      // If SignalR is connected, real-time push events handle everything
      if (signalRService.isConnected()) return;

      const currentConv = conversationsRef.current.find((c) => c.id === activeConversationId);
      if (!currentConv) return;
      const numPartnerId = parseInt(currentConv.partnerId.replace(/\D/g, ''), 10);
      if (isNaN(numPartnerId) || numPartnerId <= 0) return;

      const history = await chatService.getMessageHistory(numPartnerId);
      if (!history || history.length === 0) return;

      const formatted: ChatMessage[] = history.map((m: DatabaseMessage) => ({
        id: String(m.messageId),
        senderId: String(m.senderId),
        senderName: m.senderName,
        senderAvatar: m.senderAvatar,
        text: m.messageBody,
        timestamp: new Date(m.sentTimestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isMe: m.isMe,
      }));

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversationId) {
            const hasNewMessages =
              c.messages.length !== formatted.length ||
              (formatted.length > 0 &&
                c.messages[c.messages.length - 1]?.id !== formatted[formatted.length - 1]?.id);

            if (hasNewMessages) {
              return {
                ...c,
                messages: formatted,
                lastMessage: formatted[formatted.length - 1].text,
                lastMessageTime: formatted[formatted.length - 1].timestamp,
              };
            }
          }
          return c;
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [activeConversationId]);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0] || null;

  const selectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setConversations((prev) => {
      const target = prev.find((conv) => conv.id === id);
      if (!target || target.unreadCount === 0) return prev;
      const numId = parseInt(target.partnerId.replace(/\D/g, ''), 10);
      if (!isNaN(numId)) {
        chatService.markAsRead(numId);
      }
      return prev.map((conv) => (conv.id === id ? { ...conv, unreadCount: 0 } : conv));
    });
  }, []);

  const startOrOpenConversation = useCallback(
    (
      partnerId: string,
      partnerName: string,
      partnerAvatar: string,
      partnerRole: string,
      skillOffered: string,
      skillWanted: string
    ) => {
      const existing = conversations.find((c) => c.partnerId === partnerId);
      if (existing) {
        setActiveConversationId(existing.id);
        return existing.id;
      }

      const newId = `conv-db-${partnerId}`;
      const newConv: Conversation = {
        id: newId,
        partnerId,
        partnerName,
        partnerAvatar,
        partnerRole,
        isOnline: true,
        lastMessage: 'Let us connect and swap skills!',
        lastMessageTime: 'Just now',
        unreadCount: 0,
        skillOffered,
        skillWanted,
        messages: [],
      };

      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newId);
      return newId;
    },
    [conversations]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !activeConversationId) return;

      const currentConv = conversations.find((c) => c.id === activeConversationId);
      const partnerId = currentConv?.partnerId || '1';
      const tempId = 'm-' + Date.now();

      const newMessage: ChatMessage = {
        id: tempId,
        senderId: 'u-me',
        senderName: 'You',
        senderAvatar: 'ME',
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
      };

      // Optimistically update UI immediately
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === activeConversationId) {
            return {
              ...conv,
              lastMessage: newMessage.text,
              lastMessageTime: newMessage.timestamp,
              messages: [...conv.messages, newMessage],
            };
          }
          return conv;
        })
      );

      // Send to backend database API
      const numPartnerId = parseInt(partnerId.replace(/\D/g, ''), 10);
      if (!isNaN(numPartnerId) && numPartnerId > 0) {
        let sentViaSignalR = false;
        if (signalRService.isConnected()) {
          sentViaSignalR = await signalRService.sendMessage(numPartnerId, text.trim());
        }

        if (!sentViaSignalR) {
          const res = await chatService.sendMessage(numPartnerId, text.trim());
          if (res) {
            setConversations((prev) =>
              prev.map((c) => {
                if (c.id === activeConversationId) {
                  return {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === tempId ? { ...m, id: String(res.messageId) } : m
                    ),
                  };
                }
                return c;
              })
            );
          }
        }
      }
    },
    [activeConversationId, conversations]
  );

  const sendTyping = useCallback(() => {
    if (!activeConversationId) return;
    const currentConv = conversations.find((c) => c.id === activeConversationId);
    if (!currentConv) return;
    const numPartnerId = parseInt(currentConv.partnerId.replace(/\D/g, ''), 10);
    if (!isNaN(numPartnerId) && numPartnerId > 0) {
      signalRService.sendTyping(numPartnerId);
    }
  }, [activeConversationId, conversations]);

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!messageId || !activeConversationId) return;

      // Optimistically remove from state
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === activeConversationId) {
            const remaining = conv.messages.filter((m) => m.id !== messageId);
            const last = remaining[remaining.length - 1];
            return {
              ...conv,
              messages: remaining,
              lastMessage: last ? last.text : 'Ready to swap skills!',
              lastMessageTime: last ? last.timestamp : conv.lastMessageTime,
            };
          }
          return conv;
        })
      );

      // Call backend API / SignalR to delete
      const numMsgId = parseInt(messageId.replace(/\D/g, ''), 10);
      if (!isNaN(numMsgId) && numMsgId > 0) {
        const signalRDeleted = await signalRService.deleteMessage(numMsgId);
        if (!signalRDeleted) {
          await chatService.deleteMessage(numMsgId);
        }
      }
    },
    [activeConversationId]
  );

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      if (!conversationId) return;

      const targetConv = conversations.find((c) => c.id === conversationId);
      const partnerIdStr = targetConv?.partnerId || '';

      // Optimistically remove conversation from state
      setConversations((prev) => {
        const remaining = prev.filter((conv) => conv.id !== conversationId);
        return remaining;
      });

      // Switch active conversation if the deleted one was active
      if (activeConversationId === conversationId) {
        const remaining = conversations.filter((c) => c.id !== conversationId);
        setActiveConversationId(remaining.length > 0 ? remaining[0].id : '');
      }

      // Delete in backend database
      if (partnerIdStr) {
        const numPartnerId = parseInt(partnerIdStr.replace(/\D/g, ''), 10);
        if (!isNaN(numPartnerId) && numPartnerId > 0) {
          await chatService.deleteConversation(numPartnerId);
        }
      }
    },
    [activeConversationId, conversations]
  );

  return {
    conversations,
    activeConversation,
    activeConversationId,
    selectConversation,
    startOrOpenConversation,
    sendMessage,
    sendTyping,
    deleteMessage,
    deleteConversation,
    isTyping,
    isSignalRConnected,
  };
}
