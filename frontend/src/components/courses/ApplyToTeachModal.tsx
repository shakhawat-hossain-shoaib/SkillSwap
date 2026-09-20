import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { teacherApplicationService } from '../../services/teacherApplicationService';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import toast from 'react-hot-toast';
import {
  X,
  GraduationCap,
  Sparkles,
  BookOpen,
  User,
  Mail,
  Phone,
  Layers,
  Send,
  CheckCircle2,
} from 'lucide-react';

interface ApplyToTeachModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ApplyToTeachModal({ isOpen, onClose, onSuccess }: ApplyToTeachModalProps) {
  const { user } = useAuth();

  const [applicantName, setApplicantName] = useState(user?.fullName || '');
  const [applicantEmail, setApplicantEmail] = useState(user?.email || '');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [proposedCourseTitle, setProposedCourseTitle] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [targetLevel, setTargetLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'>('Beginner');
  const [expectedDuration, setExpectedDuration] = useState('4-6 Weeks');
  const [courseOutline, setCourseOutline] = useState('');
  const [teachingExperience, setTeachingExperience] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantEmail.trim() || !proposedCourseTitle.trim()) {
      toast.error('Please fill in your name, email, and proposed course title');
      return;
    }

    setIsSubmitting(true);
    try {
      teacherApplicationService.submit({
        applicantName: applicantName.trim(),
        applicantEmail: applicantEmail.trim(),
        applicantPhone: applicantPhone.trim() || 'Not provided',
        proposedCourseTitle: proposedCourseTitle.trim(),
        category,
        targetLevel,
        expectedDuration,
        courseOutline: courseOutline.trim() || 'Course overview discussed during admin onboarding review.',
        teachingExperience: teachingExperience.trim() || 'Peer instructor passionate about skill sharing.',
        portfolioUrl: portfolioUrl.trim(),
      });

      setIsSubmittedSuccess(true);
      toast.success('Your teacher application has been submitted to Admin! 🚀');
      if (onSuccess) onSuccess();
    } catch {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmittedSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden text-gray-900 border border-gray-100 animate-fadeIn">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-primary-900 via-primary-800 to-accent-900 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-accent-300 border border-white/10 shadow-xs">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold font-display">Apply to Teach a Course</h2>
                <span className="px-2 py-0.5 rounded-full bg-accent-400/20 text-accent-200 border border-accent-400/30 text-[10px] font-bold">
                  I Want to Teach
                </span>
              </div>
              <p className="text-xs text-primary-100">
                Share your expertise with the SkillSwap community. Admin will review and reach out to you!
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-primary-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isSubmittedSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Application Submitted! 🎉</h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              Thank you, <strong>{applicantName}</strong>! Your proposal for <strong>"{proposedCourseTitle}"</strong> has been forwarded to the SkillSwap admin team.
            </p>
            <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 text-xs text-primary-800 max-w-md mx-auto text-left space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary-600" /> Next Steps:
              </p>
              <p className="text-gray-600">
                1. Our team will review your outline and syllabus structure.
              </p>
              <p className="text-gray-600">
                2. An admin will contact you at <strong>{applicantEmail}</strong> or via phone to schedule an onboarding call.
              </p>
            </div>
            <Button onClick={handleResetAndClose} className="px-8 py-2.5 rounded-xl text-xs font-bold">
              Got it, close modal
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
            {/* Applicant Information */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary-600" /> Instructor Information
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Full Name *</label>
                  <Input
                    placeholder="Your Full Name"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    required
                    className="text-xs h-9 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                    <Mail className="h-3 w-3 text-gray-400" /> Contact Email *
                  </label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    required
                    className="text-xs h-9 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-gray-400" /> Phone / WhatsApp
                  </label>
                  <Input
                    placeholder="+880 1XXXXXXXXX"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="text-xs h-9 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Portfolio / GitHub / LinkedIn</label>
                  <Input
                    placeholder="https://..."
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="text-xs h-9 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Proposed Course Details */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary-600" /> Proposed Course Proposal
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-gray-700">Proposed Course Title *</label>
                  <Input
                    placeholder="e.g. Master Clean Code in Python & Django"
                    value={proposedCourseTitle}
                    onChange={(e) => setProposedCourseTitle(e.target.value)}
                    required
                    className="text-xs h-9 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Design">Design</option>
                    <option value="Mobile Dev">Mobile Dev</option>
                    <option value="DevOps & Cloud">DevOps & Cloud</option>
                    <option value="Languages">Languages</option>
                    <option value="Photography">Photography</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Target Skill Level</label>
                  <select
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value as any)}
                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Estimated Duration</label>
                  <select
                    value={expectedDuration}
                    onChange={(e) => setExpectedDuration(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="2-3 Weeks">2-3 Weeks (Quick Track)</option>
                    <option value="4-6 Weeks">4-6 Weeks (Comprehensive)</option>
                    <option value="8-10 Weeks">8-10 Weeks (Deep Masterclass)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-primary-600" /> Syllabus & Course Outline
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline the core modules, what students will build, and hands-on assignments included in this course."
                  value={courseOutline}
                  onChange={(e) => setCourseOutline(e.target.value)}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Your Experience & Background</label>
                <textarea
                  rows={2}
                  placeholder="Tell us about your industry experience or past tutoring/mentoring experience."
                  value={teachingExperience}
                  onChange={(e) => setTeachingExperience(e.target.value)}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" size="sm" onClick={handleResetAndClose} className="text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-6 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Send className="h-3.5 w-3.5" />
                {isSubmitting ? 'Submitting...' : 'Submit Application to Admin'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
