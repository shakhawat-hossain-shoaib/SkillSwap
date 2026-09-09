import { useState } from 'react';
import { H2, H3, P } from '../common/Typography';
import { Sparkles, BookOpen, Repeat, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DualProfileSection() {
  const navigate = useNavigate();
  const [selectedTeach, setSelectedTeach] = useState('React JS');
  const [selectedLearn, setSelectedLearn] = useState('Python');

  const teachSkills = [
    { name: 'React JS', level: 'Advanced', students: 14 },
    { name: 'UI/UX Design', level: 'Pro', students: 22 },
    { name: 'Node.js', level: 'Intermediate', students: 9 },
    { name: 'Data Structures', level: 'Mentor', students: 31 },
  ];

  const learnSkills = [
    { name: 'Python', demand: 'High', availableMentors: 38 },
    { name: 'Machine Learning', demand: 'Very High', availableMentors: 25 },
    { name: 'Public Speaking', demand: 'Medium', availableMentors: 12 },
    { name: 'Figma Systems', demand: 'High', availableMentors: 44 },
  ];

  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider mb-4 border border-primary-100">
            <Sparkles className="h-3.5 w-3.5 text-primary-600" />
            Reciprocal Barter Architecture
          </div>
          <H2 className="border-b-0 text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            The Dual-Profile Engine
          </H2>
          <P className="text-slate-600 text-base sm:text-lg mt-0 leading-relaxed">
            In traditional schooling you pay high fees. On SkillSwap, your existing skill is your currency. Teach what you know, spend your earned credit to learn what you want.
          </P>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Dual Cards Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch relative">
            {/* Left Card: Teach */}
            <div className="bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 border border-indigo-100 rounded-3xl p-8 relative shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                  <Sparkles className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                  Earn Barter Hours
                </span>
              </div>

              <H3 className="text-2xl font-bold text-slate-900 mb-2">What You Teach</H3>
              <P className="text-slate-600 text-sm mb-6 mt-0 leading-relaxed">
                Offer your knowledge in development, design, or academics. Every session you mentor credits your balance.
              </P>

              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Click to Test Skill:
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {teachSkills.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSelectedTeach(s.name)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedTeach === s.name
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="font-bold text-xs">{s.name}</div>
                    <div className={`text-[10px] mt-0.5 ${selectedTeach === s.name ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {s.level} • {s.students} taught
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold bg-indigo-50/70 p-3 rounded-xl border border-indigo-100">
                <ShieldCheck className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                <span>Verified peer reviews build your Trust Score.</span>
              </div>
            </div>

            {/* Right Card: Learn */}
            <div className="bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 border border-emerald-100 rounded-3xl p-8 relative shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                  <BookOpen className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Spend Barter Hours
                </span>
              </div>

              <H3 className="text-2xl font-bold text-slate-900 mb-2">What You Learn</H3>
              <P className="text-slate-600 text-sm mb-6 mt-0 leading-relaxed">
                Choose from hundreds of peer mentors or join cohort bootcamps with video lessons and live code reviews.
              </P>

              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Select Desired Skill:
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {learnSkills.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSelectedLearn(s.name)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedLearn === s.name
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="font-bold text-xs">{s.name}</div>
                    <div className={`text-[10px] mt-0.5 ${selectedLearn === s.name ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {s.availableMentors} mentors active
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Zero cash payments required. Pure knowledge exchange.</span>
              </div>
            </div>
          </div>

          {/* Interactive Live Barter Strip */}
          <div className="mt-8 p-4 sm:p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-slate-800">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 flex-shrink-0">
                <Repeat className="h-5 w-5 animate-spinSlow" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Current Simulation:</div>
                <div className="font-bold text-sm sm:text-base text-white">
                  You teach <span className="text-indigo-400">{selectedTeach}</span> ⇄ You receive <span className="text-emerald-400">{selectedLearn}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/signup')}
              className="py-2.5 px-5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <span>Create Your Profile</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
