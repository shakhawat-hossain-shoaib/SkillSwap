export interface CommunityComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorEmail?: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  communityName: string;
  authorName: string;
  authorAvatar: string;
  authorEmail?: string;
  title: string;
  content: string;
  tag: string;
  likes: number;
  likedByMe?: boolean;
  comments: CommunityComment[];
  createdAt: string;
}

export interface CommunityGroup {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'Programming' | 'Design' | 'Photography' | 'Data Science & AI' | 'Languages' | 'Career';
  icon: string;
  coverImage: string;
  memberCount: number;
  isJoined?: boolean;
  rules: string[];
  createdAt: string;
}

const GROUPS_KEY = 'skillswap_community_groups';
const POSTS_KEY = 'skillswap_community_posts';
const JOINED_KEY = 'skillswap_joined_communities';

const initialGroups: CommunityGroup[] = [
  {
    id: 'group-python',
    name: 'Python Learning Community',
    slug: 'python-learning-community',
    description: 'The ultimate space for Pythonistas of all levels! Share scripts, solve algorithmic challenges, discuss FastAPI/Django, and get help with debugging.',
    category: 'Programming',
    icon: '🐍',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    memberCount: 540,
    rules: [
      'Format your code snippets with backticks.',
      'Be respectful and constructive when reviewing code.',
      'No spamming commercial bootcamps without permission.'
    ],
    createdAt: '2026-01-10T00:00:00.000Z',
  },
  {
    id: 'group-photography',
    name: 'Photography & Visual Arts Community',
    slug: 'photography-community',
    description: 'Share your photography portfolios, critique compositions, exchange Lightroom presets, and arrange local photo-walks and gear swaps.',
    category: 'Photography',
    icon: '📸',
    coverImage: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80',
    memberCount: 385,
    rules: [
      'Include camera/lens EXIF data when asking for feedback.',
      'Original photography work only.',
      'Respect model privacy and copyright.'
    ],
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'group-react',
    name: 'React & Frontend Masters',
    slug: 'react-frontend-masters',
    description: 'Discussions around React 19, Next.js App Router, Tailwind CSS, performance optimization, state management, and frontend career growth.',
    category: 'Programming',
    icon: '⚛️',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    memberCount: 720,
    rules: [
      'Search before posting duplicate questions.',
      'Provide reproduction links (CodeSandbox/StackBlitz) when asking for bug fixes.'
    ],
    createdAt: '2026-01-20T00:00:00.000Z',
  },
  {
    id: 'group-design',
    name: 'UI/UX & Product Design Circle',
    slug: 'ui-ux-design-circle',
    description: 'Showcase your Figma UI prototypes, exchange design tokens, conduct user testing teardowns, and master interaction design.',
    category: 'Design',
    icon: '🎨',
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80',
    memberCount: 490,
    rules: [
      'Constructive feedback only.',
      'Credit inspiration and UI kits used.'
    ],
    createdAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: 'group-ai',
    name: 'Data Science & Generative AI Hub',
    slug: 'ai-data-science-hub',
    description: 'Explore machine learning algorithms, LLM fine-tuning, autonomous agent architectures, Pandas tricks, and AI research papers.',
    category: 'Data Science & AI',
    icon: '🧠',
    coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    memberCount: 610,
    rules: [
      'Cite research sources and paper links.',
      'Disclose AI-generated responses.'
    ],
    createdAt: '2026-02-10T00:00:00.000Z',
  },
  {
    id: 'group-language',
    name: 'Language & Culture Exchange Lounge',
    slug: 'language-exchange-lounge',
    description: 'Practice speaking English, German, Japanese, Bengali, and French. Connect with native speakers for 1-on-1 audio chats and language tandem barter.',
    category: 'Languages',
    icon: '🌍',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    memberCount: 310,
    rules: [
      'Encourage all learner skill levels.',
      'Keep discussions polite and friendly.'
    ],
    createdAt: '2026-02-15T00:00:00.000Z',
  }
];

