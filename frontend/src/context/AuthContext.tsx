import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import api from '../lib/axios';

export interface User {
  id: string;
  email: string;
  fullName: string;
  bioDetails?: string | null;
  profilePicture?: string | null;
  portfolioLinks?: string | null;
  trustRating?: number;
  skillsCanTeach?: string[];
  skillsWantsToLearn?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<User | null>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const fetchRealUserProfile = useCallback(async (authToken?: string | null): Promise<User | null> => {
    const activeToken = authToken || localStorage.getItem('token');
    if (!activeToken) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      // 1. Fetch user profile from database
      const profileRes = await api.get('/profile/me', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      const profileData = profileRes.data?.data || profileRes.data;

      // 2. Fetch user skills from database
      let skillsCanTeach: string[] = [];
      let skillsWantsToLearn: string[] = [];
      try {
        const skillsRes = await api.get('/profile/me/skills', {
          headers: { Authorization: `Bearer ${activeToken}` },
        });
        const skillsData = skillsRes.data?.data || skillsRes.data;
        if (skillsData?.canTeach && Array.isArray(skillsData.canTeach)) {
          skillsCanTeach = skillsData.canTeach.map((s: any) => s.skillName || s);
        }
        if (skillsData?.wantsToLearn && Array.isArray(skillsData.wantsToLearn)) {
          skillsWantsToLearn = skillsData.wantsToLearn.map((s: any) => s.skillName || s);
        }
      } catch {
        // Non-fatal if skills fail
      }

      const fullUser: User = {
        id: String(profileData.userId || profileData.id),
        email: profileData.emailAddress || profileData.email,
        fullName: profileData.fullName || 'User',
        bioDetails: profileData.bioDetails || null,
        profilePicture: profileData.profilePicture || null,
        portfolioLinks: profileData.portfolioLinks || null,
        trustRating: profileData.trustRating != null ? Number(profileData.trustRating) : 5.0,
        skillsCanTeach,
        skillsWantsToLearn,
      };

      setUser(fullUser);
      localStorage.setItem('user', JSON.stringify(fullUser));
      return fullUser;
    } catch (err: any) {
      // If 401 Unauthorized, token has expired or is invalid
      if (err.response?.status === 401) {
        logout();
        return null;
      }
      // Otherwise keep existing cached user if present
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          return parsed;
        } catch {
          // ignore
        }
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    // Rehydrate auth state on load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from local storage');
      }
    }

    if (storedToken) {
      setToken(storedToken);
      fetchRealUserProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, [fetchRealUserProfile]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    // Immediately fetch full real user profile from DB with skills
    fetchRealUserProfile(newToken);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
        refreshUser: () => fetchRealUserProfile(token),
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
