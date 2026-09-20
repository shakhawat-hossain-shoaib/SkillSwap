import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import {
  type CommunityGroup,
  type CommunityPost,
  communityService,
} from '../../services/communityService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import toast from 'react-hot-toast';
import {
  Users2,
  MessageSquare,
  Heart,
  Share2,
  Plus,
  Search,
  Send,
  Shield,
  Hash,
  X,
  Compass,
} from 'lucide-react';

export function CommunityPage() {
  const { user } = useAuth();

  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // New Post Form State
  const [isPosting, setIsPosting] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postTargetGroup, setPostTargetGroup] = useState('');
  const [postTag, setPostTag] = useState('');

  // Comment input per post state { [postId]: string }
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  // Create Group Modal State
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState<CommunityGroup['category']>('Programming');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupIcon, setNewGroupIcon] = useState('💬');
  const [newGroupCover, setNewGroupCover] = useState('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80');

  const refreshData = () => {
    const allGroups = communityService.getGroups();
    setGroups(allGroups);
    if (!postTargetGroup && allGroups.length > 0) {
      setPostTargetGroup(allGroups[0].id);
    }
    const allPosts = communityService.getPosts(selectedGroupId === 'all' ? undefined : selectedGroupId);
    setPosts(allPosts);
  };

  useEffect(() => {
    refreshData();
  }, [selectedGroupId]);

  const activeGroup = groups.find((g) => g.id === selectedGroupId);

  const handleToggleJoin = (groupId: string, groupName: string) => {
    const joined = communityService.toggleJoinGroup(groupId);
    toast.success(joined ? `Joined "${groupName}" 🎉` : `Left "${groupName}".`);
    refreshData();
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      toast.error('Please enter a post title and message');
      return;
    }

    const targetGrp = groups.find((g) => g.id === postTargetGroup) || groups[0];
    if (!targetGrp) {
      toast.error('Please select a community group');
      return;
    }

    communityService.createPost({
      communityId: targetGrp.id,
      communityName: targetGrp.name,
      authorName: user?.fullName || 'Community Member',
      authorAvatar: user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : 'ME',
      authorEmail: user?.email,
      title: postTitle.trim(),
      content: postContent.trim(),
      tag: postTag.trim() || targetGrp.category,
    });

    setPostTitle('');
    setPostContent('');
    setPostTag('');
    setIsPosting(false);
    toast.success('Your post has been published to the community! 🚀');
    refreshData();
  };

  const handleLikePost = (postId: string) => {
    communityService.toggleLikePost(postId);
    refreshData();
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    communityService.addComment(postId, {
      authorName: user?.fullName || 'SkillSwap Member',
      authorAvatar: user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : 'ME',
      authorEmail: user?.email,
      content: text,
    });

    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
    toast.success('Comment posted!');
    refreshData();
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupDescription.trim()) {
      toast.error('Please enter group name and description');
      return;
    }

    const created = communityService.createGroup({
      name: newGroupName.trim(),
      slug: newGroupName.toLowerCase().replace(/\s+/g, '-'),
      description: newGroupDescription.trim(),
      category: newGroupCategory,
      icon: newGroupIcon || '💬',
      coverImage: newGroupCover,
      rules: [
        'Be respectful and support all fellow peers.',
        'Share high quality learning resources.',
        'Keep conversations on topic.',
      ],
    });

    toast.success(`Community "${created.name}" created! 🎊`);
    setIsCreateGroupOpen(false);
    setNewGroupName('');
    setNewGroupDescription('');
    setSelectedGroupId(created.id);
    refreshData();
  };

  const categories = [
    'All',
    'Programming',
    'Design',
    'Photography',
    'Data Science & AI',
    'Languages',
  ];

  const filteredGroups = groups.filter((g) => {
    const matchesCategory = selectedCategory === 'All' || g.category === selectedCategory;
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      {/* Page Header Banner */}
      <div className="mb-6 bg-gradient-to-r from-slate-900 via-primary-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-3">
              <Users2 className="h-4 w-4 text-indigo-400" /> SkillSwap Community Hubs
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white mb-2">
              Join Communities & Peer Groups
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Connect with fellow developers, designers, photographers, and learners in dedicated niche groups. Ask questions, showcase projects, and exchange knowledge!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              onClick={() => setIsCreateGroupOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Community Group
            </Button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Community Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Community Navigation & Groups (4 Cols on LG) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Groups Directory Card */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary-600" /> Communities ({groups.length})
              </h2>
              <button
                onClick={() => setSelectedGroupId('all')}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                  selectedGroupId === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                All Feeds
              </button>
            </div>

            {/* Search within groups */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
              />
            </div>

            {/* Group Category filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {categories.slice(0, 4).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Group Items List */}
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {filteredGroups.map((group) => {
                const isSelected = selectedGroupId === group.id;
                return (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-primary-50/80 border-primary-300 shadow-xs'
                        : 'bg-gray-50/50 border-gray-100 hover:bg-gray-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xl flex-shrink-0 shadow-xs select-none">
                        {group.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-900 truncate">
                          {group.name}
                        </div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-2 mt-0.5">
                          <span>{group.category}</span>
                          <span>•</span>
                          <span>{group.memberCount} members</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleJoin(group.id, group.name);
                      }}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all flex-shrink-0 ${
                        group.isJoined
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-rose-100 hover:text-rose-800'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {group.isJoined ? 'Joined' : '+ Join'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group Guidelines / Community Rules */}
          {activeGroup && (
            <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
                <Shield className="h-4 w-4 text-indigo-600" /> Group Guidelines
              </div>
              <ul className="text-xs text-gray-600 space-y-2">
                {activeGroup.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="h-4 w-4 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Active Feed & Discussions (8 Cols on LG) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Group Banner (if a specific group is picked) */}
          {activeGroup && (
            <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs">
              <div className="relative h-32 w-full bg-slate-900">
                <img
                  src={activeGroup.coverImage}
                  alt={activeGroup.name}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl select-none">{activeGroup.icon}</span>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold font-display">{activeGroup.name}</h2>
                      <p className="text-[11px] text-slate-300">
                        {activeGroup.memberCount} members • {activeGroup.category}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleToggleJoin(activeGroup.id, activeGroup.name)}
                    className={`text-xs font-bold rounded-xl ${
                      activeGroup.isJoined
                        ? 'bg-white/20 text-white hover:bg-rose-600'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {activeGroup.isJoined ? 'Joined' : 'Join Group'}
                  </Button>
                </div>
              </div>
              <div className="p-4 text-xs text-gray-600 bg-gray-50/50">
                {activeGroup.description}
              </div>
            </div>
          )}

          {/* Create Post Box */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-xs select-none shadow-xs">
                {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : 'ME'}
              </div>
              <div
                onClick={() => setIsPosting(true)}
                className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-200/80 text-xs text-gray-500 cursor-pointer transition-colors"
              >
                {isPosting
                  ? 'Share your question or project with the community...'
                  : `Start a discussion in ${activeGroup ? activeGroup.name : 'any community'}...`}
              </div>
            </div>

            {/* Expanded Post Form */}
            {isPosting && (
              <form onSubmit={handleCreatePost} className="space-y-3 pt-2 border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-600">Post in Group</label>
                    <select
                      value={postTargetGroup}
                      onChange={(e) => setPostTargetGroup(e.target.value)}
                      className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.icon} {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-600">Topic Tag</label>
                    <Input
                      placeholder="e.g. FastAPI, Lighting, React19, UI Teardown"
                      value={postTag}
                      onChange={(e) => setPostTag(e.target.value)}
                      className="text-xs h-9 bg-gray-50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600">Discussion Title</label>
                  <Input
                    placeholder="What would you like to ask or share?"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    required
                    className="text-xs h-9 bg-gray-50 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600">Message & Details</label>
                  <textarea
                    rows={4}
                    placeholder="Share your experience, code snippets, questions, or project links..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    required
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPosting(false)}
                    className="text-xs text-gray-500"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" /> Post to Community
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Posts Feed List */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300 p-8 shadow-xs">
                <div className="h-14 w-14 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1">No discussions yet</h3>
                <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
                  Be the first to start a conversation in this community group!
                </p>
                <Button
                  size="sm"
                  onClick={() => setIsPosting(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Create First Post
                </Button>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const isExpanded = expandedComments[post.id] || false;
                const commentCount = post.comments?.length || 0;

                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-xs space-y-4 transition-all hover:border-gray-300"
                  >
                    {/* Post Author Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                          {post.authorAvatar}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                            <span>{post.authorName}</span>
                            <span className="text-[10px] text-gray-400 font-normal">• {post.createdAt}</span>
                          </div>
                          <div className="text-[11px] text-primary-600 font-semibold flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {post.communityName}
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold">
                        #{post.tag}
                      </span>
                    </div>

                    {/* Post Content */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>
                    </div>

                    {/* Likes & Comments Counters & Actions */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center gap-1.5 font-semibold transition-colors ${
                            post.likedByMe
                              ? 'text-rose-600'
                              : 'text-gray-500 hover:text-rose-600'
                          }`}
                        >
                          <Heart
                            className={`h-4 w-4 ${post.likedByMe ? 'fill-rose-600' : ''}`}
                          />
                          <span>{post.likes} {post.likes === 1 ? 'Like' : 'Likes'}</span>
                        </button>

                        <button
                          onClick={() =>
                            setExpandedComments((prev) => ({
                              ...prev,
                              [post.id]: !prev[post.id],
                            }))
                          }
                          className="flex items-center gap-1.5 font-semibold text-gray-500 hover:text-primary-600 transition-colors"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>{commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success('Post link copied to clipboard!');
                          }
                        }}
                        className="flex items-center gap-1 text-gray-400 hover:text-gray-700"
                        title="Share post"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Expandable Comments Section */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-gray-100 space-y-3 bg-gray-50/60 p-3 rounded-2xl">
                        {/* List of comments */}
                        {post.comments && post.comments.length > 0 ? (
                          <div className="space-y-2">
                            {post.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="p-2.5 rounded-xl bg-white border border-gray-100 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-gray-900 text-[11px]">
                                    {comment.authorName}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {comment.createdAt}
                                  </span>
                                </div>
                                <p className="text-gray-700 leading-snug text-[11px]">
                                  {comment.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-gray-400 text-center py-2">
                            No comments yet. Write the first response!
                          </p>
                        )}

                        {/* Add comment input */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Write a helpful response..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post.id);
                            }}
                            className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddComment(post.id)}
                            className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl"
                          >
                            Reply
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 text-gray-900 animate-fadeIn">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600 text-white">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold">Create a New Community</h2>
                  <p className="text-xs text-slate-400">
                    Create a hub for members interested in a shared skill.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateGroupOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="text-xs font-bold text-gray-700">Icon</label>
                  <Input
                    value={newGroupIcon}
                    onChange={(e) => setNewGroupIcon(e.target.value)}
                    placeholder="🐍"
                    className="text-center text-lg h-10"
                  />
                </div>
                <div className="col-span-3 space-y-1">
                  <label className="text-xs font-bold text-gray-700">Community Name *</label>
                  <Input
                    placeholder="e.g. Flutter Mobile Developers"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    required
                    className="text-xs h-10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Category</label>
                <select
                  value={newGroupCategory}
                  onChange={(e) => setNewGroupCategory(e.target.value as any)}
                  className="w-full h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="Photography">Photography</option>
                  <option value="Data Science & AI">Data Science & AI</option>
                  <option value="Languages">Languages</option>
                  <option value="Career">Career</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Description & Purpose</label>
                <textarea
                  rows={3}
                  placeholder="What is this community group about? Who should join?"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  required
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Cover Image URL</label>
                <Input
                  placeholder="https://..."
                  value={newGroupCover}
                  onChange={(e) => setNewGroupCover(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreateGroupOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl"
                >
                  Create Community
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
