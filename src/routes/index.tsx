import { useUsers } from "@/store/users-store";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, Shuffle, ArrowRight, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, StatCard, InfoTip, Bar, PotIcon, Money } from "@/components/shared/ui-kit";
import { BarsChart, AreaTrend, Donut } from "@/components/shared/charts";
import { useFinance, useSummary } from "@/store/finance-store";
import { useQuickActions } from "@/components/layout/AppShell";
import { monthlyHistory, balanceDaily } from "@/data/mock";
import { formatBRL, formatDate, pct } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Visão geral — Pote" },
    { name: "description", content: "Sua situação financeira de hoje: saldos, potes, reservas e compromissos." },
    { property: "og:title", content: "Visão geral — Pote" },
    { property: "og:description", content: "Sua situação financeira de hoje: saldos, potes, reservas e compromissos." },
  ] }),
  component: Dashboard,
});

function Dashboard() {
  const { current: me } = useUsers();
  const s = useSummary();
  const { pots, fixedExpenses, installments } = useFinance();
  const qa = useQuickActions();
  const current = monthlyHistory[monthlyHistory.length - 1]!;

  // Composition of the total balance — each real is shown exactly once.
  const parts = [
    { label: "Contas de reserva", value: s.accountReserves, color: "var(--chart-5)" },
    { label: "Reservas virtuais", value: s.virtualReserves, color: "var(--chart-2)" },
    { label: "Saldo nos potes", value: s.potsRemaining, color: "var(--chart-1)" },
    { label: "Não distribuído", value: Math.max(s.undistributed, 0), color: "var(--chart-3)" },
  ];
  const potSpend = pots.filter((p) => p.spent > 0).map((p) => ({ name: p.name, value: p.spent, color: p.color }));
  const upcoming = [
    ...fixedExpenses.filter((f) => f.status !== "paga" && f.status !== "cancelada").map((f) => ({ id: f.id, name: f.name, amount: f.amount, due: f.nextDue, late: f.status === "atrasada", kind: "Despesa fixa" })),
    ...installments.filter((i) => !i.cancelled).flatMap((i) => { const n = i.installments.find((x) => x.status !== "paga"); return n ? [{ id: i.id, name: `${i.description} (${n.n}/${i.count})`, amount: n.amount, due: n.due, late: n.status === "atrasada", kind: "Parcela" }] : []; }),
  ].sort((a, b) => a.due.localeCompare(b.due)).slice(0, 5);
  const necTotal = current.necessidade + current.impulso;

  return (
    <>
      <PageHeader title={`Olá, ${me.name.split(" ")[0]}`} description="Terça-feira, 17/11/2026 · Aqui está o retrato do seu dinheiro hoje."
        actions={<>
          <Button variant="outline" onClick={() => qa.newTransaction("receita")}><ArrowDownLeft className="h-4 w-4 text-success" />Receita</Button>
          <Button variant="outline" onClick={() => qa.newTransaction("despesa")}><ArrowUpRight className="h-4 w-4 text-destructive" />Despesa</Button>
          <Button onClick={qa.distribute}><Shuffle className="h-4 w-4" />Distribuir</Button>
        </>} />

      {/* Balance composition */}
      <section className="mb-4 rounded-2xl border bg-card p-5 md:p-7">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">Saldo total nas contas
              <InfoTip>Soma dos saldos reais de todas as contas ativas, contando cada conta uma única vez. Potes e reservas são partes deste valor, não dinheiro extra.</InfoTip>
            </div>
            <p className="mt-2 font-display text-4xl font-medium tracking-tight tabular md:text-5xl">{formatBRL(s.totalBalance)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Em 4 contas ativas</p>
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground md:text-right">Como esse dinheiro está organizado — cada parte já faz parte do saldo acima.</p>
        </div>
        <div className="mt-6 flex h-3 w-full gap-0.5 overflow-hidden rounded-full">
          {parts.map((p) => <div key={p.label} className="h-full animate-grow-x first:rounded-l-full last:rounded-r-full" style={{ width: `${(p.value / s.totalBalance) * 100}%`, background: p.color }} />)}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-4">
          {parts.map((p) => (
            <div key={p.label} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: p.color }} />
              <div><p className="text-xs text-muted-foreground">{p.label}</p><p className="text-sm font-semibold tabular">{formatBRL(p.value)}</p></div>
            </div>
          ))}
        </div>
      </section>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard tone="primary" label="Disponível para gastar" value={s.available} info="Saldo das contas de uso cotidiano menos o que está protegido em reservas virtuais." hint={`${formatBRL(s.dailyBalance)} em contas do dia a dia`} />
        <StatCard label="Distribuído nos potes" value={s.potsRemaining} info="Saldo ainda disponível dentro dos potes. Faz parte do dinheiro disponível." hint={`${pots.length} potes ativos`} />
        <StatCard tone="sand" label="Não distribuído" value={s.undistributed} info="Parte do dinheiro disponível que ainda não foi destinada a nenhum pote." footer={<Button size="sm" variant="secondary" className="h-7 bg-card text-xs" onClick={qa.distribute}>Distribuir agora</Button>} />
        <StatCard label="Reservas financeiras" value={s.virtualReserves + s.accountReserves} info="Dinheiro protegido. Reservas virtuais ficam dentro de contas cotidianas; as demais estão em contas próprias de reserva." hint={<>{formatBRL(s.virtualReserves)} virtual · {formatBRL(s.accountReserves)} em contas</>} />
        <StatCard tone="warning" label="Compromissos futuros" value={s.commitments} info="Despesas fixas e parcelas ainda não pagas. É uma previsão — não sai do saldo até ser paga." hint={<>{formatBRL(s.pendingFixed)} fixas · {formatBRL(s.pendingInstallments)} parcelas</>} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Receitas e despesas" description="Últimos 6 meses" className="lg:col-span-2">
          <BarsChart data={monthlyHistory} xKey="month" series={[{ key: "receitas", name: "Receitas", color: "var(--chart-1)" }, { key: "despesas", name: "Despesas", color: "var(--chart-2)" }]} />
        </Panel>
        <Panel title="Próximos compromissos" action={<Link to="/compromissos" className="text-xs text-primary hover:underline">Ver todos</Link>}>
          <ul className="space-y-3">
            {upcoming.map((u) => (
              <li key={u.id + u.due} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted"><CalendarClock className="h-4 w-4 text-muted-foreground" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{u.name}</p>
                  <p className={u.late ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>{u.late ? "Em atraso · " : ""}{formatDate(u.due)} · {u.kind}</p>
                </div>
                <Money value={u.amount} className="text-sm font-medium" />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Gastos por pote" description="Novembro de 2026">
          <div className="relative">
            <Donut data={potSpend} height={180} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><p className="text-[11px] text-muted-foreground">Total</p><p className="text-sm font-semibold tabular">{formatBRL(potSpend.reduce((a, b) => a + b.value, 0))}</p></div>
          </div>
          <ul className="mt-3 space-y-1.5">
            {potSpend.slice(0, 5).map((p) => <li key={p.name} className="flex items-center justify-between text-xs"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: p.color }} />{p.name}</span><span className="tabular text-muted-foreground">{formatBRL(p.value)}</span></li>)}
          </ul>
        </Panel>

        <Panel title="Necessidade e impulso" description="Gastos classificados neste mês">
          <div className="flex items-end gap-6">
            <div><p className="text-xs text-muted-foreground">Necessidade</p><p className="font-display text-2xl tabular">{pct(current.necessidade, necTotal)}%</p><p className="text-xs tabular text-muted-foreground">{formatBRL(current.necessidade)}</p></div>
            <div><p className="text-xs text-muted-foreground">Impulso</p><p className="font-display text-2xl tabular">{pct(current.impulso, necTotal)}%</p><p className="text-xs tabular text-muted-foreground">{formatBRL(current.impulso)}</p></div>
          </div>
          <div className="mt-5 flex h-2.5 overflow-hidden rounded-full">
            <div className="animate-grow-x bg-primary" style={{ width: `${pct(current.necessidade, necTotal)}%` }} />
            <div className="bg-impulse" style={{ width: `${pct(current.impulso, necTotal)}%` }} />
          </div>
          <Link to="/relatorios" className="mt-5 inline-flex items-center gap-1 text-xs text-primary hover:underline">Ver análise completa <ArrowRight className="h-3 w-3" /></Link>
        </Panel>

        <Panel title="Evolução do saldo" description="Novembro de 2026">
          <AreaTrend data={balanceDaily} xKey="day" yKey="saldo" name="Saldo" height={200} />
        </Panel>

        <Panel title="Seus potes" className="lg:col-span-3" action={<Link to="/potes" className="text-xs text-primary hover:underline">Gerenciar potes</Link>}>
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            {pots.map((p) => (
              <Link key={p.id} to="/potes/$potId" params={{ potId: p.id }} className="group flex items-center gap-3">
                <PotIcon icon={p.icon} color={p.color} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between text-xs"><span className="truncate font-medium group-hover:text-primary">{p.name}</span><span className="tabular text-muted-foreground">{formatBRL(p.reserved - p.spent)}</span></div>
                  <Bar value={p.spent} max={p.reserved} color={p.color} className="mt-1.5" />
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
