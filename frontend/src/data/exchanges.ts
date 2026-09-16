export interface ExchangeUser {
  id: string;
  name: string;
  avatar: string;
  rating: number;
}

export type ExchangeStatus = 'pending' | 'active' | 'completed' | 'declined';

export interface Exchange {
  id: string;
  requester: ExchangeUser;
  responder: ExchangeUser;
  skillOffered: string;
  skillWanted: string;
  status: ExchangeStatus;
  createdAt: string;
  message: string;
}

// Clean initial state: real requests are fetched from the database
export const exchanges: Exchange[] = [];

export function getExchangesByStatus(status?: ExchangeStatus): Exchange[] {
  if (!status || status === undefined) return exchanges;
  return exchanges.filter(e => e.status === status);
}
