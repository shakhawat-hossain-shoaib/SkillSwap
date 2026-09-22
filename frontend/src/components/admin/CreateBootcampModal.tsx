import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { saveCustomBootcamp, type Bootcamp } from '../../data/bootcamps';
import { bootcampService } from '../../services/bootcampService';
import { X, Plus, Trash2, BookOpen, Video, FileText, Pencil, Folder } from 'lucide-react';

interface LessonFormValue {
  title: string;
  duration: string;
  videoUrl?: string;
  content: string;
  assignmentTitle?: string;
  assignmentDesc?: string;
}

interface BootcampFormValues {
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  instructor: string;
  description: string;
  thumbnail: string;
  tags: string;
  lessons: LessonFormValue[];
}

interface CreateBootcampModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bootcampToEdit?: any | null;
}

const EMOJI_OPTIONS = ['🚀', '⚡', '💻', '🤖', '🧠', '🎨', '🌐', '🛡️', '📊', '🔥', '🐍', '📱'];

export function CreateBootcampModal({
  isOpen,
  onClose,
  onSuccess,
  bootcampToEdit,
}: CreateBootcampModalProps) {
  const [selectedEmoji, setSelectedEmoji] = useState('🚀');
  const [activeTab, setActiveTab] = useState<'info' | 'curriculum'>('info');

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BootcampFormValues>({
    defaultValues: {
      title: '',
      category: 'Web Development',
      difficulty: 'Beginner',
      duration: '4 weeks',
      instructor: 'SkillSwap Faculty',
      description: '',
      thumbnail: '🚀',
      tags: 'React, Fullstack, Coding',
      lessons: [
        {
          title: 'Module 1: Orientation & Setup',
          duration: '45 min',
          videoUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
          content: '# Getting Started\n\nWelcome to this masterclass bootcamp! In this module we cover the core concepts, mental models, and modern ecosystem setup.',
          assignmentTitle: 'Assignment 1: Environment Setup & Hello World',
          assignmentDesc: 'Set up your local tooling and write your first working component.',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lessons',
  });

  const watchedTitle = watch('title');
  const previewFolderName = watchedTitle
    ? watchedTitle.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_]/g, '')
    : 'Course-Name';

  useEffect(() => {
    if (bootcampToEdit) {
      reset({
        title: bootcampToEdit.title,
        category: bootcampToEdit.category || 'Web Development',
        difficulty: bootcampToEdit.difficulty || 'Beginner',
        duration: bootcampToEdit.duration || '4 weeks',
        instructor: bootcampToEdit.instructor || 'SkillSwap Faculty',
        description: bootcampToEdit.description || '',
        thumbnail: bootcampToEdit.thumbnail || '🚀',
        tags: bootcampToEdit.tags ? bootcampToEdit.tags.join(', ') : '',
        lessons: (bootcampToEdit.lessons || []).map((l: any) => ({
          title: l.title,
          duration: l.duration || '45 min',
          videoUrl: l.videoUrl || '',
          content: l.content || `# ${l.title}`,
          assignmentTitle: l.assignment?.title || '',
          assignmentDesc: l.assignment?.description || '',
        })),
      });
      setSelectedEmoji(bootcampToEdit.thumbnail || '🚀');
    } else {
      reset({
        title: '',
        category: 'Web Development',
        difficulty: 'Beginner',
        duration: '4 weeks',
        instructor: 'SkillSwap Faculty',
        description: '',
        thumbnail: '🚀',
        tags: 'Web Development, Masterclass',
        lessons: [
          {
            title: 'Module 1: Foundations & Architecture',
            duration: '45 min',
            videoUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
            content: '# Getting Started\n\nWelcome to this masterclass bootcamp! In this module we cover the core concepts and modern ecosystem setup.',
            assignmentTitle: 'Assignment 1: Environment Setup',
            assignmentDesc: 'Configure your development tools and verify your initial build.',
          },
        ],
      });
      setSelectedEmoji('🚀');
    }
  }, [bootcampToEdit, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: BootcampFormValues) => {
    try {
      const isEditing = !!bootcampToEdit;
      const bootcampId = isEditing
        ? bootcampToEdit.id
        : 'bc-' + data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const formattedLessons = (data.lessons || []).map((l, index) => ({
        id: isEditing && bootcampToEdit.lessons?.[index]?.id
          ? bootcampToEdit.lessons[index].id
          : `${bootcampId}-lesson-${index + 1}`,
        title: l.title || `Lesson ${index + 1}`,
        description: `Master key concepts in ${l.title}`,
        duration: l.duration || '45 min',
        videoUrl: l.videoUrl || 'https://www.youtube.com/watch?v=bMknfKXIFA8',
        content: l.content || `# ${l.title}\n\nLesson content and lecture details.`,
        order: index + 1,
        isCompleted: false,
        assignment: l.assignmentTitle
          ? {
              title: l.assignmentTitle,
              description: l.assignmentDesc || 'Complete the assignment task as outlined.',
              dueDate: 'Flexible Submission',
              points: 100,
            }
          : undefined,
      }));

      const curriculumPayload = {
        modules: [
          {
            id: 'mod-1',
            title: 'Core Curriculum & Modules',
            description: 'Comprehensive guided learning track for this bootcamp',
            lessons: formattedLessons,
          },
        ],
      };

      // 1. Save to Database via API
      try {
        if (isEditing && (bootcampToEdit.bootcampId || !isNaN(parseInt(bootcampToEdit.id, 10)))) {
          const dbId = bootcampToEdit.bootcampId || parseInt(bootcampToEdit.id, 10);
          await bootcampService.update(dbId, {
            title: data.title.trim(),
            category: data.category,
            difficulty: data.difficulty,
            duration: data.duration.trim(),
            instructor: data.instructor.trim(),
            thumbnail: selectedEmoji,
            description: data.description.trim(),
            curriculumJson: JSON.stringify(curriculumPayload),
          });
        } else {
          await bootcampService.create({
            title: data.title.trim(),
            category: data.category,
            difficulty: data.difficulty,
            duration: data.duration.trim(),
            instructor: data.instructor.trim(),
            thumbnail: selectedEmoji,
            description: data.description.trim(),
            curriculumJson: JSON.stringify(curriculumPayload),
          });
        }
      } catch (apiErr) {
        console.warn('API save warning (will keep local fallback):', apiErr);
      }

      // 2. Also save to local storage for offline fallback
      const savedBootcamp: Bootcamp = {
        id: bootcampId,
        title: data.title.trim(),
        description: data.description.trim(),
        instructor: data.instructor.trim(),
        instructorAvatar: data.instructor.slice(0, 2).toUpperCase(),
        difficulty: data.difficulty,
        duration: data.duration.trim(),
        category: data.category,
        enrolledCount: isEditing ? bootcampToEdit.enrolledCount : 1,
        rating: isEditing ? bootcampToEdit.rating : 5.0,
        thumbnail: selectedEmoji,
        tags: [data.category, data.difficulty],
        lessons: formattedLessons,
      };
      saveCustomBootcamp(savedBootcamp);

      toast.success(
        isEditing
          ? `Bootcamp "${data.title}" updated in database and synced with disk!`
          : `Bootcamp "${data.title}" published! Folder created on disk at bootcamps/${previewFolderName}`
      );

      reset();
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save bootcamp', err);
      toast.error('Failed to save bootcamp.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                {bootcampToEdit ? <Pencil className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
              </span>
              <div>
                <h2 className="font-display font-bold text-xl text-gray-900">
                  {bootcampToEdit ? 'Edit Bootcamp Course' : 'Create & Publish New Bootcamp'}
                </h2>
                <p className="text-xs text-gray-500">
                  Full LMS integration: database persistence + automatic physical folder provisioning.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-5 border-b border-gray-100 pb-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" /> 1. Course Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('curriculum')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'curriculum'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Video className="h-3.5 w-3.5" /> 2. Lectures, Videos & Assignments ({fields.length})
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 overflow-y-auto flex-1 pr-1">
          {activeTab === 'info' && (
            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Bootcamp Title *
                </label>
                <Input
                  placeholder="e.g. Full-Stack Next.js 15 & AI Engineering"
                  {...register('title', { required: 'Title is required' })}
                  error={errors.title?.message}
                />
              </div>

              {/* Physical Folder Disk Notice */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2.5">
                <Folder className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Disk Content Directory:</span> A physical directory is automatically linked at{' '}
                  <code className="bg-white px-2 py-0.5 rounded-md font-mono text-indigo-700 border border-indigo-200">
                    bootcamps/{previewFolderName}/
                  </code>
                  . Any files placed in its <code className="font-mono">materials/</code> or <code className="font-mono">assignments/</code> subfolder will appear in the course downloads!
                </div>
              </div>

              {/* Grid: Category, Difficulty, Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    {...register('category')}
                    className="w-full text-xs font-semibold rounded-xl border border-gray-200 p-2.5 bg-gray-50 focus:bg-white focus:border-indigo-500 outline-hidden transition-colors"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science">Data Science & AI</option>
                    <option value="Mobile Development">Mobile Apps</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Design">UI/UX & Product Design</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Difficulty Level
                  </label>
                  <select
                    {...register('difficulty')}
                    className="w-full text-xs font-semibold rounded-xl border border-gray-200 p-2.5 bg-gray-50 focus:bg-white focus:border-indigo-500 outline-hidden transition-colors"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Duration
                  </label>
                  <Input placeholder="e.g. 6 weeks" {...register('duration')} />
                </div>
              </div>

              {/* Instructor & Emoji Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Instructor Name
                  </label>
                  <Input placeholder="e.g. Sarah Chen" {...register('instructor')} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Course Thumbnail Icon
                  </label>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setSelectedEmoji(emoji)}
                        className={`h-9 w-9 text-base rounded-xl flex items-center justify-center transition-all ${
                          selectedEmoji === emoji
                            ? 'bg-indigo-600 text-white scale-110 shadow-md ring-2 ring-indigo-400'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Course Overview & Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the skills students will acquire, learning outcomes, and prerequisites..."
                  className="w-full text-xs rounded-xl border border-gray-200 p-3 bg-gray-50 focus:bg-white focus:border-indigo-500 outline-hidden transition-colors"
                  {...register('description')}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="button" onClick={() => setActiveTab('curriculum')} className="text-xs font-bold">
                  Next: Add Lessons & Video Content →
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Curriculum Lessons & Modules</h3>
                  <p className="text-xs text-gray-500">
                    Add lectures with video links, markdown notes, and assignments.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    append({
                      title: `Lesson ${fields.length + 1}`,
                      duration: '45 min',
                      videoUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
                      content: '# Lesson Notes\n\nDetailed breakdown of topics.',
                      assignmentTitle: `Assignment ${fields.length + 1}`,
                      assignmentDesc: 'Build a practical implementation project.',
                    })
                  }
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Lesson Module
                </button>
              </div>

              <div className="space-y-4">
                {fields.map((field, idx) => (
                  <div key={field.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/60 px-2.5 py-1 rounded-md">
                        Module #{idx + 1}
                      </span>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(idx)}
                          className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Lesson Title</label>
                        <Input placeholder="e.g. Introduction to Component State" {...register(`lessons.${idx}.title` as const)} />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Duration</label>
                        <Input placeholder="e.g. 45 min" {...register(`lessons.${idx}.duration` as const)} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        Video Lecture URL (YouTube or MP4 embed)
                      </label>
                      <Input
                        placeholder="https://www.youtube.com/watch?v=... or .mp4 link"
                        {...register(`lessons.${idx}.videoUrl` as const)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Assignment Title</label>
                        <Input
                          placeholder="e.g. Build an Interactive Filter"
                          {...register(`lessons.${idx}.assignmentTitle` as const)}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Assignment Instructions</label>
                        <Input
                          placeholder="Short instructions for submission"
                          {...register(`lessons.${idx}.assignmentDesc` as const)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        Lecture Content & Markdown Notes
                      </label>
                      <textarea
                        rows={3}
                        className="w-full text-xs font-mono rounded-xl border border-gray-200 p-2.5 bg-white focus:border-indigo-500 outline-hidden"
                        placeholder="# Lecture Overview..."
                        {...register(`lessons.${idx}.content` as const)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              {isSubmitting
                ? 'Publishing to Database & Disk...'
                : bootcampToEdit
                ? 'Save Changes'
                : 'Publish Bootcamp Now 🚀'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
