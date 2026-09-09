import { H2 } from '../common/Typography';
import { Check, X, Minus } from 'lucide-react';

export function ComparisonTable() {
  const metrics = [
    { name: "Cost", skillswap: "Free (Time Barter)", udemy: "$15 - $200+ per course", fb: "Free (But unstructured)" },
    { name: "AI Matching", skillswap: "Yes (Complementary skills)", udemy: "No", fb: "No" },
    { name: "Accountability", skillswap: "Trust Ratings & Reviews", udemy: "Self-paced", fb: "High risk of ghosting" },
    { name: "Learning Style", skillswap: "1-on-1 Interactive Mentorship", udemy: "Pre-recorded videos", fb: "Varies wildly" },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <H2 className="border-b-0">Why SkillSwap?</H2>
        </div>
        
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm max-w-4xl mx-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
              <tr>
                <th scope="col" className="p-4 font-semibold">Feature</th>
                <th scope="col" className="p-4 font-bold text-primary-700 bg-primary-50/50">SkillSwap</th>
                <th scope="col" className="p-4 font-semibold">Udemy / Coursera</th>
                <th scope="col" className="p-4 font-semibold">Facebook Groups</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {metrics.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{row.name}</td>
                  <td className="p-4 bg-primary-50/30 text-primary-800 font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent-500 flex-shrink-0" />
                      <span>{row.skillswap}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Minus className="h-4 w-4 flex-shrink-0" />
                      <span>{row.udemy}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <X className="h-4 w-4 text-red-400 flex-shrink-0" />
                      <span>{row.fb}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
