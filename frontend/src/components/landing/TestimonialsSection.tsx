import { useState } from 'react';
import { H2, P } from '../common/Typography';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: 'Sofia Martinez',
      role: 'Full-stack Developer',
      avatar: 'SM',
      rating: 5,
      taught: 'React & TypeScript',
      learned: 'UI/UX Design',
      quote: "I traded 4 hours of React guidance for UI feedback on my side project. Within a week, my app's conversion jumped 30%. No money spent — purely mutual value!",
    },
    {
      id: 2,
      name: 'Dr. Tariq Al-Mansoor',
      role: 'Bioinformatics Researcher',
      avatar: 'TM',
      rating: 5,
      taught: 'Python Data Science',
      learned: 'Public Speaking',
      quote: "SkillSwap connected me with an incredible presentation coach. In return, I helped them automate their spreadsheet workflows. It was the most rewarding learning experience I've had.",
    },
    {
      id: 3,
      name: 'Elena Rostova',
      role: 'Brand Strategist',
      avatar: 'ER',
      rating: 5,
      taught: 'SEO & Copywriting',
      learned: 'Guitar Basics',
      quote: "Always wanted to play guitar but private tutors were $60/hr. Found a musician wanting to optimize his indie band's website. We swapped skills every Tuesday!",
    },
    {
      id: 4,
      name: 'Marcus Chen',
      role: 'Product Designer',
      avatar: 'MC',
      rating: 5,
      taught: 'Figma & Design Systems',
      learned: 'Machine Learning',
      quote: "The bootcamps and exchange requests streamline everything. I gained foundational ML knowledge while helping an engineer design clean user journeys.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold uppercase tracking-wider mb-3">
            Real Stories
          </div>
          <H2 className="border-b-0">Loved by Learners & Mentors</H2>
          <P className="max-w-2xl mx-auto text-gray-600">
            Hear from members of the SkillSwap community who unlocked new career superpowers without opening their wallets.
          </P>
        </div>

        {/* Carousel / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {testimonials.map((item, idx) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative group ${
                idx === currentIndex ? 'ring-2 ring-primary-500 ring-offset-2' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-gray-200 group-hover:text-primary-200 transition-colors" />
                </div>

                <p className="text-gray-700 text-sm italic mb-6 leading-relaxed">
                  "{item.quote}"
                </p>
              </div>

              <div>
                {/* Swap badge */}
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 mb-4 text-xs">
                  <div className="flex items-center justify-between text-gray-600 mb-1">
                    <span className="font-medium text-primary-700">Taught:</span>
                    <span className="truncate max-w-[120px] font-semibold text-gray-800">{item.taught}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="font-medium text-accent-700">Learned:</span>
                    <span className="truncate max-w-[120px] font-semibold text-gray-800">{item.learned}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                    {item.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm leading-snug">{item.name}</h4>
                    <p className="text-xs text-gray-500">{item.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel controls for mobile */}
        <div className="flex md:hidden justify-center items-center gap-4">
          <button
            onClick={prevTestimonial}
            className="p-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentIndex ? 'w-6 bg-primary-600' : 'w-2 bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={nextTestimonial}
            className="p-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
