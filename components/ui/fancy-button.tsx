"use client"

import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const fancyButtonVariants = cva(
  "relative inline-flex items-center justify-center overflow-hidden rounded-md font-medium transition-all duration-300 focus:outline-none",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600",
        secondary: "bg-gradient-to-r from-pink-500 to-orange-400 text-white hover:from-pink-600 hover:to-orange-500",
        outline: "border-2 border-purple-500 bg-transparent text-purple-500 hover:bg-purple-500/10",
        ghost: "bg-transparent text-purple-500 hover:bg-purple-500/10",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        default: "h-11 px-6 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
)

export interface FancyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof fancyButtonVariants> {
  children: React.ReactNode
}

const FancyButton = React.forwardRef<HTMLButtonElement, FancyButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(fancyButtonVariants({ variant, size, className }))}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        {...props}
      >
        {/* Shine effect */}
        <span className="absolute inset-0 overflow-hidden rounded-md">
          <span className="absolute -left-[100%] top-0 h-full w-[250%] -translate-x-full transform bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 group-hover:translate-x-full"></span>
        </span>

        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      </motion.button>
    )
  },
)

FancyButton.displayName = "FancyButton"

export { FancyButton }
