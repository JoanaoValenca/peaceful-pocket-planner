import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, Panel, PotIcon, Segmented } from "@/components/shared/ui-kit";
import { BarsChart, AreaTrend, Donut, Lines } from "@/components/shared/charts";
import { PotMeter } from "@/components/shared/PotCard";
import { useFinance } from "@/store/finance-store";
import { monthlyHistory } from "@/data/mock";
import { formatBRL, pct } from "@/lib/format";

export const Route = createFileRoute("/relatorios")({
  head: () => ({ meta: [
    { title: "Relatórios — Pote" },
    { name: "description", content: "Análises de receitas, despesas, potes e necessidade versus impulso." },
    { property: "og:title", content: "Relatórios — Pote" },
    { property: "og:description", content: "Análises de receitas, despesas, potes e necessidade versus impulso." },
  ] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { pots } = useFinance();
  const [period, setPeriod] = useState<"3" | "6">("6");
  const [potFilter, setPotFilter] = useState("todos");
  const data = monthlyHistory.slice(-Number(period));
  const totals = data.reduce((a, m) => ({ r: a.r + m.receitas, d: a.d + m.despesas, n: a.n + m.necessidade, i: a.i + m.impulso }), { r: 0, d: 0, n: 0, i: 0 });
  const potSpend = pots.map((p) => ({ name: p.name, value: p.spent, color: p.color })).filter((p) => p.value > 0);
  // Demonstrative impulse share per pot.
  const byPot = pots.filter((p) => p.spent > 0).map((p, i) => { const imp = Math.round(p.spent * ([0.12, 0.05, 0.6, 0.08, 0.7, 0.1, 0.45, 0][i % 8] ?? 0)); return { pot: p.name, necessidade: p.spent - imp, impulso: imp }; });
  const shown = potFilter === "todos" ? pots : pots.filter((p) => p.id === potFilter);
  const prev = monthlyHistory[monthlyHistory.length - 2]!, cur = monthlyHistory[monthlyHistory.length - 1]!;

  return (
    <>
      <PageHeader title="Relatórios" description="Entenda seu comportamento financeiro ao longo do tempo."
        actions={<Segmented value={period} onChange={setPeriod} options={[{ value: "3", label: "3 meses" }, { value: "6", label: "6 meses" }]} />} />
      <Tabs defaultValue="geral">
        <TabsList className="mb-6 h-10 rounded-xl"><TabsTrigger value="geral" className="rounded-lg px-3">Visão geral</TabsTrigger><TabsTrigger value="potes" className="rounded-lg px-3">Por potes</TabsTrigger><TabsTrigger value="ni" className="rounded-lg px-3">Necessidade x impulso</TabsTrigger></TabsList>

        <TabsContent value="geral" className="space-y-4">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border lg:grid-cols-4">
            {[["Receitas", totals.r], ["Despesas", totals.d], ["Diferença", totals.r - totals.d], ["Média de despesas/mês", totals.d / data.length]].map(([l, v]) => <div key={l as string} className="bg-card p-5"><p className="text-xs text-muted-foreground">{l}</p><p className="mt-2 font-display text-2xl tabular">{formatBRL(v as number)}</p></div>)}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Comparativo mensal"><BarsChart data={data} xKey="month" series={[{ key: "receitas", name: "Receitas", color: "var(--chart-1)" }, { key: "despesas", name: "Despesas", color: "var(--chart-2)" }]} /></Panel>
            <Panel title="Evolução do saldo"><AreaTrend data={data} xKey="month" yKey="saldo" name="Saldo" height={240} /></Panel>
            <Panel title="Distribuição dos gastos" description="Novembro de 2026" className="lg:col-span-2">
              <div className="grid items-center gap-6 md:grid-cols-[240px_1fr]">
                <Donut data={potSpend} height={220} />
                <ul className="grid gap-2 sm:grid-cols-2">{potSpend.map((p) => <li key={p.name} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-muted"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />{p.name}</span><span className="tabular text-muted-foreground">{formatBRL(p.value)}</span></li>)}</ul>
              </div>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="potes" className="space-y-4">
          <div className="flex justify-end">
            <Select value={potFilter} onValueChange={setPotFilter}><SelectTrigger className="h-9 w-48 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os potes</SelectItem>{pots.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1.4fr] gap-4 border-b bg-muted/50 px-5 py-3 text-xs font-medium text-muted-foreground md:grid"><span>Pote</span><span>Orçamento</span><span>Reservado</span><span>Gasto</span><span>Restante</span><span>Utilização</span></div>
            <div className="divide-y">
              {shown.map((p) => (
                <div key={p.id} className="grid grid-cols-2 items-center gap-3 px-5 py-4 text-sm md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1.4fr] md:gap-4">
                  <span className="col-span-2 flex items-center gap-3 font-medium md:col-span-1"><PotIcon icon={p.icon} color={p.color} size="sm" />{p.name}</span>
                  <span className="tabular text-muted-foreground"><span className="text-xs md:hidden">Orçamento </span>{formatBRL(p.budget)}</span>
                  <span className="tabular"><span className="text-xs text-muted-foreground md:hidden">Reservado </span>{formatBRL(p.reserved)}</span>
                  <span className="tabular"><span className="text-xs text-muted-foreground md:hidden">Gasto </span>{formatBRL(p.spent)}</span>
                  <span className="tabular font-medium"><span className="text-xs font-normal text-muted-foreground md:hidden">Restante </span>{formatBRL(p.reserved - p.spent)}</span>
                  <span className="col-span-2 flex items-center gap-2 md:col-span-1"><PotMeter pot={p} /><span className="w-10 text-right text-xs tabular text-muted-foreground">{pct(p.spent, p.reserved)}%</span></span>
                </div>
              ))}
            </div>
          </div>
          <Panel title="Histórico de utilização" description="Gasto total nos potes por mês">
            <BarsChart data={data.map((m) => ({ month: m.month, gasto: Math.round(m.despesas * 0.55), orcamento: pots.reduce((s, p) => s + p.budget, 0) }))} xKey="month" series={[{ key: "orcamento", name: "Orçamento", color: "var(--sand)" }, { key: "gasto", name: "Gasto nos potes", color: "var(--chart-1)" }]} />
          </Panel>
        </TabsContent>

        <TabsContent value="ni" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-card p-5"><p className="flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-primary" />Necessidades</p><p className="mt-2 font-display text-2xl tabular">{formatBRL(totals.n)}</p><p className="text-xs text-muted-foreground">{pct(totals.n, totals.n + totals.i)}% dos gastos classificados</p></div>
            <div className="rounded-2xl border bg-card p-5"><p className="flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-impulse" />Impulso</p><p className="mt-2 font-display text-2xl tabular">{formatBRL(totals.i)}</p><p className="text-xs text-muted-foreground">{pct(totals.i, totals.n + totals.i)}% dos gastos classificados</p></div>
            <div className="rounded-2xl border bg-card p-5"><p className="text-xs text-muted-foreground">Comparativo com o mês anterior</p><p className="mt-2 text-sm">Impulso em novembro: <strong className="tabular">{formatBRL(cur.impulso)}</strong></p><p className="text-sm">Em outubro: <strong className="tabular">{formatBRL(prev.impulso)}</strong></p><p className="mt-1 text-xs text-muted-foreground">Novembro ainda está em andamento.</p></div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Evolução mensal"><Lines data={data} xKey="month" series={[{ key: "necessidade", name: "Necessidade", color: "var(--chart-1)" }, { key: "impulso", name: "Impulso", color: "var(--impulse)" }]} /></Panel>
            <Panel title="Proporção por mês"><BarsChart stacked data={data} xKey="month" series={[{ key: "necessidade", name: "Necessidade", color: "var(--chart-1)" }, { key: "impulso", name: "Impulso", color: "var(--impulse)" }]} /></Panel>
            <Panel title="Distribuição por pote" description="Novembro de 2026" className="lg:col-span-2">
              <BarsChart stacked data={byPot} xKey="pot" series={[{ key: "necessidade", name: "Necessidade", color: "var(--chart-1)" }, { key: "impulso", name: "Impulso", color: "var(--impulse)" }]} height={260} />
            </Panel>
          </div>
          <p className="text-center text-xs text-muted-foreground">Essas informações servem para você conhecer seus hábitos. Não existe proporção certa ou errada.</p>
        </TabsContent>
      </Tabs>
    </>
  );
}
