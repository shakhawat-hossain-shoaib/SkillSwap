import { useState } from 'react';
import { type BootcampSession, bootcampSessionService } from '../../services/bootcampSessionService';
import { Button } from '../common/Button';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  CheckCircle,
  Users,
  X,
  Share2,
} from 'lucide-react';

interface BootcampSessionCardProps {
  session: BootcampSession;
  onRegisteredChange?: () => void;
}

export function BootcampSessionCard({ session, onRegisteredChange }: BootcampSessionCardProps) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(session.isRegistered || false);
  const [registeredCount, setRegisteredCount] = useState(session.registeredCount);

  const handleToggleRegister = () => {
    const nextState = bootcampSessionService.toggleRegistration(session.id);
    setIsRegistered(nextState);
    if (nextState) {
      setRegisteredCount((c) => c + 1);
      toast.success(`🎉 You are registered for "${session.title}"! Calendar invite sent.`);
    } else {
      setRegisteredCount((c) => Math.max(0, c - 1));
      toast.success(`Registration cancelled for "${session.title}".`);
    }
    if (onRegisteredChange) onRegisteredChange();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Bootcamp session link copied to clipboard!');
    }
  };

  const seatsLeft = Math.max(0, session.maxSeats - registeredCount);

  return (
    <>
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-xl hover:border-primary-200 transition-all duration-300 flex flex-col overflow-hidden group">
        {/* Card Cover Image Header */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-900">
          <img
            src={session.coverImage}
            alt={session.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Top Floating Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white border border-white/10 text-[11px] font-bold shadow-xs">
              {session.sessionType}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-[11px] font-extrabold shadow-xs ${
                session.isFree
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {session.fees}
            </span>
          </div>

          {/* Bottom Floating Info inside cover */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
            <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary-300" />
              {session.date}
            </span>

            <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm font-medium flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-accent-300" />
              {session.duration}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            {/* Category and Platform */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-primary-50 text-primary-700 font-semibold text-[11px]">
                {session.category}
              </span>

              <span className="flex items-center gap-1 text-gray-600 font-medium text-[11px]">
                {session.platform === 'On-Site / Physical' ? (
                  <MapPin className="h-3.5 w-3.5 text-rose-500" />
                ) : (
                  <Video className="h-3.5 w-3.5 text-indigo-500" />
                )}
                {session.platform}
              </span>
            </div>

            {/* Title */}
            <h3
              onClick={() => setIsDetailModalOpen(true)}
              className="font-bold text-gray-900 text-base leading-snug group-hover:text-primary-600 transition-colors cursor-pointer line-clamp-2"
            >
              {session.title}
            </h3>

            {/* Short Description */}
            <p className="text-gray-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
              {session.description}
            </p>

            {/* Speaker Bar */}
            <div className="mt-4 p-2.5 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
              <img
                src={session.speakerAvatar}
                alt={session.speakerName}
                className="h-10 w-10 rounded-xl object-cover border border-gray-200"
              />
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-gray-900 truncate">
                  {session.speakerName}
                </div>
                <div className="text-[10px] text-gray-500 truncate">{session.speakerTitle}</div>
              </div>
            </div>

            {/* Venue & Seat Counter */}
            <div className="mt-3 space-y-1 text-xs text-gray-500">
              <div className="flex items-center gap-1.5 text-gray-600 truncate">
                <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{session.venue}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 text-gray-400">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> {registeredCount} enrolled
                </span>
                <span className="font-semibold text-primary-700">
                  {seatsLeft > 0 ? `${seatsLeft} seats left` : 'Fully booked'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDetailModalOpen(true)}
              className="flex-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              View Agenda
            </Button>

            <Button
              size="sm"
              onClick={handleToggleRegister}
              className={`flex-1 text-xs font-bold rounded-xl transition-all ${
                isRegistered
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white shadow-xs'
              }`}
            >
              {isRegistered ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5 mr-1" /> Registered
                </>
              ) : (
                'Register Now'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Detailed Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-100 text-gray-900 animate-fadeIn">
            {/* Modal Cover Image */}
            <div className="relative h-56 w-full bg-slate-900">
              <img
                src={session.coverImage}
                alt={session.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="px-2.5 py-0.5 rounded-full bg-primary-600 text-white text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">
                  {session.sessionType}
                </span>
                <h2 className="text-xl font-extrabold font-display leading-tight">{session.title}</h2>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
              {/* Key Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
                <div>
                  <div className="text-gray-400 font-semibold text-[10px] uppercase">Date</div>
                  <div className="font-bold text-gray-900 mt-0.5">{session.date}</div>
                </div>
                <div>
                  <div className="text-gray-400 font-semibold text-[10px] uppercase">Time & Length</div>
                  <div className="font-bold text-gray-900 mt-0.5">{session.time}</div>
                </div>
                <div>
                  <div className="text-gray-400 font-semibold text-[10px] uppercase">Platform</div>
                  <div className="font-bold text-gray-900 mt-0.5">{session.platform}</div>
                </div>
                <div>
                  <div className="text-gray-400 font-semibold text-[10px] uppercase">Admission</div>
                  <div className="font-extrabold text-emerald-600 mt-0.5">{session.fees}</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Session Overview & Learning Outcomes
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {session.description}
                </p>
              </div>

              {/* Speaker Profile */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50/40 border border-primary-100 flex items-start gap-4">
                <img
                  src={session.speakerAvatar}
                  alt={session.speakerName}
                  className="h-14 w-14 rounded-2xl object-cover border-2 border-white shadow-xs"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-primary-700 uppercase tracking-wider">
                    Featured Speaker & Mentor
                  </div>
                  <h4 className="text-base font-bold text-gray-900">{session.speakerName}</h4>
                  <p className="text-xs text-gray-600 font-medium">{session.speakerTitle}</p>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{session.speakerBio}</p>
                </div>
              </div>

              {/* Venue & Joining Information */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2 text-xs">
                <div className="font-bold text-gray-800 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-rose-500" /> Venue & Access Link
                </div>
                <p className="text-gray-600">{session.venue}</p>
                {isRegistered && (
                  <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
                    <span className="font-bold">Live Meeting Link:</span>{' '}
                    <a
                      href={session.meetingLink || 'https://meet.google.com'}
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-mono ml-1 break-all"
                    >
                      {session.meetingLink || 'https://meet.google.com/skillswap-live-session'}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900"
              >
                <Share2 className="h-4 w-4" /> Share Event
              </button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-xs font-semibold"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={handleToggleRegister}
                  className={`text-xs font-bold px-6 py-2 rounded-xl ${
                    isRegistered
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  {isRegistered ? 'Registered (Cancel)' : `Join for ${session.fees}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
