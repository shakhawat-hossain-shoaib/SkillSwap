import { Card, CardHeader, CardContent } from '../common/Card';
import { H2, H3, P } from '../common/Typography';
import { Wallet, RefreshCw, ShieldAlert } from 'lucide-react';

export function ProblemSection() {
  const problems = [
    {
      title: "Cost Barrier",
      description: "Premium courses and tutors cost hundreds of dollars, locking out passionate learners who can't afford them.",
      icon: <Wallet className="h-8 w-8 text-cta-500" />
    },
    {
      title: "Informal Friction",
      description: "Finding someone willing to trade skills on Reddit or Facebook is tedious, matching schedules is a nightmare.",
      icon: <RefreshCw className="h-8 w-8 text-accent-500" />
    },
    {
      title: "No Accountability",
      description: "Ghosting is common. Without a structured system or reviews, people easily drop out of commitments.",
      icon: <ShieldAlert className="h-8 w-8 text-primary-500" />
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <H2 className="border-b-0 text-3xl md:text-4xl">The Broken Learning Economy</H2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((problem, idx) => (
            <Card key={idx} className="hover:-translate-y-1 transition-transform duration-300">
              <CardHeader className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  {problem.icon}
                </div>
                <H3 className="text-xl">{problem.title}</H3>
              </CardHeader>
              <CardContent>
                <P className="text-gray-600 mt-0">{problem.description}</P>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
