import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import api from '../../lib/axios';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  ArrowLeft,
  Repeat,
  Calendar,
  Star,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Video,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface RealExchangeView {
  id: string;
  partnerName: string;
  partnerAvatar: string;
  partnerRating: number;
  partnerId: string;
  skillOffered: string;
  skillWanted: string;
  status: string;
}

export function ExchangeChat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exchangeView, setExchangeView] = useState<RealExchangeView | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    conversations,
    activeConversation,
    selectConversation,
    startOrOpenConversation,
    sendMessage,
    sendTyping,
    isTyping,
  } = useChat();

  useEffect(() => {
    let isMounted = true;

    async function loadExchange() {
      setIsLoading(true);
      try {
        const allUsers = await chatService.getDatabaseUsers();

        // 1. Check if ID matches an exchange request from API
        const [sentRes, recvRes] = await Promise.all([
          api.get('/exchange-requests/sent').catch(() => ({ data: { data: [] } })),
          api.get('/exchange-requests/received').catch(() => ({ data: { data: [] } })),
        ]);

        const sent = sentRes.data?.data || sentRes.data || [];
        const recv = recvRes.data?.data || recvRes.data || [];
        const allReqs = [...sent, ...recv];

        // 1. Try matching by requestId OR matching by participant IDs
        const matchedReq = allReqs.find((r) => 
          String(r.requestId || r.id || r.exchangeRequestId) === String(id) ||
          (String(r.senderId) === String(id) && String(r.receiverId) === String(user?.id)) ||
          (String(r.receiverId) === String(id) && String(r.senderId) === String(user?.id))
        );

        if (matchedReq) {
          const isSender = String(matchedReq.senderId) === String(user?.id);
          const otherUserId = isSender ? matchedReq.receiverId : matchedReq.senderId;
          const partner = allUsers.find((u) => String(u.userId) === String(otherUserId));
          const trueRequestId = String(matchedReq.requestId || matchedReq.id || matchedReq.exchangeRequestId || id);

          // Parse skills from learningGoals (e.g. "Graphics ⇄ React: ...")
          let senderSkill = 'Skills Offered';
          let receiverSkill = 'Skills Wanted';
          if (matchedReq.learningGoals?.includes(' ⇄ ')) {
            const parts = matchedReq.learningGoals.split(' ⇄ ');
            senderSkill = parts[0].replace(/^\[.*?\]\s*/, '').trim();
            if (parts[1]) {
              receiverSkill = parts[1].split(':')[0].trim();
            }
          }
          const partnerOffers = isSender ? receiverSkill : senderSkill;
          const partnerWants = isSender ? senderSkill : receiverSkill;

          const viewObj: RealExchangeView = {
            id: trueRequestId,
            partnerName: partner?.fullName || (isSender ? matchedReq.receiverName : matchedReq.senderName) || `User #${otherUserId}`,
            partnerAvatar: partner?.avatar || (partner?.fullName || (isSender ? matchedReq.receiverName : matchedReq.senderName) || 'U').slice(0, 2).toUpperCase(),
            partnerRating: partner?.trustRating || 5.0,
            partnerId: String(otherUserId),
            skillOffered: partner?.skillsCanTeach?.[0] || partnerOffers,
            skillWanted: partner?.skillsWantsToLearn?.[0] || partnerWants,
            status: matchedReq.status || 'Active',
          };

          if (isMounted) setExchangeView(viewObj);
          return;
        }

        // 2. Otherwise check if ID is a database user ID (e.g. /exchanges/2/chat)
        const matchedUser = allUsers.find((u) => String(u.userId) === String(id));
        if (matchedUser) {
          const reqWithUser = allReqs.find((r) =>
            (String(r.senderId) === String(matchedUser.userId) && String(r.receiverId) === String(user?.id)) ||
            (String(r.receiverId) === String(matchedUser.userId) && String(r.senderId) === String(user?.id))
          );
          const trueRequestId = reqWithUser ? String(reqWithUser.requestId || reqWithUser.id) : String(matchedUser.userId);

          const viewObj: RealExchangeView = {
            id: trueRequestId,
            partnerName: matchedUser.fullName,
            partnerAvatar: matchedUser.avatar || matchedUser.fullName.slice(0, 2).toUpperCase(),
            partnerRating: matchedUser.trustRating || 5.0,
            partnerId: String(matchedUser.userId),
            skillOffered: matchedUser.skillsCanTeach?.[0] || 'Peer Knowledge',
            skillWanted: matchedUser.skillsWantsToLearn?.[0] || 'Shared Interest',
            status: reqWithUser?.status || 'Active',
          };
          if (isMounted) setExchangeView(viewObj);
          return;
        }

        // 3. Fallback to first available database user
        const firstOther = allUsers.find((u) => String(u.userId) !== String(user?.id)) || allUsers[0];
        if (firstOther) {
          const reqWithUser = allReqs.find((r) =>
            (String(r.senderId) === String(firstOther.userId) && String(r.receiverId) === String(user?.id)) ||
            (String(r.receiverId) === String(firstOther.userId) && String(r.senderId) === String(user?.id))
          );
          const trueRequestId = reqWithUser ? String(reqWithUser.requestId || reqWithUser.id) : String(firstOther.userId);

          const viewObj: RealExchangeView = {
            id: trueRequestId,
            partnerName: firstOther.fullName,
            partnerAvatar: firstOther.avatar || firstOther.fullName.slice(0, 2).toUpperCase(),
            partnerRating: firstOther.trustRating || 5.0,
            partnerId: String(firstOther.userId),
            skillOffered: firstOther.skillsCanTeach?.[0] || 'Peer Knowledge',
            skillWanted: firstOther.skillsWantsToLearn?.[0] || 'Shared Interest',
            status: reqWithUser?.status || 'Active',
          };
          if (isMounted) setExchangeView(viewObj);
        }
      } catch (e) {
        console.warn('Could not resolve exchange details', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadExchange();

    return () => {
      isMounted = false;
    };
  }, [id, user]);

  // Activate matching conversation (guarded to avoid re-trigger loops)
  const lastActivatedPartnerRef = useRef<string | null>(null);

  useEffect(() => {
    if (!exchangeView?.partnerId) return;
    if (lastActivatedPartnerRef.current === exchangeView.partnerId) return;

    const existing = conversations.find(
      (c) => String(c.partnerId) === String(exchangeView.partnerId)
    );
    if (existing) {
      lastActivatedPartnerRef.current = exchangeView.partnerId;
      selectConversation(existing.id);
    } else {
      lastActivatedPartnerRef.current = exchangeView.partnerId;
      startOrOpenConversation(
        exchangeView.partnerId,
        exchangeView.partnerName,
        exchangeView.partnerAvatar,
        'Peer Swapper',
        exchangeView.skillOffered,
        exchangeView.skillWanted
      );
    }
  }, [exchangeView?.partnerId, conversations, selectConversation, startOrOpenConversation]);

  const handleSchedule = () => {
    sendMessage(`📅 Let's schedule our live swap session for this Saturday at 3:00 PM!`);
    toast.success('Session proposal sent to chat! 📅');
  };

  const handleGenerateRoom = () => {
    sendMessage(`📹 Generated Video Swap Room: https://skillswap.app/room/swap-${exchangeView?.id || 'session'}`);
    toast.success('Video meeting room link attached to chat! 📹');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="py-24 text-center text-xs text-gray-400">Loading barter session...</div>
      </DashboardLayout>
    );
  }

  if (!exchangeView) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 p-8">
          <Repeat className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 text-base mb-1">Exchange not found</h3>
          <p className="text-xs text-gray-500 mb-4">The requested barter session does not exist.</p>
          <Button onClick={() => navigate('/exchanges')} size="sm">
            Back to Exchange Requests
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Back Link */}
      <button
        onClick={() => navigate('/exchanges')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Exchange Requests
      </button>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-170px)]">
        {/* Left Col: Exchange Context & Agreement Panel */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-base shadow-xs select-none">
                {exchangeView.partnerAvatar}
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-1.5">
                  {exchangeView.partnerName} <ShieldCheck className="h-4 w-4 text-accent-500" />
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center text-amber-500 font-semibold">
                    <Star className="h-3 w-3 fill-amber-400 mr-0.5" /> {Number(exchangeView.partnerRating).toFixed(1)}
                  </span>
                  <span>• Verified Database Member</span>
                </div>
              </div>
            </div>

            {/* Agreement Box */}
            <div className="p-4 rounded-2xl bg-primary-50/60 border border-primary-100 mb-6 text-xs space-y-3">
              <div className="font-bold text-primary-900 flex items-center gap-1.5">
                <Repeat className="h-4 w-4 text-accent-600" /> Barter Agreement
              </div>

              <div>
                <span className="text-gray-500 text-[11px] block">They will teach:</span>
                <span className="font-bold text-accent-800 text-sm">{exchangeView.skillOffered}</span>
              </div>

              <div className="border-t border-primary-200/50 pt-2">
                <span className="text-gray-500 text-[11px] block">You will teach:</span>
                <span className="font-bold text-primary-800 text-sm">{exchangeView.skillWanted}</span>
              </div>

              <div className="border-t border-primary-200/50 pt-2 flex justify-between items-center text-[11px]">
                <span className="text-gray-500">Status:</span>
                <Badge variant={exchangeView.status.toLowerCase() === 'active' ? 'accent' : 'warning'}>
                  {exchangeView.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Swap Checklist */}
            <div className="space-y-2 mb-6">
              <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
                Swap Milestones
              </h4>
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Proposal Matched in Database</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-primary-700 bg-primary-50 p-2 rounded-xl border border-primary-200">
                <Clock className="h-4 w-4 text-primary-600 flex-shrink-0" />
                <span>Session 1: Initial Goals & Setup</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-xl border border-gray-100">
                <span className="h-4 w-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Session 2: Hands-on Practice & Review</span>
              </div>
            </div>
            {/* Barter Completion & Reviews Info */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-primary-50/50 border border-indigo-200/80 mb-6 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-500" /> Barter & Peer Review
                </span>
                {exchangeView?.status === 'completed' ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Completed
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                    In Progress
                  </span>
                )}
              </div>
              <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                Rating & reviews unlock once your barter conversation and session are completed. Complete this barter from your Exchanges hub.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/exchanges')}
                className="w-full text-xs font-bold bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 shadow-2xs flex items-center justify-center gap-1.5"
              >
                <span>Go to Exchanges Hub</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Action CTA */}
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <Button
              variant="cta"
              size="sm"
              className="w-full text-xs font-semibold"
              onClick={handleSchedule}
            >
              <Calendar className="mr-1.5 h-4 w-4" /> Propose Live Session
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={handleGenerateRoom}
            >
              <Video className="mr-1.5 h-4 w-4" /> Generate Video Room
            </Button>
          </div>
        </div>

        {/* Right 2 Cols: Real Chat Window */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden h-full flex flex-col">
          <ChatWindow
            conversation={activeConversation}
            onSendMessage={sendMessage}
            onTyping={sendTyping}
            isTyping={isTyping}
          />
        </div>
      </div>

    </DashboardLayout>
  );
}
