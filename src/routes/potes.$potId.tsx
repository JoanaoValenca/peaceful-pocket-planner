import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Pencil, ArrowLeftRight, Shuffle, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Panel, PotIcon, EmptyState } from "@/components/shared/ui-kit";
import { PotMeter, PotLegend } from "@/components/shared/PotCard";
import { TransactionRow } from "@/components/shared/TransactionRow";
import { BarsChart } from "@/components/shared/charts";
import { PotFormDialog, PotTransferDialog, RulePicker, RULE_LABEL, PERIOD_LABEL } from "@/components/dialogs/PotDialogs";
import { useFinance } from "@/store/finance-store";
import { useQuickActions } from "@/components/layout/AppShell";
import { formatBRL, pct } from "@/lib/format";
import type { LeftoverRule } from "@/data/types";

export const Route = createFileRoute("/potes/$potId")({
  head: () => ({ meta: [
    { title: "Detalhes do pote — Pote" },
    { name: "description", content: "Orçamento, valor reservado, gastos e histórico do pote." },
    { property: "og:title", content: "Detalhes do pote — Pote" },
    { property: "og:description", content: "Orçamento, valor reservado, gastos e histórico do pote." },
  ] }),
  component: PotDetail,
  notFoundComponent: () => <EmptyState title="Pote não encontrado" action={<Link to="/potes" className="text-sm text-primary">Voltar aos potes</Link>} />,
});

function PotDetail() {
  const { potId } = Route.useParams();
  const { pots, setPots, transactions } = useFinance();
  const qa = useQuickActions();
  const [editing, setEditing] = useState(false);
  const [transfer, setTransfer] = useState(false);
  const [ruleOpen, setRuleOpen] = useState(false);
  const [rule, setRule] = useState<LeftoverRule>("acumular");
  const pot = pots.find((p) => p.id === potId);
  if (!pot) throw notFound();
  const txs = transactions.filter((t) => t.potId === pot.id || t.toPotId === pot.id);
  const left = pot.reserved - pot.spent;
  // Demonstrative history (scaled from current pot) for the period comparison chart.
  const history = ["jun", "jul", "ago", "set", "out", "nov"].map((m, i) => ({ month: m, orcamento: pot.budget, gasto: i === 5 ? pot.spent : Math.round(pot.budget * (0.62 + ((i * 37) % 30) / 100)) }));

  return (
    <>
      <Link to="/potes" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" />Meus potes</Link>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <PotIcon icon={pot.icon} color={pot.color} size="lg" />
          <div><h1 className="font-display text-3xl font-medium tracking-tight">{pot.name}</h1><p className="text-sm text-muted-foreground">Período {PERIOD_LABEL[pot.periodicity].toLowerCase()} · Sobra: {RULE_LABEL[pot.leftoverRule].title.toLowerCase()}</p></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" />Editar</Button>
          <Button variant="outline" size="sm" onClick={() => setTransfer(true)}><ArrowLeftRight className="h-4 w-4" />Transferir</Button>
          <Button size="sm" onClick={qa.distribute}><Shuffle className="h-4 w-4" />Distribuir</Button>
        </div>
      </div>

      <section className="mb-4 rounded-2xl border bg-card p-6">
        <div className="grid gap-6 md:grid-cols-4">
          <div><p className="text-xs text-muted-foreground">Saldo restante</p><p className="font-display text-3xl tabular">{formatBRL(left)}</p></div>
          <div><p className="text-xs text-muted-foreground">Valor reservado</p><p className="text-lg font-semibold tabular">{formatBRL(pot.reserved)}</p></div>
          <div><p className="text-xs text-muted-foreground">Valor gasto</p><p className="text-lg font-semibold tabular">{formatBRL(pot.spent)}</p><p className="text-xs text-muted-foreground">{pct(pot.spent, pot.reserved)}% do reservado</p></div>
          <div><p className="text-xs text-muted-foreground">Orçamento planejado</p><p className="text-lg font-semibold tabular text-muted-foreground">{formatBRL(pot.budget)}</p>{pot.budget > pot.reserved && <p className="text-xs text-muted-foreground">Faltam {formatBRL(pot.budget - pot.reserved)} para reservar</p>}</div>
        </div>
        <PotMeter pot={pot} className="mt-6 h-3" />
        <div className="mt-3"><PotLegend /></div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Histórico de movimentações" className="lg:col-span-2">
          {txs.length ? <div className="divide-y">{txs.map((t) => <TransactionRow key={t.id} tx={t} />)}</div> : <EmptyState title="Nenhuma movimentação neste pote" description="Despesas registradas neste pote aparecerão aqui." />}
        </Panel>
        <div className="space-y-4">
          <Panel title="Orçamento x gasto" description="Últimos 6 períodos">
            <BarsChart data={history} xKey="month" height={180} series={[{ key: "orcamento", name: "Orçamento", color: "var(--muted)" }, { key: "gasto", name: "Gasto", color: pot.color }]} />
          </Panel>
          <Panel title="Encerramento do período" action={<Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setRule(pot.leftoverRule); setRuleOpen(true); }}><Settings2 className="h-3.5 w-3.5" />Configurar</Button>}>
            <p className="text-sm font-medium">{RULE_LABEL[pot.leftoverRule].title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{RULE_LABEL[pot.leftoverRule].desc}</p>
            <p className="mt-3 rounded-xl bg-muted p-3 text-xs">Se o período terminasse hoje, sobrariam <strong className="tabular">{formatBRL(Math.max(left, 0))}</strong>.</p>
          </Panel>
        </div>
      </div>

      <PotFormDialog open={editing} pot={pot} onClose={() => setEditing(false)} />
      <PotTransferDialog open={transfer} fromId={pot.id} onClose={() => setTransfer(false)} />
      <Dialog open={ruleOpen} onOpenChange={setRuleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-display text-xl font-medium">Regra de saldo restante</DialogTitle><DialogDescription>O que fazer com o dinheiro que sobrar em {pot.name} ao fim do período.</DialogDescription></DialogHeader>
          <RulePicker value={rule} onChange={setRule} />
          <DialogFooter className="gap-2"><Button variant="ghost" onClick={() => setRuleOpen(false)}>Cancelar</Button><Button onClick={() => { setPots((ps) => ps.map((p) => p.id === pot.id ? { ...p, leftoverRule: rule } : p)); setRuleOpen(false); toast.success("Regra atualizada"); }}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
