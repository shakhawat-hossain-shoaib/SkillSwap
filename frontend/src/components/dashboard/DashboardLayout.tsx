import { useState, useEffect, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { ThemeToggle } from '../common/ThemeToggle';
import api from '../../lib/axios';
import {
  LayoutDashboard,
  GraduationCap,
  Layers,
  MessageSquare,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  Repeat,
  Sparkles,
  Search,
  Flame,
  Users2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NotificationItem {
  id: number | string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingExchangeCount, setPendingExchangeCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Dynamically fetch live pending requests and unread message counts from real database
  useEffect(() => {
    let isMounted = true;

    async function fetchSidebarData() {
      try {
        // 1. Fetch real pending exchange requests
        const exchangeRes = await api.get('/exchange-requests/received');
        const requests = exchangeRes.data?.data || exchangeRes.data || [];
        const pending = requests.filter(
          (req: any) => req.status === 'Pending' || req.status === 'pending'
        );

        if (isMounted) {
          setPendingExchangeCount(pending.length);

          const notifs: NotificationItem[] = requests.map((req: any) => ({
            id: req.id || req.requestId || req.exchangeRequestId || Math.random(),
            title: 'Exchange Request',
            message: `${req.senderName || 'A member'} sent an exchange request: "${req.learningGoals || 'Skill swap proposal'}".`,
            time: req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent',
            unread: req.status === 'Pending' || req.status === 'pending',
          }));
          setNotifications(notifs);
          setUnreadCount(notifs.filter((n) => n.unread).length);
        }
      } catch {
        if (isMounted) {
          setPendingExchangeCount(0);
          setNotifications([]);
          setUnreadCount(0);
        }
      }

      try {
        // 2. Fetch real unread messages count
        const msgRes = await api.get('/messages/users');
        const users = msgRes.data?.data || msgRes.data || [];
        const totalUnread = users.reduce((sum: number, u: any) => sum + (u.unreadCount || 0), 0);

        if (isMounted) {
          setUnreadMessagesCount(totalUnread);
        }
      } catch {
        if (isMounted) {
          setUnreadMessagesCount(0);
        }
      }
    }

    fetchSidebarData();

    // Re-check periodically every 15s to keep counts dynamically up to date
    const interval = setInterval(fetchSidebarData, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Bootcamps',
      path: '/bootcamps',
      icon: Flame,
      badge: 'Live',
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      name: 'Courses',
      path: '/courses',
      icon: GraduationCap,
      badge: null,
      badgeColor: 'bg-accent-100 text-accent-700',
    },
    {
      name: 'Community',
      path: '/community',
      icon: Users2,
      badge: 'Hub',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      name: 'Exchange Requests',
      path: '/exchanges',
      icon: Layers,
      badge: pendingExchangeCount > 0 ? String(pendingExchangeCount) : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      name: 'Messages',
      path: '/messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? String(unreadMessagesCount) : null,
      badgeColor: 'bg-primary-100 text-primary-700',
    },
    {
      name: 'My Profile',
      path: '/profile',
      icon: User,
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 h-16 flex items-center justify-between sticky top-0 z-40 transition-colors">
        <Link to="/" className="flex items-center gap-2 text-primary-900 dark:text-white font-bold">
          <Repeat className="h-6 w-6 text-accent-500" />
          <span className="font-display font-bold text-lg">SkillSwap</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cta-500"></span>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
            title="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Static Fixed Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 flex-shrink-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-slate-800/80">
          <Link to="/" className="flex items-center gap-2.5 text-primary-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white shadow-xs select-none">
              <Repeat className="h-4 w-4" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-primary-900 dark:text-white">
              SkillSwap
            </span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Menu
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/30'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] font-bold h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center transition-all ${
                      isActive ? 'bg-white/25 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Matchmaking
          </div>
          <div className="mx-2 p-3.5 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50/50 border border-primary-100 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-primary-900 mb-1">
              <Sparkles className="h-4 w-4 text-accent-600" /> AI Matchmaker
            </div>
            <p className="text-gray-600 text-[11px] mb-2 leading-relaxed">
              We find mentors automatically based on your dual-profile skills.
            </p>
            <span className="inline-block px-2 py-0.5 rounded bg-primary-100 text-primary-800 text-[10px] font-semibold">
              Live Beta
            </span>
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 mt-auto">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-xs select-none">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 truncate">
              <div className="text-sm font-bold text-gray-900 truncate">
                {user?.fullName || (isLoading ? 'Loading...' : 'User')}
              </div>
              <div className="text-xs text-gray-500 truncate">{user?.email || (user as any)?.emailAddress || ''}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Log out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header for Desktop */}
        <header className="hidden md:flex h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 items-center justify-between px-8 sticky top-0 z-30 shadow-xs transition-colors">
          <div className="flex items-center gap-3 w-96">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search bootcamps, peers, or skills..."
                className="w-full pl-9 pr-4 py-1.5 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle showLabel={true} />

            {/* Notifications toggle */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 relative transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cta-500"></span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                    <h4 className="font-bold text-sm text-gray-900">Notifications</h4>
                    <span
                      onClick={() => setUnreadCount(0)}
                      className="text-[11px] font-semibold text-primary-600 cursor-pointer hover:underline"
                    >
                      Mark all as read
                    </span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400">
                      <p className="font-medium text-gray-600">No new notifications</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Exchange requests and alerts will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-64 overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl text-xs transition-colors ${
                            n.unread ? 'bg-primary-50/70 border border-primary-100' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between font-semibold text-gray-900 mb-0.5">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-gray-400 font-normal">{n.time}</span>
                          </div>
                          <p className="text-gray-600 leading-snug">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Avatar Button */}
            <Link
              to="/profile"
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl hover:bg-gray-100/80 border border-gray-200/60 transition-all group"
              title="View & Edit My Profile"
            >
              <div className="relative">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-xs shadow-xs select-none group-hover:scale-105 transition-transform">
                  {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : 'U'}
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-gray-900 group-hover:text-primary-600 transition-colors truncate max-w-[130px]">
                  {user?.fullName || 'My Profile'}
                </div>
                <div className="text-[10px] text-gray-400 font-medium leading-none mt-0.5">
                  My Profile
                </div>
              </div>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
