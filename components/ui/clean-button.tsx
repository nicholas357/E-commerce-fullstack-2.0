import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cleanButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-slate-800 text-white hover:bg-slate-700",
        outline: "border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800",
        ghost: "bg-transparent text-slate-200 hover:bg-slate-800",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface CleanButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof cleanButtonVariants> {
  children: React.ReactNode
}

const CleanButton = React.forwardRef<HTMLButtonElement, CleanButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button ref={ref} className={cn(cleanButtonVariants({ variant, size, className }))} {...props}>
        <span className="flex items-center justify-center gap-2">{children}</span>
      </button>
    )
  },
)

CleanButton.displayName = "CleanButton"

export { CleanButton }
