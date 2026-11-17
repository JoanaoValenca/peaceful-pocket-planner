import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Check, Pencil, History, Ban, CalendarDays, FastForward, Repeat2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader, StatusBadge, NatureBadge, Field, MoneyInput, Bar, Segmented, EmptyState } from "@/components/shared/ui-kit";
import { useFinance } from "@/store/finance-store";
import { formatBRL, formatDate, parseBRL, todayISO } from "@/lib/format";
import type { FixedExpense, InstallmentPurchase, Nature } from "@/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/compromissos")({
  head: () => ({ meta: [
    { title: "Despesas e compromissos — Pote" },
    { name: "description", content: "Despesas fixas e compras parceladas com vencimentos e status." },
    { property: "og:title", content: "Despesas e compromissos — Pote" },
    { property: "og:description", content: "Despesas fixas e compras parceladas com vencimentos e status." },
  ] }),
  component: CommitmentsPage,
});

const FREQ = { mensal: "Mensal", anual: "Anual", semanal: "Semanal" };

function CommitmentsPage() {
  return (
    <>
      <PageHeader title="Despesas e compromissos" description="O que já está combinado para os próximos meses." />
      <Tabs defaultValue="fixas">
        <TabsList className="mb-6 h-10 rounded-xl"><TabsTrigger value="fixas" className="rounded-lg px-4">Despesas fixas</TabsTrigger><TabsTrigger value="parceladas" className="rounded-lg px-4">Compras parceladas</TabsTrigger></TabsList>
        <TabsContent value="fixas"><FixedTab /></TabsContent>
        <TabsContent value="parceladas"><InstallmentsTab /></TabsContent>
      </Tabs>
    </>
  );
}

