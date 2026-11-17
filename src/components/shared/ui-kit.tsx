import type { ReactNode } from "react";
import * as Icons from "lucide-react";
import { Info, Inbox } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import type { Nature } from "@/data/types";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight md:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, description, action, children, className }: { title?: string | undefined; description?: string | undefined; action?: ReactNode; children: ReactNode; className?: string | undefined }) {
  return (
    <section className={cn("rounded-2xl border bg-card p-5 md:p-6", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function InfoTip({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger type="button" aria-label="Mais informações" className="text-muted-foreground transition-colors hover:text-foreground">
          <Info className="h-3.5 w-3.5" />
        </TooltipTrigger>
        <TooltipContent className="max-w-64 text-xs leading-relaxed">{children}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Money({ value, className, signed }: { value: number; className?: string; signed?: "in" | "out" }) {
  return (
    <span className={cn("tabular", className)}>
      {signed === "in" ? "+ " : signed === "out" ? "− " : ""}
      {formatBRL(value)}
    </span>
  );
}

export function StatCard({ label, value, hint, info, tone = "default", icon, footer }: {
  label: string; value: number; hint?: ReactNode; info?: string | undefined; icon?: ReactNode; footer?: ReactNode;
  tone?: "default" | "primary" | "sand" | "warning";
}) {
  const tones = {
    default: "bg-card",
    primary: "bg-primary text-primary-foreground border-primary",
    sand: "bg-sand/60 border-sand",
    warning: "bg-warning-soft border-warning/30",
  };
  return (
    <div className={cn("flex flex-col justify-between rounded-2xl border p-5 transition-shadow hover:shadow-sm", tones[tone])}>
      <div className="flex items-center justify-between gap-2">
        <div className={cn("flex items-center gap-1.5 text-xs font-medium", tone === "primary" ? "text-primary-foreground/80" : "text-muted-foreground")}>
          {label}
          {info && <InfoTip>{info}</InfoTip>}
        </div>
        {icon}
      </div>
      <div className="mt-4 font-display text-2xl font-medium tracking-tight tabular md:text-[1.7rem]">{formatBRL(value)}</div>
      {hint && <div className={cn("mt-1 text-xs", tone === "primary" ? "text-primary-foreground/75" : "text-muted-foreground")}>{hint}</div>}
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}

export function Bar({ value, max, color, className, track = "bg-muted" }: { value: number; max: number; color?: string; className?: string; track?: string }) {
  const w = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full", track, className)}>
      <div className="h-full rounded-full bg-primary animate-grow-x" style={{ width: `${w}%`, background: color }} />
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-14 text-center">
      <div className="mb-3 rounded-full bg-muted p-3"><Inbox className="h-5 w-5 text-muted-foreground" /></div>
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="mt-1 max-w-xs text-xs text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  paga: "bg-success-soft text-success",
  pendente: "bg-muted text-muted-foreground",
  atrasada: "bg-destructive-soft text-destructive",
  cancelada: "bg-muted text-muted-foreground line-through",
  ativa: "bg-success-soft text-success",
  inativa: "bg-muted text-muted-foreground",
};
const statusLabels: Record<string, string> = { paga: "Paga", pendente: "Pendente", atrasada: "Em atraso", cancelada: "Cancelada", ativa: "Ativa", inativa: "Inativa" };
export function StatusBadge({ status }: { status: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", statusStyles[status])}>{statusLabels[status] ?? status}</span>;
}

export function NatureBadge({ nature }: { nature?: Nature | undefined }) {
  if (!nature) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
      <span className={cn("h-1.5 w-1.5 rounded-full", nature === "necessidade" ? "bg-primary" : "bg-impulse")} />
      {nature === "necessidade" ? "Necessidade" : "Impulso"}
    </span>
  );
}

export function PotIcon({ icon, color, size = "md" }: { icon: string; color: string; size?: "sm" | "md" | "lg" }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[icon] ?? Icons.Circle;
  const s = { sm: "h-7 w-7 [&>svg]:h-3.5 [&>svg]:w-3.5", md: "h-10 w-10 [&>svg]:h-4.5 [&>svg]:w-4.5", lg: "h-14 w-14 [&>svg]:h-6 [&>svg]:w-6" }[size];
  return (
    <div className={cn("flex shrink-0 items-center justify-center rounded-xl", s)} style={{ background: `color-mix(in oklab, ${color} 16%, transparent)`, color }}>
      <Icon />
    </div>
  );
}

export function Field({ label, children, hint, error }: { label: string; children: ReactNode; hint?: string | undefined; error?: string | undefined }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function MoneyInput({ value, onChange, ...rest }: { value: string; onChange: (v: string) => void } & Omit<React.ComponentProps<"input">, "value" | "onChange">) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
      <Input inputMode="decimal" placeholder="0,00" className="pl-9 tabular" value={value} onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ""))} {...rest} />
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="inline-flex rounded-xl bg-muted p-1">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-all", value === o.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
