import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bootcamps as fallbackBootcamps, type Bootcamp } from '../../data/bootcamps';
import { bootcampService } from '../../services/bootcampService';
import { H2, P } from '../common/Typography';
import { Button } from '../common/Button';
import {
  ArrowRight,
  Sparkles,
  Star,
  Users,
  Clock,
  BookOpen,
  Video,
  FileText,
  Folder,
  Layers,
  ChevronRight,
  X,
} from 'lucide-react';

const COURSE_BANNERS: Record<string, string> = {
  'react-fundamentals': '/react_course_banner.jpg',
  'python-data-science': '/python_course_banner.jpg',
  'ui-ux-design-systems': '/uiux_course_banner.jpg',
};

const CATEGORIES = ['All', 'Web Development', 'Data Science', 'Design'];

export function FeaturedBootcampsPreview() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [courseList, setCourseList] = useState<Bootcamp[]>(fallbackBootcamps);
  const [selectedPreview, setSelectedPreview] = useState<Bootcamp | null>(null);

  useEffect(() => {
    bootcampService.getAll().then((apiData) => {
      if (apiData && apiData.length > 0) {
        // Merge API data with local fallback
        const merged = apiData.map((item) => {
          const fallback = fallbackBootcamps.find((fb) => fb.id === item.id || fb.id === item.slug);
          return {
            id: item.slug || item.id,
            slug: item.slug,
            title: item.title,
            description: item.description,
            instructor: item.instructor,
            instructorAvatar: item.instructorAvatar || 'SS',
            difficulty: item.difficulty,
            duration: item.duration,
            category: item.category,
            lessons: fallback?.lessons || (item.curriculum?.modules?.[0]?.lessons as any) || [],
            enrolledCount: item.enrolledCount || fallback?.enrolledCount || 150,
            rating: item.rating || fallback?.rating || 4.9,
            thumbnail: item.thumbnail || '🚀',
            tags: fallback?.tags || [item.category],
            contentPath: item.contentPath,
          } as Bootcamp;
        });
        setCourseList(merged);
      }
    });
  }, []);

  const filtered = activeCategory === 'All'
    ? courseList.slice(0, 3)
    : courseList.filter((c) => c.category.toLowerCase().includes(activeCategory.toLowerCase())).slice(0, 3);

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50/50 relative overflow-hidden">
      {/* Subtle background ambient lights */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-96 h-96 bg-accent-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
              Verified Masterclass Cohorts
            </div>
            <H2 className="border-b-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              Step Into High-Impact{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-indigo-600 to-accent-600">
                Peer Bootcamps
              </span>
            </H2>
            <P className="text-slate-600 text-base sm:text-lg leading-relaxed mt-0">
              Each bootcamp is complete with high-definition video walkthroughs, interactive coding tasks, and real downloadable resources synced directly to repository course directories.
            </P>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-white text-primary-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <Link to="/bootcamps">
              <Button variant="outline" className="text-xs font-semibold group border-slate-300 hover:border-primary-500">
                All Courses ({courseList.length})
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Bootcamp Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((bootcamp) => {
            const bannerImg =
              COURSE_BANNERS[bootcamp.id] ||
              COURSE_BANNERS[bootcamp.slug || ''] ||
              '/hero_students.jpg';

            const lessonCount = bootcamp.lessons?.length || 3;

            return (
              <div
                key={bootcamp.id}
                className="group flex flex-col bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-primary-300 transition-all duration-300 overflow-hidden relative"
              >
                {/* Visual Banner Header */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src={bannerImg}
                    alt={bootcamp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20 flex items-center gap-1">
                      <span className="text-xs">{bootcamp.thumbnail}</span>
                      {bootcamp.category}
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[11px] font-bold shadow-xs">
                      100% Free Barter
                    </span>
                  </div>

                  {/* Bottom Stats Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="h-3.5 w-3.5 text-amber-300" />
                      <span>{bootcamp.duration}</span>
                      <span className="text-white/40">•</span>
                      <span>{bootcamp.difficulty}</span>
                    </div>

                    <div className="flex items-center gap-1 font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                      <span>{bootcamp.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                        {bootcamp.instructorAvatar || bootcamp.instructor.charAt(0)}
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        Instructor: <strong className="text-slate-700">{bootcamp.instructor}</strong>
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors leading-snug mb-2 line-clamp-1">
                      {bootcamp.title}
                    </h3>

                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4">
                      {bootcamp.description}
                    </p>

                    {/* Highlights & Inclusions */}
                    <div className="space-y-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-5 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Video className="h-3.5 w-3.5 text-primary-500" /> Video Walkthroughs
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {lessonCount} Lessons
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Folder className="h-3.5 w-3.5 text-indigo-500" /> Course Files & Notes
                        </span>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium">
                          Synced on Disk
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <FileText className="h-3.5 w-3.5 text-emerald-500" /> Hands-on Assignment
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700">
                          Verified Rubric
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedPreview(bootcamp)}
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                      <span>Quick Syllabus</span>
                    </button>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate(`/bootcamps/${bootcamp.id}`)}
                      className="flex-1 text-xs font-bold shadow-xs flex items-center justify-center gap-1"
                    >
                      <span>Enroll Free</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Stats Banner */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
                <Users className="h-3.5 w-3.5" /> 1,200+ Active Cohort Learners
              </div>
              <h4 className="text-xl sm:text-2xl font-bold">Want to learn with live peers and weekly milestones?</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
                All bootcamps are cashless. You earn admission credits by sharing your own skills with peers or contributing to community reviews.
              </p>
            </div>

            <Link to="/bootcamps">
              <Button variant="cta" size="lg" className="whitespace-nowrap font-bold shadow-lg shadow-indigo-500/25">
                Explore Full Catalog
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Syllabus Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedPreview.thumbnail}</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">{selectedPreview.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{selectedPreview.category}</span>
                    <span>•</span>
                    <span>{selectedPreview.duration}</span>
                    <span>•</span>
                    <span className="font-semibold text-primary-600">{selectedPreview.difficulty}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedPreview(null)}
                className="p-2 rounded-full hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="text-xs text-slate-600 bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
                <Folder className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-indigo-900 mb-0.5">Physical Course Directory Linked</div>
                  <p className="text-slate-600 leading-relaxed">
                    Course files are provisioned at <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-200">bootcamps/{selectedPreview.id}/materials</code>. Download slides, cheatsheets, and project specs right from the lesson viewer.
                  </p>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary-600" /> Syllabus Lessons ({selectedPreview.lessons.length})
              </h4>

              <div className="space-y-3">
                {selectedPreview.lessons.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <h5 className="font-bold text-sm text-slate-900">{lesson.title}</h5>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{lesson.description}</p>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap bg-slate-100 px-2 py-1 rounded-md">
                      {lesson.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setSelectedPreview(null)}>
                Close Preview
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setSelectedPreview(null);
                  navigate(`/bootcamps/${selectedPreview.id}`);
                }}
                className="font-bold text-xs"
              >
                Go to Full Course Portal
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
