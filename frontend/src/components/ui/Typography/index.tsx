import React from "react"
import { cn } from "@Utils/cn"

type Variant = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p"

interface TypographyProps {
  variant?: Variant
  className?: string
  children: React.ReactNode
}

const styles: Record<Variant, string> = {
  h1: "text-[1.5rem] sm:text-[1.875rem] md:text-[2.25rem] lg:text-[3rem] font-bold tracking-tight",
  h2: "text-[1.25rem] sm:text-[1.5rem] md:text-[1.875rem] lg:text-[2.25rem] font-semibold tracking-tight",
  h3: "text-[1.125rem] sm:text-[1.25rem] md:text-[1.5rem] lg:text-[1.875rem] font-semibold",
  h4: "text-[1rem] sm:text-[1.125rem] md:text-[1.25rem] lg:text-[1.5rem] font-medium",
  h5: "text-[0.875rem] sm:text-[1rem] md:text-[1.125rem] lg:text-[1.25rem] font-medium",
  h6: "text-[0.75rem] sm:text-[0.875rem] md:text-[1rem] lg:text-[1.125rem] font-medium",

  p: "text-[0.875rem] sm:text-[1rem] md:text-[1.125rem] lg:text-[1.25rem]",
}

export function Typography({
  variant = "p",
  className,
  children,
}: TypographyProps) {
  const Comp = variant

  return (
    <Comp className={cn(styles[variant], className)}>
      {children}
    </Comp>
  )
}