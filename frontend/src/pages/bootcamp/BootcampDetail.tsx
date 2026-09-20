import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useBootcamps } from '../../hooks/useBootcamps';
import { bootcampService, type ApiBootcamp, type PhysicalMaterialFile } from '../../services/bootcampService';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  BookOpen,
  Clock,
  Star,
  Users,
  CheckCircle2,
  PlayCircle,
  ArrowLeft,
  Share2,
  Bookmark,
  Award,
  Layers,
  PlusCircle,
  Check,
  Folder,
  Download,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function BootcampDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bootcamps, enroll, isEnrolled } = useBootcamps();

  const [activeTab, setActiveTab] = useState<'syllabus' | 'materials' | 'assignments'>('syllabus');
  const [apiBootcamp, setApiBootcamp] = useState<ApiBootcamp | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  // Find local fallback
  const localBootcamp = bootcamps.find((b) => b.id === id);

  useEffect(() => {
    if (id) {
      setIsLoadingApi(true);
      bootcampService
        .getById(id)
        .then((data) => {
          if (data) setApiBootcamp(data);
        })
        .finally(() => setIsLoadingApi(false));
    }
  }, [id]);

  const bootcamp = apiBootcamp
    ? {
        ...localBootcamp,
        ...apiBootcamp,
        lessons: localBootcamp?.lessons || (apiBootcamp.curriculum?.modules?.[0]?.lessons as any) || [],
      }
    : localBootcamp;

  if (!bootcamp) {
    if (isLoadingApi) {
      return (
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading bootcamp details...</p>
          </div>
        </DashboardLayout>
      );
    }
    return (
      <DashboardLayout>
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Bootcamp Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">The bootcamp you are looking for does not exist.</p>
          <Link to="/bootcamps">
            <Button variant="default">Back to All Bootcamps</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const enrolled = isEnrolled(bootcamp.id);
  const completedCount = (bootcamp.lessons || []).filter((l: any) => l.isCompleted).length;
  const totalLessons = (bootcamp.lessons || []).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const firstUncompletedLesson =
    (bootcamp.lessons || []).find((l: any) => !l.isCompleted) || bootcamp.lessons?.[0];

  const physicalFiles: PhysicalMaterialFile[] = apiBootcamp?.physicalMaterials || [];
  const folderName = apiBootcamp?.folderName || (bootcamp as any).slug || bootcamp.id;

  const handleEnrollClick = async () => {
    enroll(bootcamp.id);
    if (apiBootcamp?.bootcampId) {
      await bootcampService.enroll(apiBootcamp.bootcampId).catch(() => {});
    }
    toast.success(`Enrolled in ${bootcamp.title}! 🚀`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Bootcamp link copied to clipboard!');
  };

  const handleSave = () => {
    toast.success('Saved to your learning bookmarks!');
  };

  return (
    <DashboardLayout>
      {/* Back Button */}
      <button
        onClick={() => navigate('/bootcamps')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Bootcamps
      </button>

      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-950 p-6 sm:p-10 text-white relative overflow-hidden shadow-xl mb-8">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-md border border-white/20">
                {bootcamp.category}
              </span>
              <Badge variant="accent" className="py-1 px-3">
                {bootcamp.difficulty}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-black/20 px-3 py-1 rounded-full border border-white/10">
                <Star className="h-3.5 w-3.5 fill-amber-400" /> {bootcamp.rating} Rating
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white mb-4 leading-tight">
              {bootcamp.title}
            </h1>

            <p className="text-primary-100 text-sm sm:text-base mb-6 max-w-2xl leading-relaxed">
              {bootcamp.description}
            </p>

            {/* Instructor and Stats Row */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/10 text-xs text-primary-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-accent-500 text-white font-bold flex items-center justify-center">
                  {bootcamp.instructorAvatar || 'SF'}
                </div>
                <div>
                  <div className="text-[10px] text-primary-300">Instructor</div>
                  <div className="font-semibold text-white">{bootcamp.instructor}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-accent-300" />
                <span>{bootcamp.duration} estimated</span>
              </div>

              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-accent-300" />
                <span>{totalLessons} structured modules</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-accent-300" />
                <span>{bootcamp.enrolledCount} enrolled peers</span>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <div className="w-full lg:w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex flex-col justify-between text-white shadow-lg">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-primary-200 font-semibold uppercase tracking-wider">
                  Course Status
                </span>
                <span className="text-xs font-bold text-accent-300">
                  {completedCount}/{totalLessons} Completed
                </span>
              </div>

              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-gradient-to-r from-accent-400 to-cta-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="space-y-2 mb-6 text-xs text-primary-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent-400" /> Video lectures & structured notes
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent-400" /> Downloadable disk materials
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-accent-400" /> Certificate upon completion
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {enrolled ? (
                firstUncompletedLesson ? (
                  <Link to={`/bootcamps/${bootcamp.id}/lessons/${firstUncompletedLesson.id}`}>
                    <Button
                      variant="cta"
                      size="lg"
                      className="w-full justify-center font-bold text-sm shadow-md"
                    >
                      <PlayCircle className="mr-2 h-5 w-5" />
                      {completedCount > 0
                        ? progressPercent === 100
                          ? 'Review Lessons'
                          : 'Resume Learning'
                        : 'Start Learning'}
                    </Button>
                  </Link>
                ) : null
              ) : (
                <Button
                  variant="cta"
                  size="lg"
                  className="w-full justify-center font-bold text-sm shadow-md"
                  onClick={handleEnrollClick}
                >
                  <PlusCircle className="mr-2 h-5 w-5" /> Enroll Free
                </Button>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-white border-white/30 hover:bg-white/10 hover:text-white text-xs"
                  onClick={handleShare}
                >
                  <Share2 className="h-3.5 w-3.5 mr-1" /> Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-white border-white/30 hover:bg-white/10 hover:text-white text-xs"
                  onClick={handleSave}
                >
                  <Bookmark className="h-3.5 w-3.5 mr-1" /> Bookmark
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Tabs */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Navigation Tabs Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'syllabus'
                  ? 'bg-primary-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Layers className="h-4 w-4" /> Syllabus & Lectures ({totalLessons})
            </button>

            <button
              onClick={() => setActiveTab('materials')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'materials'
                  ? 'bg-primary-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Folder className="h-4 w-4" /> Course Materials & Files ({physicalFiles.length})
            </button>

            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'assignments'
                  ? 'bg-primary-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FileText className="h-4 w-4" /> Assignments
            </button>
          </div>

          {/* Directory Notice Badge */}
          <div className="inline-flex items-center gap-2 text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1 rounded-xl">
            <Folder className="h-3.5 w-3.5 text-primary-600" />
            <span>Disk Path: <strong className="font-mono text-gray-700">bootcamps/{folderName}/</strong></span>
          </div>
        </div>

        {/* TAB 1: SYLLABUS */}
        {activeTab === 'syllabus' && (
          <div className="space-y-3">
            {(bootcamp.lessons || []).map((lesson: any, idx: number) => (
              <Link
                key={lesson.id}
                to={`/bootcamps/${bootcamp.id}/lessons/${lesson.id}`}
                className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 group ${
                  lesson.isCompleted
                    ? 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-300'
                    : 'bg-gray-50/60 border-gray-200/80 hover:bg-white hover:border-primary-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      lesson.isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-primary-100 text-primary-700 group-hover:bg-primary-600 group-hover:text-white transition-colors'
                    }`}
                  >
                    {lesson.isCompleted ? <Check className="h-5 w-5 stroke-[3]" /> : `0${idx + 1}`}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-primary-600 transition-colors flex items-center gap-2">
                      {lesson.title}
                      {lesson.isCompleted && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{lesson.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                    <Clock className="h-3.5 w-3.5" /> {lesson.duration}
                  </span>
                  <Button
                    size="sm"
                    variant={lesson.isCompleted ? 'ghost' : 'outline'}
                    className="text-xs font-bold"
                  >
                    {lesson.isCompleted ? 'Review' : 'Start'}
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* TAB 2: COURSE MATERIALS & DOWNLOADS */}
        {activeTab === 'materials' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-3">
              <Folder className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-indigo-950">Disk Materials Directory</h4>
                <p className="mt-0.5 text-indigo-700">
                  Drop your slides, notes, or code archives into <code className="bg-white px-2 py-0.5 rounded font-mono border border-indigo-200">bootcamps/{folderName}/materials/</code> and they will immediately appear below for students.
                </p>
              </div>
            </div>

            {physicalFiles.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200 p-6">
                <Folder className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-700">No physical files dropped in folder yet</p>
                <p className="text-xs text-gray-500 mt-1">
                  Place PDF slides or handouts in <span className="font-mono">bootcamps/{folderName}/materials/</span>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {physicalFiles.map((file) => (
                  <div
                    key={file.relativePath}
                    className="p-4 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-primary-300 hover:shadow-xs transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-10 w-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs flex-shrink-0 uppercase font-mono">
                        {file.extension || 'FILE'}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-xs text-gray-900 truncate" title={file.fileName}>
                          {file.fileName}
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium">
                          {file.formattedSize} • <span className="capitalize">{file.folderCategory}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={bootcampService.getDownloadUrl(file.relativePath)}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white transition-colors flex-shrink-0"
                      title="Download material"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ASSIGNMENTS */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              Complete these hands-on assignments to apply what you learn and earn your completion certificate.
            </p>

            <div className="space-y-3">
              {(bootcamp.lessons || []).map((lesson: any, idx: number) => {
                const assignment = lesson.assignment || {
                  title: `Module ${idx + 1} Practical Project`,
                  description: `Implement the key exercises covered in "${lesson.title}".`,
                  dueDate: 'Flexible',
                  points: 100,
                };

                return (
                  <div
                    key={lesson.id}
                    className="p-5 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-accent-100 text-accent-800 text-[10px] font-bold">
                          Assignment #{idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-gray-900">{assignment.title}</h4>
                      </div>
                      <p className="text-xs text-gray-600">{assignment.description}</p>
                      <div className="text-[11px] text-gray-400 font-medium">
                        Due: {assignment.dueDate || 'Flexible'} • {assignment.points || 100} Points
                      </div>
                    </div>

                    <Link to={`/bootcamps/${bootcamp.id}/lessons/${lesson.id}`}>
                      <Button size="sm" variant="outline" className="text-xs font-bold flex-shrink-0">
                        View Details & Submit →
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
