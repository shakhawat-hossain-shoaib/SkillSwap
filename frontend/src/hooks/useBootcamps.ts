import { useState, useEffect, useCallback } from 'react';
import { getAllBootcamps, type Bootcamp, type Lesson } from '../data/bootcamps';
import { bootcampService, type ApiBootcamp } from '../services/bootcampService';

export interface BootcampProgress {
  enrolledBootcampIds: string[];
  completedLessonIds: Record<string, string[]>; // bootcampId -> array of completed lessonIds
}

const STORAGE_KEY = 'skillswap_bootcamps_progress';

function mapApiToLocalBootcamp(apiB: ApiBootcamp): Bootcamp {
  const curriculumLessons: Lesson[] = [];

  if (apiB.curriculum && Array.isArray(apiB.curriculum.modules)) {
    let orderCounter = 1;
    for (const mod of apiB.curriculum.modules) {
      for (const les of mod.lessons || []) {
        curriculumLessons.push({
          id: les.id || `les-${orderCounter}`,
          title: les.title || 'Lesson',
          description: les.assignment?.title || mod.title || 'Module Lecture',
          duration: les.duration || '30 min',
          content: les.content || '# Lecture Notes',
          order: orderCounter++,
          isCompleted: false,
        });
      }
    }
  }

  return {
    id: apiB.slug || String(apiB.bootcampId),
    title: apiB.title,
    description: apiB.description || '',
    instructor: apiB.instructor || 'Faculty',
    instructorAvatar: apiB.instructorAvatar || 'SF',
    difficulty: apiB.difficulty || 'Beginner',
    duration: apiB.duration || '4 weeks',
    category: apiB.category || 'General',
    lessons: curriculumLessons.length > 0 ? curriculumLessons : [
      {
        id: 'intro',
        title: 'Course Introduction',
        description: 'Orientation & foundations',
        duration: '30 min',
        content: '# Getting Started\n\nWelcome to this masterclass bootcamp.',
        order: 1,
        isCompleted: false,
      }
    ],
    enrolledCount: apiB.enrolledCount || 0,
    rating: apiB.rating || 5.0,
    thumbnail: apiB.thumbnail || '🚀',
    tags: [apiB.category || 'SkillSwap', apiB.difficulty || 'All Levels'],
  };
}

export function useBootcamps() {
  const [bootcampList, setBootcampList] = useState<Bootcamp[]>(() => getAllBootcamps());
  const [isLoading, setIsLoading] = useState(false);

  const fetchFromApi = useCallback(async () => {
    setIsLoading(true);
    try {
      const apiBootcamps = await bootcampService.getAll();
      if (apiBootcamps && apiBootcamps.length > 0) {
        const mapped = apiBootcamps.map(mapApiToLocalBootcamp);
        setBootcampList(mapped);
      } else {
        setBootcampList(getAllBootcamps());
      }
    } catch {
      setBootcampList(getAllBootcamps());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFromApi();

    const handleUpdate = () => {
      fetchFromApi();
    };
    window.addEventListener('skillswap_bootcamps_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('skillswap_bootcamps_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [fetchFromApi]);

  const [progress, setProgress] = useState<BootcampProgress>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse bootcamp progress', e);
      }
    }
    return {
      enrolledBootcampIds: [],
      completedLessonIds: {},
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const isEnrolled = useCallback(
    (bootcampId: string) => progress.enrolledBootcampIds.includes(bootcampId),
    [progress.enrolledBootcampIds]
  );

  const enroll = useCallback((bootcampId: string) => {
    setProgress((prev) => {
      if (prev.enrolledBootcampIds.includes(bootcampId)) return prev;
      return {
        ...prev,
        enrolledBootcampIds: [...prev.enrolledBootcampIds, bootcampId],
      };
    });

    const parsedId = parseInt(bootcampId, 10);
    if (!isNaN(parsedId)) {
      bootcampService.enroll(parsedId).catch(() => {});
    }
  }, []);

  const unenroll = useCallback((bootcampId: string) => {
    setProgress((prev) => ({
      ...prev,
      enrolledBootcampIds: prev.enrolledBootcampIds.filter((id) => id !== bootcampId),
    }));
  }, []);

  const isLessonCompleted = useCallback(
    (bootcampId: string, lessonId: string) => {
      return progress.completedLessonIds[bootcampId]?.includes(lessonId) || false;
    },
    [progress.completedLessonIds]
  );

  const toggleLessonCompletion = useCallback((bootcampId: string, lessonId: string) => {
    let nowCompleted = false;
    setProgress((prev) => {
      const currentList = prev.completedLessonIds[bootcampId] || [];
      const exists = currentList.includes(lessonId);
      nowCompleted = !exists;
      const updatedList = exists
        ? currentList.filter((id) => id !== lessonId)
        : [...currentList, lessonId];

      const enrolled = prev.enrolledBootcampIds.includes(bootcampId)
        ? prev.enrolledBootcampIds
        : [...prev.enrolledBootcampIds, bootcampId];

      return {
        ...prev,
        enrolledBootcampIds: enrolled,
        completedLessonIds: {
          ...prev.completedLessonIds,
          [bootcampId]: updatedList,
        },
      };
    });
    return nowCompleted;
  }, []);

  const getBootcampStats = useCallback(
    (bootcamp: Bootcamp) => {
      const completed = progress.completedLessonIds[bootcamp.id] || [];
      const total = bootcamp.lessons?.length || 0;
      const percent = total > 0 ? Math.round((completed.length / total) * 100) : 0;
      const enrolled = progress.enrolledBootcampIds.includes(bootcamp.id);
      return {
        completedCount: completed.length,
        totalCount: total,
        progressPercent: percent,
        isEnrolled: enrolled,
        isCompleted: completed.length === total && total > 0,
      };
    },
    [progress]
  );

  const getEnhancedBootcamps = useCallback((): (Bootcamp & {
    completedCount: number;
    progressPercent: number;
    isEnrolled: boolean;
    lessons: (Lesson & { isCompleted: boolean })[];
  })[] => {
    return bootcampList.map((b) => {
      const stats = getBootcampStats(b);
      const enhancedLessons = (b.lessons || []).map((l) => ({
        ...l,
        isCompleted: isLessonCompleted(b.id, l.id),
      }));

      return {
        ...b,
        ...stats,
        lessons: enhancedLessons,
      };
    });
  }, [bootcampList, getBootcampStats, isLessonCompleted]);

  return {
    bootcamps: getEnhancedBootcamps(),
    rawBootcamps: bootcampList,
    isLoading,
    refreshBootcamps: fetchFromApi,
    isEnrolled,
    enroll,
    unenroll,
    isLessonCompleted,
    toggleLessonCompletion,
    getBootcampStats,
  };
}
