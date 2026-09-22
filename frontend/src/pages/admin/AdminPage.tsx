import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminLogin } from '../../components/admin/AdminLogin';
import { CreateBootcampModal } from '../../components/admin/CreateBootcampModal';
import { CreateBootcampPostModal } from '../../components/admin/CreateBootcampPostModal';
import { UserReviewsModal } from '../../components/admin/UserReviewsModal';
import { chatService, type DatabaseChatUser } from '../../services/chatService';
import { reviewService, type AdminReviewRecord } from '../../services/reviewService';
import { bootcampService } from '../../services/bootcampService';
import { bootcampSessionService, type BootcampSession } from '../../services/bootcampSessionService';
import { teacherApplicationService, type TeacherApplication } from '../../services/teacherApplicationService';
import { getAllBootcamps, deleteCustomBootcamp, getCustomBootcamps, type Bootcamp } from '../../data/bootcamps';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  Users,
  Network,
  LogOut,
  ExternalLink,
  Search,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Sparkles,
  Star,
  Repeat,
  BarChart3,
  UserCheck,
  Folder,
  Calendar,
  MapPin,
  GraduationCap,
  Mail,
  Flame,
  UserPlus,
} from 'lucide-react';

interface ConnectionItem {
  id: string | number;
  user1Name: string;
  user1Email: string;
  user1Avatar: string;
  user2Name: string;
  user2Email: string;
  user2Avatar: string;
  connectionType: 'Exchange Request' | 'Direct Chat Interaction';
  status: 'Pending' | 'Active' | 'Connected';
  details: string;
  time: string;
}

