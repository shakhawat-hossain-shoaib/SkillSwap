import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { H2, P } from '../../components/common/Typography';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import { Repeat, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        email: data.email,
        emailAddress: data.email,
        password: data.password,
      };
      const response = await api.post('/auth/login', payload);

      const resData = response.data?.data || response.data;
      const token = resData.token || response.data.token;
      const id = resData.id || resData.userId || '0';
      const fullName = resData.fullName || 'User';

      login(token, {
        id: String(id),
        email: data.email,
        fullName: fullName,
      });

      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Invalid email or password. Please verify your credentials.';
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
          <H2 className="border-b-0 text-2xl dark:text-white">Log in to your account</H2>
          <P className="text-gray-500 dark:text-slate-400 mt-1 text-xs">Welcome back to the peer skill exchange platform</P>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Input
              label="Email address"
              type="email"
              placeholder="user@example.com"
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              {...register('email', { required: 'Email is required' })}
              error={errors.email?.message as string}
            />
          </div>
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pr-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              {...register('password', { required: 'Password is required' })}
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </Button>

          <div className="text-center text-xs text-gray-600 dark:text-slate-400 pt-2">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500">
              Sign up free
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
