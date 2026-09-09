import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export function CtaBanner() {
  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-primary-900 via-primary-800 to-accent-900 px-8 py-16 md:px-16 md:py-20 text-white shadow-2xl overflow-hidden">
          {/* Decorative background glows */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-accent-500/20 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider mb-6 text-accent-300">
              <Sparkles className="h-4 w-4" /> 100% Free & Cashless
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white mb-6 leading-tight">
              Ready to trade what you know for what you want to master?
            </h2>

            <p className="text-primary-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of curious minds bartering knowledge, expanding portfolios, and making meaningful peer connections.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button
                  variant="cta"
                  size="lg"
                  className="w-full sm:w-auto text-base font-bold shadow-xl shadow-cta-500/25 group"
                >
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-white border-white/30 hover:bg-white/10 hover:text-white"
                >
                  Log In to Dashboard
                </Button>
              </Link>
            </div>

            {/* Micro value props */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-primary-200">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-accent-400" /> Verified Member Trust Scores
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-400" /> Real-time 1-on-1 Chat
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-cta-400" /> Structured Bootcamp Curriculum
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
