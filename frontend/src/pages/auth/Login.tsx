import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { H2, P } from '../../components/common/Typography';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import { Repeat } from 'lucide-react';

export function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-900 mb-4">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white shadow-xs">
              <Repeat className="h-6 w-6" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-primary-900">
              SkillSwap
            </span>
          </Link>
          <H2 className="border-b-0 text-2xl">Log in to your account</H2>
          <P className="text-gray-500 mt-1 text-xs">Welcome back to the peer skill exchange platform</P>
        </div>


        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Input
              label="Email address"
              type="email"
              placeholder="user@example.com"
              {...register('email', { required: 'Email is required' })}
              error={errors.email?.message as string}
            />
          </div>
          <div>
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
              error={errors.password?.message as string}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </Button>

          <div className="text-center text-xs text-gray-600 pt-2">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-500">
              Sign up free
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
