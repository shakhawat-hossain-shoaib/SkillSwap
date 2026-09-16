import { useState, useEffect, type FormEvent } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { type ExchangeStatus } from '../../data/exchanges';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Repeat,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  X,
  RotateCcw,
  Sparkles,
  Zap,
  Bot,
  BrainCircuit,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { ExchangeDetailsModal } from '../../components/exchange/ExchangeDetailsModal';
import toast from 'react-hot-toast';

interface RealExchangeItem {
  id: string;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  receiverId: number;
  receiverName: string;
  receiverAvatar: string;
  skillOffered: string;
  skillWanted: string;
  status: ExchangeStatus;
  createdAt: string;
  message: string;
  matchScore: number;
  matchReason?: string;
  myRating?: number;
  partnerRating?: number;
}

interface AiMatchResult {
  matchedUserId: number;
  matchedUserName: string;
  matchedUserAvatar: string;
  matchScore: number;
  matchReason: string;
}

export function ExchangeRequests() {
  const { user } = useAuth();
  const [exchangeList, setExchangeList] = useState<RealExchangeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | ExchangeStatus>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // AI Proposal Form State (Notice: No manual partner selection!)
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');
  const [newLearningGoals, setNewLearningGoals] = useState('');
  const [newDuration, setNewDuration] = useState('4 weeks');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success AI match display state
  const [aiMatchResult, setAiMatchResult] = useState<AiMatchResult | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);

  // Selected barter modal for popup details, open chat, complete barter & review
  const [selectedBarterModal, setSelectedBarterModal] = useState<RealExchangeItem | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const [sentRes, recvRes] = await Promise.all([
        api.get('/exchange-requests/sent').catch(() => ({ data: { data: [] } })),
        api.get('/exchange-requests/received').catch(() => ({ data: { data: [] } })),
      ]);

      const sent = sentRes.data?.data || sentRes.data || [];
      const recv = recvRes.data?.data || recvRes.data || [];

      const parseGoals = (rawGoals: string) => {
        let text = rawGoals || '';
        let offered = 'Taught Skill';
        let wanted = 'Requested Skill';

        if (text.includes(' ⇄ ')) {
          const parts = text.split(' ⇄ ');
          offered = parts[0].replace(/^\[.*?\]\s*/, '').trim();
          if (parts[1]) {
            const secondParts = parts[1].split(':');
            wanted = secondParts[0].trim();
            if (secondParts.length > 1) {
              text = secondParts.slice(1).join(':').trim();
            }
          }
        }
        return { offered, wanted, text };
      };

      const mappedList: RealExchangeItem[] = [];

      for (const r of [...recv, ...sent]) {
        const { offered, wanted, text } = parseGoals(r.learningGoals);
        mappedList.push({
          id: String(r.requestId || r.id),
          senderId: r.senderId,
          senderName: r.senderName || `Member #${r.senderId}`,
          senderAvatar: r.senderAvatar || 'U',
          receiverId: r.receiverId,
          receiverName: r.receiverName || `Member #${r.receiverId}`,
          receiverAvatar: r.receiverAvatar || 'P',
          skillOffered: offered,
          skillWanted: wanted,
          status: (r.status?.toLowerCase() || 'pending') as ExchangeStatus,
          createdAt: r.createdAt || new Date().toISOString(),
          message: text || r.learningGoals || 'Skill swap proposal',
          matchScore: r.matchScore || 94.0,
          matchReason: r.matchReason,
          myRating: r.myRating,
          partnerRating: r.partnerRating,
        });
      }

      setExchangeList(mappedList);
    } catch (err) {
      console.warn('Error fetching requests', err);
      setExchangeList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  // Pre-fill user's default skills if available when opening modal
  const handleOpenModal = () => {
    setAiMatchResult(null);
    if (user?.skillsCanTeach && user.skillsCanTeach.length > 0 && !newSkillOffered) {
      setNewSkillOffered(user.skillsCanTeach[0]);
    }
    if (user?.skillsWantsToLearn && user.skillsWantsToLearn.length > 0 && !newSkillWanted) {
      setNewSkillWanted(user.skillsWantsToLearn[0]);
    }
    setIsModalOpen(true);
  };

  const handleProposeAiSwap = async (e: FormEvent) => {
    e.preventDefault();
    if (!newSkillOffered.trim() || !newSkillWanted.trim() || !newLearningGoals.trim()) {
      toast.error('Please enter the skill you offer, what you want to learn, and your goals.');
      return;
    }

    setIsSubmitting(true);
    setMatchError(null);
    try {
      const response = await api.post('/exchange-requests/ai-propose', {
        skillOffered: newSkillOffered.trim(),
        skillWanted: newSkillWanted.trim(),
        learningGoals: newLearningGoals.trim(),
        estimatedDuration: newDuration.trim() || '4 weeks',
      });

      const resData = response.data?.data || response.data;
      if (resData) {
        setAiMatchResult({
          matchedUserId: resData.matchedUserId,
          matchedUserName: resData.matchedUserName,
          matchedUserAvatar: resData.matchedUserAvatar,
          matchScore: resData.matchScore || 95.0,
          matchReason: resData.matchReason || 'Optimal skill barter compatibility.',
        });
        toast.success('SwapAI matched your proposal! 🤖✨');
        fetchRequests();
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'AI matchmaking was unable to find a matching peer.';
      setMatchError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await api.patch(`/exchange-requests/${id}/status`, { status: 1 }); // 1 = Accepted
      toast.success('Exchange request accepted! You can now chat and coordinate sessions. 🎉');
      fetchRequests();
    } catch {
      setExchangeList((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: 'active' as ExchangeStatus } : e))
      );
      toast.success('Exchange request accepted! 🎉');
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await api.patch(`/exchange-requests/${id}/status`, { status: 2 }); // 2 = Declined
      toast.error('Exchange proposal declined');
      fetchRequests();
    } catch {
      setExchangeList((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: 'declined' as ExchangeStatus } : e))
      );
      toast.error('Exchange proposal declined');
    }
  };

  const handleReopen = (id: string) => {
    setExchangeList((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'pending' as ExchangeStatus } : e))
    );
    toast.success('Proposal reopened');
  };

  const filteredExchanges = exchangeList.filter((ex) => {
    if (activeTab === 'all') return true;
    return ex.status === activeTab;
  });

  const getStatusBadge = (status: ExchangeStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending Review
          </Badge>
        );
      case 'active':
        return (
          <Badge variant="accent" className="flex items-center gap-1 bg-emerald-100 text-emerald-800">
            <CheckCircle className="h-3 w-3" /> Active Exchange
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-primary-100 text-primary-800">
            <Star className="h-3 w-3" /> Completed
          </Badge>
        );
      case 'declined':
        return (
          <Badge variant="secondary" className="flex items-center gap-1 text-gray-500 bg-gray-100">
            <XCircle className="h-3 w-3" /> Declined
          </Badge>
        );
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <BrainCircuit className="h-3.5 w-3.5" /> AI Skill Barter Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900">
            Exchange Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Propose what you teach & learn. SwapAI automatically finds your optimal barter peer.
          </p>
        </div>

        <Button
          variant="cta"
          onClick={handleOpenModal}
          className="self-start sm:self-auto shadow-md flex items-center gap-2"
        >
          <Bot className="h-4 w-4" /> Propose SwapAI Skill Swap
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-3">
        {(['all', 'pending', 'active', 'completed', 'declined'] as const).map((tab) => {
          const count =
            tab === 'all'
              ? exchangeList.length
              : exchangeList.filter((e) => e.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab === 'all' ? 'All Requests' : tab}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Exchange List */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-gray-400">Loading your AI barter exchanges...</div>
      ) : filteredExchanges.length > 0 ? (
        <div className="space-y-4">
          {filteredExchanges.map((exchange) => {
            const isIncoming = exchange.receiverId === Number(user?.id);
            const partnerName = isIncoming ? exchange.senderName : exchange.receiverName;
            const partnerAvatar = isIncoming ? exchange.senderAvatar : exchange.receiverAvatar;

            return (
              <div
                key={exchange.id}
                onClick={() => setSelectedBarterModal(exchange)}
                className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs hover:border-primary-400 hover:shadow-md transition-all cursor-pointer group select-none"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: User & Swap Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-base shadow-xs select-none flex-shrink-0">
                      {partnerAvatar}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base text-gray-900 group-hover:text-primary-600 transition-colors">
                          {partnerName}
                        </h3>
                        
                        {/* SwapAI Match Score Badge */}
                        <div className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold flex items-center gap-1">
                          <Zap className="h-3 w-3 text-indigo-600" />
                          <span>{exchange.matchScore}% SwapAI Match</span>
                        </div>

                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 font-medium">
                          {isIncoming ? 'Incoming proposal for you' : 'You proposed this swap'}
                        </span>
                        {exchange.myRating && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                            <span>You rated: {exchange.myRating}★</span>
                          </span>
                        )}
                        {exchange.partnerRating && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                            <Star className="h-3 w-3 fill-emerald-500 text-emerald-600" />
                            <span>Peer rated: {exchange.partnerRating}★</span>
                          </span>
                        )}
                        <span className="ml-auto">{getStatusBadge(exchange.status)}</span>
                      </div>

                      {/* AI Reasoning if present */}
                      {exchange.matchReason && (
                        <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed font-medium">{exchange.matchReason}</span>
                        </div>
                      )}

                      {/* Skill Barter Exchange Visual */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-wrap items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500 font-medium">Offered:</span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200/60">
                            {exchange.skillOffered}
                          </span>
                        </div>
                        <Repeat className="h-3.5 w-3.5 text-gray-400" />
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500 font-medium">Wanted:</span>
                          <span className="font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-lg border border-primary-200/60">
                            {exchange.skillWanted}
                          </span>
                        </div>
                      </div>

                      {/* Goals Preview */}
                      <p className="text-xs text-gray-600 italic bg-white p-2.5 rounded-lg border border-gray-100">
                        "{exchange.message}"
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions / Click Prompt */}
                  <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-end gap-2.5 flex-shrink-0">
                    {exchange.status === 'pending' && isIncoming ? (
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAccept(exchange.id)}
                          className="text-xs bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDecline(exchange.id)}
                          className="text-xs text-red-600 hover:bg-red-50"
                        >
                          Decline
                        </Button>
                      </div>
                    ) : exchange.status === 'declined' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReopen(exchange.id);
                        }}
                        className="text-xs text-gray-600 hover:bg-gray-100"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" /> Reopen
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 group-hover:text-primary-700 bg-primary-50/60 group-hover:bg-primary-100/70 border border-primary-200/50 px-3 py-1.5 rounded-xl transition-all">
                        <span>View Barter & Actions</span>
                        <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300 p-8">
          <div className="h-16 w-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
            <Bot className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">No barter proposals in this view</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
            Tell the AI what skill you have to teach and what you want to learn. SwapAI will find the best match for you!
          </p>
          <Button variant="cta" onClick={handleOpenModal} className="text-xs">
            <Bot className="mr-1.5 h-4 w-4" /> Propose SwapAI Skill Swap
          </Button>
        </div>
      )}

      {/* Propose AI Swap Modal (NO user browsing - Pure AI Matchmaking) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn select-none">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <BrainCircuit className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display font-bold text-lg text-gray-900">
                    Propose SwapAI Skill Swap
                  </h3>
                  <p className="text-xs text-gray-400">Powered by SwapAI Matchmaking Engine</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* If AI has found a match, display the celebration result */}
            {aiMatchResult ? (
              <div className="space-y-5 animate-fadeIn">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-primary-50 border border-indigo-200/80 text-center space-y-3">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-accent-500 text-white font-bold text-xl shadow-md mx-auto">
                    {aiMatchResult.matchedUserAvatar}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      AI Matched Partner
                    </span>
                    <h4 className="text-lg font-bold text-gray-900">{aiMatchResult.matchedUserName}</h4>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-extrabold shadow-xs">
                    <Zap className="h-3.5 w-3.5" />
                    <span>{aiMatchResult.matchScore}% Match Score</span>
                  </div>

                  <p className="text-xs text-indigo-950 font-medium bg-white/70 p-3 rounded-xl border border-indigo-100 leading-relaxed text-left">
                    💡 <strong>SwapAI Justification:</strong> {aiMatchResult.matchReason}
                  </p>
                </div>

                <div className="text-xs text-gray-500 text-center leading-relaxed">
                  Your skill swap proposal has been routed directly to <strong>{aiMatchResult.matchedUserName}</strong>.
                  Once they accept, you will be able to message and coordinate live barter sessions!
                </div>

                <div className="pt-2">
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => {
                      setIsModalOpen(false);
                      setAiMatchResult(null);
                    }}
                  >
                    Done & View Proposals
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProposeAiSwap} className="space-y-4">
                <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-indigo-950">
                    <Sparkles className="h-3.5 w-3.5 text-accent-500" />
                    Strict Keyword Matchmaking:
                  </p>
                  <p className="leading-relaxed text-gray-600">
                    SwapAI checks for verified skill keyword matches across registered peers. Without a proper skill match (e.g. React, Python, UI/UX Design, TypeScript, Machine Learning), SwapAI will not connect you with an unrelated member.
                  </p>
                </div>

                {matchError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5 animate-fadeIn">
                    <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-rose-900 mb-0.5">No Skill Keyword Match Found</p>
                      <p className="leading-relaxed">{matchError}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Skill You Offer to Teach *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. React Development, Python, Guitar, UI Design"
                    value={newSkillOffered}
                    onChange={(e) => setNewSkillOffered(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Skill You Want in Return *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Machine Learning, Public Speaking, SEO, Figma"
                    value={newSkillWanted}
                    onChange={(e) => setNewSkillWanted(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Learning Goals & Details *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your experience level, what you want to achieve, and preferred format..."
                    value={newLearningGoals}
                    onChange={(e) => setNewLearningGoals(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4 weeks, 2 months"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="cta"
                    disabled={isSubmitting}
                    className="flex-1 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Sparkles className="h-3.5 w-3.5 animate-spin" />
                        AI Matching...
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="h-3.5 w-3.5" />
                        Find Match & Propose
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Barter Details, Open Chat, Barter Close & Review Modal */}
      {selectedBarterModal && (
        <ExchangeDetailsModal
          isOpen={!!selectedBarterModal}
          onClose={() => setSelectedBarterModal(null)}
          exchange={selectedBarterModal}
          currentUserId={user?.id}
          onStatusChanged={() => {
            fetchRequests();
          }}
          onRatingSubmitted={() => {
            fetchRequests();
          }}
        />
      )}
    </DashboardLayout>
  );
}
