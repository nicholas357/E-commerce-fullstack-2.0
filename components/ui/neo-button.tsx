"use client"

import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const neoButtonVariants = cva(
  "group relative inline-flex items-center justify-center overflow-hidden font-medium transition-all duration-300 ease-out focus:outline-none active:scale-95",
  {
    variants: {
      variant: {
        default: "text-white",
        secondary: "text-white",
        accent: "text-white",
        outline: "bg-transparent",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        default: "h-11 px-6 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface NeoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neoButtonVariants> {
  children: React.ReactNode
}

const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(
  ({ className, variant, size, children, disabled, ...props }, ref) => {
    // Define variant-specific styles
    const variantStyles = {
      default: {
        background: "bg-gradient-to-r from-indigo-600 to-blue-500",
        border: "border-indigo-700",
        glow: "bg-indigo-600",
        layerBg: "bg-indigo-800",
      },
      secondary: {
        background: "bg-gradient-to-r from-fuchsia-600 to-pink-500",
        border: "border-fuchsia-700",
        glow: "bg-fuchsia-600",
        layerBg: "bg-fuchsia-800",
      },
      accent: {
        background: "bg-gradient-to-r from-amber-500 to-orange-500",
        border: "border-amber-600",
        glow: "bg-amber-500",
        layerBg: "bg-amber-700",
      },
      outline: {
        background: "bg-transparent",
        border: "border-indigo-500",
        glow: "bg-indigo-500",
        layerBg: "bg-transparent",
        text: "text-indigo-500",
      },
    }

    const currentStyle = variantStyles[variant || "default"]

    return (
      <motion.button
        ref={ref}
        className={cn(
          neoButtonVariants({ variant, size, className }),
          "rounded-md",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        whileHover={disabled ? {} : { scale: 1.03 }}
        whileTap={disabled ? {} : { scale: 0.97 }}
        {...props}
      >
        {/* Main button with gradient */}
        <span
          className={cn(
            "absolute inset-0 rounded-md",
            currentStyle.background,
            variant === "outline" ? "opacity-0" : "opacity-100",
          )}
        ></span>

        {/* Bottom layer for 3D effect */}
        <span
          className={cn(
            "absolute -bottom-1 left-0 right-0 h-2 rounded-b-md",
            currentStyle.layerBg,
            "transform transition-transform duration-300 group-hover:translate-y-0",
            variant === "outline" ? "border-b border-l border-r border-indigo-500" : "",
          )}
        ></span>

        {/* Glow effect */}
        <span
          className={cn(
            "absolute inset-0 rounded-md opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-50",
            currentStyle.glow,
          )}
        ></span>

        {/* Border overlay */}
        <span
          className={cn(
            "absolute inset-0 rounded-md border",
            currentStyle.border,
            variant === "outline" ? "border-2" : "border-1",
            "opacity-50",
          )}
        ></span>

        {/* Shine effect */}
        <span className="absolute inset-0 rounded-md bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>

        {/* Content */}
        <span
          className={cn(
            "relative z-10 flex items-center justify-center gap-2",
            variant === "outline" && currentStyle.text,
          )}
        >
          {children}
        </span>
      </motion.button>
    )
  },
)

NeoButton.displayName = "NeoButton"

export { NeoButton }
