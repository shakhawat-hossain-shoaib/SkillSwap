import api from '../lib/axios';

export interface PhysicalMaterialFile {
  fileName: string;
  folderCategory: string; // 'materials' | 'assignments' | 'general'
  relativePath: string;
  sizeBytes: number;
  formattedSize: string;
  extension: string;
  lastModified: string;
}

export interface LessonAssignment {
  title: string;
  description: string;
  dueDate?: string;
  points?: number;
}

export interface LessonMaterial {
  title: string;
  url: string;
}

export interface LessonItem {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  content: string;
  assignment?: LessonAssignment;
  materials?: LessonMaterial[];
  order?: number;
}

export interface ModuleItem {
  id: string;
  title: string;
  description?: string;
  lessons: LessonItem[];
}

export interface CurriculumData {
  modules: ModuleItem[];
}

export interface ApiBootcamp {
  id: string;
  bootcampId: number;
  title: string;
  slug?: string;
  description: string;
  instructor: string;
  instructorAvatar?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  category: string;
  thumbnail: string;
  rating: number;
  enrolledCount: number;
  maxParticipantCap: number;
  contentPath?: string;
  folderName?: string;
  physicalMaterials?: PhysicalMaterialFile[];
  curriculum?: CurriculumData;
  createdAt: string;
  updatedAt?: string;
}

export interface BootcampFormInput {
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  instructor: string;
  thumbnail: string;
  description: string;
  maxParticipantCap?: number;
  curriculumJson?: string;
}

export const bootcampService = {
  async getAll(category?: string, difficulty?: string): Promise<ApiBootcamp[]> {
    try {
      const params: any = {};
      if (category && category !== 'All') params.category = category;
      if (difficulty && difficulty !== 'All') params.difficulty = difficulty;

      const response = await api.get('/bootcamps', { params });
      return response.data?.data || [];
    } catch (err) {
      console.warn('Failed to fetch bootcamps from API, falling back to local storage', err);
      return [];
    }
  },

  async getById(idOrSlug: string): Promise<ApiBootcamp | null> {
    try {
      const response = await api.get(`/bootcamps/${encodeURIComponent(idOrSlug)}`);
      return response.data?.data || null;
    } catch (err) {
      console.warn(`Failed to fetch bootcamp ${idOrSlug} from API`, err);
      return null;
    }
  },

  async create(data: BootcampFormInput): Promise<{ success: boolean; data?: ApiBootcamp; message?: string }> {
    const response = await api.post('/bootcamps', data);
    return response.data;
  },

  async update(id: number, data: BootcampFormInput): Promise<{ success: boolean; data?: ApiBootcamp; message?: string }> {
    const response = await api.put(`/bootcamps/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<{ success: boolean; message?: string }> {
    const response = await api.delete(`/bootcamps/${id}`);
    return response.data;
  },

  async enroll(id: number): Promise<{ success: boolean; enrolledCount?: number }> {
    const response = await api.post(`/bootcamps/${id}/enroll`);
    return response.data;
  },

  getDownloadUrl(relativePath: string): string {
    const base = api.defaults.baseURL || 'http://localhost:5080/api';
    return `${base}/bootcamps/download?file=${encodeURIComponent(relativePath)}`;
  },
};
