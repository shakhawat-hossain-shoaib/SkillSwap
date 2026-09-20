import { Link } from 'react-router-dom';
import type { Bootcamp, Lesson } from '../../data/bootcamps';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { BookOpen, Clock, Star, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

interface EnhancedBootcamp extends Bootcamp {
  completedCount?: number;
  progressPercent?: number;
  isEnrolled?: boolean;
  lessons: (Lesson & { isCompleted?: boolean })[];
}

interface BootcampCardProps {
  bootcamp: EnhancedBootcamp;
  compact?: boolean;
  onEnroll?: (id: string) => void;
}

export function BootcampCard({ bootcamp, compact = false, onEnroll }: BootcampCardProps) {
  const completedLessons =
    bootcamp.completedCount !== undefined
      ? bootcamp.completedCount
      : bootcamp.lessons.filter((l) => l.isCompleted).length;

  const progressPercent =
    bootcamp.progressPercent !== undefined
      ? bootcamp.progressPercent
      : Math.round((completedLessons / bootcamp.lessons.length) * 100);

  const isEnrolled = bootcamp.isEnrolled || completedLessons > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-primary-300 transition-all duration-300 flex flex-col group">
      {/* Header Banner with Emoji/Thumbnail */}
      <div className="h-40 bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 relative p-6 flex flex-col justify-between overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />
        <div className="absolute top-4 right-4 text-4xl group-hover:scale-125 transition-transform duration-300 select-none">
          {bootcamp.thumbnail}
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md border border-white/20">
            {bootcamp.category}
          </span>
          <Badge
            variant={
              bootcamp.difficulty === 'Beginner'
                ? 'accent'
                : bootcamp.difficulty === 'Intermediate'
                ? 'warning'
                : 'default'
            }
          >
            {bootcamp.difficulty}
          </Badge>
        </div>

        <div className="text-white">
          <p className="text-[11px] text-primary-200">Instructor</p>
          <p className="text-sm font-semibold flex items-center gap-1.5">
            <span className="h-5 w-5 rounded-full bg-accent-500 text-white text-[10px] flex items-center justify-center font-bold">
              {bootcamp.instructorAvatar}
            </span>
            {bootcamp.instructor}
          </p>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
              {bootcamp.title}
            </h3>
          </div>

          <p className="text-gray-600 text-xs leading-relaxed mb-4 line-clamp-2">
            {bootcamp.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {bootcamp.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[11px] font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div>
          {/* Metadata Bar */}
          <div className="flex items-center justify-between py-3 border-t border-gray-100 text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <span>{bootcamp.lessons.length} lessons</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>{bootcamp.duration}</span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-gray-700">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
              <span>{bootcamp.rating}</span>
            </div>
          </div>

          {/* Progress or Enrolled info */}
          {isEnrolled ? (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1 font-medium">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  {completedLessons === bootcamp.lessons.length
                    ? 'Completed!'
                    : `${completedLessons}/${bootcamp.lessons.length} Finished`}
                </span>
                <span className="text-primary-600 font-bold">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-gray-400" />
                <span>{bootcamp.enrolledCount} learners</span>
              </span>
              {onEnroll && (
                <button
                  onClick={() => onEnroll(bootcamp.id)}
                  className="text-primary-600 font-semibold hover:underline"
                >
                  + Enroll Free
                </button>
              )}
            </div>
          )}

          {/* CTA Link */}
          <Link to={`/courses/${bootcamp.id}`}>
            <Button
              variant={isEnrolled ? 'default' : 'outline'}
              className="w-full justify-center group/btn"
              size={compact ? 'sm' : 'default'}
            >
              {isEnrolled
                ? progressPercent === 100
                  ? 'Review Course'
                  : 'Continue Course'
                : 'View Curriculum'}
              <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
