import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-red-500 text-white",
        outline: "text-foreground",
        success: "border-transparent bg-green-500/20 text-green-500 border-green-500/50",
        amber: "border-transparent bg-amber-500/20 text-amber-500 border-amber-500/50",
        blue: "border-transparent bg-blue-500/20 text-blue-500 border-blue-500/50",
        green: "border-transparent bg-green-500/20 text-green-500 border-green-500/50",
        purple: "border-transparent bg-purple-500/20 text-purple-500 border-purple-500/50",
        cyan: "border-transparent bg-cyan-500/20 text-cyan-500 border-cyan-500/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
