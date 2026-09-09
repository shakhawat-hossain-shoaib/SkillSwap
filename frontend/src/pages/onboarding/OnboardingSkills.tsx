import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { H2, H3, P } from '../../components/common/Typography';
import { SkillChip } from '../../components/common/SkillChip';
import { Sparkles, BookOpen, Plus, CheckCircle2 } from 'lucide-react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';

export function OnboardingSkills() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [canTeach, setCanTeach] = useState<string[]>([]);
  const [wantToLearn, setWantToLearn] = useState<string[]>([]);
  const [teachInput, setTeachInput] = useState('');
  const [learnInput, setLearnInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.skillsCanTeach && user.skillsCanTeach.length > 0) {
      setCanTeach(user.skillsCanTeach);
    }
    if (user?.skillsWantsToLearn && user.skillsWantsToLearn.length > 0) {
      setWantToLearn(user.skillsWantsToLearn);
    }
  }, [user]);

  const handleAddTeach = (e: React.FormEvent) => {
    e.preventDefault();
    if (teachInput.trim() && !canTeach.includes(teachInput.trim())) {
      setCanTeach([...canTeach, teachInput.trim()]);
      setTeachInput('');
    }
  };

  const handleAddLearn = (e: React.FormEvent) => {
    e.preventDefault();
    if (learnInput.trim() && !wantToLearn.includes(learnInput.trim())) {
      setWantToLearn([...wantToLearn, learnInput.trim()]);
      setLearnInput('');
    }
  };

  const handleComplete = async () => {
    if (canTeach.length === 0 && wantToLearn.length === 0) {
      toast.error('Please add at least one skill to teach or learn');
      return;
    }

    setIsSubmitting(true);
    try {
      const promises = [];
      for (const skill of canTeach) {
        promises.push(
          api.post('/profile/me/skills', {
            skillName: skill,
            skillType: 'CanTeach',
            proficiencyLevel: 'Intermediate',
          }).catch(() => null)
        );
      }
      for (const skill of wantToLearn) {
        promises.push(
          api.post('/profile/me/skills', {
            skillName: skill,
            skillType: 'WantsToLearn',
            proficiencyLevel: 'Beginner',
          }).catch(() => null)
        );
      }
      
      await Promise.all(promises);
      await refreshUser();
      toast.success('Skills updated successfully!');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to save skills.');
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full space-y-8 flex-1">
        <div className="text-center">
          <div className="text-sm font-bold text-accent-600 uppercase tracking-wider mb-2">Step 2 of 2</div>
          <H2 className="border-b-0">Build your dual-profile</H2>
          <P className="text-gray-600 mt-2 max-w-2xl mx-auto">
            What expertise can you offer to the community, and what are you looking to learn in return?
          </P>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-8">
          
          {/* Can Teach Column */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-primary-100 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6 text-primary-600">
              <Sparkles className="h-6 w-6" />
              <H3 className="text-primary-900 m-0">I Can Teach</H3>
            </div>
            
            <form onSubmit={handleAddTeach} className="flex gap-2 mb-6">
              <Input 
                placeholder="e.g. React JS, Graphic Design" 
                value={teachInput}
                onChange={(e) => setTeachInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="default" className="flex-shrink-0 px-3">
                <Plus className="h-5 w-5" />
              </Button>
            </form>

            <div className="flex-1">
              {canTeach.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg">
                  Add skills you can share
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {canTeach.map((skill) => (
                    <SkillChip 
                      key={skill} 
                      label={skill} 
                      variant="primary" 
                      onRemove={() => setCanTeach(canTeach.filter(s => s !== skill))} 
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Wants to Learn Column */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-accent-100 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6 text-accent-600">
              <BookOpen className="h-6 w-6" />
              <H3 className="text-accent-900 m-0">I Want to Learn</H3>
            </div>
            
            <form onSubmit={handleAddLearn} className="flex gap-2 mb-6">
              <Input 
                placeholder="e.g. Python, Digital Marketing" 
                value={learnInput}
                onChange={(e) => setLearnInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="flex-shrink-0 px-3 bg-accent-600 hover:bg-accent-700 text-white border-0">
                <Plus className="h-5 w-5" />
              </Button>
            </form>

            <div className="flex-1">
              {wantToLearn.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg">
                  Add skills you want to learn
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {wantToLearn.map((skill) => (
                    <SkillChip 
                      key={skill} 
                      label={skill} 
                      variant="accent" 
                      onRemove={() => setWantToLearn(wantToLearn.filter(s => s !== skill))} 
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-8 flex justify-center pb-12">
          <Button 
            size="lg" 
            variant="cta" 
            className="w-full max-w-md shadow-lg"
            onClick={handleComplete}
            disabled={isSubmitting || (canTeach.length === 0 && wantToLearn.length === 0)}
          >
            {isSubmitting ? 'Finalizing Profile...' : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" /> Complete Setup
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
