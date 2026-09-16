import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  MessageSquare,
  CheckCircle2,
  Lock,
  Star,
  Zap,
  Calendar,
  Check,
  CheckCircle,
} from 'lucide-react';
import { Button } from '../common/Button';
import { reviewService } from '../../services/reviewService';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export type ExchangeStatus = 'pending' | 'active' | 'completed' | 'declined';

export interface ExchangeModalItem {
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

interface ExchangeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchange: ExchangeModalItem | null;
  currentUserId: string | number | undefined;
  onStatusChanged?: () => void;
  onRatingSubmitted?: (ratingValue: number) => void;
}

const RATING_LABELS: Record<number, { title: string; desc: string }> = {
  1: { title: 'Needs Improvement (1★)', desc: 'Session was incomplete or communication had major gaps.' },
  2: { title: 'Fair (2★)', desc: 'Basic knowledge shared, but lacked structure.' },
  3: { title: 'Good (3★)', desc: 'Helpful skill exchange; met expectations.' },
  4: { title: 'Very Good (4★)', desc: 'Engaging, knowledgeable, and well prepared.' },
  5: { title: 'Exceptional (5★)', desc: 'Outstanding mentor! Extremely patient, clear, and insightful.' },
};

const QUICK_TAGS = [
  '⚡ Super Punctual',
  '💡 Great Explanations',
  '🤝 Very Patient',
  '🚀 Highly Skilled',
  '🎯 Clear Goals',
  '⭐ 100% Recommend',
];

