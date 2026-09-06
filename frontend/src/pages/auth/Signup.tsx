import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { H2, P } from '../../components/common/Typography';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import { Repeat } from 'lucide-react';

export function Signup() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
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
        'Failed to create account. Email may already be in use.';
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
          <H2 className="border-b-0 text-2xl">Create your account</H2>
          <P className="text-gray-500 mt-1 text-xs">Join the cashless skill exchange community</P>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Input
              label="Full Name"
              placeholder="John Doe"
              {...register('fullName', { required: 'Full name is required' })}
              error={errors.fullName?.message as string}
            />
          </div>
          <div>
            <Input
              label="Email address"
              type="email"
              placeholder="john@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
              })}
              error={errors.email?.message as string}
            />
          </div>
          <div>
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Must be at least 6 characters' },
              })}
              error={errors.password?.message as string}
            />
          </div>

          <Button type="submit" variant="default" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Start Swapping Skills'}
          </Button>

          <div className="text-center text-xs text-gray-600 pt-2">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
