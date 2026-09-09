import { Users, Repeat, GraduationCap, Star } from 'lucide-react';

export function StatsSection() {
  const stats = [
    {
      id: 1,
      label: 'Skills Exchanged',
      value: '2,400+',
      description: 'Peer-to-peer barter sessions completed',
      icon: <Repeat className="h-6 w-6 text-accent-500" />,
      color: 'from-accent-500/10 to-accent-500/5',
      borderColor: 'border-accent-200/50',
    },
    {
      id: 2,
      label: 'Active Swappers',
      value: '1,850+',
      description: 'Passionate learners & mentors globally',
      icon: <Users className="h-6 w-6 text-primary-500" />,
      color: 'from-primary-500/10 to-primary-500/5',
      borderColor: 'border-primary-200/50',
    },
    {
      id: 3,
      label: 'Interactive Bootcamps',
      value: '45+',
      description: 'Curated peer-led structured courses',
      icon: <GraduationCap className="h-6 w-6 text-cta-500" />,
      color: 'from-cta-500/10 to-cta-500/5',
      borderColor: 'border-cta-200/50',
    },
    {
      id: 4,
      label: 'Satisfaction Rate',
      value: '4.9★',
      description: 'Based on verified exchange reviews',
      icon: <Star className="h-6 w-6 text-amber-500 fill-amber-400" />,
      color: 'from-amber-500/10 to-amber-500/5',
      borderColor: 'border-amber-200/50',
    },
  ];

  return (
    <section className="py-12 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className={`p-6 rounded-2xl bg-gradient-to-b ${stat.color} border ${stat.borderColor} transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative group`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 bg-white rounded-xl shadow-xs border border-gray-100 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </span>
                <span className="text-3xl font-extrabold font-display text-gray-900 tracking-tight">
                  {stat.value}
                </span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">{stat.label}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
