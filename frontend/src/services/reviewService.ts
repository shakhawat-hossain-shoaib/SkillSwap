import api from '../lib/axios';

export interface ReviewItem {
  reviewId: number;
  sessionId: number;
  requestId: number;
  reviewerId: number;
  reviewerName: string;
  reviewerAvatar: string;
  revieweeId: number;
  revieweeName: string;
  revieweeAvatar: string;
  ratingValue: number;
  writtenFeedback?: string;
}

export interface ExchangeRatingStatus {
  requestId: number;
  canRate: boolean;
  status: string;
  partnerId: number;
  partnerName: string;
  partnerAvatar: string;
  partnerTrustRating: number;
  myReviewGiven?: ReviewItem | null;
  reviewReceived?: ReviewItem | null;
}

export interface AdminReviewRecord {
  reviewId: number;
  sessionId: number;
  requestId: number;
  reviewerId: number;
  reviewerName: string;
  reviewerEmail: string;
  reviewerAvatar: string;
  revieweeId: number;
  revieweeName: string;
  revieweeEmail: string;
  revieweeAvatar: string;
  ratingValue: number;
  writtenFeedback: string;
}

export const reviewService = {
  /**
   * Submit or update a 1-5 star rating and optional feedback for an accepted exchange request
   */
  async submitRating(
    requestId: number | string,
    ratingValue: number,
    writtenFeedback?: string
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      if (!requestId || requestId === '0') {
        return { success: false, message: 'Invalid exchange or partner ID.' };
      }
      const response = await api.post(`/exchange-requests/${requestId}/rate`, {
        ratingValue,
        writtenFeedback: writtenFeedback?.trim() || null,
      });
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (err: any) {
      console.error('Rating submission failed:', err);
      const responseData = err.response?.data;
      let message = 'Failed to submit rating.';

      if (typeof responseData === 'string') {
        message = responseData;
      } else if (responseData?.message) {
        message = responseData.message;
      } else if (responseData?.error) {
        message = responseData.error;
      } else if (responseData?.errors) {
        const errorValues = Object.values(responseData.errors).flat();
        message = (errorValues.join(' ') as string) || 'Validation error.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, message };
    }
  },

  /**
   * Get the rating status for a specific exchange request
   */
  async getExchangeRatings(requestId: number | string): Promise<ExchangeRatingStatus | null> {
    try {
      const response = await api.get(`/exchange-requests/${requestId}/ratings`);
      return response.data?.data || null;
    } catch (err) {
      console.warn('Could not fetch exchange ratings:', err);
      return null;
    }
  },

  /**
   * Get all public reviews received by a user
   */
  async getUserReviews(userId: number | string): Promise<{
    userId: number;
    fullName: string;
    trustRating: number;
    totalReviews: number;
    reviews: ReviewItem[];
  } | null> {
    try {
      const response = await api.get(`/reviews/user/${userId}`);
      return response.data?.data || null;
    } catch (err) {
      console.warn('Could not fetch user reviews:', err);
      return null;
    }
  },

  /**
   * Admin: Get all reviews submitted across the platform
   */
  async getAllAdminReviews(): Promise<AdminReviewRecord[]> {
    try {
      const response = await api.get('/admin/reviews');
      return response.data?.data || [];
    } catch (err) {
      console.warn('Could not fetch admin reviews:', err);
      return [];
    }
  },
};
