import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { H1, P } from '../common/Typography';
import {
  ArrowRight,
  Sparkles,
  Repeat,
  Star,
  BookOpen,
  Folder,
  CheckCircle2,
} from 'lucide-react';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-white pt-12 md:pt-20 pb-20 lg:pb-28">
      {/* Ambient background glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50/70 via-white to-slate-50/30 pointer-events-none" />
      <div className="absolute top-10 left-1/4 w-[500px] h-[300px] bg-primary-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 w-[450px] h-[350px] bg-accent-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, Description & CTA */}
          <div className="lg:col-span-7 text-left">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-primary-200 shadow-xs mb-6 animate-fadeIn">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                Live Peer Network: 2,400+ Active Swaps
              </span>
            </div>

            <H1 className="text-slate-900 mb-6 tracking-tight font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.12]">
              Trade Skills.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-indigo-600 to-accent-600">
                Level Up Together.
              </span>{' '}
              Zero Tuition.
            </H1>

            <P className="text-base sm:text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">
              SkillSwap is the modern cashless barter platform for developers, designers, and creators. Swap 1-on-1 expertise with peers, join structured bootcamps with video lectures, and download real courseware from dedicated repo directories.
            </P>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
              <Button
                variant="cta"
                size="lg"
                className="font-bold shadow-xl shadow-cta-500/25 group flex items-center justify-center text-base py-3.5 px-6 cursor-pointer"
                onClick={() => navigate('/signup')}
              >
                <span>Start Swapping Free</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="font-semibold text-slate-700 hover:text-primary-700 hover:bg-primary-50 border-slate-300 py-3.5 px-6 cursor-pointer"
                onClick={() => navigate('/bootcamps')}
              >
                <BookOpen className="mr-2 h-4 w-4 text-indigo-600" />
                <span>Explore Bootcamps</span>
              </Button>
            </div>

            {/* Feature Badges / Trust Strip */}
            <div className="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span className="font-medium">100% Cashless Barter</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span className="font-medium">Disk-Synced Materials</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span className="font-medium">Verified Peer Ratings</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Visual Centerpiece & Floating Glass Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Image Container with Glow Shadow */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xl bg-white p-2 group">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900">
                  <img
                    src="/hero_students.jpg"
                    alt="Students collaborating and swapping skills on SkillSwap"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  {/* On-image status bar */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-semibold text-[11px]">Real-Time Collaboration</span>
                    </div>

                    <div className="bg-indigo-600/90 backdrop-blur-md px-3 py-1.5 rounded-xl font-bold text-[11px] shadow-sm">
                      100% Free Peer Learning
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1 (Top Right): Rating & Reviews */}
              <div className="absolute -top-4 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl rounded-2xl p-3.5 flex items-center gap-3 animate-floatSlow">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1 font-bold text-xs text-slate-900">
                    <span>4.95 Rating</span>
                    <span className="text-slate-400 font-normal">(850+ reviews)</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Verified Peer Feedback</div>
                </div>
              </div>

              {/* Floating Badge 2 (Bottom Left): Live Barter Session */}
              <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl rounded-2xl p-3.5 flex items-center gap-3 animate-pulseSoft">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Repeat className="h-5 w-5 animate-spinSlow" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>Active Barter Session</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 text-[9px] font-extrabold">
                      LIVE
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    React Mentoring ⇄ Python Scripting
                  </div>
                </div>
              </div>

              {/* Floating Badge 3 (Middle Right): Course Directory Sync */}
              <div className="hidden sm:flex absolute top-1/2 -translate-y-1/2 -right-8 bg-slate-900/95 text-white backdrop-blur-md border border-slate-700 shadow-xl rounded-2xl p-3 items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Folder className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-bold">Disk-Synced Materials</div>
                  <div className="text-[9px] text-slate-400">bootcamps/ & slides</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
