import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBootcamps } from '../../hooks/useBootcamps';
import { bootcampService, type ApiBootcamp, type PhysicalMaterialFile } from '../../services/bootcampService';
import { Button } from '../../components/common/Button';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  BookOpen,
  Share2,
  Menu,
  Copy,
  Check,
  Sparkles,
  FileText,
  Folder,
  Download,
  Send,
  MessageSquare,
  HelpCircle,
  Video,
} from 'lucide-react';
import toast from 'react-hot-toast';

function getEmbedUrl(url?: string): { type: 'youtube' | 'video' | 'none'; src: string } {
  if (!url) return { type: 'none', src: '' };
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  if (ytMatch) {
    return {
      type: 'youtube',
      src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0`,
    };
  }
  if (url.toLowerCase().endsWith('.mp4') || url.toLowerCase().includes('.mp4?')) {
    return { type: 'video', src: url };
  }
  return { type: 'none', src: url };
}

export function LessonView() {
  const { id, lessonId } = useParams<{ id: string; lessonId: string }>();
  const navigate = useNavigate();
  const { bootcamps, toggleLessonCompletion, isLessonCompleted } = useBootcamps();

  const [apiBootcamp, setApiBootcamp] = useState<ApiBootcamp | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'assignment' | 'materials' | 'discussion'>('content');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);
  const [videoSeconds, setVideoSeconds] = useState(14);
  const [assignmentSubmission, setAssignmentSubmission] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userNotes, setUserNotes] = useState('');

  const localBootcamp = bootcamps.find((b) => b.id === id);

  useEffect(() => {
    if (id) {
      bootcampService.getById(id).then((data) => {
        if (data) setApiBootcamp(data);
      });
    }
  }, [id]);

  const bootcamp = apiBootcamp
    ? {
        ...localBootcamp,
        ...apiBootcamp,
        lessons: localBootcamp?.lessons || (apiBootcamp.curriculum?.modules?.[0]?.lessons as any) || [],
      }
    : localBootcamp;

  // Video mockup play timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setVideoSeconds((prev) => (prev >= 600 ? 0 : prev + 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  if (!bootcamp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-3xl border border-gray-200 shadow-sm max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Bootcamp Not Found</h2>
          <Link to="/bootcamps">
            <Button variant="default">Return to Bootcamps</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentLessonIndex = (bootcamp.lessons || []).findIndex((l: any) => l.id === lessonId);
  const currentLesson =
    currentLessonIndex !== -1 ? bootcamp.lessons[currentLessonIndex] : bootcamp.lessons?.[0];

  const prevLesson = currentLessonIndex > 0 ? bootcamp.lessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex < (bootcamp.lessons || []).length - 1
      ? bootcamp.lessons[currentLessonIndex + 1]
      : null;

  const isCurrentCompleted = currentLesson ? isLessonCompleted(bootcamp.id, currentLesson.id) : false;
  const physicalFiles: PhysicalMaterialFile[] = apiBootcamp?.physicalMaterials || [];

  const videoSource = getEmbedUrl(currentLesson?.videoUrl);

  const handleToggleComplete = () => {
    if (!currentLesson) return;
    const isNowDone = toggleLessonCompletion(bootcamp.id, currentLesson.id);
    if (isNowDone) {
      toast.success(`Marked "${currentLesson.title}" as complete! 🎉`);
    } else {
      toast.success(`Marked "${currentLesson.title}" as incomplete`);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Lesson link copied to clipboard!');
  };

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentSubmission.trim()) {
      toast.error('Please write your solution or GitHub repo link before submitting.');
      return;
    }
    setIsSubmitted(true);
    toast.success('Assignment submitted successfully for instructor review! 🚀');
  };

  const formatVideoTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/bootcamps/${bootcamp.id}`)}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title="Return to Course Syllabus"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="h-6 w-px bg-gray-200 hidden sm:block" />

          <div>
            <div className="text-[11px] font-semibold text-primary-600 uppercase tracking-wider">
              {bootcamp.title}
            </div>
            <h1 className="text-sm font-bold text-gray-900 truncate max-w-xs sm:max-w-md md:max-w-lg">
              {currentLesson?.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            size="sm"
            variant={isCurrentCompleted ? 'default' : 'outline'}
            onClick={handleToggleComplete}
            className={`text-xs font-bold transition-all ${
              isCurrentCompleted ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
            }`}
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            {isCurrentCompleted ? 'Completed' : 'Mark as Complete'}
          </Button>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors lg:hidden"
            title="Toggle Curriculum Playlist"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Video + Tabbed Content Column */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
          {/* VIDEO PLAYER CONTAINER */}
          <div className="rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl relative aspect-video flex flex-col justify-between">
            {videoSource.type === 'youtube' ? (
              <iframe
                className="w-full h-full"
                src={videoSource.src}
                title={currentLesson?.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : videoSource.type === 'video' ? (
              <video
                controls
                className="w-full h-full object-contain"
                src={videoSource.src}
                poster=""
              />
            ) : (
              /* Simulated High-Def Video Player */
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/30 flex items-center justify-center">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-105 hover:bg-primary-500 transition-all cursor-pointer backdrop-blur-xs ring-4 ring-white/20"
                  >
                    {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                  </button>
                </div>

                {/* Top Video Header */}
                <div className="relative z-10 p-4 sm:p-6 flex items-center justify-between text-white/90">
                  <div className="flex items-center gap-2 text-xs font-semibold bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <Video className="h-3.5 w-3.5 text-accent-400" />
                    <span>Lecture Video Stream</span>
                  </div>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Bottom Video Controls Bar */}
                <div className="relative z-10 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent space-y-2">
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden cursor-pointer">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${(videoSeconds / 600) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-primary-400">
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button onClick={() => setIsMuted(!isMuted)} className="hover:text-primary-400">
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                      <span className="font-mono text-[11px] text-gray-300">
                        {formatVideoTime(videoSeconds)} / 10:00
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold bg-white/10 px-2 py-0.5 rounded">1080p HD</span>
                      <button className="hover:text-primary-400">
                        <Maximize2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* LESSON NAVIGATION TABS */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-6">
            <div className="flex gap-2 border-b border-gray-100 pb-3 flex-wrap">
              <button
                onClick={() => setActiveTab('content')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'content'
                    ? 'bg-primary-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" /> 📖 Lecture Notes
              </button>

              <button
                onClick={() => setActiveTab('assignment')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'assignment'
                    ? 'bg-primary-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FileText className="h-3.5 w-3.5" /> 📝 Lesson Assignment
              </button>

              <button
                onClick={() => setActiveTab('materials')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'materials'
                    ? 'bg-primary-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Folder className="h-3.5 w-3.5" /> 📁 Materials & Downloads ({physicalFiles.length})
              </button>

              <button
                onClick={() => setActiveTab('discussion')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'discussion'
                    ? 'bg-primary-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" /> 💬 Peer Q&A & Scratchpad
              </button>
            </div>

            {/* TAB 1: LECTURE NOTES & CODE SAMPLES */}
            {activeTab === 'content' && (
              <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-4 text-gray-800">
                <div className="bg-primary-50/60 p-4 rounded-2xl border border-primary-100 flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-primary-900">
                      Module Learning Objectives
                    </h4>
                    <p className="text-xs text-primary-700 mt-0.5">
                      By completing this lecture, you will master the underlying core patterns, understand design trade-offs, and implement the concepts in code.
                    </p>
                  </div>
                </div>

                <div className="whitespace-pre-wrap font-sans text-gray-700">
                  {currentLesson?.content}
                </div>

                {/* Code Sample Block */}
                <div className="rounded-2xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto relative">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 text-[11px]">
                    <span>example_implementation.tsx</span>
                    <button
                      onClick={() => handleCopyCode('// Production Example\nimport { useState } from "react";\nexport function Component() {\n  return <div>Loaded</div>;\n}', 1)}
                      className="hover:text-white flex items-center gap-1 text-[11px]"
                    >
                      {copiedCodeIdx === 1 ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedCodeIdx === 1 ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <code>{`// Core Pattern Demonstration
export function useFeatureSync() {
  const [data, setData] = useState(null);
  // Efficient data synchronization
  return { data };
}`}</code>
                </div>
              </div>
            )}

            {/* TAB 2: ASSIGNMENT */}
            {activeTab === 'assignment' && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-accent-50/50 border border-accent-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-accent-200 text-accent-900 text-xs font-bold">
                      Hands-On Milestone
                    </span>
                    <span className="text-xs font-semibold text-accent-700">
                      100 Points • Certificate Requirement
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-gray-900">
                    {currentLesson?.assignment?.title || `Practical Milestone for ${currentLesson?.title}`}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {currentLesson?.assignment?.description ||
                      'Apply the architectural patterns from this lecture. Implement the component or script and submit your solution below.'}
                  </p>
                </div>

                <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Your Solution Code or GitHub Repository URL
                    </label>
                    <textarea
                      rows={4}
                      value={assignmentSubmission}
                      onChange={(e) => setAssignmentSubmission(e.target.value)}
                      placeholder="Paste your code snippet, PR link, or GitHub repo URL here..."
                      className="w-full text-xs font-mono rounded-2xl border border-gray-200 p-3 bg-gray-50 focus:bg-white focus:border-primary-500 outline-hidden transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {isSubmitted ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold">
                          <CheckCircle2 className="h-4 w-4" /> Solution submitted for peer review
                        </span>
                      ) : (
                        <span>Peers will provide constructive feedback on your code.</span>
                      )}
                    </div>

                    <Button type="submit" size="sm" className="font-bold text-xs bg-primary-600 hover:bg-primary-700">
                      <Send className="h-3.5 w-3.5 mr-1" /> Submit Assignment
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: MATERIALS & DOWNLOADS */}
            {activeTab === 'materials' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-3">
                  <Folder className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-950">
                      Synchronized Physical Folder on Disk
                    </h4>
                    <p className="text-indigo-700 mt-0.5">
                      These files are read directly from <code className="bg-white px-2 py-0.5 rounded font-mono border border-indigo-200">bootcamps/{apiBootcamp?.folderName || bootcamp.id}/materials/</code> on your computer.
                    </p>
                  </div>
                </div>

                {physicalFiles.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-200 p-6">
                    <Folder className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-700">No additional files uploaded yet</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Drop any slide deck, notes, or zip file into the bootcamp folder to access it here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {physicalFiles.map((file) => (
                      <div
                        key={file.relativePath}
                        className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-primary-300 transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="h-9 w-9 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs flex-shrink-0 uppercase font-mono">
                            {file.extension || 'FILE'}
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-bold text-xs text-gray-900 truncate">{file.fileName}</div>
                            <div className="text-[10px] text-gray-500">
                              {file.formattedSize} • <span className="capitalize">{file.folderCategory}</span>
                            </div>
                          </div>
                        </div>

                        <a
                          href={bootcampService.getDownloadUrl(file.relativePath)}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1.5 flex-shrink-0"
                        >
                          <Download className="h-3.5 w-3.5" /> Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SCRATCHPAD & NOTES */}
            {activeTab === 'discussion' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Your Personal Lecture Notes (Auto-saved)
                  </label>
                  <textarea
                    rows={4}
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="Jot down personal takeaways, syntax reminders, and questions for peer swaps..."
                    className="w-full text-xs font-mono rounded-2xl border border-gray-200 p-3 bg-gray-50 focus:bg-white focus:border-primary-500 outline-hidden transition-colors"
                  />
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-1">
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-primary-600" /> Need Help with this Lecture?
                  </div>
                  <p>
                    Propose a 1-on-1 skill exchange session with your peers under the <strong>Matches</strong> tab to pair-program on this module!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Prev / Next Navigation Bar */}
          <div className="flex items-center justify-between pt-2">
            {prevLesson ? (
              <Link to={`/bootcamps/${bootcamp.id}/lessons/${prevLesson.id}`}>
                <Button variant="outline" size="sm" className="text-xs font-semibold">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous: {prevLesson.title}
                </Button>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link to={`/bootcamps/${bootcamp.id}/lessons/${nextLesson.id}`}>
                <Button size="sm" className="text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white">
                  Next: {nextLesson.title} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <Link to={`/bootcamps/${bootcamp.id}`}>
                <Button size="sm" variant="cta" className="text-xs font-bold">
                  Course Completed! View Syllabus →
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Right Sidebar Playlist (Desktop) */}
        <aside className="w-80 border-l border-gray-200 bg-white hidden lg:flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-xs uppercase tracking-wider text-gray-500">
              Curriculum Playlist ({bootcamp.lessons?.length})
            </h2>
            <span className="text-[11px] font-bold text-primary-600">
              {bootcamp.lessons?.filter((l: any) => l.isCompleted).length}/{bootcamp.lessons?.length} Done
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {(bootcamp.lessons || []).map((lesson: any, idx: number) => {
              const isCurrent = lesson.id === currentLesson?.id;
              const completed = isLessonCompleted(bootcamp.id, lesson.id);

              return (
                <Link
                  key={lesson.id}
                  to={`/bootcamps/${bootcamp.id}/lessons/${lesson.id}`}
                  className={`p-3.5 block transition-colors ${
                    isCurrent
                      ? 'bg-primary-50/80 border-l-4 border-primary-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleLessonCompletion(bootcamp.id, lesson.id);
                      }}
                      className={`mt-0.5 flex-shrink-0 rounded-full p-0.5 ${
                        completed
                          ? 'text-emerald-600 hover:text-emerald-700'
                          : 'text-gray-300 hover:text-gray-400'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4 fill-current" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-gray-400 font-medium">Lesson {idx + 1}</div>
                      <div
                        className={`text-xs font-bold truncate ${
                          isCurrent ? 'text-primary-900' : 'text-gray-800'
                        }`}
                      >
                        {lesson.title}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{lesson.duration}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
