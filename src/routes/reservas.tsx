import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Pencil, ArrowDownToLine, ArrowUpFromLine, History, Layers, Landmark, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader, Bar, Field, MoneyInput, InfoTip, EmptyState } from "@/components/shared/ui-kit";
import { TransactionRow } from "@/components/shared/TransactionRow";
import { useFinance, useSummary } from "@/store/finance-store";
import { formatBRL, formatDate, parseBRL, pct } from "@/lib/format";
import type { Reserve } from "@/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reservas")({
  head: () => ({ meta: [
    { title: "Reservas financeiras — Pote" },
    { name: "description", content: "Acompanhe o dinheiro protegido para emergências e objetivos." },
    { property: "og:title", content: "Reservas financeiras — Pote" },
    { property: "og:description", content: "Acompanhe o dinheiro protegido para emergências e objetivos." },
  ] }),
  component: ReservesPage,
});

function ReservesPage() {
  const { reserves, setReserves, accounts, transactions, addTransaction } = useFinance();
  const s = useSummary();
  const [editing, setEditing] = useState<Reserve | "new" | null>(null);
  const [moving, setMoving] = useState<{ r: Reserve; kind: "add" | "remove" } | null>(null);
  const [history, setHistory] = useState<Reserve | null>(null);
  const accName = (id: string) => { const a = accounts.find((x) => x.id === id); return a ? `${a.institution} · ${a.name}` : "—"; };

  const Card = ({ r }: { r: Reserve }) => {
    const p = pct(r.amount, r.target);
    return (
      <article className="flex flex-col rounded-2xl border bg-card p-5">
        <div className="flex items-start justify-between gap-2">
          <div><p className="text-sm font-semibold">{r.name}</p><p className="text-xs text-muted-foreground">{r.goal}</p></div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Ações"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setMoving({ r, kind: "add" })}><ArrowDownToLine />Adicionar valor</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMoving({ r, kind: "remove" })}><ArrowUpFromLine />Retirar valor</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setHistory(r)}><History />Histórico</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditing(r)}><Pencil />Editar reserva</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-5 flex items-end justify-between">
          <p className="font-display text-2xl tabular">{formatBRL(r.amount)}</p>
          <p className="text-xs tabular text-muted-foreground">de {formatBRL(r.target)}</p>
        </div>
        <Bar value={r.amount} max={r.target} className="mt-3 h-2" color="var(--primary)" />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{p}% alcançado</span>{r.dueDate && <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDate(r.dueDate)}</span>}</div>
        <div className="mt-4 flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
          {r.location === "virtual" ? <Layers className="h-3.5 w-3.5" /> : <Landmark className="h-3.5 w-3.5" />}
          <span className="truncate">{r.location === "virtual" ? "Virtual dentro de " : "Em "}{accName(r.accountId)}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" onClick={() => setMoving({ r, kind: "add" })}>Adicionar</Button>
          <Button variant="ghost" size="sm" onClick={() => setMoving({ r, kind: "remove" })}>Retirar</Button>
        </div>
      </article>
    );
  };

  const virtual = reserves.filter((r) => r.location === "virtual");
  const inAccount = reserves.filter((r) => r.location === "conta");

  return (
    <>
      <PageHeader title="Reservas financeiras" description="Dinheiro que você protege do consumo do dia a dia."
        actions={<Button onClick={() => setEditing("new")}><Plus className="h-4 w-4" />Criar reserva</Button>} />

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-primary p-5 text-primary-foreground"><p className="text-xs text-primary-foreground/80">Total protegido</p><p className="mt-2 font-display text-3xl tabular">{formatBRL(s.virtualReserves + s.accountReserves)}</p></div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Layers className="h-3.5 w-3.5" />Reservas virtuais<InfoTip>Dinheiro separado dentro de uma conta de uso cotidiano. Continua na conta, mas é descontado do disponível para gastar.</InfoTip></p>
          <p className="mt-2 font-display text-2xl tabular">{formatBRL(s.virtualReserves)}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Landmark className="h-3.5 w-3.5" />Em contas de reserva<InfoTip>Dinheiro guardado em uma conta bancária própria para reserva, separada das contas do dia a dia.</InfoTip></p>
          <p className="mt-2 font-display text-2xl tabular">{formatBRL(s.accountReserves)}</p>
        </div>
      </div>

      {[{ title: "Em contas bancárias de reserva", desc: "Ficam em contas separadas — não aparecem no seu dinheiro do dia a dia.", list: inAccount }, { title: "Reservas virtuais", desc: "Ficam dentro das contas de uso cotidiano, mas estão protegidas.", list: virtual }].map((g) => (
        <section key={g.title} className="mb-8">
          <h2 className="text-sm font-semibold">{g.title}</h2>
          <p className="mb-4 text-xs text-muted-foreground">{g.desc}</p>
          {g.list.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{g.list.map((r) => <Card key={r.id} r={r} />)}</div> : <EmptyState title="Nenhuma reserva aqui" />}
        </section>
      ))}

      <ReserveForm open={editing !== null} reserve={editing === "new" ? null : editing} onClose={() => setEditing(null)}
        onSave={(r) => { setReserves((p) => p.some((x) => x.id === r.id) ? p.map((x) => x.id === r.id ? r : x) : [...p, r]); toast.success(editing === "new" ? "Reserva criada" : "Reserva atualizada"); setEditing(null); }} />

      <MoveDialog state={moving} onClose={() => setMoving(null)} onConfirm={(v) => {
        const { r, kind } = moving!;
        setReserves((p) => p.map((x) => x.id === r.id ? { ...x, amount: x.amount + (kind === "add" ? v : -v) } : x));
        addTransaction({ type: kind === "add" ? "deposito_reserva" : "retirada_reserva", amount: v, date: "2026-11-17", description: `${kind === "add" ? "Depósito" : "Retirada"} — ${r.name}`, reserveId: r.id, accountId: r.accountId });
        toast.success(kind === "add" ? "Valor adicionado à reserva" : "Valor retirado da reserva");
        setMoving(null);
      }} />

      <Sheet open={!!history} onOpenChange={(o) => !o && setHistory(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {history && <>
            <SheetHeader><SheetTitle className="font-display text-2xl font-medium">{history.name}</SheetTitle><SheetDescription>Histórico de depósitos e retiradas</SheetDescription></SheetHeader>
            {(() => { const t = transactions.filter((x) => x.reserveId === history.id); return t.length ? <div className="mt-4 divide-y">{t.map((x) => <TransactionRow key={x.id} tx={x} compact />)}</div> : <div className="mt-6"><EmptyState title="Sem movimentações" description="Depósitos e retiradas desta reserva aparecerão aqui." /></div>; })()}
          </>}
        </SheetContent>
      </Sheet>
    </>
  );
}

function ReserveForm({ open, reserve, onClose, onSave }: { open: boolean; reserve: Reserve | null; onClose: () => void; onSave: (r: Reserve) => void }) {
  const { accounts } = useFinance();
  const [f, setF] = useState({ name: "", goal: "", target: "", dueDate: "", location: "virtual" as Reserve["location"], accountId: "" });
  const [lastKey, setLastKey] = useState<string | null>(null);
  const key = open ? reserve?.id ?? "new" : null;
  if (key !== lastKey) { setLastKey(key); if (open) setF(reserve ? { name: reserve.name, goal: reserve.goal, target: reserve.target.toFixed(2).replace(".", ","), dueDate: reserve.dueDate ?? "", location: reserve.location, accountId: reserve.accountId } : { name: "", goal: "", target: "", dueDate: "", location: "virtual", accountId: "" }); }
  const eligible = accounts.filter((a) => a.active && a.use === (f.location === "virtual" ? "cotidiano" : "reserva"));
  const save = () => {
    const target = parseBRL(f.target);
    if (!f.name.trim() || !target || !f.accountId) { toast.error("Preencha nome, meta e conta."); return; }
    onSave({ id: reserve?.id ?? `res-${Date.now()}`, amount: reserve?.amount ?? 0, name: f.name, goal: f.goal, target, dueDate: f.dueDate || undefined, location: f.location, accountId: f.accountId });
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md">
        <DialogHeader><DialogTitle className="font-display text-xl font-medium">{reserve ? "Editar reserva" : "Nova reserva"}</DialogTitle><DialogDescription>Defina um objetivo e onde o dinheiro ficará guardado.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <Field label="Nome"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ex.: Viagem de férias" /></Field>
          <Field label="Objetivo"><Input value={f.goal} onChange={(e) => setF({ ...f, goal: e.target.value })} placeholder="Para que serve esta reserva?" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Meta"><MoneyInput value={f.target} onChange={(v) => setF({ ...f, target: v })} /></Field>
            <Field label="Data desejada (opcional)"><Input type="date" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} /></Field>
          </div>
          <Field label="Onde fica o dinheiro?">
            <div className="grid grid-cols-2 gap-2">
              {([["virtual", "Reserva virtual", "Dentro de uma conta do dia a dia", Layers], ["conta", "Conta de reserva", "Em uma conta bancária separada", Landmark]] as const).map(([v, t, d, Icon]) => (
                <button key={v} type="button" onClick={() => setF({ ...f, location: v, accountId: "" })} className={cn("rounded-xl border p-3 text-left transition-colors", f.location === v ? "border-primary bg-primary-soft" : "hover:bg-muted")}>
                  <Icon className="mb-2 h-4 w-4 text-primary" /><span className="block text-sm font-medium">{t}</span><span className="text-xs text-muted-foreground">{d}</span>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Conta"><Select value={f.accountId} onValueChange={(v) => setF({ ...f, accountId: v })}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{eligible.map((a) => <SelectItem key={a.id} value={a.id}>{a.institution} · {a.name}</SelectItem>)}</SelectContent></Select></Field>
        </div>
        <DialogFooter className="gap-2"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={save}>Salvar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MoveDialog({ state, onClose, onConfirm }: { state: { r: Reserve; kind: "add" | "remove" } | null; onClose: () => void; onConfirm: (v: number) => void }) {
  const [v, setV] = useState("");
  const n = parseBRL(v);
  const err = state && state.kind === "remove" && n > state.r.amount ? `A reserva tem ${formatBRL(state.r.amount)}.` : null;
  return (
    <Dialog open={!!state} onOpenChange={(o) => { if (!o) { onClose(); setV(""); } }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle className="font-display text-xl font-medium">{state?.kind === "add" ? "Adicionar valor" : "Retirar valor"}</DialogTitle><DialogDescription>{state?.r.name}</DialogDescription></DialogHeader>
        <Field label="Valor" error={err ?? undefined}><MoneyInput value={v} onChange={setV} autoFocus /></Field>
        {state && n > 0 && !err && <p className="text-xs text-muted-foreground">Novo saldo da reserva: <strong className="tabular">{formatBRL(state.r.amount + (state.kind === "add" ? n : -n))}</strong></p>}
        <DialogFooter className="gap-2"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button disabled={!n || n <= 0 || !!err} onClick={() => { onConfirm(n); setV(""); }}>Confirmar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
