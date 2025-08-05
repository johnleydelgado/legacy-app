import { CheckCircle, MinusCircle } from "lucide-react"

type Variant = "active" | "inactive"

interface Props extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
  children: string
}

/**
 * Small pill used in the directory table to show customer status.
 * Uses lucide-react icons + Tailwind for colour.
 */
export function StatusBadge({ variant = "active", children, className, ...rest }: Props) {
  const isActive = variant === "active"

  const palette = isActive
    ? "bg-emerald-900/20 text-emerald-400"
    : "bg-muted text-muted-foreground/60"

  const Icon = isActive ? CheckCircle : MinusCircle

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${palette} ${className ?? ""}`}
      {...rest}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {children}
    </span>
  )
}