function FixedTab() {
  const { fixedExpenses: list, setFixedExpenses, accounts, pots } = useFinance();
  const [paying, setPaying] = useState<FixedExpense | null>(null);
  const [editing, setEditing] = useState<FixedExpense | "new" | null>(null);
  const [hist, setHist] = useState<FixedExpense | null>(null);
  const [cancel, setCancel] = useState<FixedExpense | null>(null);
  const month = list.filter((f) => f.nextDue.startsWith("2026-11"));
  const sum = (fn: (f: FixedExpense) => boolean) => month.filter(fn).reduce((s, f) => s + f.amount, 0);
  const kpis = [
    { l: "Previsto no mês", v: sum((f) => f.status !== "cancelada") },
    { l: "Já pago", v: sum((f) => f.status === "paga"), c: "text-success" },
    { l: "Pendente", v: sum((f) => f.status === "pendente") },
    { l: "Em atraso", v: sum((f) => f.status === "atrasada"), c: "text-destructive" },
  ];
  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border lg:grid-cols-4">
        {kpis.map((k) => <div key={k.l} className="bg-card p-5"><p className="text-xs text-muted-foreground">{k.l}</p><p className={cn("mt-2 font-display text-2xl tabular", k.c)}>{formatBRL(k.v)}</p></div>)}
      </div>
      <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">Despesas recorrentes</h2><Button size="sm" onClick={() => setEditing("new")}><Plus className="h-4 w-4" />Cadastrar despesa</Button></div>
      <div className="divide-y rounded-2xl border bg-card">
        {list.map((f) => {
          const pot = pots.find((p) => p.id === f.potId);
          return (
            <div key={f.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 md:flex-nowrap">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted"><Repeat2 className="h-4 w-4 text-muted-foreground" /></div>
                <div className="min-w-0">
                  <p className={cn("truncate text-sm font-medium", f.status === "cancelada" && "text-muted-foreground line-through")}>{f.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{f.category}{pot ? ` · Pote ${pot.name}` : ""} · {FREQ[f.frequency]}</p>
                </div>
              </div>
              <div className="hidden w-28 md:block"><NatureBadge nature={f.nature} /></div>
              <div className="w-28 text-xs"><p className="text-muted-foreground">Vencimento</p><p className={cn("tabular", f.status === "atrasada" && "text-destructive")}>{formatDate(f.nextDue)}</p></div>
              <div className="w-20"><StatusBadge status={f.status} /></div>
              <p className="w-24 text-right text-sm font-semibold tabular">{formatBRL(f.amount)}</p>
              <div className="flex items-center gap-1">
                {(f.status === "pendente" || f.status === "atrasada") && <Button size="sm" variant="secondary" className="h-8" onClick={() => setPaying(f)}><Check className="h-3.5 w-3.5" /><span className="hidden sm:inline">Pagar</span></Button>}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Ações"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditing(f)}><Pencil />Editar configuração</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setHist(f)}><History />Ocorrências e histórico</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled={f.status === "paga" || f.status === "cancelada"} onClick={() => setCancel(f)} className="text-destructive"><Ban />Cancelar ocorrência</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      <PayDialog title={paying?.name} amount={paying?.amount} potId={paying?.potId} open={!!paying} onClose={() => setPaying(null)}
        onConfirm={() => { setFixedExpenses((l) => l.map((x) => x.id === paying!.id ? { ...x, status: "paga" } : x)); toast.success(`${paying!.name} marcada como paga`); setPaying(null); }} />
      <FixedForm open={editing !== null} item={editing === "new" ? null : editing} onClose={() => setEditing(null)}
        onSave={(it) => { setFixedExpenses((l) => l.some((x) => x.id === it.id) ? l.map((x) => x.id === it.id ? it : x) : [...l, it]); toast.success(editing === "new" ? "Despesa recorrente cadastrada" : "Configuração atualizada"); setEditing(null); }} />
      <AlertDialog open={!!cancel} onOpenChange={(o) => !o && setCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Cancelar esta ocorrência?</AlertDialogTitle><AlertDialogDescription>A ocorrência de {cancel && formatDate(cancel.nextDue)} de “{cancel?.name}” não será cobrada. As próximas continuam programadas.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Voltar</AlertDialogCancel><AlertDialogAction onClick={() => { setFixedExpenses((l) => l.map((x) => x.id === cancel!.id ? { ...x, status: "cancelada" } : x)); toast("Ocorrência cancelada"); }}>Cancelar ocorrência</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Sheet open={!!hist} onOpenChange={(o) => !o && setHist(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {hist && <>
            <SheetHeader><SheetTitle className="font-display text-2xl font-medium">{hist.name}</SheetTitle><SheetDescription>{formatBRL(hist.amount)} · {FREQ[hist.frequency]} · {accounts[0] && "ocorrências"}</SheetDescription></SheetHeader>
            <ul className="mt-6 space-y-1">
              {[["2026-12", "pendente"], ["2026-11", hist.status], ["2026-10", "paga"], ["2026-09", "paga"], ["2026-08", "paga"]].map(([m, st]) => (
                <li key={m} className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-muted"><span className="text-sm tabular">{formatDate(`${m}-${hist.nextDue.slice(8, 10)}`)}</span><span className="flex items-center gap-3"><StatusBadge status={st} /><span className="text-sm tabular">{formatBRL(hist.amount)}</span></span></li>
              ))}
            </ul>
          </>}
        </SheetContent>
      </Sheet>
    </>
  );
}

function PayDialog({ title, amount, potId, open, onClose, onConfirm }: { title?: string; amount?: number; potId?: string; open: boolean; onClose: () => void; onConfirm: () => void }) {
  const { accounts, pots } = useFinance();
  const [v, setV] = useState(""); const [acc, setAcc] = useState(""); const [date, setDate] = useState(todayISO()); const [pot, setPot] = useState("");
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) { setWasOpen(open); if (open) { setV(amount ? amount.toFixed(2).replace(".", ",") : ""); setAcc(""); setDate(todayISO()); setPot(potId ?? ""); } }
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle className="font-display text-xl font-medium">Confirmar pagamento</DialogTitle><DialogDescription>{title}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <Field label="Valor efetivamente pago"><MoneyInput value={v} onChange={setV} /></Field>
          <Field label="Conta utilizada"><Select value={acc} onValueChange={setAcc}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{accounts.filter((a) => a.active && a.use === "cotidiano").map((a) => <SelectItem key={a.id} value={a.id}>{a.institution} · {a.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Data do pagamento"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Pote relacionado"><Select value={pot} onValueChange={setPot}><SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger><SelectContent>{pots.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></Field>
        </div>
        <DialogFooter className="gap-2"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={() => { if (!acc || !(parseBRL(v) > 0)) { toast.error("Informe o valor e a conta utilizada."); return; } onConfirm(); }}>Confirmar pagamento</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FixedForm({ open, item, onClose, onSave }: { open: boolean; item: FixedExpense | null; onClose: () => void; onSave: (f: FixedExpense) => void }) {
  const { pots } = useFinance();
  const blank = { name: "", amount: "", category: "", potId: "", nature: "necessidade" as Nature, frequency: "mensal" as FixedExpense["frequency"], nextDue: todayISO() };
  const [f, setF] = useState(blank);
  const [lastKey, setLastKey] = useState<string | null>(null);
  const key = open ? item?.id ?? "new" : null;
  if (key !== lastKey) { setLastKey(key); if (open) setF(item ? { name: item.name, amount: item.amount.toFixed(2).replace(".", ","), category: item.category, potId: item.potId ?? "", nature: item.nature, frequency: item.frequency, nextDue: item.nextDue } : blank); }
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md">
        <DialogHeader><DialogTitle className="font-display text-xl font-medium">{item ? "Editar despesa recorrente" : "Nova despesa recorrente"}</DialogTitle><DialogDescription>Contas que se repetem, como aluguel, internet ou academia.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <Field label="Nome"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ex.: Internet" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor previsto"><MoneyInput value={f.amount} onChange={(v) => setF({ ...f, amount: v })} /></Field>
            <Field label="Categoria"><Input value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} placeholder="Ex.: Moradia" /></Field>
            <Field label="Frequência"><Select value={f.frequency} onValueChange={(v) => setF({ ...f, frequency: v as FixedExpense["frequency"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(FREQ).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Próximo vencimento"><Input type="date" value={f.nextDue} onChange={(e) => setF({ ...f, nextDue: e.target.value })} /></Field>
          </div>
          <Field label="Pote associado (opcional)"><Select value={f.potId} onValueChange={(v) => setF({ ...f, potId: v })}><SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger><SelectContent>{pots.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Classificação"><Segmented value={f.nature} onChange={(v) => setF({ ...f, nature: v })} options={[{ value: "necessidade", label: "Necessidade" }, { value: "impulso", label: "Impulso" }]} /></Field>
        </div>
        <DialogFooter className="gap-2"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={() => {
          const amount = parseBRL(f.amount);
          if (!f.name.trim() || !(amount > 0)) { toast.error("Preencha nome e valor."); return; }
          onSave({ id: item?.id ?? `fx-${Date.now()}`, status: item?.status ?? "pendente", name: f.name, amount, category: f.category || "Outros", potId: f.potId || undefined, nature: f.nature, frequency: f.frequency, nextDue: f.nextDue });
        }}>Salvar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InstallmentsTab() {
  const { installments, setInstallments } = useFinance();
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const active = installments.filter((i) => !i.cancelled);
  const remaining = active.flatMap((i) => i.installments).filter((x) => x.status !== "paga").reduce((s, x) => s + x.amount, 0);
  const thisMonth = active.flatMap((i) => i.installments).filter((x) => x.due.startsWith("2026-11")).reduce((s, x) => s + x.amount, 0);
  const current = installments.find((i) => i.id === openId) ?? null;
  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border lg:grid-cols-3">
        <div className="bg-card p-5"><p className="text-xs text-muted-foreground">Compras ativas</p><p className="mt-2 font-display text-2xl">{active.length}</p></div>
        <div className="bg-card p-5"><p className="text-xs text-muted-foreground">Parcelas neste mês</p><p className="mt-2 font-display text-2xl tabular">{formatBRL(thisMonth)}</p></div>
        <div className="col-span-2 bg-card p-5 lg:col-span-1"><p className="text-xs text-muted-foreground">Total a pagar</p><p className="mt-2 font-display text-2xl tabular">{formatBRL(remaining)}</p></div>
      </div>
      <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">Compras parceladas</h2><Button size="sm" onClick={() => setCreating(true)}><Plus className="h-4 w-4" />Cadastrar compra</Button></div>
      {installments.length === 0 ? <EmptyState title="Nenhuma compra parcelada" /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {installments.map((i) => {
            const paid = i.installments.filter((x) => x.status === "paga").length;
            const next = i.installments.find((x) => x.status !== "paga");
            return (
              <button key={i.id} onClick={() => setOpenId(i.id)} className={cn("flex flex-col rounded-2xl border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm", i.cancelled && "opacity-55")}>
                <div className="flex w-full items-start justify-between gap-2"><div><p className="text-sm font-semibold">{i.description}</p><p className="text-xs text-muted-foreground">Comprado em {formatDate(i.purchaseDate)}</p></div>{i.cancelled ? <StatusBadge status="cancelada" /> : <NatureBadge nature={i.nature} />}</div>
                <div className="mt-5 flex w-full items-end justify-between"><div><p className="text-xs text-muted-foreground">Parcela</p><p className="font-display text-2xl tabular">{formatBRL(i.installments[0].amount)}</p></div><p className="text-xs tabular text-muted-foreground">Total {formatBRL(i.total)}</p></div>
                <Bar value={paid} max={i.count} className="mt-4 h-2" />
                <div className="mt-2 flex w-full justify-between text-xs text-muted-foreground"><span>{paid} de {i.count} pagas · {i.count - paid} pendentes</span>{next && !i.cancelled && <span className={next.status === "atrasada" ? "text-destructive" : ""}>Próx. {formatDate(next.due)}</span>}</div>
              </button>
            );
          })}
        </div>
      )}
      <InstallmentSheet purchase={current} onClose={() => setOpenId(null)} onChange={(p) => setInstallments((l) => l.map((x) => x.id === p.id ? p : x))} />
      <NewInstallmentDialog open={creating} onClose={() => setCreating(false)} onSave={(p) => { setInstallments((l) => [p, ...l]); toast.success("Compra parcelada cadastrada"); setCreating(false); }} />
    </>
  );
}

function InstallmentSheet({ purchase: p, onClose, onChange }: { purchase: InstallmentPurchase | null; onClose: () => void; onChange: (p: InstallmentPurchase) => void }) {
  const [editFuture, setEditFuture] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [confirm, setConfirm] = useState<"antecipar" | "cancelar" | null>(null);
  if (!p) return <Sheet open={false} />;
  const pending = p.installments.filter((x) => x.status !== "paga");
  const pendingSum = pending.reduce((s, x) => s + x.amount, 0);
  const pay = (n: number) => { onChange({ ...p, installments: p.installments.map((x) => x.n === n ? { ...x, status: "paga", paidAt: todayISO() } : x) }); toast.success(`Parcela ${n}/${p.count} marcada como paga`); };
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader><SheetTitle className="font-display text-2xl font-medium">{p.description}</SheetTitle><SheetDescription>{p.count}x de {formatBRL(p.installments[0].amount)} · total {formatBRL(p.total)}</SheetDescription></SheetHeader>
        <dl className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-muted p-4 text-sm">
          <div><dt className="text-xs text-muted-foreground">Data da compra</dt><dd className="tabular">{formatDate(p.purchaseDate)}</dd></div>
          <div><dt className="text-xs text-muted-foreground">1º vencimento</dt><dd className="tabular">{formatDate(p.firstDue)}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Pagas</dt><dd>{p.count - pending.length}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Saldo devedor</dt><dd className="tabular">{formatBRL(pendingSum)}</dd></div>
        </dl>
        {!p.cancelled && pending.length > 0 && <div className="mt-4 grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" onClick={() => { setNewAmount(pending[0].amount.toFixed(2).replace(".", ",")); setEditFuture(true); }}><Pencil className="h-3.5 w-3.5" />Editar</Button>
          <Button variant="outline" size="sm" onClick={() => setConfirm("antecipar")}><FastForward className="h-3.5 w-3.5" />Quitar</Button>
          <Button variant="outline" size="sm" className="text-destructive" onClick={() => setConfirm("cancelar")}><Ban className="h-3.5 w-3.5" />Cancelar</Button>
        </div>}
        <ol className="relative mt-6 space-y-1 border-l pl-5">
          {p.installments.map((x) => (
            <li key={x.n} className="relative flex items-center gap-3 rounded-xl py-2 pr-1">
              <span className={cn("absolute -left-[27px] flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 bg-card", x.status === "paga" ? "border-success bg-success" : x.status === "atrasada" ? "border-destructive" : "border-input")}>{x.status === "paga" && <Check className="h-2 w-2 text-primary-foreground" />}</span>
              <div className="flex-1"><p className="text-sm font-medium">Parcela {x.n}/{p.count}</p><p className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="h-3 w-3" />{formatDate(x.due)}{x.paidAt && ` · paga em ${formatDate(x.paidAt)}`}</p></div>
              <span className="text-sm tabular">{formatBRL(x.amount)}</span>
              {x.status !== "paga" && !p.cancelled ? <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => pay(x.n)}>Pagar</Button> : <StatusBadge status={p.cancelled && x.status !== "paga" ? "cancelada" : x.status} />}
            </li>
          ))}
        </ol>
        <Dialog open={editFuture} onOpenChange={setEditFuture}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle className="font-display text-xl font-medium">Editar parcelas futuras</DialogTitle><DialogDescription>Altera o valor das {pending.length} parcelas pendentes.</DialogDescription></DialogHeader>
            <Field label="Novo valor por parcela"><MoneyInput value={newAmount} onChange={setNewAmount} /></Field>
            <DialogFooter className="gap-2"><Button variant="ghost" onClick={() => setEditFuture(false)}>Cancelar</Button><Button onClick={() => { const v = parseBRL(newAmount); if (!(v > 0)) return; onChange({ ...p, installments: p.installments.map((x) => x.status === "paga" ? x : { ...x, amount: v }) }); setEditFuture(false); toast.success("Parcelas futuras atualizadas"); }}>Salvar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>{confirm === "antecipar" ? "Antecipar quitação?" : "Cancelar compromisso?"}</AlertDialogTitle>
              <AlertDialogDescription>{confirm === "antecipar" ? `As ${pending.length} parcelas restantes (${formatBRL(pendingSum)}) serão marcadas como pagas hoje.` : "As parcelas pendentes deixarão de aparecer nos compromissos futuros."}</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Voltar</AlertDialogCancel><AlertDialogAction onClick={() => {
              if (confirm === "antecipar") { onChange({ ...p, installments: p.installments.map((x) => x.status === "paga" ? x : { ...x, status: "paga", paidAt: todayISO() }) }); toast.success("Compra quitada"); }
              else { onChange({ ...p, cancelled: true }); toast("Compromisso cancelado"); }
            }}>Confirmar</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
}

function NewInstallmentDialog({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (p: InstallmentPurchase) => void }) {
  const [f, setF] = useState({ description: "", total: "", count: "6", purchaseDate: todayISO(), firstDue: "2026-12-10", nature: "necessidade" as Nature });
  const total = parseBRL(f.total); const count = Number(f.count) || 0;
  const each = total > 0 && count > 0 ? total / count : 0;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="font-display text-xl font-medium">Nova compra parcelada</DialogTitle><DialogDescription>Registre manualmente compras pagas em parcelas.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <Field label="Descrição"><Input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Ex.: Máquina de lavar" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor total"><MoneyInput value={f.total} onChange={(v) => setF({ ...f, total: v })} /></Field>
            <Field label="Parcelas"><Input type="number" min={1} max={48} value={f.count} onChange={(e) => setF({ ...f, count: e.target.value })} /></Field>
            <Field label="Data da compra"><Input type="date" value={f.purchaseDate} onChange={(e) => setF({ ...f, purchaseDate: e.target.value })} /></Field>
            <Field label="1º vencimento"><Input type="date" value={f.firstDue} onChange={(e) => setF({ ...f, firstDue: e.target.value })} /></Field>
          </div>
          <Field label="Classificação"><Segmented value={f.nature} onChange={(v) => setF({ ...f, nature: v })} options={[{ value: "necessidade", label: "Necessidade" }, { value: "impulso", label: "Impulso" }]} /></Field>
          {each > 0 && <p className="rounded-xl bg-muted p-3 text-sm">{count}x de <strong className="tabular">{formatBRL(each)}</strong></p>}
        </div>
        <DialogFooter className="gap-2"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={() => {
          if (!f.description.trim() || !each) { toast.error("Preencha descrição, valor e parcelas."); return; }
          const [y, m, d] = f.firstDue.split("-").map(Number);
          onSave({ id: `ins-${Date.now()}`, description: f.description, total, count, purchaseDate: f.purchaseDate, firstDue: f.firstDue, nature: f.nature,
            installments: Array.from({ length: count }, (_, i) => ({ n: i + 1, amount: Math.round(each * 100) / 100, due: new Date(Date.UTC(y, m - 1 + i, d)).toISOString().slice(0, 10), status: "pendente" as const })) });
        }}>Cadastrar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
