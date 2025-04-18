"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-3 shadow-md transition-all",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-foreground",
        success: "border-amber-500/30 bg-amber-500 text-black",
        error: "border-red-500/30 bg-red-500 text-white",
        warning: "border-amber-500/30 bg-amber-400 text-black",
        info: "border-blue-500/30 bg-blue-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

const Toast = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return <div ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />
})
Toast.displayName = "Toast"

const ToastClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "absolute right-1 top-1 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none",
        className,
      )}
      toast-close=""
      {...props}
    >
      <X className="h-3 w-3" />
    </button>
  ),
)
ToastClose.displayName = "ToastClose"

const ToastTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h3 ref={ref} className={cn("text-sm font-medium", className)} {...props} />,
)
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("text-xs opacity-90", className)} {...props} />,
)
ToastDescription.displayName = "ToastDescription"

const ToastAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-7 items-center justify-center rounded-md border border-amber-500/50 bg-amber-600 px-3 text-xs font-medium text-white transition-colors hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2",
        className,
      )}
      {...props}
    />
  ),
)
ToastAction.displayName = "ToastAction"

export { Toast, ToastClose, ToastTitle, ToastDescription, ToastAction }