export function AdminPage() {
  const { isAdminAuthenticated, adminEmail, adminLogout } = useAdminAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'bootcamps' | 'courses' | 'applications' | 'users' | 'reviews' | 'connections'>('overview');
  
  // Users & Connections
  const [users, setUsers] = useState<DatabaseChatUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(true);

  // Reviews State
  const [reviews, setReviews] = useState<AdminReviewRecord[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewSearch, setReviewSearch] = useState('');
  const [selectedUserForReviews, setSelectedUserForReviews] = useState<{
    userId: number;
    fullName: string;
    emailAddress: string;
    avatar: string;
    currentRating: number;
  } | null>(null);

  // 1-Day & 2-Day Bootcamps (New Feature)
  const [bootcampSessions, setBootcampSessions] = useState<BootcampSession[]>([]);
  const [isCreateBootcampPostOpen, setIsCreateBootcampPostOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<BootcampSession | null>(null);

  // Multi-Week Courses
  const [courses, setCourses] = useState<Bootcamp[]>(() => getAllBootcamps());
  const customCourseIds = getCustomBootcamps().map((b) => b.id);
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Bootcamp | null>(null);

  // Teacher Applications ("I Want to Teach")
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [applicationFilter, setApplicationFilter] = useState<string>('All');

  // Fetch real users from database
  const refreshUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await chatService.getAdminUsers();
      setUsers(data);
      refreshConnections(data);
    } catch (err) {
      console.warn('Admin user fetch failed', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Refresh Bootcamp Sessions
  const refreshBootcampSessions = () => {
    setBootcampSessions(bootcampSessionService.getAll());
  };

  // Refresh Teacher Applications
  const refreshApplications = () => {
    setApplications(teacherApplicationService.getAll());
  };

  // Refresh Courses
  const refreshCourses = async () => {
    try {
      const list = await bootcampService.getAll();
      if (list && list.length > 0) {
        setCourses(list as any);
      } else {
        setCourses(getAllBootcamps());
      }
    } catch {
      setCourses(getAllBootcamps());
    }
  };

  // Fetch real connections
  const refreshConnections = async (allUsers: DatabaseChatUser[]) => {
    setIsLoadingConnections(true);
    try {
      const connList: ConnectionItem[] = [];

      try {
        const backendConns = await chatService.getAdminConnections();
        for (const req of backendConns) {
          connList.push({
            id: `req-${req.id}`,
            user1Name: req.user1Name,
            user1Email: req.user1Email,
            user1Avatar: req.user1Avatar,
            user2Name: req.user2Name,
            user2Email: req.user2Email,
            user2Avatar: req.user2Avatar,
            connectionType: 'Exchange Request',
            status: req.status === 'Accepted' ? 'Active' : 'Pending',
            details: req.details || 'Skill swap proposal',
            time: req.time || 'Recent',
          });
        }
      } catch (e) {
        console.warn('Could not load admin connections', e);
      }

      for (let i = 0; i < allUsers.length; i++) {
        for (let j = i + 1; j < allUsers.length; j++) {
          const u1 = allUsers[i];
          const u2 = allUsers[j];

          const u1TeachesU2Wants = (u1.skillsCanTeach || []).some((s) =>
            (u2.skillsWantsToLearn || []).some((w) => w.toLowerCase() === s.toLowerCase())
          );
          const u2TeachesU1Wants = (u2.skillsCanTeach || []).some((s) =>
            (u1.skillsWantsToLearn || []).some((w) => w.toLowerCase() === s.toLowerCase())
          );

          if (u1TeachesU2Wants || u2TeachesU1Wants) {
            connList.push({
              id: `match-${u1.userId}-${u2.userId}`,
              user1Name: u1.fullName,
              user1Email: u1.emailAddress,
              user1Avatar: u1.avatar || u1.fullName.slice(0, 2).toUpperCase(),
              user2Name: u2.fullName,
              user2Email: u2.emailAddress,
              user2Avatar: u2.avatar || u2.fullName.slice(0, 2).toUpperCase(),
              connectionType: 'Direct Chat Interaction',
              status: 'Connected',
              details: `Mutual Skill Match: ${[...(u1.skillsCanTeach || []), ...(u2.skillsCanTeach || [])].slice(0, 2).join(' ⇄ ')}`,
              time: 'Active Peer Pair',
            });
          }
        }
      }

      setConnections(connList);
    } catch {
      setConnections([]);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  // Refresh Reviews
  const refreshReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const data = await reviewService.getAllAdminReviews();
      setReviews(data);
    } catch (err) {
      console.warn('Admin review fetch failed', err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      chatService.getDatabaseUsers().then((dbUsers) => {
        setUsers(dbUsers);
        setIsLoadingUsers(false);
        refreshConnections(dbUsers);
      });
      refreshBootcampSessions();
      refreshCourses();
      refreshApplications();
      refreshReviews();
    }
  }, [isAdminAuthenticated]);

  const handleDeleteBootcampSession = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the bootcamp session "${title}"?`)) {
      bootcampSessionService.delete(id);
      refreshBootcampSessions();
      toast.success(`Bootcamp "${title}" deleted.`);
    }
  };

  const handleDeleteCourse = async (id: string | number, title: string, dbId?: number) => {
    if (window.confirm(`Are you sure you want to delete course "${title}"?`)) {
      try {
        const idToDelete = dbId || (typeof id === 'number' ? id : parseInt(id, 10));
        if (!isNaN(idToDelete)) {
          await bootcampService.delete(idToDelete);
        }
        deleteCustomBootcamp(String(id));
        await refreshCourses();
        toast.success(`Course "${title}" deleted.`);
      } catch (err) {
        console.error('Delete failed', err);
        toast.error('Failed to delete course.');
      }
    }
  };

  const handleUpdateAppStatus = (id: string, status: TeacherApplication['status']) => {
    teacherApplicationService.updateStatus(id, status);
    refreshApplications();
    toast.success(`Application marked as ${status}`);
  };

  // If not authenticated as admin, show Admin Login
  if (!isAdminAuthenticated) {
    return <AdminLogin />;
  }

  // Filter users by search
  const filteredUsers = users.filter((u) => {
    const term = userSearch.toLowerCase();
    const matchesName = u.fullName?.toLowerCase().includes(term);
    const matchesEmail = u.emailAddress?.toLowerCase().includes(term);
    const matchesSkills =
      (u.skillsCanTeach || []).some((s) => s.toLowerCase().includes(term)) ||
      (u.skillsWantsToLearn || []).some((s) => s.toLowerCase().includes(term));
    return matchesName || matchesEmail || matchesSkills;
  });

  const filteredApps = applications.filter((app) => {
    if (applicationFilter === 'All') return true;
    return app.status === applicationFilter;
  });

  const filteredReviews = reviews.filter((r) => {
    const term = reviewSearch.toLowerCase();
    return (
      r.reviewerName?.toLowerCase().includes(term) ||
      r.revieweeName?.toLowerCase().includes(term) ||
      r.writtenFeedback?.toLowerCase().includes(term)
    );
  });

  const ratedUsers = users.filter((u) => u.trustRating > 0);
  const averagePlatformRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.ratingValue, 0) / reviews.length
      : ratedUsers.length > 0
      ? ratedUsers.reduce((sum, u) => sum + Number(u.trustRating), 0) / ratedUsers.length
      : 5.0;

  const totalSkillsCount = users.reduce(
    (acc, u) => acc + (u.skillsCanTeach?.length || 0) + (u.skillsWantsToLearn?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-600 flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-base text-white tracking-tight">
                SkillSwap Admin Console
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold">
                ROOT ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Manage Bootcamps, Courses, Teachers & Community</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>User Platform</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-white">{adminEmail || 'admin@skillswap.app'}</div>
            <div className="text-[10px] text-emerald-400">● Session Active</div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={adminLogout}
            className="border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-800/60 text-xs font-semibold"
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" /> Log out
          </Button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80 w-fit shadow-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="h-4 w-4" /> Overview & Metrics
          </button>

          <button
            onClick={() => setActiveTab('bootcamps')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'bootcamps'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Flame className="h-4 w-4" /> Bootcamp Posts ({bootcampSessions.length})
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'courses'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <GraduationCap className="h-4 w-4" /> Courses ({courses.length})
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'applications'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <UserPlus className="h-4 w-4" /> Teacher Applications ({applications.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Users className="h-4 w-4" /> Users ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> Peer Reviews ({reviews.length})
          </button>

          <button
            onClick={() => setActiveTab('connections')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'connections'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Network className="h-4 w-4" /> Connections ({connections.length})
          </button>
        </div>

        {/* ── TAB 1: OVERVIEW ────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Database Users
                  </span>
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white">{users.length}</div>
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Live MySQL Database
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Overall User Rating
                  </span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <Star className="h-5 w-5 fill-amber-400" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-amber-400 flex items-center gap-1.5">
                  <span>{averagePlatformRating.toFixed(1)}</span>
                  <span className="text-sm font-normal text-slate-500">/ 5.0</span>
                </div>
                <p className="text-[11px] text-amber-300 mt-1">
                  {reviews.length} peer reviews recorded
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Bootcamp Posts
                  </span>
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                    <Flame className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white">{bootcampSessions.length}</div>
                <p className="text-[11px] text-rose-300 mt-1">1-Day & 2-Day sessions</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Multi-Week Courses
                  </span>
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white">{courses.length}</div>
                <p className="text-[11px] text-indigo-400 mt-1">
                  {customCourseIds.length} custom courses
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Teacher Proposals
                  </span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <UserPlus className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white">{applications.length}</div>
                <p className="text-[11px] text-amber-300 mt-1">
                  {applications.filter((a) => a.status === 'Pending').length} pending review
                </p>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" /> Platform Controls
                </h3>
                <div className="space-y-4 text-xs text-slate-300">
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                    <Flame className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">1-Day / 2-Day Bootcamp Sessions</div>
                      <p className="text-slate-400 mt-0.5 leading-relaxed">
                        Create event-style bootcamp workshops with cover images, speaker details, venue info, platform links, and free/paid ticketing.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">Course Curricula & Teacher Applications</div>
                      <p className="text-slate-400 mt-0.5 leading-relaxed">
                        Review submissions from users who clicked "I want to teach". Review their syllabus proposals and contact them directly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-900/40 rounded-3xl p-6 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  Quick Actions
                </h3>
                <Button
                  onClick={() => {
                    setEditingSession(null);
                    setIsCreateBootcampPostOpen(true);
                  }}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-rose-600/30 flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Post New Bootcamp Session
                </Button>
                <Button
                  onClick={() => {
                    setEditingCourse(null);
                    setIsCreateCourseModalOpen(true);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Create Course Curriculum
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('applications')}
                  className="w-full border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold justify-start"
                >
                  <UserPlus className="h-4 w-4 mr-2 text-amber-400" /> Inspect Teacher Proposals ({applications.length})
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: BOOTCAMP POSTS (1-DAY & 2-DAY SESSIONS) ─────────── */}
        {activeTab === 'bootcamps' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Flame className="h-5 w-5 text-rose-400" /> Bootcamp Sessions (1-Day & 2-Day Workshops)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Admin-published event posts featuring cover images, dates, speakers, venue, platform, and fees.
                </p>
              </div>

              <Button
                onClick={() => {
                  setEditingSession(null);
                  setIsCreateBootcampPostOpen(true);
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-rose-600/30 flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" /> Post New Bootcamp Session
              </Button>
            </div>

            {/* Grid of Bootcamp Sessions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {bootcampSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-2xl bg-slate-950/70 border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all"
                >
                  <div>
                    {/* Cover photo */}
                    <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                      <img
                        src={session.coverImage}
                        alt={session.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold">
                          {session.sessionType}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          session.isFree ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {session.fees}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                          {session.category}
                        </span>
                        <h3 className="font-bold text-sm text-white mt-0.5 line-clamp-2 leading-snug">
                          {session.title}
                        </h3>
                      </div>

                      {/* Speaker & Date */}
                      <div className="space-y-1.5 text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          <img
                            src={session.speakerAvatar}
                            alt={session.speakerName}
                            className="h-6 w-6 rounded-full object-cover border border-slate-700"
                          />
                          <span className="truncate font-semibold">{session.speakerName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Calendar className="h-3.5 w-3.5 text-rose-400" />
                          <span>{session.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                          <MapPin className="h-3.5 w-3.5 text-slate-500" />
                          <span className="truncate">{session.venue}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs bg-slate-900/50">
                    <span className="text-slate-400 text-[11px]">
                      {session.registeredCount} enrolled / {session.maxSeats} max
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingSession(session);
                          setIsCreateBootcampPostOpen(true);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1 p-1 hover:bg-indigo-950/40 rounded transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>

                      <button
                        onClick={() => handleDeleteBootcampSession(session.id, session.title)}
                        className="text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1 p-1 hover:bg-rose-950/40 rounded transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: MULTI-WEEK COURSES ───────────────────────────────── */}
        {activeTab === 'courses' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-indigo-400" /> Structured Course Masterclasses
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage multi-week courses, curriculum modules, video lessons, and downloadable files.
                </p>
              </div>

              <Button
                onClick={() => {
                  setEditingCourse(null);
                  setIsCreateCourseModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" /> Create Course Curriculum
              </Button>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((b) => {
                const isCustom = customCourseIds.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl select-none">{b.thumbnail}</span>
                        {isCustom ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                            Custom Course
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold">
                            Core Catalog
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-white mb-1 leading-snug">{b.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                        {b.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-3 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {b.category}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-medium">
                          {b.difficulty}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {b.duration}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded-md mb-3 border border-slate-800/80">
                        <Folder className="h-3 w-3 text-indigo-400 flex-shrink-0" />
                        <span className="font-mono truncate">bootcamps/{(b as any).folderName || b.slug || b.id}/</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">
                        Instructor: <strong className="text-slate-200">{b.instructor}</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCourse(b);
                            setIsCreateCourseModalOpen(true);
                          }}
                          className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1 p-1 hover:bg-indigo-950/40 rounded transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>

                        <button
                          onClick={() => handleDeleteCourse(b.id, b.title, (b as any).bootcampId)}
                          className="text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1 p-1 hover:bg-rose-950/40 rounded transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 4: TEACHER APPLICATIONS ("I Want to Teach") ────────── */}
        {activeTab === 'applications' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-amber-400" /> "I Want to Teach" Course Proposals
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proposals submitted by users wanting to host and teach courses on SkillSwap. Review and contact applicants.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                {['All', 'Pending', 'Under Review', 'Approved / Contacted', 'Declined'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setApplicationFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      applicationFilter === st
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Applications List */}
            {filteredApps.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 bg-slate-950/50 rounded-2xl border border-slate-800">
                <UserCheck className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-300">No applications under this filter</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                          {app.applicantName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{app.proposedCourseTitle}</span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px]">
                              {app.category}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                            <span>Instructor: <strong className="text-slate-200">{app.applicantName}</strong></span>
                            <span>•</span>
                            <span className="font-mono">{app.applicantEmail}</span>
                            <span>•</span>
                            <span>{app.applicantPhone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Selector */}
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateAppStatus(app.id, e.target.value as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none ${
                          app.status === 'Approved / Contacted'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : app.status === 'Under Review'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            : app.status === 'Declined'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Approved / Contacted">Approved / Contacted</option>
                        <option value="Declined">Declined</option>
                      </select>
                    </div>

                    {/* Proposal Details Snippet */}
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-2">
                      <div>
                        <span className="text-slate-400 font-semibold">Course Outline & Syllabus: </span>
                        <span className="text-slate-300">{app.courseOutline}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold">Experience & Background: </span>
                        <span className="text-slate-300">{app.teachingExperience}</span>
                      </div>
                      {app.portfolioUrl && (
                        <div className="text-[11px] text-indigo-400 font-mono">
                          Portfolio: <a href={app.portfolioUrl} target="_blank" rel="noreferrer" className="underline">{app.portfolioUrl}</a>
                        </div>
                      )}
                    </div>

                    {/* Footer Contact Action */}
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>Submitted on {new Date(app.submittedAt).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${app.applicantEmail}?subject=SkillSwap Instructor Proposal: ${encodeURIComponent(app.proposedCourseTitle)}`}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Mail className="h-3.5 w-3.5" /> Email Applicant
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 5: USERS & SKILLS ───────────────────────────────────── */}
        {activeTab === 'users' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-400" /> Database User Directory
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete list of registered accounts with their dual-profile barter skills ({totalSkillsCount} total skills recorded).
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <Input
                    placeholder="Search by name, email, or skill..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9 h-9 text-xs bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <Button size="sm" variant="outline" onClick={refreshUsers} className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800">
                  Refresh
                </Button>
              </div>
            </div>

            {/* Table */}
            {isLoadingUsers ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading user database...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 bg-slate-950/50 rounded-2xl border border-slate-800">
                <UserCheck className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-300">No users match your query</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Skills Offered (Can Teach)</th>
                      <th className="py-3 px-4">Skills Wanted (To Learn)</th>
                      <th className="py-3 px-4">Overall Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.userId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-accent-500 flex items-center justify-center text-white font-bold text-xs select-none shadow-xs">
                              {u.avatar || u.fullName?.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{u.fullName}</span>
                                <span className="text-[9px] font-mono text-slate-500">#{u.userId}</span>
                              </div>
                              <p className="text-[11px] text-slate-400 truncate max-w-xs">{u.bioDetails || 'No bio specified'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                          {u.emailAddress}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {u.skillsCanTeach && u.skillsCanTeach.length > 0 ? (
                              u.skillsCanTeach.map((s) => (
                                <span
                                  key={s}
                                  className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-medium"
                                >
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">None added</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {u.skillsWantsToLearn && u.skillsWantsToLearn.length > 0 ? (
                              u.skillsWantsToLearn.map((s) => (
                                <span
                                  key={s}
                                  className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-medium"
                                >
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">None added</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center text-amber-400">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3.5 w-3.5 ${
                                      star <= Math.round(u.trustRating > 0 ? Number(u.trustRating) : 5.0)
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-slate-700'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-extrabold text-amber-300 text-xs">
                                {u.trustRating > 0 ? Number(u.trustRating).toFixed(1) : '5.0'}
                              </span>
                              <span className="text-[10px] text-slate-500">/ 5.0</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">
                                {u.totalReviewsReceived ? `${u.totalReviewsReceived} reviews` : 'Initial Rating'}
                              </span>
                              <button
                                onClick={() => setSelectedUserForReviews({
                                  userId: u.userId,
                                  fullName: u.fullName,
                                  emailAddress: u.emailAddress,
                                  avatar: u.avatar || u.fullName?.slice(0, 2).toUpperCase(),
                                  currentRating: u.trustRating > 0 ? Number(u.trustRating) : 5.0,
                                })}
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-medium"
                              >
                                Inspect Reviews
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: REVIEWS & STAR RATINGS ───────────────────────────────── */}
        {activeTab === 'reviews' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" /> Platform Ratings & Peer Reviews
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete transparent audit of all 1-to-5 star ratings and written testimonials exchanged between members.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <Input
                    placeholder="Search reviews by name or text..."
                    value={reviewSearch}
                    onChange={(e) => setReviewSearch(e.target.value)}
                    className="pl-9 h-9 text-xs bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <Button size="sm" variant="outline" onClick={refreshReviews} className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800">
                  Refresh
                </Button>
              </div>
            </div>

            {isLoadingReviews ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading platform reviews...</div>
            ) : filteredReviews.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 bg-slate-950/50 rounded-2xl border border-slate-800">
                <Star className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-300">No peer reviews recorded yet</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  When members complete or participate in accepted exchanges, their ratings will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Reviewer (Gave Rating)</th>
                      <th className="py-3 px-4">Reviewee (Rated User)</th>
                      <th className="py-3 px-4">Star Rating</th>
                      <th className="py-3 px-4">Written Testimonial</th>
                      <th className="py-3 px-4">Exchange Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredReviews.map((rev) => (
                      <tr key={rev.reviewId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-xl bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center">
                              {rev.reviewerAvatar}
                            </div>
                            <div>
                              <div className="font-bold text-white">{rev.reviewerName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{rev.reviewerEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center">
                              {rev.revieweeAvatar}
                            </div>
                            <div>
                              <div className="font-bold text-white">{rev.revieweeName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{rev.revieweeEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center text-amber-400">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-3.5 w-3.5 ${s <= rev.ratingValue ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                                />
                              ))}
                            </div>
                            <span className="font-bold text-amber-300 text-xs">{rev.ratingValue}.0</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-sm">
                          {rev.writtenFeedback ? (
                            <span className="text-slate-300 italic leading-relaxed">"{rev.writtenFeedback}"</span>
                          ) : (
                            <span className="text-slate-500 italic">No written comment</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                          Exchange #{rev.requestId}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 6: CONNECTIONS ───────────────────────────────────────── */}
        {activeTab === 'connections' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Network className="h-5 w-5 text-indigo-400" /> Connection Tracker
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time visualization of who is connected with whom across exchange proposals and messages.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refreshConnections(users)}
                className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Refresh Connections
              </Button>
            </div>

            {isLoadingConnections ? (
              <div className="py-12 text-center text-xs text-slate-400">Mapping user connections...</div>
            ) : connections.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 bg-slate-950/50 rounded-2xl border border-slate-800">
                <Network className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-300">No active connections recorded</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connections.map((conn) => (
                  <div
                    key={conn.id}
                    className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold flex items-center gap-1">
                        <Repeat className="h-3 w-3 text-indigo-400" /> {conn.connectionType}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          conn.status === 'Active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {conn.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 px-1">
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                          {conn.user1Avatar}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{conn.user1Name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{conn.user1Email}</div>
                        </div>
                      </div>

                      <div className="flex-1 mx-4 flex items-center justify-center relative">
                        <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-accent-500 to-rose-500 opacity-60"></div>
                        <div className="absolute h-5 w-5 rounded-full bg-slate-900 border border-indigo-400 flex items-center justify-center text-[10px] text-indigo-300">
                          ⇄
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 text-right">
                        <div>
                          <div className="font-bold text-white text-xs">{conn.user2Name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{conn.user2Email}</div>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-600 to-accent-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                          {conn.user2Avatar}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate max-w-[260px] text-slate-300 font-medium">
                        {conn.details}
                      </span>
                      <span>{conn.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bootcamp Post Modal (1-2 Day Sessions) */}
      <CreateBootcampPostModal
        isOpen={isCreateBootcampPostOpen}
        onClose={() => {
          setIsCreateBootcampPostOpen(false);
          setEditingSession(null);
        }}
        onSuccess={() => {
          refreshBootcampSessions();
          setEditingSession(null);
        }}
        sessionToEdit={editingSession}
      />

      {/* Course Curriculum Modal */}
      <CreateBootcampModal
        isOpen={isCreateCourseModalOpen}
        onClose={() => {
          setIsCreateCourseModalOpen(false);
          setEditingCourse(null);
        }}
        onSuccess={() => {
          refreshCourses();
          setEditingCourse(null);
        }}
        bootcampToEdit={editingCourse}
      />

      {/* User Reviews Inspection Modal */}
      {selectedUserForReviews && (
        <UserReviewsModal
          isOpen={!!selectedUserForReviews}
          onClose={() => setSelectedUserForReviews(null)}
          userId={selectedUserForReviews.userId}
          userName={selectedUserForReviews.fullName}
          userEmail={selectedUserForReviews.emailAddress}
          userAvatar={selectedUserForReviews.avatar}
          currentRating={selectedUserForReviews.currentRating}
        />
      )}
    </div>
  );
}
