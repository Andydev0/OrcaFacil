import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Novas variantes para status de orçamentos
        rascunho: "border-transparent bg-[#9E9E9E] text-white hover:bg-[#9E9E9E]/80",
        pendente: "border-transparent bg-[#FFA726] text-white hover:bg-[#FFA726]/80",
        analise: "border-transparent bg-[#42A5F5] text-white hover:bg-[#42A5F5]/80",
        aprovado: "border-transparent bg-[#66BB6A] text-white hover:bg-[#66BB6A]/80",
        recusado: "border-transparent bg-[#EF5350] text-white hover:bg-[#EF5350]/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }