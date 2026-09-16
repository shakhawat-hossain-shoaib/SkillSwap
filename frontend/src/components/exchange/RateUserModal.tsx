import { useState, useEffect } from 'react';
import { Star, X, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';
import { reviewService } from '../../services/reviewService';
import toast from 'react-hot-toast';

interface RateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: number | string;
  partnerName: string;
  partnerAvatar: string;
  partnerSkill?: string;
  initialRating?: number;
  initialFeedback?: string;
  onRatingSubmitted?: (ratingValue: number, partnerTrustRating?: number) => void;
}

const RATING_LABELS: Record<number, { title: string; desc: string }> = {
  1: { title: 'Needs Improvement (1★)', desc: 'Session was difficult or incomplete.' },
  2: { title: 'Fair (2★)', desc: 'Basic knowledge shared, but communication had gaps.' },
  3: { title: 'Good (3★)', desc: 'Met expectations; helpful skill exchange.' },
  4: { title: 'Very Good (4★)', desc: 'Engaging, knowledgeable, and well-structured.' },
  5: { title: 'Exceptional (5★)', desc: 'Outstanding mentor! Extremely patient and insightful.' },
};

const QUICK_TAGS = [
  '⚡ Super Punctual',
  '💡 Great Explanations',
  '🤝 Very Patient',
  '🚀 Highly Skilled',
  '🎯 Clear Goals',
  '⭐ 100% Recommend',
];

export function RateUserModal({
  isOpen,
  onClose,
  requestId,
  partnerName,
  partnerAvatar,
  partnerSkill,
  initialRating = 5,
  initialFeedback = '',
  onRatingSubmitted,
}: RateUserModalProps) {
  const [rating, setRating] = useState<number>(initialRating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>(initialFeedback || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setRating(initialRating || 5);
      setFeedback(initialFeedback || '');
      setHoverRating(0);
    }
  }, [isOpen, initialRating, initialFeedback]);

  if (!isOpen) return null;

  const currentDisplayRating = hoverRating || rating;

  const handleTagClick = (tag: string) => {
    if (feedback.includes(tag)) return;
    setFeedback((prev) => (prev ? `${prev.trim()} ${tag}` : tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error('Please select a star rating between 1 and 5.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await reviewService.submitRating(requestId, rating, feedback);
      if (res.success) {
        toast.success(res.message || `Rated ${partnerName} ${rating} stars! ⭐`);
        if (onRatingSubmitted) {
          onRatingSubmitted(rating, res.data?.partnerTrustRating);
        }
        onClose();
      } else {
        toast.error(res.message || 'Failed to submit rating.');
      }
    } catch {
      toast.error('An unexpected error occurred while submitting your rating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-500">
              <Star className="h-5 w-5 fill-amber-400" />
            </span>
            <div>
              <h3 className="font-display font-bold text-lg text-gray-900">
                Rate Exchange Peer
              </h3>
              <p className="text-xs text-gray-400">Score & feedback out of 5 stars</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Partner Card Preview */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-50/70 via-indigo-50/40 to-amber-50/50 border border-primary-100/80 mb-5 flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-base shadow-xs flex-shrink-0">
            {partnerAvatar}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-900 text-sm truncate">{partnerName}</span>
              <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            </div>
            <p className="text-xs text-gray-500 truncate">
              {partnerSkill ? `Exchange partner for ${partnerSkill}` : 'SkillSwap Barter Peer'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Selection */}
          <div className="text-center py-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Select Your Star Rating
            </label>

            <div className="flex items-center justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isLit = starVal <= currentDisplayRating;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRating(starVal)}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-125 active:scale-95"
                    title={`${starVal} Star${starVal > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`h-9 w-9 transition-colors ${
                        isLit
                          ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                          : 'text-gray-200 fill-gray-100 hover:text-amber-200'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Score Label Description */}
            <div className="min-h-[44px] flex flex-col items-center justify-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-xs">
                <span>{RATING_LABELS[currentDisplayRating]?.title}</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                {RATING_LABELS[currentDisplayRating]?.desc}
              </p>
            </div>
          </div>

          {/* Quick Compliment Tags */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Quick Compliments (Click to add)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-primary-50 hover:text-primary-700 text-gray-600 text-[11px] font-medium transition-colors border border-transparent hover:border-primary-200"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Written Feedback Textarea */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Written Testimonial / Feedback <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder={`Write a few words about what you learned or how ${partnerName} helped you...`}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              maxLength={2000}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white resize-none"
            />
          </div>

          {/* Help notice */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100/80 text-[11px] text-amber-900 flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              Your star rating directly contributes to <strong>{partnerName}</strong>'s overall platform trust rating and is visible to admins and verified peers.
            </span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 text-xs"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Star className="h-4 w-4 fill-white" />
                  <span>Submit {rating}★ Rating</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
