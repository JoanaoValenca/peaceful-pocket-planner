import { Link } from "@tanstack/react-router";
import { PotIcon, InfoTip } from "./ui-kit";
import { formatBRL, pct } from "@/lib/format";
import type { Pot } from "@/data/types";
import { cn } from "@/lib/utils";

/** Two-layer bar: light track = planned budget, mid = reserved money, solid = spent. */
export function PotMeter({ pot, className }: { pot: Pot; className?: string }) {
  const reservedW = pot.budget > 0 ? Math.min((pot.reserved / pot.budget) * 100, 100) : 0;
  const spentW = pot.budget > 0 ? Math.min((pot.spent / pot.budget) * 100, 100) : 0;
  return (
    <div className={cn("relative h-2.5 w-full overflow-hidden rounded-full bg-muted", className)} style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent 0 4px, color-mix(in oklab, var(--border) 80%, transparent) 4px 5px)" }}>
      <div className="absolute inset-y-0 left-0 animate-grow-x rounded-full" style={{ width: `${reservedW}%`, background: `color-mix(in oklab, ${pot.color} 32%, transparent)` }} />
      <div className="absolute inset-y-0 left-0 animate-grow-x rounded-full" style={{ width: `${spentW}%`, background: pot.color }} />
    </div>
  );
}

export function PotCard({ pot }: { pot: Pot }) {
  const left = pot.reserved - pot.spent;
  const used = pct(pot.spent, pot.reserved);
  return (
    <Link to="/potes/$potId" params={{ potId: pot.id }} className="group flex flex-col rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <PotIcon icon={pot.icon} color={pot.color} />
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold group-hover:text-primary">{pot.name}</p><p className="text-xs text-muted-foreground">{used}% do reservado usado</p></div>
      </div>
      <div className="mt-5"><p className="text-xs text-muted-foreground">Saldo restante</p><p className={cn("font-display text-2xl tabular", left < 0 && "text-destructive")}>{formatBRL(left)}</p></div>
      <PotMeter pot={pot} className="mt-4" />
      <dl className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
        <div><dt className="text-muted-foreground">Gasto</dt><dd className="font-medium tabular">{formatBRL(pot.spent)}</dd></div>
        <div><dt className="text-muted-foreground">Reservado</dt><dd className="font-medium tabular">{formatBRL(pot.reserved)}</dd></div>
        <div><dt className="text-muted-foreground">Orçamento</dt><dd className="font-medium tabular text-muted-foreground">{formatBRL(pot.budget)}</dd></div>
      </dl>
    </Link>
  );
}

export function PotLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-full bg-primary" />Gasto</span>
      <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-full bg-primary/30" />Reservado (dinheiro separado)</span>
      <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-full border bg-muted" />Orçamento planejado</span>
      <InfoTip>O orçamento é só um plano. O valor reservado é dinheiro real já separado do disponível. O saldo restante é reservado menos gasto.</InfoTip>
    </div>
  );
}
