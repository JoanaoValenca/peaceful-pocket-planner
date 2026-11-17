/** Demonstrative monthly plan builder. Placeholder logic only — real projections come later. */
import { plannedIncome, plannedExtraordinary } from "./mock";
import type { FixedExpense, InstallmentPurchase, Pot } from "./types";

export interface PlanEvent { date: string; label: string; amount: number; kind: "receita" | "fixa" | "parcela" | "extra"; done: boolean; }

export function buildPlan(year: number, month: number, fixed: FixedExpense[], installments: InstallmentPurchase[], pots: Pot[]) {
  const key = `${year}-${String(month + 1).padStart(2, "0")}`;
  const isCurrent = key === "2026-11";
  const isPast = key < "2026-11";
  const day = (iso: string) => iso.slice(8, 10);
  const events: PlanEvent[] = [];

  plannedIncome.forEach((i) => events.push({ date: `${key}-${day(i.date)}`, label: i.description, amount: i.amount, kind: "receita", done: isPast || (isCurrent && i.received) }));
  fixed.filter((f) => f.frequency === "mensal" && f.status !== "cancelada").forEach((f) => events.push({ date: `${key}-${day(f.nextDue)}`, label: f.name, amount: f.amount, kind: "fixa", done: isPast || (isCurrent && f.status === "paga") }));
  installments.filter((p) => !p.cancelled).forEach((p) => p.installments.filter((x) => x.due.startsWith(key)).forEach((x) => events.push({ date: x.due, label: `${p.description} (${x.n}/${p.count})`, amount: x.amount, kind: "parcela", done: x.status === "paga" })));
  if (isCurrent) plannedExtraordinary.forEach((e) => events.push({ date: e.date, label: e.description, amount: e.amount, kind: "extra", done: false }));
  events.sort((a, b) => a.date.localeCompare(b.date));

  const sum = (k: PlanEvent["kind"], done?: boolean) => events.filter((e) => e.kind === k && (done === undefined || e.done === done)).reduce((s, e) => s + e.amount, 0);
  const potBudget = pots.reduce((s, p) => s + p.budget, 0);
  const potDistributed = isCurrent ? pots.reduce((s, p) => s + p.reserved, 0) : isPast ? potBudget * 0.95 : 0;
  const income = sum("receita"), fixedT = sum("fixa"), inst = sum("parcela"), extra = sum("extra");
  return {
    key, isCurrent, isPast, events,
    income: { planned: income, done: sum("receita", true) },
    fixed: { planned: fixedT, done: sum("fixa", true) },
    installments: { planned: inst, done: sum("parcela", true) },
    pots: { planned: potBudget, done: potDistributed },
    extra: { planned: extra },
    projected: income - fixedT - inst - potBudget - extra,
  };
}
