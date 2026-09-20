export interface TeacherApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  proposedCourseTitle: string;
  category: string;
  targetLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  expectedDuration: string;
  courseOutline: string;
  teachingExperience: string;
  portfolioUrl?: string;
  status: 'Pending' | 'Under Review' | 'Approved / Contacted' | 'Declined';
  adminNotes?: string;
  submittedAt: string;
}

const STORAGE_KEY = 'skillswap_teacher_applications';

const initialApplications: TeacherApplication[] = [
  {
    id: 'app-1',
    applicantName: 'Arif Hasan',
    applicantEmail: 'arif.hasan@example.com',
    applicantPhone: '+880 1712-345678',
    proposedCourseTitle: 'Mastering Docker, Kubernetes & CI/CD Pipelines',
    category: 'DevOps & Cloud',
    targetLevel: 'Intermediate',
    expectedDuration: '6 weeks',
    courseOutline: 'Containerization basics, multi-stage builds, Kubernetes pod orchestration, Helm charts, and automated GitHub Actions deployment pipelines.',
    teachingExperience: '3 years as Senior DevOps Engineer, conducted 4 university tech workshops.',
    portfolioUrl: 'https://github.com',
    status: 'Pending',
    submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'app-2',
    applicantName: 'Sumaiya Akter',
    applicantEmail: 'sumaiya.ui@example.com',
    applicantPhone: '+880 1819-876543',
    proposedCourseTitle: 'Micro-interactions & Motion Design with Framer',
    category: 'Design',
    targetLevel: 'Beginner',
    expectedDuration: '4 weeks',
    courseOutline: 'Framer basics, interactive component states, spring physics, scroll-driven animations, and exporting production React code.',
    teachingExperience: 'Product Designer with 5+ years experience mentoring juniors.',
    portfolioUrl: 'https://dribbble.com',
    status: 'Approved / Contacted',
    adminNotes: 'Contacted via WhatsApp. Scheduled curriculum review meeting for Friday.',
    submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  }
];

export const teacherApplicationService = {
  getAll: (): TeacherApplication[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialApplications));
        return initialApplications;
      }
      return JSON.parse(stored);
    } catch {
      return initialApplications;
    }
  },

  submit: (appData: Omit<TeacherApplication, 'id' | 'status' | 'submittedAt'>): TeacherApplication => {
    const list = teacherApplicationService.getAll();
    const newApp: TeacherApplication = {
      ...appData,
      id: `app-${Date.now()}`,
      status: 'Pending',
      submittedAt: new Date().toISOString(),
    };
    const updated = [newApp, ...list];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newApp;
  },

  updateStatus: (id: string, status: TeacherApplication['status'], adminNotes?: string): boolean => {
    const list = teacherApplicationService.getAll();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) return false;
    list[index].status = status;
    if (adminNotes !== undefined) {
      list[index].adminNotes = adminNotes;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  },

  delete: (id: string): boolean => {
    const list = teacherApplicationService.getAll();
    const filtered = list.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
};
