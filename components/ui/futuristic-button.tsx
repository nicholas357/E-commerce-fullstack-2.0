"use client"

import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const futuristicButtonVariants = cva(
  "relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap font-medium transition-all duration-300 ease-out focus:outline-none active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40",
        secondary:
          "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40",
        accent:
          "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40",
        outline: "border-2 border-cyan-500 bg-transparent text-cyan-500 hover:bg-cyan-500/10",
        ghost: "bg-transparent text-cyan-500 hover:bg-cyan-500/10",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-5 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
      shape: {
        default: "rounded-md",
        pill: "rounded-full",
        angular: "clip-path-polygon",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  },
)

export interface FuturisticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof futuristicButtonVariants> {
  children: React.ReactNode
  glow?: boolean
}

const FuturisticButton = React.forwardRef<HTMLButtonElement, FuturisticButtonProps>(
  ({ className, variant, size, shape, children, glow = true, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(futuristicButtonVariants({ variant, size, shape, className }))}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        {...props}
      >
        {glow && (
          <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-cyan-300 to-blue-500 opacity-0 blur transition-opacity duration-500 group-hover:opacity-30"></span>
        )}
        <span className="relative flex items-center justify-center gap-2">{children}</span>
      </motion.button>
    )
  },
)

FuturisticButton.displayName = "FuturisticButton"

export { FuturisticButton }
