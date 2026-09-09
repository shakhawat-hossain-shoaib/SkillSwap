import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SkillChipProps {
  label: string;
  onRemove: () => void;
  variant?: 'primary' | 'accent';
}

export function SkillChip({ label, onRemove, variant = 'primary' }: SkillChipProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
        variant === 'primary' 
          ? "bg-primary-100 text-primary-800 hover:bg-primary-200" 
          : "bg-accent-100 text-accent-800 hover:bg-accent-200"
      )}
    >
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className={cn(
          "p-0.5 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2",
          variant === 'primary'
            ? "hover:bg-primary-300 text-primary-600 hover:text-primary-900 focus:ring-primary-500"
            : "hover:bg-accent-300 text-accent-600 hover:text-accent-900 focus:ring-accent-500"
        )}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
