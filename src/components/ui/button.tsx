import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary-soft text-white hover:bg-primary hover:shadow-glow hover:scale-105 active:scale-95 shadow-card backdrop-blur-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-card",
        outline:
          "border border-input bg-background hover:bg-primary-subtle hover:text-primary hover:border-primary/50 hover:shadow-card",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-card",
        ghost: "hover:bg-primary-subtle hover:text-primary hover:scale-105 active:scale-95",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-glow",
        premium: "bg-primary-soft text-white shadow-glow hover:bg-primary hover:shadow-elegant hover:scale-105 active:scale-95 border border-primary-glow/20 backdrop-blur-sm",
        accent: "bg-accent-soft text-white hover:bg-accent hover:shadow-glow hover:scale-105 active:scale-95 backdrop-blur-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
