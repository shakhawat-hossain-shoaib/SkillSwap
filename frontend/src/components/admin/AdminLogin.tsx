import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ShieldCheck, Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminLoginFormValues {
  email: string;
  password: string;
}

export function AdminLogin() {
  const { adminLogin } = useAdminAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({
    defaultValues: {
      email: import.meta.env.VITE_ADMIN_EMAIL || 'admin@skillswap.app',
      password: '',
    },
  });

  const [authError, setAuthError] = useState<string | null>(null);

  const onSubmit = async (data: AdminLoginFormValues) => {
    setAuthError(null);
    const result = await adminLogin(data.email, data.password);
    if (result.success) {
      toast.success('Welcome Administrator! Access granted. 🛡️');
    } else {
      const msg = result.message || 'Authentication failed. Please check credentials in database.';
      setAuthError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Admin Header Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-rose-500 text-white shadow-xl shadow-indigo-500/20 mb-4 ring-4 ring-white/10">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
            SkillSwap Admin
          </h1>
          <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-semibold">
            Administrative Control Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/50">
          <div className="mb-6 border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-indigo-400" /> Sign In as Administrator
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Restricted portal. Authenticated directly against the SkillSwap database.
            </p>
          </div>

          {authError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" /> Admin Email
              </label>
              <Input
                type="email"
                placeholder="admin@skillswap.app"
                className="bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
                {...register('email', { required: 'Admin email is required' })}
                error={errors.email?.message}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-400" /> Admin Password
              </label>
              <Input
                type="password"
                placeholder="••••••••••••"
                className="bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
                {...register('password', { required: 'Admin password is required' })}
                error={errors.password?.message}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 py-2.5 rounded-xl transition-all"
            >
              {isSubmitting ? 'Verifying Credentials...' : 'Sign In to Console'} {!isSubmitting && <ArrowRight className="h-4 w-4 ml-1.5 inline" />}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500">
              Admin credentials are authenticated securely against the database <span className="font-mono text-slate-400">Admins</span> table.
            </p>
            <div className="mt-3">
              <Link
                to="/"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
              >
                ← Return to Public SkillSwap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
