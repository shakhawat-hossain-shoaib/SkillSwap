import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { type BootcampSession, bootcampSessionService } from '../../services/bootcampSessionService';
import { BootcampSessionCard } from '../../components/bootcamp/BootcampSessionCard';
import {
  Sparkles,
  Search,
  CheckCircle,
  GraduationCap,
  Flame,
} from 'lucide-react';

export function BootcampList() {
  const [sessions, setSessions] = useState<BootcampSession[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedFee, setSelectedFee] = useState<'All' | 'Free' | 'Paid'>('All');
  const [onlyRegistered, setOnlyRegistered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const refreshSessions = () => {
    setSessions(bootcampSessionService.getAll());
  };

  useEffect(() => {
    refreshSessions();
  }, []);

  const categories = [
    'All',
    'Web Development',
    'AI & ML',
    'Design',
    'Photography',
    'Data Science',
    'Mobile Dev',
  ];

  const sessionTypes = [
    'All',
    '1-Day Intensive',
    '2-Day Weekend Workshop',
    'Evening Masterclass',
    'Special Webinar',
  ];

  const filteredSessions = sessions.filter((s) => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesType = selectedType === 'All' || s.sessionType === selectedType;
    const matchesFee =
      selectedFee === 'All' ||
      (selectedFee === 'Free' && s.isFree) ||
      (selectedFee === 'Paid' && !s.isFree);
    const matchesRegistered = !onlyRegistered || s.isRegistered;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.speakerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesType && matchesFee && matchesRegistered && matchesSearch;
  });

  const registeredCount = sessions.filter((s) => s.isRegistered).length;

  return (
    <DashboardLayout>
      {/* Page Header Banner */}
      <div className="mb-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-primary-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold mb-3">
              <Flame className="h-4 w-4 text-rose-400" /> Live 1-Day & 2-Day Workshops
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white mb-2">
              Explore Live Bootcamps & Sessions
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Join interactive masterclasses and weekend bootcamps led by industry experts. Gain fast, practical skills with live mentorship and project reviews.
            </p>
          </div>

          {/* Quick link to multi-week structured courses */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              to="/courses"
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/15 transition-all text-center flex items-center justify-center gap-2"
            >
              <GraduationCap className="h-4 w-4 text-accent-300" />
              Browse Multi-Week Courses →
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200/80 shadow-xs mb-8 space-y-4">
        {/* Top search & dropdown row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by topic, speaker name, venue, or tool (e.g. Next.js, Python, Figma, Lighting)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOnlyRegistered(!onlyRegistered)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                onlyRegistered
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CheckCircle className="h-3.5 w-3.5" /> My Registered ({registeredCount})
            </button>

            {/* Fee Filter */}
            <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-semibold text-gray-600">
              <button
                onClick={() => setSelectedFee('All')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedFee === 'All' ? 'bg-white text-gray-900 shadow-xs' : 'hover:text-gray-900'
                }`}
              >
                All Fees
              </button>
              <button
                onClick={() => setSelectedFee('Free')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedFee === 'Free' ? 'bg-white text-emerald-600 shadow-xs' : 'hover:text-gray-900'
                }`}
              >
                Free
              </button>
              <button
                onClick={() => setSelectedFee('Paid')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedFee === 'Paid' ? 'bg-white text-amber-600 shadow-xs' : 'hover:text-gray-900'
                }`}
              >
                Paid
              </button>
            </div>

            {/* Format Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
            >
              {sessionTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'All' ? 'Format: All Types' : type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-semibold text-gray-500 mr-1 flex-shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bootcamps Grid */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <BootcampSessionCard
              key={session.id}
              session={session}
              onRegisteredChange={refreshSessions}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300 p-8 shadow-xs">
          <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">No bootcamp sessions found</h3>
          <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">
            Try adjusting your search criteria or resetting your category and fee filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedType('All');
              setSelectedFee('All');
              setOnlyRegistered(false);
              setSearchQuery('');
            }}
            className="px-5 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold hover:bg-primary-700 shadow-xs"
          >
            Reset Filters
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
