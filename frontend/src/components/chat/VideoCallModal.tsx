import { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, Sparkles, User, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface VideoCallModalProps {
  partnerName: string;
  partnerAvatar: string;
  partnerRole: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoCallModal({
  partnerName,
  partnerAvatar,
  partnerRole,
  isOpen,
  onClose,
}: VideoCallModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isOpen) {
      setDuration(0);
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleEndCall = () => {
    toast.success(`Video swap call with ${partnerName} ended (${formatDuration(duration)})`);
    onClose();
  };

  const handleScreenShareToggle = () => {
    setIsScreenSharing(!isScreenSharing);
    if (!isScreenSharing) {
      toast.success('Sharing your screen with peer! 🖥️');
    } else {
      toast.success('Screen share stopped');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-gray-950 rounded-3xl border border-gray-800 max-w-4xl w-full h-[580px] flex flex-col justify-between overflow-hidden shadow-2xl relative text-white">
        {/* Top Call Info */}
        <div className="p-4 px-6 flex items-center justify-between border-b border-gray-800 bg-gray-900/60 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-xs">
              {partnerAvatar}
            </div>
            <div>
              <div className="font-bold text-sm flex items-center gap-1.5">
                {partnerName} <ShieldCheck className="h-4 w-4 text-accent-400" />
              </div>
              <p className="text-[11px] text-gray-400">{partnerRole}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/50">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* Video Stage / Feeds */}
        <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950">
          {/* Remote Peer Video Feed */}
          <div className="relative rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden flex flex-col items-center justify-center p-6 group">
            {isScreenSharing ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-950 rounded-xl border border-dashed border-gray-700 p-6 text-center">
                <Monitor className="h-16 w-16 text-primary-400 mb-3 animate-pulse" />
                <h4 className="font-bold text-sm text-gray-200">Presenting Screen: React & Python Demo</h4>
                <p className="text-xs text-gray-500 mt-1">Live code editor is being shared in HD</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-primary-600 via-accent-500 to-cta-500 flex items-center justify-center text-white font-extrabold text-3xl shadow-2xl mb-4 animate-float">
                  {partnerAvatar}
                </div>
                <h3 className="font-bold text-base text-gray-200">{partnerName}</h3>
                <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <Sparkles className="h-3.5 w-3.5 text-accent-400" /> Peer is speaking...
                </span>
              </div>
            )}

            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-medium text-gray-300">
              {partnerName}
            </div>
          </div>

          {/* Local User Video Feed */}
          <div className="relative rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden flex flex-col items-center justify-center p-6">
            {isVideoOff ? (
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 mb-3">
                  <User className="h-10 w-10" />
                </div>
                <p className="text-xs text-gray-400">Camera is turned off</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary-700 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl mb-3">
                  YOU
                </div>
                <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" /> Camera Active
                </p>
              </div>
            )}

            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-medium text-gray-300 flex items-center gap-1.5">
              <span>You (Local)</span>
              {isMuted && <MicOff className="h-3 w-3 text-red-400" />}
            </div>
          </div>
        </div>

        {/* Bottom Call Controls */}
        <div className="p-4 px-6 border-t border-gray-800 bg-gray-900/80 backdrop-blur-md flex items-center justify-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
              isMuted ? 'bg-red-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
              isVideoOff ? 'bg-red-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
            }`}
            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </button>

          <button
            onClick={handleScreenShareToggle}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
              isScreenSharing
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
            }`}
            title="Toggle screen share"
          >
            <Monitor className="h-5 w-5" />
          </button>

          <button
            onClick={handleEndCall}
            className="h-12 px-6 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-red-600/30 transition-transform hover:scale-105"
          >
            <PhoneOff className="h-5 w-5" /> End Swap Call
          </button>
        </div>
      </div>
    </div>
  );
}