export function ExchangeDetailsModal({
  isOpen,
  onClose,
  exchange,
  currentUserId,
  onStatusChanged,
  onRatingSubmitted,
}: ExchangeDetailsModalProps) {
  const navigate = useNavigate();

  // Local state for barter status so completing it immediately transitions the UI
  const [currentStatus, setCurrentStatus] = useState<ExchangeStatus>('pending');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Rating Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    if (exchange) {
      setCurrentStatus(exchange.status);
      setRating(exchange.myRating || 5);
      setHoverRating(0);
      setFeedback('');
      setHasRated(!!exchange.myRating);

      // Check if existing review details exist
      reviewService.getExchangeRatings(exchange.id).then((res) => {
        if (res?.myReviewGiven) {
          setRating(res.myReviewGiven.ratingValue);
          setFeedback(res.myReviewGiven.writtenFeedback || '');
          setHasRated(true);
        }
      });
    }
  }, [exchange, isOpen]);

  if (!isOpen || !exchange) return null;

  const isIncoming = exchange.receiverId === Number(currentUserId);
  const partnerName = isIncoming ? exchange.senderName : exchange.receiverName;
  const partnerAvatar = isIncoming ? exchange.senderAvatar : exchange.receiverAvatar;
  const theyOffer = isIncoming ? exchange.skillOffered : exchange.skillWanted;
  const youOffer = isIncoming ? exchange.skillWanted : exchange.skillOffered;

  const currentDisplayRating = hoverRating || rating;
  const isCompleted = currentStatus === 'completed';

  const handleTagClick = (tag: string) => {
    if (feedback.includes(tag)) return;
    setFeedback((prev) => (prev ? `${prev.trim()} ${tag}` : tag));
  };

  // Complete / Close Barter Action
  const handleCompleteBarter = async () => {
    setIsUpdatingStatus(true);
    try {
      // Send Completed status (4 in enum, or "Completed")
      await api.patch(`/exchange-requests/${exchange.id}/status`, { status: 4 });
      setCurrentStatus('completed');
      toast.success('Barter successfully marked as Completed! 🎉 Peer rating is now unlocked.');
      if (onStatusChanged) onStatusChanged();
    } catch {
      try {
        await api.patch(`/exchange-requests/${exchange.id}/status`, { status: 'Completed' });
        setCurrentStatus('completed');
        toast.success('Barter successfully marked as Completed! 🎉 Peer rating is now unlocked.');
        if (onStatusChanged) onStatusChanged();
      } catch (err: any) {
        toast.error(err?.response?.data?.error || 'Failed to complete barter. Please try again.');
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Accept Proposal
  const handleAccept = async () => {
    setIsUpdatingStatus(true);
    try {
      await api.patch(`/exchange-requests/${exchange.id}/status`, { status: 1 });
      setCurrentStatus('active');
      toast.success('Barter proposal accepted! You can now chat and coordinate sessions. 🎉');
      if (onStatusChanged) onStatusChanged();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to accept proposal.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Decline Proposal
  const handleDecline = async () => {
    setIsUpdatingStatus(true);
    try {
      await api.patch(`/exchange-requests/${exchange.id}/status`, { status: 2 });
      setCurrentStatus('declined');
      toast.error('Barter proposal declined.');
      if (onStatusChanged) onStatusChanged();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to decline proposal.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Submit Rating (only unlocked when barter is completed)
  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCompleted) {
      toast.error('Please complete the barter before submitting your peer rating.');
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5 stars.');
      return;
    }

    setIsSubmittingRating(true);
    try {
      const res = await reviewService.submitRating(exchange.id, rating, feedback);
      if (res.success) {
        setHasRated(true);
        toast.success(res.message || `Rated ${partnerName} ${rating} stars! ⭐`);
        if (onRatingSubmitted) onRatingSubmitted(rating);
        if (onStatusChanged) onStatusChanged();
      } else {
        toast.error(res.message || 'Failed to submit rating.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'An error occurred while submitting your rating.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleOpenChat = () => {
    onClose();
    navigate(`/exchanges/${exchange.id}/chat`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-gray-100 max-w-xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col relative">
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-slate-50/60">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center font-bold text-white text-base shadow-sm">
              {partnerAvatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-gray-900 leading-snug">
                  {partnerName}
                </h3>
                {exchange.matchScore && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold">
                    <Zap className="h-3 w-3 text-indigo-600" />
                    {exchange.matchScore}% Match
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {isIncoming ? 'Incoming Barter Proposal' : 'Outgoing Barter Proposal'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Barter Status Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-gray-500">Barter Status:</span>
              {currentStatus === 'completed' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Barter Completed
                </span>
              )}
              {currentStatus === 'active' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-300">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" /> Active Barter
                </span>
              )}
              {currentStatus === 'pending' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                  <Calendar className="h-3.5 w-3.5 text-amber-600" /> Pending Acceptance
                </span>
              )}
              {currentStatus === 'declined' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold border border-red-300">
                  Declined
                </span>
              )}
            </div>

            {hasRated && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold border border-amber-300">
                <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                Rated: {rating}★
              </span>
            )}
          </div>

          {/* Skill Barter Exchange Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50/50 to-accent-50/30 border border-primary-100 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-primary-100/70">
              <span className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                Barter Breakdown
              </span>
              <span className="text-gray-400 text-[11px] font-mono">
                {new Date(exchange.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-600 block mb-1">
                  They will teach:
                </span>
                <span className="font-extrabold text-sm text-gray-900 block">{theyOffer}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 block mb-1">
                  You will teach:
                </span>
                <span className="font-extrabold text-sm text-gray-900 block">{youOffer}</span>
              </div>
            </div>

            {exchange.message && (
              <p className="text-xs text-gray-600 italic bg-white/80 p-2.5 rounded-xl border border-gray-100">
                "{exchange.message}"
              </p>
            )}
          </div>

          {/* Actions Section: Open Chat & Complete/Close Barter */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Barter Coordination & Actions
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Action 1: Open Chat */}
              <Button
                variant="default"
                size="default"
                onClick={handleOpenChat}
                className="w-full flex items-center justify-center gap-2 text-xs font-bold shadow-xs py-2.5"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Open Chat with {partnerName}</span>
              </Button>

              {/* Action 2: Barter Close / Complete */}
              {currentStatus === 'active' && (
                <Button
                  variant="cta"
                  size="default"
                  onClick={handleCompleteBarter}
                  disabled={isUpdatingStatus}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isUpdatingStatus ? 'Completing...' : 'Close Barter (Complete)'}</span>
                </Button>
              )}

              {currentStatus === 'completed' && (
                <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Barter Closed & Complete</span>
                </div>
              )}

              {currentStatus === 'pending' && isIncoming && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handleAccept}
                    disabled={isUpdatingStatus}
                    className="flex-1 text-xs bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 font-bold"
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> Accept
                  </Button>
                  <Button
                    variant="ghost"
                    size="default"
                    onClick={handleDecline}
                    disabled={isUpdatingStatus}
                    className="flex-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Decline
                  </Button>
                </div>
              )}

              {currentStatus === 'declined' && (
                <div className="flex items-center justify-center p-2.5 rounded-xl bg-gray-50 text-gray-500 border border-gray-200 text-xs">
                  Proposal was declined
                </div>
              )}
            </div>
          </div>

          {/* Review / Rating System (Only active after the end of conversation / successful barter) */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
                Peer Review & Rating
              </h4>
              {isCompleted && (
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ✓ Unlocked (Barter Finished)
                </span>
              )}
            </div>

            {!isCompleted ? (
              /* Locked State: Barter must be finished/completed first */
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-center space-y-2.5">
                <div className="h-9 w-9 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-2xs">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-amber-950">
                    Rating unlocks after a successful barter
                  </h5>
                  <p className="text-[11px] text-amber-900/80 leading-relaxed max-w-sm mx-auto mt-0.5">
                    Finish your conversation and learning session with {partnerName}. Once done, click{' '}
                    <strong>"Close Barter (Complete)"</strong> above to unlock peer ratings!
                  </p>
                </div>

                {currentStatus === 'active' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCompleteBarter}
                    disabled={isUpdatingStatus}
                    className="text-xs font-bold bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50 shadow-2xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                    Finished Swapping? Complete Barter & Rate
                  </Button>
                )}
              </div>
            ) : (
              /* Unlocked Rating Form (Barter is Completed) */
              <form onSubmit={handleSubmitRating} className="space-y-4 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/50 to-orange-50/40 border border-amber-200/80 space-y-3">
                  {/* Star Rating Selector */}
                  <div className="text-center space-y-1">
                    <span className="text-xs font-semibold text-gray-700 block">
                      Select Star Rating for {partnerName}:
                    </span>
                    <div className="flex justify-center items-center gap-1.5 py-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 focus:outline-hidden transition-transform transform hover:scale-125 duration-150"
                        >
                          <Star
                            className={`h-7 w-7 transition-colors ${
                              star <= currentDisplayRating
                                ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                                : 'text-gray-200 hover:text-amber-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <div className="min-h-[22px]">
                      <span className="text-xs font-extrabold text-amber-900">
                        {RATING_LABELS[currentDisplayRating]?.title}
                      </span>
                      <p className="text-[11px] text-gray-500">
                        {RATING_LABELS[currentDisplayRating]?.desc}
                      </p>
                    </div>
                  </div>

                  {/* Quick Compliment Tags */}
                  <div className="space-y-1.5 pt-2 border-t border-amber-200/60">
                    <span className="text-[11px] font-semibold text-gray-600 block">
                      Quick Compliments (click to insert):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagClick(tag)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-amber-200/90 hover:bg-amber-100/60 hover:border-amber-300 text-amber-950 text-[11px] font-medium transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Textarea */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-semibold text-gray-700 block">
                      Written Testimonial / Feedback (Optional):
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder={`Share highlights of your skill exchange with ${partnerName}...`}
                      rows={3}
                      className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden resize-none bg-white"
                    />
                  </div>

                  {/* Submit Rating Button */}
                  <Button
                    type="submit"
                    disabled={isSubmittingRating}
                    className="w-full text-xs font-bold py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Star className="h-4 w-4 fill-white" />
                    <span>
                      {isSubmittingRating
                        ? 'Saving Rating...'
                        : hasRated
                        ? `Update ${rating}★ Rating`
                        : `Submit ${rating}★ Rating`}
                    </span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
