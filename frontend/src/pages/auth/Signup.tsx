import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { H2, P } from '../../components/common/Typography';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import { Repeat, Eye, EyeOff, Check, X, ShieldCheck } from 'lucide-react';

export function Signup() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const passwordValue = watch('password', '') || '';

  // Password criteria checks
  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasLowercase = /[a-z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);
  const hasSpecial = /[^A-Za-z0-9]/.test(passwordValue);

  const criteriaCount = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;

  const strengthColor =
    criteriaCount <= 2 ? 'bg-red-500' :
    criteriaCount === 3 ? 'bg-amber-500' :
    criteriaCount === 4 ? 'bg-blue-500' :
    'bg-emerald-500';

  const strengthLabel =
    criteriaCount <= 2 ? 'Weak' :
    criteriaCount === 3 ? 'Fair' :
    criteriaCount === 4 ? 'Good' :
    'Strong';

  const onSubmit = async (data: any) => {
    if (criteriaCount < 4) {
      toast.error('Please choose a stronger password matching the security criteria.');
      return;
    }

    try {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        emailAddress: data.email,
        password: data.password,
      };
      const response = await api.post('/auth/register', payload);

      const resData = response.data?.data || response.data;
      const token = resData.token || response.data.token;
      const id = resData.id || resData.userId || '0';

      login(token, {
        id: String(id),
        email: data.email,
        fullName: data.fullName,
      });

      toast.success('Account created successfully!');
      navigate('/onboarding/profile');
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to create account. Please verify your details.';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="w-full max-w-md space-y-6 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-900 dark:text-white mb-4">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white shadow-xs">
              <Repeat className="h-6 w-6" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-primary-900 dark:text-white">
              SkillSwap
            </span>
          </Link>
          <H2 className="border-b-0 text-2xl dark:text-white">Create your account</H2>
          <P className="text-gray-500 dark:text-slate-400 mt-1 text-xs">Join the cashless peer skill exchange platform</P>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Input
              label="Full Name"
              placeholder="Sarah Jenkins"
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              {...register('fullName', { required: 'Full name is required' })}
              error={errors.fullName?.message as string}
            />
          </div>
          <div>
            <Input
              label="Email address"
              type="email"
              placeholder="sarah@example.com"
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
              })}
              error={errors.email?.message as string}
            />
          </div>
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pr-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Must be at least 8 characters' },
              })}
              error={errors.password?.message as string}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {passwordValue.length > 0 && (
            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5 text-gray-700 dark:text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary-500" /> Security Strength:
                </span>
                <span className={criteriaCount <= 2 ? 'text-red-500' : criteriaCount === 3 ? 'text-amber-500' : 'text-emerald-500'}>
                  {strengthLabel}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strengthColor}`}
                  style={{ width: `${(criteriaCount / 5) * 100}%` }}
                />
              </div>

              {/* Criteria list */}
              <div className="grid grid-cols-2 gap-1 pt-1 text-[11px]">
                <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-400'}`}>
                  {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} 8+ characters
                </span>
                <span className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-400'}`}>
                  {hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Uppercase letter
                </span>
                <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-400'}`}>
                  {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Number (0-9)
                </span>
                <span className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-400'}`}>
                  {hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Special symbol
                </span>
              </div>
            </div>
          )}

          <Button type="submit" variant="default" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Start Swapping Skills'}
          </Button>

          <div className="text-center text-xs text-gray-600 dark:text-slate-400 pt-2">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
