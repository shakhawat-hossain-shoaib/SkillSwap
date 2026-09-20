import { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useBootcamps } from '../../hooks/useBootcamps';
import { categories, difficulties } from '../../data/bootcamps';
import { BootcampCard } from '../../components/bootcamp/BootcampCard';
import { ApplyToTeachModal } from '../../components/courses/ApplyToTeachModal';
import { Button } from '../../components/common/Button';
import {
  Search,
  Filter,
  Sparkles,
  GraduationCap,
  CheckCircle,
  PlusCircle,
  Award,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function CourseList() {
  const { bootcamps, enroll } = useBootcamps();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [onlyEnrolled, setOnlyEnrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const handleEnroll = (id: string) => {
    enroll(id);
    toast.success('Successfully enrolled in course! 🎉');
  };

  const filteredCourses = bootcamps.filter((course) => {
    const matchesCategory =
      selectedCategory === 'All' || course.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === 'All' || course.difficulty === selectedDifficulty;
    const matchesEnrolled = !onlyEnrolled || course.isEnrolled;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesDifficulty && matchesEnrolled && matchesSearch;
  });

  const enrolledCount = bootcamps.filter((b) => b.isEnrolled).length;

  return (
    <DashboardLayout>
      {/* Page Header Banner */}
      <div className="mb-8 bg-gradient-to-r from-primary-900 via-primary-800 to-accent-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-accent-300 border border-white/10 mb-3">
              <GraduationCap className="h-4 w-4" /> Multi-Week Structured Curricula
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white mb-2">
              Explore SkillSwap Courses
            </h1>
            <p className="text-primary-100 text-sm leading-relaxed">
              Step-by-step masterclasses with video lessons, source code templates, and downloadable project materials. Learn at your own pace!
            </p>
          </div>

          {/* Prominent 'I Want to Teach' Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              onClick={() => setIsApplyModalOpen(true)}
              className="bg-accent-500 hover:bg-accent-400 text-slate-900 font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-accent-500/30 flex items-center justify-center gap-2 transition-transform hover:scale-105"
            >
              <PlusCircle className="h-4 w-4" />
              I Want to Teach
            </Button>
          </div>
        </div>
      </div>

      {/* "I Want to Teach" Callout Strip */}
      <div className="mb-8 p-5 rounded-3xl bg-gradient-to-r from-accent-50 via-primary-50 to-indigo-50 border border-accent-200/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-accent-500/20 text-accent-700 flex items-center justify-center flex-shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Have skills to share with others?</h3>
            <p className="text-xs text-gray-600">
              Create and host your own multi-week course or workshop. Submit your course syllabus to Admin.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => setIsApplyModalOpen(true)}
          className="bg-primary-900 hover:bg-primary-800 text-white font-bold text-xs px-4 py-2 rounded-xl whitespace-nowrap"
        >
          Submit Teacher Proposal
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200/80 shadow-xs mb-8 space-y-4">
        {/* Top search & dropdown row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by course title, topic, or keyword (e.g. React, Python, Figma, Docker)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOnlyEnrolled(!onlyEnrolled)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${onlyEnrolled
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <CheckCircle className="h-3.5 w-3.5" /> My Enrolled ({enrolledCount})
            </button>

            <div className="flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                aria-label="Filter by difficulty"
                className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    Difficulty: {diff}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-semibold text-gray-500 mr-1 flex-shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${selectedCategory === cat
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <BootcampCard
              key={course.id}
              bootcamp={course}
              onEnroll={handleEnroll}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300 p-8">
          <div className="h-16 w-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">No courses matched your search</h3>
          <p className="text-gray-500 text-sm mb-4">
            Try adjusting your search filters or browse all categories.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedDifficulty('All');
              setOnlyEnrolled(false);
              setSearchQuery('');
            }}
            className="px-5 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold hover:bg-primary-700 shadow-xs"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Apply to Teach Modal */}
      <ApplyToTeachModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </DashboardLayout>
  );
}
