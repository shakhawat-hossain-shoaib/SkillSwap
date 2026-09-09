import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn'; // Will create this utility

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none ring-offset-white",
  {
    variants: {
      variant: {
        default: "bg-primary-600 text-white hover:bg-primary-900 shadow-sm",
        cta: "bg-cta-500 text-white hover:bg-cta-600 shadow-md transform hover:-translate-y-0.5 transition-transform",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-900",
        ghost: "bg-transparent hover:bg-primary-50 text-primary-600",
        link: "underline-offset-4 hover:underline text-primary-600",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-12 px-8 rounded-md text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
