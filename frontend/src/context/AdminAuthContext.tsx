import { createContext, useContext, useState, type ReactNode } from 'react';
import api from '../lib/axios';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminEmail: string | null;
  adminName: string | null;
  adminRole: string | null;
  adminLogin: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'skillswap_admin_session';
const ADMIN_EMAIL_KEY = 'skillswap_admin_email';
const ADMIN_TOKEN_KEY = 'skillswap_admin_token';
const ADMIN_NAME_KEY = 'skillswap_admin_name';
const ADMIN_ROLE_KEY = 'skillswap_admin_role';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
  });
  const [adminEmail, setAdminEmail] = useState<string | null>(() => {
    return localStorage.getItem(ADMIN_EMAIL_KEY) || null;
  });
  const [adminName, setAdminName] = useState<string | null>(() => {
    return localStorage.getItem(ADMIN_NAME_KEY) || null;
  });
  const [adminRole, setAdminRole] = useState<string | null>(() => {
    return localStorage.getItem(ADMIN_ROLE_KEY) || null;
  });

  const adminLogin = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    const inputEmail = email.trim();
    const inputPassword = pass.trim();

    try {
      const response = await api.post('/admin/login', {
        email: inputEmail,
        password: inputPassword,
      });

      if (response.data && response.data.success) {
        const token = response.data.token;
        const adminData = response.data.admin || {};

        setIsAdminAuthenticated(true);
        setAdminEmail(adminData.email || inputEmail);
        setAdminName(adminData.fullName || 'System Administrator');
        setAdminRole(adminData.role || 'SuperAdmin');

        localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
        localStorage.setItem(ADMIN_EMAIL_KEY, adminData.email || inputEmail);
        localStorage.setItem(ADMIN_NAME_KEY, adminData.fullName || 'System Administrator');
        localStorage.setItem(ADMIN_ROLE_KEY, adminData.role || 'SuperAdmin');
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
        localStorage.setItem('token', token); // Allow standard axios interceptor to attach JWT token

        return { success: true };
      }

      return {
        success: false,
        message: response.data?.message || 'Login failed. Please verify credentials.',
      };
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Authentication failed. Please verify database connection and credentials.';
      return { success: false, message };
    }
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminEmail(null);
    setAdminName(null);
    setAdminRole(null);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_EMAIL_KEY);
    localStorage.removeItem(ADMIN_NAME_KEY);
    localStorage.removeItem(ADMIN_ROLE_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated,
        adminEmail,
        adminName,
        adminRole,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
