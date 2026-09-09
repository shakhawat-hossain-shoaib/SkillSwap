import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Button } from '../../components/common/Button';
import api from '../../lib/axios';
import {
  User as UserIcon,
  Mail,
  Globe,
  Plus,
  Trash2,
  Save,
  ShieldCheck,
  Award,
  BookOpen,
  Repeat,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SkillItem {
  userSkillId?: number;
  skillName: string;
  typeTag: 'Teach' | 'Learn';
  proficiencyLevel: string;
}

export function ProfilePage() {
  const { user, refreshUser } = useAuth();

  // Profile fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bioDetails, setBioDetails] = useState(user?.bioDetails || '');
  const [portfolioLinks, setPortfolioLinks] = useState(user?.portfolioLinks || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Skills
  const [canTeachSkills, setCanTeachSkills] = useState<SkillItem[]>([]);
  const [wantsToLearnSkills, setWantsToLearnSkills] = useState<SkillItem[]>([]);
  const [newTeachSkill, setNewTeachSkill] = useState('');
  const [newTeachLevel, setNewTeachLevel] = useState('Intermediate');
  const [newLearnSkill, setNewLearnSkill] = useState('');
  const [newLearnLevel, setNewLearnLevel] = useState('Beginner');
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // Sync user state on load
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setBioDetails(user.bioDetails || '');
      setPortfolioLinks(user.portfolioLinks || '');
    }
  }, [user]);

  // Load skills from database
  useEffect(() => {
    loadSkills();
  }, []);

  async function loadSkills() {
    try {
      const res = await api.get('/profile/me/skills');
      const data = res.data?.data || res.data;
      if (data?.canTeach) {
        setCanTeachSkills(
          data.canTeach.map((s: any) => ({
            userSkillId: s.userSkillId,
            skillName: s.skillName,
            typeTag: 'Teach',
            proficiencyLevel: s.proficiencyLevel || 'Intermediate',
          }))
        );
      }
      if (data?.wantsToLearn) {
        setWantsToLearnSkills(
          data.wantsToLearn.map((s: any) => ({
            userSkillId: s.userSkillId,
            skillName: s.skillName,
            typeTag: 'Learn',
            proficiencyLevel: s.proficiencyLevel || 'Beginner',
          }))
        );
      }
    } catch (err) {
      console.warn('Could not load skills from API:', err);
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    setIsSavingProfile(true);
    try {
      await api.put('/profile/me', {
        fullName: fullName.trim(),
        bioDetails: bioDetails.trim(),
        portfolioLinks: portfolioLinks.trim(),
      });
      await refreshUser();
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddSkill = async (type: 'Teach' | 'Learn') => {
    const skillName = type === 'Teach' ? newTeachSkill.trim() : newLearnSkill.trim();
    const proficiencyLevel = type === 'Teach' ? newTeachLevel : newLearnLevel;

    if (!skillName) {
      toast.error('Please enter a skill name');
      return;
    }

    setIsAddingSkill(true);
    try {
      await api.post('/profile/me/skills', {
        skillName,
        skillType: type === 'Teach' ? 'CanTeach' : 'WantsToLearn',
        typeTag: type === 'Teach' ? 'Teach' : 'Learn',
        proficiencyLevel,
      });

      if (type === 'Teach') {
        setNewTeachSkill('');
      } else {
        setNewLearnSkill('');
      }

      await loadSkills();
      await refreshUser();
      toast.success(`Added "${skillName}" to ${type === 'Teach' ? 'Skills You Teach' : 'Skills You Want to Learn'}`);
    } catch (err) {
      console.error('Error adding skill:', err);
      toast.error('Failed to add skill');
    } finally {
      setIsAddingSkill(false);
    }
  };

  const handleDeleteSkill = async (userSkillId?: number, skillName?: string) => {
    if (!userSkillId) return;

    try {
      await api.delete(`/profile/me/skills/${userSkillId}`);
      await loadSkills();
      await refreshUser();
      toast.success(`Removed "${skillName || 'Skill'}"`);
    } catch (err) {
      console.error('Error deleting skill:', err);
      toast.error('Failed to remove skill');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto pb-12">
        {/* Profile Banner / Header Card */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-primary-100/40 via-accent-50/30 to-transparent rounded-bl-full pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
            {/* Avatar Circle */}
            <div className="relative">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-3xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white font-extrabold text-2xl md:text-3xl shadow-md shadow-primary-600/20 select-none">
                {fullName ? fullName.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" title="Active member" />
            </div>

            {/* Meta details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1.5">
                <h1 className="font-display font-extrabold text-2xl md:text-3xl text-gray-900 truncate">
                  {fullName || 'Member Profile'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent-100 text-accent-800">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified Swapper
                </span>
              </div>

              <p className="text-gray-500 text-sm flex items-center gap-1.5 mb-3">
                <Mail className="h-4 w-4 text-gray-400" />
                {user?.email || (user as any)?.emailAddress || 'Registered User'}
              </p>

              {/* Stats badges */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 font-semibold text-gray-700 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span>Trust Rating: <strong>{(user?.trustRating || 5.0).toFixed(1)} / 5.0</strong></span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 font-semibold text-gray-700 flex items-center gap-1.5">
                  <Repeat className="h-4 w-4 text-primary-600" />
                  <span>Skills Offered: <strong>{canTeachSkills.length}</strong></span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 font-semibold text-gray-700 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-accent-600" />
                  <span>Learning Goals: <strong>{wantsToLearnSkills.length}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Section: Left Edit Form, Right Skills Manager */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Personal Information Edit Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2 rounded-xl bg-primary-50 text-primary-600">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-gray-900">Personal Information</h2>
                <p className="text-gray-500 text-xs">Update your public profile details and bio</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium text-gray-900"
                  />
                </div>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Email Address <span className="text-gray-400 font-normal">(Account Login)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || (user as any)?.emailAddress || ''}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100/80 border border-gray-200 rounded-xl text-sm text-gray-500 font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Bio Details */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  About Me / Bio
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={bioDetails}
                    onChange={(e) => setBioDetails(e.target.value)}
                    placeholder="Introduce yourself, your background, experience, and why you love peer skill swapping..."
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium text-gray-900 leading-relaxed"
                  />
                </div>
              </div>

              {/* Portfolio / Links */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Portfolio / GitHub / LinkedIn Links
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={portfolioLinks}
                    onChange={(e) => setPortfolioLinks(e.target.value)}
                    placeholder="e.g. github.com/username, linkedin.com/in/username"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium text-gray-900"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="cta"
                  disabled={isSavingProfile}
                  className="w-full sm:w-auto px-6 py-2.5 font-bold text-sm shadow-xs flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column: Skills & Swap Management (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Skills I Can Teach */}
            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <Repeat className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-gray-900">Skills I Teach</h3>
                    <p className="text-[11px] text-gray-400">Offer to peers</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                  {canTeachSkills.length}
                </span>
              </div>

              {/* Skill list */}
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
                {canTeachSkills.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2 text-center">No skills added yet.</p>
                ) : (
                  canTeachSkills.map((skill) => (
                    <div
                      key={skill.userSkillId || skill.skillName}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs"
                    >
                      <div>
                        <span className="font-bold text-gray-900">{skill.skillName}</span>
                        <span className="ml-2 text-[10px] text-gray-500 font-medium px-1.5 py-0.5 rounded bg-white border border-gray-200">
                          {skill.proficiencyLevel}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSkill(skill.userSkillId, skill.skillName)}
                        className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove skill"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Teach Skill */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. React, Python"
                  value={newTeachSkill}
                  onChange={(e) => setNewTeachSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill('Teach'))}
                  className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                />
                <select
                  value={newTeachLevel}
                  onChange={(e) => setNewTeachLevel(e.target.value)}
                  className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none font-medium"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddSkill('Teach')}
                  disabled={isAddingSkill}
                  className="p-2 h-auto"
                  title="Add Skill"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Skills I Want to Learn */}
            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-gray-900">Skills I Want to Learn</h3>
                    <p className="text-[11px] text-gray-400">Match with mentors</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                  {wantsToLearnSkills.length}
                </span>
              </div>

              {/* Skill list */}
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
                {wantsToLearnSkills.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2 text-center">No skills added yet.</p>
                ) : (
                  wantsToLearnSkills.map((skill) => (
                    <div
                      key={skill.userSkillId || skill.skillName}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs"
                    >
                      <div>
                        <span className="font-bold text-gray-900">{skill.skillName}</span>
                        <span className="ml-2 text-[10px] text-gray-500 font-medium px-1.5 py-0.5 rounded bg-white border border-gray-200">
                          {skill.proficiencyLevel}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSkill(skill.userSkillId, skill.skillName)}
                        className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove skill"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Learn Skill */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Machine Learning, Figma"
                  value={newLearnSkill}
                  onChange={(e) => setNewLearnSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill('Learn'))}
                  className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                />
                <select
                  value={newLearnLevel}
                  onChange={(e) => setNewLearnLevel(e.target.value)}
                  className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none font-medium"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddSkill('Learn')}
                  disabled={isAddingSkill}
                  className="p-2 h-auto"
                  title="Add Skill"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
