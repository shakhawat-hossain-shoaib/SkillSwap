import { useState, useEffect, useRef } from 'react';
import { type BootcampSession, bootcampSessionService } from '../../services/bootcampSessionService';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import toast from 'react-hot-toast';
import {
  X,
  Upload,
  Image as ImageIcon,
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  DollarSign,
  Tag,
  Sparkles,
} from 'lucide-react';

interface CreateBootcampPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sessionToEdit?: BootcampSession | null;
}

export function CreateBootcampPostModal({
  isOpen,
  onClose,
  onSuccess,
  sessionToEdit,
}: CreateBootcampPostModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [sessionType, setSessionType] = useState<BootcampSession['sessionType']>('1-Day Intensive');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [venue, setVenue] = useState('');
  const [platform, setPlatform] = useState<BootcampSession['platform']>('Google Meet');
  const [speakerName, setSpeakerName] = useState('');
  const [speakerTitle, setSpeakerTitle] = useState('');
  const [speakerAvatar, setSpeakerAvatar] = useState('');
  const [speakerBio, setSpeakerBio] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [fees, setFees] = useState('Free');
  const [category, setCategory] = useState<BootcampSession['category']>('Web Development');
  const [tagsInput, setTagsInput] = useState('');
  const [maxSeats, setMaxSeats] = useState(100);
  const [meetingLink, setMeetingLink] = useState('');

  useEffect(() => {
    if (sessionToEdit) {
      setTitle(sessionToEdit.title);
      setDescription(sessionToEdit.description);
      setCoverImage(sessionToEdit.coverImage);
      setSessionType(sessionToEdit.sessionType);
      setDate(sessionToEdit.date);
      setTime(sessionToEdit.time);
      setDuration(sessionToEdit.duration);
      setVenue(sessionToEdit.venue);
      setPlatform(sessionToEdit.platform);
      setSpeakerName(sessionToEdit.speakerName);
      setSpeakerTitle(sessionToEdit.speakerTitle);
      setSpeakerAvatar(sessionToEdit.speakerAvatar);
      setSpeakerBio(sessionToEdit.speakerBio);
      setIsFree(sessionToEdit.isFree);
      setFees(sessionToEdit.fees);
      setCategory(sessionToEdit.category);
      setTagsInput(sessionToEdit.tags?.join(', ') || '');
      setMaxSeats(sessionToEdit.maxSeats || 100);
      setMeetingLink(sessionToEdit.meetingLink || '');
    } else {
      // Defaults for a new post
      setTitle('');
      setDescription('');
      setCoverImage('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80');
      setSessionType('1-Day Intensive');
      setDate('Saturday, Nov 14, 2026');
      setTime('6:00 PM - 9:00 PM (BST)');
      setDuration('3 Hours');
      setVenue('Online / Google Meet');
      setPlatform('Google Meet');
      setSpeakerName('');
      setSpeakerTitle('');
      setSpeakerAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
      setSpeakerBio('');
      setIsFree(true);
      setFees('Free');
      setCategory('Web Development');
      setTagsInput('Live Session, Workshop, Interactive');
      setMaxSeats(100);
      setMeetingLink('https://meet.google.com/skillswap-live');
    }
  }, [sessionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast.error('Image size must be less than 4MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
        toast.success('Cover image loaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a session title');
      return;
    }
    if (!speakerName.trim()) {
      toast.error('Please enter the speaker/instructor name');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      coverImage: coverImage || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      sessionType,
      date: date.trim() || 'Upcoming Weekend',
      time: time.trim() || 'TBD',
      duration: duration.trim() || '2 Hours',
      venue: venue.trim() || 'Online',
      platform,
      speakerName: speakerName.trim(),
      speakerTitle: speakerTitle.trim(),
      speakerAvatar: speakerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      speakerBio: speakerBio.trim(),
      fees: isFree ? 'Free' : (fees.trim() || 'Paid'),
      isFree,
      category,
      tags: tags.length > 0 ? tags : ['Workshop', 'SkillSwap'],
      maxSeats: Number(maxSeats) || 100,
      meetingLink: meetingLink.trim(),
    };

    if (sessionToEdit) {
      bootcampSessionService.update(sessionToEdit.id, payload);
      toast.success('Bootcamp post updated successfully! 🎉');
    } else {
      bootcampSessionService.create(payload);
      toast.success('New Bootcamp session posted to catalog! 🚀');
    }

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden text-slate-100 animate-fadeIn">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {sessionToEdit ? 'Edit Bootcamp Post' : 'Create 1-Day / 2-Day Bootcamp Post'}
              </h2>
              <p className="text-xs text-slate-400">
                Publish a live intensive workshop, speaker session, or masterclass event.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Cover Image Upload & Preview */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-indigo-400" /> Post Cover Image
            </label>
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950/80 group">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-44 object-cover object-center"
                />
              ) : (
                <div className="w-full h-44 flex flex-col items-center justify-center text-slate-500 gap-2">
                  <ImageIcon className="h-10 w-10 text-slate-600" />
                  <span className="text-xs">No cover image uploaded</span>
                </div>
              )}
              
              <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto text-xs border-slate-700 text-slate-200 hover:bg-slate-800"
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload from Computer
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-sm">
                  <Input
                    placeholder="Or paste direct image URL..."
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="h-8 text-xs bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Session Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Bootcamp Title <span className="text-rose-400">*</span>
              </label>
              <Input
                placeholder="e.g. Next.js 15 & Server Components 2-Day Sprint"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-slate-950 border-slate-700 text-white text-xs h-10 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Web Development">Web Development</option>
                <option value="Data Science">Data Science</option>
                <option value="AI & ML">AI & ML</option>
                <option value="Design">Design</option>
                <option value="Photography">Photography</option>
                <option value="Mobile Dev">Mobile Dev</option>
                <option value="Career & Freelancing">Career & Freelancing</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Session Description & Agenda</label>
            <textarea
              rows={3}
              placeholder="What will participants learn in this session? Mention hands-on exercises and project details."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Format, Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Session Type</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as any)}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1-Day Intensive">1-Day Intensive</option>
                <option value="2-Day Weekend Workshop">2-Day Weekend Workshop</option>
                <option value="Evening Masterclass">Evening Masterclass</option>
                <option value="Special Webinar">Special Webinar</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-400" /> Date / Schedule
              </label>
              <Input
                placeholder="e.g. Saturday, Oct 17, 2026"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white text-xs h-10 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-400" /> Time & Duration
              </label>
              <Input
                placeholder="e.g. 6:00 PM - 9:30 PM (3.5 Hrs)"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white text-xs h-10 placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Venue & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-rose-400" /> Venue / Location
              </label>
              <Input
                placeholder="e.g. Online (Google Meet) or Studio Lumen, Gulshan"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white text-xs h-10 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5 text-indigo-400" /> Delivery Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="On-Site / Physical">On-Site / Physical</option>
                <option value="Discord">Discord</option>
              </select>
            </div>
          </div>

          {/* Speaker / Instructor Info */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4" /> Speaker / Instructor Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Speaker Name *</label>
                <Input
                  placeholder="e.g. Dr. Tanvir Ahmed"
                  value={speakerName}
                  onChange={(e) => setSpeakerName(e.target.value)}
                  required
                  className="bg-slate-900 border-slate-700 text-white text-xs h-9 placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Speaker Title / Role</label>
                <Input
                  placeholder="e.g. Senior AI Engineer @ Google DeepMind"
                  value={speakerTitle}
                  onChange={(e) => setSpeakerTitle(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white text-xs h-9 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Speaker Avatar URL</label>
                <Input
                  placeholder="https://... photo URL"
                  value={speakerAvatar}
                  onChange={(e) => setSpeakerAvatar(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white text-xs h-9 placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Short Bio / Credentials</label>
                <Input
                  placeholder="8+ years in deep learning and distributed systems."
                  value={speakerBio}
                  onChange={(e) => setSpeakerBio(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white text-xs h-9 placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing, Seats & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Fees / Price</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !isFree;
                    setIsFree(next);
                    if (next) setFees('Free');
                    else setFees('৳500 / $5');
                  }}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                    isFree ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {isFree ? 'Free Session' : 'Paid Session'}
                </button>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <Input
                  placeholder="e.g. Free or ৳500"
                  value={fees}
                  onChange={(e) => {
                    setFees(e.target.value);
                    if (e.target.value.toLowerCase().includes('free')) {
                      setIsFree(true);
                    } else {
                      setIsFree(false);
                    }
                  }}
                  className="pl-9 bg-slate-950 border-slate-700 text-white text-xs h-10 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Max Participant Seats</label>
              <Input
                type="number"
                min="10"
                max="500"
                value={maxSeats}
                onChange={(e) => setMaxSeats(Number(e.target.value))}
                className="bg-slate-950 border-slate-700 text-white text-xs h-10 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-indigo-400" /> Tags (comma separated)
              </label>
              <Input
                placeholder="AI, Next.js, Figma, Live"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white text-xs h-10 placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30"
            >
              {sessionToEdit ? 'Save Changes' : 'Publish Bootcamp Post'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
