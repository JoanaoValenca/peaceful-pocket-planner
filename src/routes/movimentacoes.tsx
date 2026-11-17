import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PageHeader, NatureBadge, EmptyState } from "@/components/shared/ui-kit";
import { TransactionRow, txDirection, useTxLabels } from "@/components/shared/TransactionRow";
import { TX_LABELS } from "@/components/dialogs/TransactionDialog";
import { useFinance } from "@/store/finance-store";
import { useQuickActions } from "@/components/layout/AppShell";
import { formatBRL, formatDate } from "@/lib/format";
import type { TxType } from "@/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/movimentacoes")({
  head: () => ({ meta: [
    { title: "Movimentações — Pote" },
    { name: "description", content: "Receitas, despesas, transferências e demais movimentações em um só lugar." },
    { property: "og:title", content: "Movimentações — Pote" },
    { property: "og:description", content: "Receitas, despesas, transferências e demais movimentações em um só lugar." },
  ] }),
  component: TransactionsPage,
});

const ALL = "todos";
type Filters = { period: string; account: string; pot: string; category: string; type: string; nature: string };
const EMPTY: Filters = { period: "nov", account: ALL, pot: ALL, category: ALL, type: ALL, nature: ALL };

function TransactionsPage() {
  const { transactions, accounts, pots } = useFinance();
  const qa = useQuickActions();
  const labels = useTxLabels();
  const [q, setQ] = useState("");
  const [f, setF] = useState<Filters>(EMPTY);
  const [sheet, setSheet] = useState(false);
  const categories = [...new Set(transactions.map((t) => t.category).filter(Boolean))] as string[];

  const list = useMemo(() => transactions.filter((t) =>
    (!q || t.description.toLowerCase().includes(q.toLowerCase())) &&
    (f.period === ALL || (f.period === "nov" ? t.date.startsWith("2026-11") : t.date.startsWith("2026-10"))) &&
    (f.account === ALL || t.accountId === f.account || t.toAccountId === f.account) &&
    (f.pot === ALL || t.potId === f.pot || t.toPotId === f.pot) &&
    (f.category === ALL || t.category === f.category) &&
    (f.type === ALL || t.type === f.type) &&
    (f.nature === ALL || t.nature === f.nature)
  ), [transactions, q, f]);

  const inTotal = list.filter((t) => txDirection(t) === "in").reduce((s, t) => s + t.amount, 0);
  const outTotal = list.filter((t) => txDirection(t) === "out").reduce((s, t) => s + t.amount, 0);
  const activeCount = (Object.keys(f) as (keyof Filters)[]).filter((k) => f[k] !== EMPTY[k]).length;

  const sel = (key: keyof Filters, placeholder: string, opts: { v: string; l: string }[]) => (
    <Select value={f[key]} onValueChange={(v) => setF({ ...f, [key]: v })}>
      <SelectTrigger className={cn("h-9 w-full text-xs lg:w-auto lg:min-w-32", f[key] !== EMPTY[key] && "border-primary/50 bg-primary-soft")}><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>{opts.map((o) => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
    </Select>
  );
  const filterControls = <>
    {sel("period", "Período", [{ v: "nov", l: "Novembro 2026" }, { v: "out", l: "Outubro 2026" }, { v: ALL, l: "Todo o período" }])}
    {sel("type", "Tipo", [{ v: ALL, l: "Todos os tipos" }, ...(Object.keys(TX_LABELS) as TxType[]).map((t) => ({ v: t, l: TX_LABELS[t] }))])}
    {sel("account", "Conta", [{ v: ALL, l: "Todas as contas" }, ...accounts.map((a) => ({ v: a.id, l: a.institution }))])}
    {sel("pot", "Pote", [{ v: ALL, l: "Todos os potes" }, ...pots.map((p) => ({ v: p.id, l: p.name }))])}
    {sel("category", "Categoria", [{ v: ALL, l: "Todas as categorias" }, ...categories.map((c) => ({ v: c, l: c }))])}
    {sel("nature", "Classificação", [{ v: ALL, l: "Necessidade e impulso" }, { v: "necessidade", l: "Necessidade" }, { v: "impulso", l: "Impulso" }])}
  </>;

  return (
    <>
      <PageHeader title="Movimentações" description="Tudo o que entrou, saiu ou mudou de lugar."
        actions={<Button onClick={() => qa.newTransaction("despesa")}><Plus className="h-4 w-4" />Registrar movimentação</Button>} />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-xs"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar descrição" className="pl-9" /></div>
        <div className="hidden flex-wrap gap-2 lg:flex">{filterControls}</div>
        <Button variant="outline" className="lg:hidden" onClick={() => setSheet(true)}><SlidersHorizontal className="h-4 w-4" />Filtros{activeCount > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{activeCount}</span>}</Button>
        {activeCount > 0 && <Button variant="ghost" size="sm" onClick={() => setF(EMPTY)} className="text-xs"><X className="h-3.5 w-3.5" />Limpar filtros</Button>}
      </div>

      <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <span className="text-muted-foreground">{list.length} movimentações</span>
        <span>Entradas <strong className="tabular text-success">{formatBRL(inTotal)}</strong></span>
        <span>Saídas <strong className="tabular">{formatBRL(outTotal)}</strong></span>
      </div>

      {list.length === 0 ? <EmptyState title="Nada encontrado" description="Ajuste a busca ou os filtros para ver outras movimentações." action={<Button variant="outline" size="sm" onClick={() => { setF(EMPTY); setQ(""); }}>Limpar tudo</Button>} /> : <>
        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-2xl border bg-card md:block">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>{["Data", "Descrição", "Tipo", "Conta", "Pote / categoria", "Classificação"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}<th className="px-4 py-3 text-right font-medium">Valor</th></tr>
            </thead>
            <tbody className="divide-y">
              {list.map((t) => { const l = labels(t); const dir = txDirection(t); return (
                <tr key={t.id} className="transition-colors hover:bg-muted/40">
                  <td className="whitespace-nowrap px-4 py-3 tabular text-muted-foreground">{formatDate(t.date)}</td>
                  <td className="px-4 py-3 font-medium">{t.description}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{TX_LABELS[t.type]}</td>
                  <td className="px-4 py-3 text-xs">{l.account}</td>
                  <td className="px-4 py-3 text-xs">{l.category}</td>
                  <td className="px-4 py-3"><NatureBadge nature={t.nature} /></td>
                  <td className={cn("whitespace-nowrap px-4 py-3 text-right font-semibold tabular", dir === "in" && "text-success", dir === "neutral" && "text-muted-foreground")}>{dir === "in" ? "+ " : dir === "out" ? "− " : ""}{formatBRL(t.amount)}</td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
        {/* Mobile list */}
        <div className="divide-y rounded-2xl border bg-card px-4 md:hidden">{list.map((t) => <TransactionRow key={t.id} tx={t} />)}</div>
      </>}

      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader><SheetTitle>Filtros</SheetTitle></SheetHeader>
          <div className="grid gap-3 py-4">{filterControls}</div>
          <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => setF(EMPTY)}>Limpar</Button><Button onClick={() => setSheet(false)}>Ver {list.length} resultados</Button></div>
        </SheetContent>
      </Sheet>
    </>
  );
}