const initialPosts: CommunityPost[] = [
  {
    id: 'post-1',
    communityId: 'group-python',
    communityName: 'Python Learning Community',
    authorName: 'Tanvir Hossain',
    authorAvatar: 'TH',
    title: 'How do you structure FastAPI microservices with SQLAlchemy 2.0 Async?',
    content: "Hey everyone! I've been refactoring our monolithic service to asynchronous FastAPI with Pydantic v2 and async session makers. Here is the pattern I've found to give the lowest latency:\n\n```python\n@asynccontextmanager\nasync def get_db_session():\n    async with AsyncSessionLocal() as session:\n        yield session\n```\nWhat repository pattern or dependency injection strategy do you prefer for large codebases?",
    tag: 'FastAPI',
    likes: 24,
    comments: [
      {
        id: 'c-1',
        authorName: 'Siam Ahmed',
        authorAvatar: 'SA',
        content: 'We use the Unit of Work pattern combined with Dependency Injection in FastAPI. Works wonders when coordinating multiple repositories in a single transaction!',
        createdAt: '2 hours ago'
      },
      {
        id: 'c-2',
        authorName: 'Nafis Iqbal',
        authorAvatar: 'NI',
        content: 'Make sure you configure connection pool size (`pool_size=20, max_overflow=10`) if hosting behind high concurrency.',
        createdAt: '1 hour ago'
      }
    ],
    createdAt: '4 hours ago'
  },
  {
    id: 'post-2',
    communityId: 'group-photography',
    communityName: 'Photography & Visual Arts Community',
    authorName: 'Mehnaz Chowdhury',
    authorAvatar: 'MC',
    title: 'Sunset portraits with single speedlight + 90cm Octabox (Behind the scenes)',
    content: "Shot during golden hour in Dhanmondi Lake! Used high-speed sync at 1/1600s with Godox AD200 to darken the ambient sunset sky while keeping the subject crisp and illuminated. Color graded in Lightroom using teal-orange split toning. Would love feedback on the highlights!",
    tag: 'Lighting BTS',
    likes: 38,
    comments: [
      {
        id: 'c-3',
        authorName: 'Arafat Rahman',
        authorAvatar: 'AR',
        content: 'Stunning catchlight in the eyes! The falloff from the 90cm octabox gives very flattering skin tones.',
        createdAt: '3 hours ago'
      }
    ],
    createdAt: '6 hours ago'
  },
  {
    id: 'post-3',
    communityId: 'group-react',
    communityName: 'React & Frontend Masters',
    authorName: 'Rahim Al-Amin',
    authorAvatar: 'RA',
    title: 'Top 5 React 19 features you should start using in production',
    content: "React 19 brings some massive ergonomic upgrades:\n1. `use()` hook for promises and context\n2. Server Actions directly inside form actions\n3. `useActionState` and `useFormStatus`\n4. Native Document Metadata `<title>` and `<meta>` support\n5. Asset loading pre-warming.\n\nWho has already upgraded their projects?",
    tag: 'React 19',
    likes: 47,
    comments: [
      {
        id: 'c-4',
        authorName: 'Zubair Hossain',
        authorAvatar: 'ZH',
        content: 'The form action state management completely eliminates 80% of boilerplate useState hooks in form validations!',
        createdAt: '5 hours ago'
      }
    ],
    createdAt: '1 day ago'
  }
];

