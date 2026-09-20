export interface BootcampSession {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  sessionType: '1-Day Intensive' | '2-Day Weekend Workshop' | 'Evening Masterclass' | 'Special Webinar';
  date: string;
  time: string;
  duration: string;
  venue: string;
  platform: 'Google Meet' | 'Zoom' | 'Microsoft Teams' | 'On-Site / Physical' | 'Discord';
  speakerName: string;
  speakerTitle: string;
  speakerAvatar: string;
  speakerBio: string;
  fees: string;
  isFree: boolean;
  category: 'Web Development' | 'Data Science' | 'Design' | 'Mobile Dev' | 'AI & ML' | 'Career & Freelancing' | 'Photography';
  tags: string[];
  maxSeats: number;
  registeredCount: number;
  isRegistered?: boolean;
  meetingLink?: string;
  createdAt: string;
}

export const initialBootcampSessions: BootcampSession[] = [
  {
    id: 'bootcamp-ai-prompting',
    title: 'Generative AI & Agentic Workflows 1-Day Masterclass',
    description: 'A hands-on intensive session breaking down prompt engineering, LLM orchestration, and building autonomous AI coding assistants from scratch with live demos.',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
    sessionType: '1-Day Intensive',
    date: 'Saturday, Oct 10, 2026',
    time: '6:00 PM - 9:30 PM (BST)',
    duration: '3.5 Hours',
    venue: 'Online / Google Meet',
    platform: 'Google Meet',
    speakerName: 'Dr. Tanvir Ahmed',
    speakerTitle: 'Lead AI Research Engineer @ Google DeepMind Fellow',
    speakerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    speakerBio: 'Over 8 years building large-scale deep learning models and agentic developer platforms.',
    fees: 'Free',
    isFree: true,
    category: 'AI & ML',
    tags: ['Generative AI', 'Agents', 'LLM', 'Hands-on'],
    maxSeats: 150,
    registeredCount: 114,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bootcamp-react-nextjs-perf',
    title: 'Next.js 15 & High Performance React: 2-Day Weekend Sprint',
    description: 'Deep dive into React Server Components, Server Actions, Edge Caching, and Core Web Vitals optimization. Build and deploy a production SaaS app.',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80',
    sessionType: '2-Day Weekend Workshop',
    date: 'Oct 17 - 18, 2026 (Sat & Sun)',
    time: '3:00 PM - 7:00 PM (BST)',
    duration: '8 Hours (2 Days)',
    venue: 'Online / Zoom & Discord Lab',
    platform: 'Zoom',
    speakerName: 'Farhana Kabir',
    speakerTitle: 'Staff Frontend Architect @ Silicon Valley Tech',
    speakerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    speakerBio: 'Ex-Meta frontend specialist who architected micro-frontends serving millions of daily requests.',
    fees: '৳500 / $5',
    isFree: false,
    category: 'Web Development',
    tags: ['React 19', 'Next.js', 'Performance', 'SSR'],
    maxSeats: 80,
    registeredCount: 62,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bootcamp-photography-lighting',
    title: 'Visual Storytelling & Cinematic Photography Lighting Masterclass',
    description: 'Master studio lighting setups, color grading in Lightroom, and visual composition for portrait and product photography in a physical interactive session.',
    coverImage: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80',
    sessionType: '1-Day Intensive',
    date: 'Friday, Oct 23, 2026',
    time: '2:30 PM - 6:30 PM (BST)',
    duration: '4 Hours',
    venue: 'Studio Lumen, Gulshan 2, Dhaka / Hybrid Streaming',
    platform: 'On-Site / Physical',
    speakerName: 'Arafat Rahman',
    speakerTitle: 'Award-winning National Geographic Contributor',
    speakerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    speakerBio: 'Over a decade of international documentary and editorial photography experience.',
    fees: '৳800 (On-site kit included)',
    isFree: false,
    category: 'Photography',
    tags: ['Lighting', 'Composition', 'Lightroom', 'Studio Work'],
    maxSeats: 35,
    registeredCount: 29,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bootcamp-uiux-figma-tokens',
    title: 'Figma Design Systems & Auto-Layout 3.0 Workshop',
    description: 'Learn how to architect enterprise design systems with Figma variables, tokens, accessible color palettes, and component variants that map 1:1 to code.',
    coverImage: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1200&q=80',
    sessionType: '1-Day Intensive',
    date: 'Wednesday, Oct 28, 2026',
    time: '7:00 PM - 9:30 PM (BST)',
    duration: '2.5 Hours',
    venue: 'Online / Microsoft Teams',
    platform: 'Microsoft Teams',
    speakerName: 'Nusrat Jahan',
    speakerTitle: 'Head of Product Design @ FinTech Innovations',
    speakerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    speakerBio: 'Designs mission-critical banking and fintech interfaces trusted by 2M+ users.',
    fees: 'Free',
    isFree: true,
    category: 'Design',
    tags: ['Figma', 'Design System', 'UI/UX', 'Tokens'],
    maxSeats: 200,
    registeredCount: 168,
    createdAt: new Date().toISOString(),
  }
];

const STORAGE_KEY = 'skillswap_bootcamp_sessions';
const REGISTERED_KEY = 'skillswap_registered_bootcamps';

export const bootcampSessionService = {
  getAll: (): BootcampSession[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const registeredIds: string[] = JSON.parse(localStorage.getItem(REGISTERED_KEY) || '[]');
      let list: BootcampSession[] = stored ? JSON.parse(stored) : initialBootcampSessions;
      
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBootcampSessions));
      }

      return list.map((item) => ({
        ...item,
        isRegistered: registeredIds.includes(item.id),
      }));
    } catch {
      return initialBootcampSessions;
    }
  },

  getById: (id: string): BootcampSession | undefined => {
    const list = bootcampSessionService.getAll();
    return list.find((b) => b.id === id);
  },

  create: (session: Omit<BootcampSession, 'id' | 'createdAt' | 'registeredCount'>): BootcampSession => {
    const list = bootcampSessionService.getAll();
    const newSession: BootcampSession = {
      ...session,
      id: `bootcamp-${Date.now()}`,
      registeredCount: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [newSession, ...list];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newSession;
  },

  update: (id: string, updates: Partial<BootcampSession>): BootcampSession | null => {
    const list = bootcampSessionService.getAll();
    const index = list.findIndex((b) => b.id === id);
    if (index === -1) return null;
    const updatedSession = { ...list[index], ...updates };
    list[index] = updatedSession;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return updatedSession;
  },

  delete: (id: string): boolean => {
    const list = bootcampSessionService.getAll();
    const filtered = list.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  toggleRegistration: (id: string): boolean => {
    try {
      const registeredIds: string[] = JSON.parse(localStorage.getItem(REGISTERED_KEY) || '[]');
      const isRegistered = registeredIds.includes(id);
      let updatedIds: string[];
      
      const list = bootcampSessionService.getAll();
      const target = list.find((b) => b.id === id);

      if (isRegistered) {
        updatedIds = registeredIds.filter((item) => item !== id);
        if (target && target.registeredCount > 0) {
          target.registeredCount -= 1;
        }
      } else {
        updatedIds = [...registeredIds, id];
        if (target) {
          target.registeredCount += 1;
        }
      }

      localStorage.setItem(REGISTERED_KEY, JSON.stringify(updatedIds));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return !isRegistered;
    } catch {
      return false;
    }
  }
};
