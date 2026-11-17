import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, InfoTip, EmptyState } from "@/components/shared/ui-kit";
import { useFinance } from "@/store/finance-store";
import { buildPlan, type PlanEvent } from "@/data/planning";
import { formatBRL, formatDate, MONTHS } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planejamento")({
  head: () => ({ meta: [
    { title: "Planejamento mensal — Pote" },
    { name: "description", content: "Previsto e realizado do mês, com a linha do tempo dos compromissos." },
    { property: "og:title", content: "Planejamento mensal — Pote" },
    { property: "og:description", content: "Previsto e realizado do mês, com a linha do tempo dos compromissos." },
  ] }),
  component: PlanningPage,
});

const KIND = { receita: { label: "Receita", color: "bg-success" }, fixa: { label: "Despesa fixa", color: "bg-chart-1" }, parcela: { label: "Parcela", color: "bg-chart-5" }, extra: { label: "Extraordinária", color: "bg-impulse" } };

function PlanningPage() {
  const { fixedExpenses, installments, pots } = useFinance();
  const [ym, setYm] = useState({ y: 2026, m: 10 });
  const shift = (d: number) => setYm(({ y, m }) => { const t = y * 12 + m + d; return { y: Math.floor(t / 12), m: t % 12 }; });
  const plan = buildPlan(ym.y, ym.m, fixedExpenses, installments, pots);

  const rows = [
    { l: "Receitas", p: plan.income.planned, d: plan.income.done, pos: true, dl: "Recebidas" },
    { l: "Despesas fixas", p: plan.fixed.planned, d: plan.fixed.done, dl: "Pagas" },
    { l: "Parcelas", p: plan.installments.planned, d: plan.installments.done, dl: "Pagas" },
    { l: "Orçamento dos potes", p: plan.pots.planned, d: plan.pots.done, dl: "Distribuído", info: "Orçamento é planejamento de uso, não despesa paga. O realizado mostra quanto já foi separado nos potes." },
    { l: "Extraordinárias previstas", p: plan.extra.planned, d: null, dl: "" },
  ];

  return (
    <>
      <PageHeader title="Planejamento mensal" description="Como o dinheiro deve se comportar ao longo do mês."
        actions={
          <div className="flex items-center gap-1 rounded-xl border bg-card p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => shift(-1)} aria-label="Mês anterior"><ChevronLeft className="h-4 w-4" /></Button>
            <span className="min-w-36 text-center text-sm font-medium">{MONTHS[ym.m]} de {ym.y}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => shift(1)} aria-label="Próximo mês"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        } />

      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border bg-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Previsto x realizado</h2>
            <div className="flex gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm border border-dashed border-muted-foreground" />Previsto</span><span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-primary" />Realizado</span></div>
          </div>
          <div className="space-y-5">
            {rows.map((r) => (
              <div key={r.l}>
                <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="flex items-center gap-1.5 font-medium">{r.l}{r.info && <InfoTip>{r.info}</InfoTip>}</span>
                  <span className="text-xs text-muted-foreground"><span className="tabular">Previsto {formatBRL(r.p)}</span>{r.d !== null && <> · <span className="tabular text-foreground">{r.dl} {formatBRL(r.d)}</span></>}</span>
                </div>
                <div className="relative h-2.5 rounded-full border border-dashed border-muted-foreground/40">
                  {r.d !== null && <div className={cn("absolute inset-y-0 left-0 animate-grow-x rounded-full", r.pos ? "bg-success" : "bg-primary")} style={{ width: `${r.p ? Math.min((r.d / r.p) * 100, 100) : 0}%` }} />}
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="flex flex-col justify-between rounded-2xl border bg-sand/50 p-6">
          <div>
            <p className="flex items-center gap-1.5 text-xs text-sand-foreground">Resultado projetado<InfoTip>Receitas previstas menos despesas fixas, parcelas, orçamento dos potes e extraordinárias. É uma estimativa.</InfoTip></p>
            <p className={cn("mt-2 font-display text-4xl tabular", plan.projected < 0 && "text-destructive")}>{formatBRL(plan.projected)}</p>
            <p className="mt-2 text-xs text-sand-foreground">{plan.isPast ? "Mês encerrado" : plan.isCurrent ? "Mês em andamento" : "Mês futuro — apenas previsões"}</p>
          </div>
          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Receitas previstas</dt><dd className="tabular">{formatBRL(plan.income.planned)}</dd></div>
            <div className="flex justify-between"><dt>Saídas previstas</dt><dd className="tabular">− {formatBRL(plan.fixed.planned + plan.installments.planned + plan.extra.planned)}</dd></div>
            <div className="flex justify-between"><dt>Orçamento dos potes</dt><dd className="tabular">− {formatBRL(plan.pots.planned)}</dd></div>
          </dl>
        </section>
      </div>

      <Panel title="Linha do tempo do mês" description="Compromissos e entradas em ordem cronológica">
        {plan.events.length === 0 ? <EmptyState title="Nada previsto para este mês" /> : (
          <ol className="relative space-y-0.5 border-l pl-6">
            {plan.events.map((e: PlanEvent, i) => (
              <li key={i} className="relative flex items-center gap-3 rounded-xl py-2.5 pr-2 hover:bg-muted/50">
                <span className={cn("absolute -left-[31px] h-2.5 w-2.5 rounded-full ring-4 ring-card", KIND[e.kind].color)} />
                <span className="w-20 shrink-0 text-xs tabular text-muted-foreground">{formatDate(e.date)}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{e.label}</p><p className="text-[11px] text-muted-foreground">{KIND[e.kind].label}</p></div>
                <span className={cn("flex items-center gap-1 text-[11px]", e.done ? "text-success" : "text-muted-foreground")}>{e.done ? <Check className="h-3 w-3" /> : <Circle className="h-3 w-3" />}<span className="hidden sm:inline">{e.done ? "Realizado" : "Previsto"}</span></span>
                <span className={cn("w-24 text-right text-sm font-semibold tabular", e.kind === "receita" && "text-success")}>{e.kind === "receita" ? "+ " : "− "}{formatBRL(e.amount)}</span>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </>
  );
}
