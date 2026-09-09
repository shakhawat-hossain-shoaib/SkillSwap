import { H2, H3, P } from '../common/Typography';
import { UserPlus, Cpu, Handshake, Star } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Sign Up & Setup",
      desc: "Create your dual-profile detailing what you know and what you want to learn.",
      icon: <UserPlus className="h-6 w-6 text-primary-600" />
    },
    {
      num: "02",
      title: "AI Smart Match",
      desc: "Our algorithm finds users with complementary skills to match your goals.",
      icon: <Cpu className="h-6 w-6 text-primary-600" />
    },
    {
      num: "03",
      title: "Exchange Request",
      desc: "Propose a barter structure, set learning goals, and agree on a timeline.",
      icon: <Handshake className="h-6 w-6 text-primary-600" />
    },
    {
      num: "04",
      title: "Session & Review",
      desc: "Complete the exchange, leave structured feedback, and boost your trust rating.",
      icon: <Star className="h-6 w-6 text-primary-600" />
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-primary-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <H2 className="border-b-0 text-white">How SkillSwap Works</H2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-primary-700/50 z-0"></div>
          
          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg mb-6 border-4 border-primary-900">
                {step.icon}
              </div>
              <div className="text-xs font-bold text-accent-400 mb-2 uppercase tracking-wider">Step {step.num}</div>
              <H3 className="text-xl mb-3">{step.title}</H3>
              <P className="text-primary-100 text-sm mt-0">{step.desc}</P>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