export const communityService = {
  getGroups: (): CommunityGroup[] => {
    try {
      const stored = localStorage.getItem(GROUPS_KEY);
      const joined: string[] = JSON.parse(localStorage.getItem(JOINED_KEY) || '["group-python", "group-photography"]');
      let list: CommunityGroup[] = stored ? JSON.parse(stored) : initialGroups;
      
      if (!stored) {
        localStorage.setItem(GROUPS_KEY, JSON.stringify(initialGroups));
        localStorage.setItem(JOINED_KEY, JSON.stringify(joined));
      }

      return list.map((g) => ({
        ...g,
        isJoined: joined.includes(g.id),
      }));
    } catch {
      return initialGroups;
    }
  },

  getGroupById: (idOrSlug: string): CommunityGroup | undefined => {
    const groups = communityService.getGroups();
    return groups.find((g) => g.id === idOrSlug || g.slug === idOrSlug);
  },

  toggleJoinGroup: (groupId: string): boolean => {
    try {
      const joined: string[] = JSON.parse(localStorage.getItem(JOINED_KEY) || '[]');
      const isJoined = joined.includes(groupId);
      let updated: string[];
      
      const groups = communityService.getGroups();
      const group = groups.find((g) => g.id === groupId);

      if (isJoined) {
        updated = joined.filter((id) => id !== groupId);
        if (group && group.memberCount > 0) group.memberCount -= 1;
      } else {
        updated = [...joined, groupId];
        if (group) group.memberCount += 1;
      }

      localStorage.setItem(JOINED_KEY, JSON.stringify(updated));
      localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
      return !isJoined;
    } catch {
      return false;
    }
  },

  createGroup: (newGroup: Omit<CommunityGroup, 'id' | 'memberCount' | 'createdAt'>): CommunityGroup => {
    const groups = communityService.getGroups();
    const created: CommunityGroup = {
      ...newGroup,
      id: `group-${Date.now()}`,
      memberCount: 1,
      isJoined: true,
      createdAt: new Date().toISOString(),
    };
    const updated = [created, ...groups];
    localStorage.setItem(GROUPS_KEY, JSON.stringify(updated));
    
    // Auto join created group
    const joined: string[] = JSON.parse(localStorage.getItem(JOINED_KEY) || '[]');
    if (!joined.includes(created.id)) {
      joined.push(created.id);
      localStorage.setItem(JOINED_KEY, JSON.stringify(joined));
    }

    return created;
  },

  getPosts: (communityId?: string): CommunityPost[] => {
    try {
      const stored = localStorage.getItem(POSTS_KEY);
      let list: CommunityPost[] = stored ? JSON.parse(stored) : initialPosts;
      if (!stored) {
        localStorage.setItem(POSTS_KEY, JSON.stringify(initialPosts));
      }
      if (communityId && communityId !== 'all') {
        return list.filter((p) => p.communityId === communityId);
      }
      return list;
    } catch {
      return initialPosts;
    }
  },

  createPost: (post: Omit<CommunityPost, 'id' | 'likes' | 'comments' | 'createdAt'>): CommunityPost => {
    const posts = communityService.getPosts();
    const created: CommunityPost = {
      ...post,
      id: `post-${Date.now()}`,
      likes: 0,
      comments: [],
      createdAt: 'Just now',
    };
    const updated = [created, ...posts];
    localStorage.setItem(POSTS_KEY, JSON.stringify(updated));
    return created;
  },

  toggleLikePost: (postId: string): boolean => {
    const posts = communityService.getPosts();
    const index = posts.findIndex((p) => p.id === postId);
    if (index === -1) return false;
    
    const post = posts[index];
    if (post.likedByMe) {
      post.likes = Math.max(0, post.likes - 1);
      post.likedByMe = false;
    } else {
      post.likes += 1;
      post.likedByMe = true;
    }
    
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    return !!post.likedByMe;
  },

  addComment: (postId: string, comment: Omit<CommunityComment, 'id' | 'createdAt'>): CommunityComment | null => {
    const posts = communityService.getPosts();
    const index = posts.findIndex((p) => p.id === postId);
    if (index === -1) return null;

    const newComment: CommunityComment = {
      ...comment,
      id: `c-${Date.now()}`,
      createdAt: 'Just now',
    };

    posts[index].comments = [...(posts[index].comments || []), newComment];
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    return newComment;
  }
};
