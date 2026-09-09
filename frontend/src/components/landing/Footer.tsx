import { Link } from 'react-router-dom';
import { Repeat, Heart, Sparkles, Compass, MessageSquare, BookOpen, Layers } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16 border-t border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 text-white hover:text-accent-400 transition-colors">
              <Repeat className="h-6 w-6 text-accent-400" />
              <span className="font-display font-bold text-xl tracking-tight">SkillSwap</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">
              The peer-to-peer cashless skill exchange platform. Trade your expertise for the skills you want to learn. No money, just knowledge.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Made with</span>
              <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
              <span>for lifelong learners</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/bootcamps" className="hover:text-white transition-colors flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-accent-400" /> Bootcamps & Lessons
                </Link>
              </li>
              <li>
                <Link to="/exchanges" className="hover:text-white transition-colors flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-primary-400" /> Exchange Requests
                </Link>
              </li>
              <li>
                <Link to="/messages" className="hover:text-white transition-colors flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-cta-400" /> Real-time Chat
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors flex items-center gap-2">
                  <Compass className="h-3.5 w-3.5 text-indigo-400" /> Member Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Modules */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Features</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="text-gray-400 flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-amber-400" /> AI Smart Match (Coming)</span></li>
              <li><Link to="/bootcamps" className="hover:text-white transition-colors">Curated Learning Tracks</Link></li>
              <li><Link to="/exchanges" className="hover:text-white transition-colors">Barter Agreement System</Link></li>
              <li><Link to="/onboarding/profile" className="hover:text-white transition-colors">Dual-Profile Builder</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal & Info</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#guidelines" className="hover:text-white transition-colors">Community Guidelines</a></li>
              <li><a href="#sdgs" className="hover:text-white transition-colors">SDG Impact Goals</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            © {new Date().getFullYear()} SkillSwap (AUST CSE 3200 Course Project). All rights reserved.
          </div>
          <div className="flex gap-6">
            <span>Clean Code</span>
            <span>•</span>
            <span>Zero Cash Transactions</span>
            <span>•</span>
            <span>Community Driven</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
