import { Badge } from '../common/Badge';

export function SdgImpactStrip() {
  return (
    <section className="py-10 bg-gray-50 border-y border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest text-center md:text-left">
            Aligned with UN Sustainable Development Goals
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="sdg" className="py-1.5 px-4">
              <span className="font-bold text-red-600 mr-2">4</span> Quality Education
            </Badge>
            <Badge variant="sdg" className="py-1.5 px-4">
              <span className="font-bold text-red-800 mr-2">8</span> Decent Work & Econ. Growth
            </Badge>
            <Badge variant="sdg" className="py-1.5 px-4">
              <span className="font-bold text-pink-600 mr-2">10</span> Reduced Inequalities
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
