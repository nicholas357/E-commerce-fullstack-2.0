"use client"

import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const gamingButtonVariants = cva(
  "relative inline-flex items-center justify-center overflow-hidden rounded-md font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none",
  {
    variants: {
      variant: {
        blue: "bg-black text-white border border-glow-blue",
        purple: "bg-black text-white border border-glow-purple",
        cyan: "bg-black text-white border border-glow-cyan",
        magenta: "bg-black text-white border border-glow-magenta",
        amber: "bg-black text-white border border-glow-amber",
        ghost: "bg-black/50 text-white border border-white/20 backdrop-blur-sm hover:border-white/50",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        default: "h-11 px-6 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "amber",
      size: "default",
    },
  },
)

export interface GamingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gamingButtonVariants> {
  children: React.ReactNode
  glitch?: boolean
  glow?: boolean
}

const GamingButton = React.forwardRef<HTMLButtonElement, GamingButtonProps>(
  ({ className, variant, size, children, glitch = false, glow = true, ...props }, ref) => {
    // Define glow classes based on variant
    const glowClasses = {
      blue: "glow-border-blue",
      purple: "glow-border-purple",
      cyan: "glow-border-cyan",
      magenta: "glow-border-purple",
      amber: "glow-border-amber",
      ghost: "",
    }

    const textGlowClasses = {
      blue: "glow-text-blue",
      purple: "glow-text-purple",
      cyan: "glow-text-cyan",
      magenta: "glow-text-magenta",
      amber: "glow-text-amber",
      ghost: "",
    }

    const currentGlowClass = variant ? glowClasses[variant] : glowClasses.amber
    const currentTextGlowClass = variant ? textGlowClasses[variant] : textGlowClasses.amber

    return (
      <motion.button
        ref={ref}
        className={cn(gamingButtonVariants({ variant, size, className }), glow && currentGlowClass, "shine")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 15,
          duration: 0.2,
        }}
        {...props}
      >
        {/* Glitch effect */}
        {glitch && (
          <>
            <span className="absolute inset-0 -z-10 animate-glitch-1 opacity-70"></span>
            <span className="absolute inset-0 -z-10 animate-glitch-2 opacity-70"></span>
          </>
        )}

        {/* Content */}
        <span className={cn("relative z-10 flex items-center justify-center gap-2", glow && currentTextGlowClass)}>
          {children}
        </span>
      </motion.button>
    )
  },
)

GamingButton.displayName = "GamingButton"

export { GamingButton }
