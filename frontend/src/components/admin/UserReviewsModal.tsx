import { useState, useEffect } from 'react';
import { Star, X, UserCheck, ShieldCheck } from 'lucide-react';
import { reviewService, type ReviewItem } from '../../services/reviewService';

interface UserReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
  userName: string;
  userEmail: string;
  userAvatar: string;
  currentRating: number;
}

export function UserReviewsModal({
  isOpen,
  onClose,
  userId,
  userName,
  userEmail,
  userAvatar,
  currentRating,
}: UserReviewsModalProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && userId) {
      setIsLoading(true);
      reviewService
        .getUserReviews(userId)
        .then((res) => {
          setReviews(res?.reviews || []);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, userId]);

  if (!isOpen || !userId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl text-slate-100 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center font-bold text-white shadow-md text-sm">
              {userAvatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{userName}</h3>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400 font-mono">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Overall Rating Banner */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Overall Trust Rating
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400">
                {currentRating > 0 ? Number(currentRating).toFixed(1) : '5.0'}
              </span>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(currentRating || 5)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
          </div>

          <div className="text-right">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'} Received
            </span>
          </div>
        </div>

        {/* Reviews List */}
        <div className="overflow-y-auto space-y-3 flex-1 pr-1 custom-scrollbar">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Loading user reviews & ratings...
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
              <UserCheck className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-300">No individual reviews recorded yet</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Using default platform trust rating (5.0★) until peer reviews are submitted.
              </p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.reviewId}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-indigo-300">
                      {rev.reviewerAvatar}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200">
                        {rev.reviewerName}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-2">
                        Exchange #{rev.requestId}
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-amber-300">
                      {rev.ratingValue}.0
                    </span>
                  </div>
                </div>

                {rev.writtenFeedback && (
                  <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 italic leading-relaxed">
                    "{rev.writtenFeedback}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 mt-3 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
