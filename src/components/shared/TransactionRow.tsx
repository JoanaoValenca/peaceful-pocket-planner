import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Shuffle, ShieldCheck, Scale } from "lucide-react";
import { useFinance } from "@/store/finance-store";
import { formatBRL, formatDate } from "@/lib/format";
import { TX_LABELS } from "@/components/dialogs/TransactionDialog";
import { NatureBadge } from "./ui-kit";
import type { Transaction } from "@/data/types";
import { cn } from "@/lib/utils";

export function txDirection(t: Transaction): "in" | "out" | "neutral" {
  if (t.type === "receita" || t.type === "retirada_reserva") return "in";
  if (t.type === "despesa") return "out";
  return "neutral";
}
const ICON = { receita: ArrowDownLeft, despesa: ArrowUpRight, transferencia: ArrowLeftRight, distribuicao: Shuffle, transferencia_pote: Shuffle, deposito_reserva: ShieldCheck, retirada_reserva: ShieldCheck, ajuste: Scale };

export function useTxLabels() {
  const { accounts, pots, reserves } = useFinance();
  return (t: Transaction) => {
    const acc = accounts.find((a) => a.id === t.accountId);
    const to = accounts.find((a) => a.id === t.toAccountId);
    const pot = pots.find((p) => p.id === t.potId);
    const toPot = pots.find((p) => p.id === t.toPotId);
    const res = reserves.find((r) => r.id === t.reserveId);
    return {
      account: acc ? (to ? `${acc.institution} → ${to.institution}` : acc.institution) : "—",
      category: pot ? (toPot ? `${pot.name} → ${toPot.name}` : pot.name) : res ? res.name : t.category ?? "—",
    };
  };
}

export function TransactionRow({ tx, compact }: { tx: Transaction; compact?: boolean }) {
  const labels = useTxLabels()(tx);
  const dir = txDirection(tx);
  const Icon = ICON[tx.type];
  return (
    <div className="flex items-center gap-3 py-3">
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", dir === "in" ? "bg-success-soft text-success" : dir === "out" ? "bg-muted text-foreground" : "bg-primary-soft text-primary")}><Icon className="h-4 w-4" /></div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{tx.description}</p>
        <p className="truncate text-xs text-muted-foreground">{formatDate(tx.date)} · {compact ? TX_LABELS[tx.type] : `${labels.category} · ${labels.account}`}</p>
        {!compact && tx.nature && <NatureBadge nature={tx.nature} />}
      </div>
      <span className={cn("shrink-0 text-sm font-semibold tabular", dir === "in" && "text-success", dir === "neutral" && "text-muted-foreground")}>
        {dir === "in" ? "+ " : dir === "out" ? "− " : ""}{formatBRL(tx.amount)}
      </span>
    </div>
  );
}
