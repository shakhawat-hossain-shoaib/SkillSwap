import { useState, type FormEvent } from 'react';
import { Calendar, Video, Sparkles, X } from 'lucide-react';
import { Button } from '../common/Button';
import toast from 'react-hot-toast';

interface ScheduleSessionModalProps {
  partnerName: string;
  isOpen: boolean;
  onClose: () => void;
  onScheduled?: (details: { date: string; time: string; topic: string; duration: string }) => void;
}

export function ScheduleSessionModal({
  partnerName,
  isOpen,
  onClose,
  onScheduled,
}: ScheduleSessionModalProps) {
  const [date, setDate] = useState('2026-08-29');
  const [time, setTime] = useState('15:00');
  const [duration, setDuration] = useState('60');
  const [topic, setTopic] = useState('1-on-1 Practice & Code Review');

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    toast.success(`Session with ${partnerName} scheduled for ${date} at ${time}! 📅`);
    if (onScheduled) {
      onScheduled({ date, time, topic, duration: `${duration} mins` });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn select-none">
      <div className="bg-white rounded-3xl border border-gray-100 max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
          <div>
            <h3 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-600" /> Schedule Swap Session
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Coordinate a live barter call with {partnerName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Session Agenda / Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Duration</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '30 mins', val: '30' },
                { label: '60 mins', val: '60' },
                { label: '90 mins', val: '90' },
              ].map((d) => (
                <button
                  key={d.val}
                  type="button"
                  onClick={() => setDuration(d.val)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    duration === d.val
                      ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Meeting Room Notice */}
          <div className="p-3 rounded-2xl bg-accent-50/70 border border-accent-100 text-xs text-accent-900 flex items-center gap-2">
            <Video className="h-4 w-4 text-accent-600 flex-shrink-0" />
            <span>A dedicated SkillSwap HD Video Room will be attached automatically.</span>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" className="flex-1 text-xs" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="cta" className="flex-1 text-xs font-semibold">
              <Sparkles className="mr-1.5 h-4 w-4" /> Confirm Schedule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
