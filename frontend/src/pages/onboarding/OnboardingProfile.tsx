import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { H2, P } from '../../components/common/Typography';
import { Camera, Plus, Trash2, ArrowRight } from 'lucide-react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';

export function OnboardingProfile() {
  const { user, refreshUser } = useAuth();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      bioDetails: user?.bioDetails || '',
    },
  });
  const navigate = useNavigate();
  const [links, setLinks] = useState<string[]>(() => {
    if (user?.portfolioLinks) {
      const parsed = user.portfolioLinks.split(',').map((l) => l.trim()).filter(Boolean);
      return parsed.length > 0 ? parsed : [''];
    }
    return [''];
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || '',
        bioDetails: user.bioDetails || '',
      });
      if (user.portfolioLinks) {
        const parsed = user.portfolioLinks.split(',').map((l) => l.trim()).filter(Boolean);
        if (parsed.length > 0) setLinks(parsed);
      }
    }
  }, [user, reset]);

  const handleAddLink = () => setLinks([...links, '']);
  
  const handleRemoveLink = (index: number) => {
    const newLinks = [...links];
    newLinks.splice(index, 1);
    setLinks(newLinks.length ? newLinks : ['']);
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const onSubmit = async (data: any) => {
    try {
      const validLinks = links.filter(link => link.trim() !== '');
      const payload = {
        fullName: data.fullName,
        bioDetails: data.bioDetails,
        portfolioLinks: validLinks.length > 0 ? validLinks.join(',') : null
      };
      
      await api.put('/profile/me', payload);
      await refreshUser();
      toast.success('Profile saved!');
      navigate('/onboarding/skills'); // Proceed to step 2
    } catch {
      toast.error('Failed to save profile.');
      navigate('/onboarding/skills');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <div className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-2">Step 1 of 2</div>
          <H2 className="border-b-0">Set up your profile</H2>
          <P className="text-gray-600 mt-2">Let others know a bit about you and your background.</P>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Avatar Mock */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group cursor-pointer">
                <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-2xl shadow-xs overflow-hidden border-2 border-dashed border-primary-300 group-hover:border-primary-500 transition-colors">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <Camera className="h-8 w-8 opacity-50" />}
                </div>
                <div className="text-center mt-2 text-sm text-primary-600 font-medium">Profile Photo</div>
              </div>
            </div>

            <div>
              <Input
                label="Full Name"
                placeholder="Your full name"
                {...register('fullName', { required: 'Name is required' })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                placeholder="Tell us about your background, what you do, and what you're passionate about..."
                {...register('bioDetails')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Portfolio & Links
              </label>
              <div className="space-y-3">
                {links.map((link, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <Input
                      placeholder="https://github.com/yourusername"
                      value={link}
                      onChange={(e) => handleLinkChange(index, e.target.value)}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveLink(index)}
                      className="text-gray-400 hover:text-red-500 flex-shrink-0"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="link"
                className="mt-2 text-sm px-0"
                onClick={handleAddLink}
              >
                <Plus className="h-4 w-4 mr-1" /> Add another link
              </Button>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="cta" disabled={isSubmitting}>
                Continue to Skills <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
