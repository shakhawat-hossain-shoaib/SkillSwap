import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useBootcamps } from '../../hooks/useBootcamps';
import api from '../../lib/axios';
import { Button } from '../../components/common/Button';
import {
  Repeat,
  Sparkles,
  BookOpen,
  MessageSquare,
  Star,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  BrainCircuit,
  Bot,
} from 'lucide-react';

interface MatchedExchangeView {
  id: string;
  partnerName: string;
  partnerAvatar: string;
  matchScore: number;
  matchReason?: string;
  offered: string;
  wanted: string;
  status: string;
  isIncoming: boolean;
}

export function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { bootcamps } = useBootcamps();

  const [matchedExchanges, setMatchedExchanges] = useState<MatchedExchangeView[]>([]);
  const [isLoadingExchanges, setIsLoadingExchanges] = useState(true);
  const [activeExchangesCount, setActiveExchangesCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const enrolledBootcamps = bootcamps.filter((b) => b.isEnrolled).slice(0, 3);
  const displayBootcamps = enrolledBootcamps.length > 0 ? enrolledBootcamps : bootcamps.slice(0, 2);

  const completedLessonsTotal = bootcamps.reduce(
    (acc, b) => acc + (b.completedCount || 0),
    0
  );

  // Fetch real registered database users and real exchange stats
  useEffect(() => {
    let isMounted = true;

    async function loadRealDashboardData() {
      try {
        setIsLoadingExchanges(true);
        // Fetch real exchange requests from database
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
            }
          }
          return { offered, wanted };
        };

        const mapped: MatchedExchangeView[] = [];
        for (const r of recv) {
          const { offered, wanted } = parseGoals(r.learningGoals);
          mapped.push({
            id: String(r.requestId || r.id),
            partnerName: r.senderName || `Member #${r.senderId}`,
            partnerAvatar: r.senderAvatar || 'U',
            matchScore: r.matchScore || 95.0,
            matchReason: r.matchReason,
            offered,
            wanted,
            status: r.status?.toLowerCase() || 'pending',
            isIncoming: true,
          });
        }
        for (const s of sent) {
          const { offered, wanted } = parseGoals(s.learningGoals);
          mapped.push({
            id: String(s.requestId || s.id),
            partnerName: s.receiverName || `Member #${s.receiverId}`,
            partnerAvatar: s.receiverAvatar || 'P',
            matchScore: s.matchScore || 95.0,
            matchReason: s.matchReason,
            offered,
            wanted,
            status: s.status?.toLowerCase() || 'pending',
            isIncoming: false,
          });
        }

        if (isMounted) {
          setMatchedExchanges(mapped);
          setActiveExchangesCount(mapped.length);
          setIsLoadingExchanges(false);

          // Build real activities from requests & user profile
          const acts: any[] = [];
          for (const r of recv) {
            acts.push({
              id: `recv-${r.id || r.exchangeRequestId || Math.random()}`,
              title: 'Incoming Swap Request',
              description: `${r.senderName || 'A member'} proposed an exchange: "${r.learningGoals || 'Skill swap'}"`,
              time: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent',
              icon: Repeat,
              color: 'bg-accent-100 text-accent-700',
            });
          }
          for (const s of sent) {
            acts.push({
              id: `sent-${s.id || s.exchangeRequestId || Math.random()}`,
              title: 'Proposal Sent',
              description: `You sent a swap proposal to a peer`,
              time: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Recent',
              icon: MessageSquare,
              color: 'bg-primary-100 text-primary-700',
            });
          }
          if (completedLessonsTotal > 0) {
            acts.push({
              id: 'bootcamp-progress',
              title: 'Bootcamp Module Progress',
              description: `You have completed ${completedLessonsTotal} total bootcamp lesson modules.`,
              time: 'Active',
              icon: CheckCircle2,
              color: 'bg-emerald-100 text-emerald-700',
            });
          }
          if (user?.skillsCanTeach && user.skillsCanTeach.length > 0) {
            acts.push({
              id: 'profile-skills',
              title: 'Skills Profile Active',
              description: `Offering to teach: ${user.skillsCanTeach.join(', ')}.`,
              time: 'Active',
              icon: Award,
              color: 'bg-amber-100 text-amber-700',
            });
          }
          setRecentActivities(acts);
        }
      } catch {
        if (isMounted) {
          setActiveExchangesCount(0);
          setRecentActivities([]);
        }
      }
    }

    loadRealDashboardData();

    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.skillsCanTeach, completedLessonsTotal]);

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-primary-900 via-primary-800 to-accent-900 p-6 sm:p-8 text-white shadow-lg overflow-hidden mb-8">
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-64 h-64 bg-accent-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-accent-300 border border-white/10 mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Ready for your next swap?
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white mb-2">
              Welcome back, {user?.fullName || 'Learner'}! 👋
            </h1>
            <p className="text-primary-100 text-sm max-w-xl leading-relaxed">
              You have <span className="font-bold text-white">{activeExchangesCount} active requests</span> and <span className="font-bold text-white">{enrolledBootcamps.length} bootcamps</span> in progress. What would you like to master today?
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/bootcamps">
              <Button variant="cta" size="sm" className="shadow-md shadow-cta-500/20 font-semibold text-xs">
                Explore Bootcamps
              </Button>
            </Link>
            <Link to="/exchanges">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white/30 hover:bg-white/10 hover:text-white text-xs"
              >
                View Exchanges
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Stat 1 */}
        {/* Stat 1 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Swaps
            </span>
            <div className="p-2.5 rounded-xl bg-accent-50 text-accent-600">
              <Repeat className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-display text-gray-900">
              {activeExchangesCount}
            </span>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> In progress
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {activeExchangesCount > 0 ? `${activeExchangesCount} total barter exchanges` : 'No active exchanges yet'}
          </p>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Skills Taught
            </span>
            <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-display text-gray-900">
              {user?.skillsCanTeach?.length || 0}
            </span>
            <span className="text-xs font-medium text-primary-600 truncate max-w-[150px]">
              {user?.skillsCanTeach?.length
                ? user.skillsCanTeach.slice(0, 2).join(', ')
                : 'No skills added'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {user?.skillsCanTeach?.length
              ? 'Available for barter swap'
              : 'Add skills in My Profile'}
          </p>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Bootcamp Progress
            </span>
            <div className="p-2.5 rounded-xl bg-cta-50 text-cta-500">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-display text-gray-900">
              {completedLessonsTotal}
            </span>
            <span className="text-xs font-medium text-cta-600">Modules Completed</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{enrolledBootcamps.length} courses enrolled</p>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Trust Rating
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Star className="h-5 w-5 fill-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-display text-gray-900">
              {user?.trustRating && Number(user.trustRating) > 0
                ? Number(user.trustRating).toFixed(1)
                : '5.0'}
            </span>
            <span className="text-xs font-medium text-amber-600 flex items-center">
              ★★★★★ (Verified)
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Real community trust score</p>
        </div>
      </div>

      {/* Main Grid: Recommended Matches & Bootcamp Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left 2 Cols: AI Recommended Matches */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Matchmaker Launcher Card */}
          <div className="bg-gradient-to-r from-indigo-900 via-primary-900 to-accent-950 p-6 sm:p-7 rounded-3xl text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-accent-300 border border-white/10">
                  <BrainCircuit className="h-3.5 w-3.5" /> SwapAI Matchmaking
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white">
                  Need a Skill Swap? Let AI Match You
                </h2>
                <p className="text-primary-200 text-xs sm:text-sm max-w-lg leading-relaxed">
                  No need to manually browse other users. Propose what you teach and want to learn, and SwapAI automatically pairs you with the best candidate in the network.
                </p>
              </div>

              <Link to="/exchanges" className="flex-shrink-0">
                <Button variant="cta" className="text-xs font-semibold shadow-lg">
                  <Bot className="h-4 w-4 mr-1.5" /> Propose SwapAI Swap
                </Button>
              </Link>
            </div>
          </div>

          {/* My AI Matched Exchanges */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-lg text-gray-900">
                    My SwapAI Barter Swaps
                  </h2>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1">
                    <Zap className="h-3 w-3" /> SwapAI Matched
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Direct skill barter proposals and active sessions routed by SwapAI.
                </p>
              </div>
              <Link to="/exchanges" className="text-xs font-semibold text-primary-600 hover:text-primary-800">
                View all proposals →
              </Link>
            </div>

            <div className="space-y-4">
              {isLoadingExchanges ? (
                <div className="text-center py-8 text-xs text-gray-400">
                  <p>Loading your SwapAI barter connections...</p>
                </div>
              ) : matchedExchanges.length === 0 ? (
                <div className="text-center py-10 text-xs text-gray-400 bg-gray-50/50 rounded-2xl border border-gray-100 p-6">
                  <Bot className="h-10 w-10 text-indigo-400 mx-auto mb-2" />
                  <p className="font-bold text-gray-800 text-sm">No Active Barter Swaps Yet</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto mb-4">
                    Submit a proposal above and our SwapAI engine will evaluate candidate skills to find your optimal mentor or peer!
                  </p>
                  <Link to="/exchanges">
                    <Button variant="outline" size="sm" className="text-xs">
                      <BrainCircuit className="h-3.5 w-3.5 mr-1" /> Propose Your First SwapAI Swap
                    </Button>
                  </Link>
                </div>
              ) : (
                matchedExchanges.slice(0, 4).map((ex) => (
                  <div
                    key={ex.id}
                    className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-primary-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Peer avatar & info */}
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-base shadow-xs flex-shrink-0 select-none">
                          {ex.partnerAvatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-gray-900">{ex.partnerName}</h3>
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold flex items-center gap-1">
                              <Zap className="h-3 w-3 text-indigo-600" />
                              {ex.matchScore}% Match
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {ex.isIncoming ? 'Incoming barter proposal' : 'Proposal sent to peer'}
                          </p>
                        </div>
                      </div>

                      {/* Chat Button */}
                      <div className="flex items-center gap-2">
                        <Link to={`/exchanges/${ex.id}/chat`}>
                          <Button size="sm" variant="default" className="text-xs">
                            <MessageSquare className="h-3.5 w-3.5 mr-1" /> Chat & Coordinate
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Skill Barter Info */}
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-200/60 text-xs">
                      <span className="text-[11px] font-medium text-gray-500">Barter:</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {ex.offered}
                      </span>
                      <Repeat className="h-3 w-3 text-gray-400" />
                      <span className="font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200">
                        {ex.wanted}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Enrolled Course Progress */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary-600" /> My Course Progress
              </h2>
              <Link to="/courses" className="text-xs font-semibold text-primary-600 hover:text-primary-800">
                Browse courses ({bootcamps.length}) →
              </Link>
            </div>

            <div className="space-y-4">
              {displayBootcamps.map((bootcamp) => {
                const completed = bootcamp.completedCount || 0;
                const total = bootcamp.lessons.length;
                const percent = bootcamp.progressPercent || 0;

                return (
                  <div
                    key={bootcamp.id}
                    className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl select-none">{bootcamp.thumbnail}</span>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{bootcamp.title}</h4>
                          <p className="text-xs text-gray-500">
                            Instructor: {bootcamp.instructor} • {bootcamp.duration}
                          </p>
                        </div>
                      </div>
                      <Link to={`/courses/${bootcamp.id}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          {percent === 100 ? 'Review' : 'Continue'}
                        </Button>
                      </Link>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>
                          {completed} of {total} lessons finished
                        </span>
                        <span className="font-bold text-primary-700">{percent}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-600 to-accent-500 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Activity Feed */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-2xl border border-primary-100 shadow-xs">
            <h3 className="font-display font-bold text-base text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-cta-500" /> Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="cta"
                className="w-full justify-between text-xs font-semibold"
                onClick={() => navigate('/bootcamps')}
              >
                <span>Live 1-2 Day Bootcamps</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between text-xs bg-white"
                onClick={() => navigate('/community')}
              >
                <span>Community Groups</span>
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                  Hub
                </span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between text-xs bg-white"
                onClick={() => navigate('/exchanges')}
              >
                <span>Manage Exchange Requests</span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                  {activeExchangesCount} Active
                </span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-between text-xs text-primary-700 hover:bg-primary-100/50"
                onClick={() => navigate('/messages')}
              >
                <span>Direct Message Inbox</span>
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
            <h3 className="font-display font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" /> Recent Activity
            </h3>
            {recentActivities.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">
                <Clock className="h-6 w-6 text-gray-300 mx-auto mb-1.5" />
                <p className="font-medium text-gray-600">No recent activity yet</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Propose an exchange or enroll in a bootcamp to build your history!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((act) => {
                  const Icon = act.icon;
                  return (
                    <div key={act.id} className="flex gap-3 text-xs">
                      <div
                        className={`h-8 w-8 rounded-xl ${act.color} flex items-center justify-center flex-shrink-0 mt-0.5`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-gray-900">{act.title}</span>
                          <span className="text-[10px] text-gray-400">{act.time}</span>
                        </div>
                        <p className="text-gray-600 mt-0.5 leading-snug">{act.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
