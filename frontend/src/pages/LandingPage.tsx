import { HeroSection } from '../components/landing/HeroSection';
import { StatsSection } from '../components/landing/StatsSection';
import { ProblemSection } from '../components/landing/ProblemSection';
import { DualProfileSection } from '../components/landing/DualProfileSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { FeaturedBootcampsPreview } from '../components/landing/FeaturedBootcampsPreview';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { ComparisonTable } from '../components/landing/ComparisonTable';
import { SdgImpactStrip } from '../components/landing/SdgImpactStrip';
import { CtaBanner } from '../components/landing/CtaBanner';
import { Footer } from '../components/landing/Footer';
import {
  Repeat,
  ArrowRight,
  BookOpen,
  Layers,
  MessageSquare,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900 selection:bg-primary-100 selection:text-primary-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 text-primary-900 hover:text-primary-600 transition-colors">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white shadow-xs select-none">
              <Repeat className="h-5 w-5" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary-900 to-primary-700 bg-clip-text text-transparent">
              SkillSwap
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link to="/bootcamps" className="hover:text-primary-600 transition-colors flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-accent-500" /> Bootcamps
            </Link>
            <Link to="/exchanges" className="hover:text-primary-600 transition-colors flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-primary-500" /> Exchange Requests
            </Link>
            <Link to="/messages" className="hover:text-primary-600 transition-colors flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-cta-500" /> Chat
            </Link>
            <a href="#how-it-works" className="hover:text-primary-600 transition-colors">
              How It Works
            </a>
            <a href="#comparison" className="hover:text-primary-600 transition-colors">
              Why Us
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard">
                  <Button size="sm" variant="default" className="shadow-xs font-semibold flex items-center gap-1.5 text-xs">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard ({user?.fullName?.split(' ')[0] || 'User'})</span>
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLogout}
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 text-xs font-semibold flex items-center gap-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Log out</span>
                </Button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  Log in
                </Link>
                <Button
                  size="sm"
                  variant="cta"
                  onClick={() => navigate('/signup')}
                  className="shadow-xs font-semibold"
                >
                  Sign up free
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <div id="sdgs">
          <SdgImpactStrip />
        </div>
        <ProblemSection />
        <DualProfileSection />
        <div id="how-it-works">
          <HowItWorksSection />
        </div>
        <FeaturedBootcampsPreview />
        <TestimonialsSection />
        <div id="comparison">
          <ComparisonTable />
        </div>
        <CtaBanner />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
