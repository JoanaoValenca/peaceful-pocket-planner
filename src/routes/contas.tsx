import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Pencil, Scale, Eye, ListOrdered, ShieldCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader, StatusBadge, Field, MoneyInput, Segmented, InfoTip } from "@/components/shared/ui-kit";
import { TransactionRow } from "@/components/shared/TransactionRow";
import { useFinance } from "@/store/finance-store";
import { formatBRL, parseBRL } from "@/lib/format";
import type { Account, AccountKind, AccountUse } from "@/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contas")({
  head: () => ({ meta: [
    { title: "Contas bancárias — Pote" },
    { name: "description", content: "Veja e organize suas contas de uso cotidiano e de reserva." },
    { property: "og:title", content: "Contas bancárias — Pote" },
    { property: "og:description", content: "Veja e organize suas contas de uso cotidiano e de reserva." },
  ] }),
  component: AccountsPage,
});

export const KIND_LABEL: Record<AccountKind, string> = { corrente: "Conta corrente", poupanca: "Poupança", investimento: "Investimento", digital: "Conta digital" };

function AccountsPage() {
  const { accounts, setAccounts, transactions } = useFinance();
  const [filter, setFilter] = useState<"todas" | AccountUse>("todas");
  const [editing, setEditing] = useState<Account | null | "new">(null);
  const [adjusting, setAdjusting] = useState<Account | null>(null);
  const [details, setDetails] = useState<Account | null>(null);

  const list = accounts.filter((a) => filter === "todas" || a.use === filter);
  const sum = (u: AccountUse) => accounts.filter((a) => a.active && a.use === u).reduce((s, a) => s + a.balance, 0);

  return (
    <>
      <PageHeader title="Contas bancárias" description="Os saldos reais de cada conta. Este é o dinheiro que existe de fato."
        actions={<Button onClick={() => setEditing("new")}><Plus className="h-4 w-4" />Adicionar conta</Button>} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5"><p className="text-xs text-muted-foreground">Total em contas ativas</p><p className="mt-2 font-display text-2xl tabular">{formatBRL(sum("cotidiano") + sum("reserva"))}</p></div>
        <div className="rounded-2xl border bg-card p-5"><p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Wallet className="h-3.5 w-3.5" />Uso cotidiano</p><p className="mt-2 font-display text-2xl tabular">{formatBRL(sum("cotidiano"))}</p></div>
        <div className="rounded-2xl border bg-card p-5"><p className="flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" />Contas de reserva <InfoTip>Contas dedicadas a guardar dinheiro protegido. Não entram no dinheiro disponível para gastar.</InfoTip></p><p className="mt-2 font-display text-2xl tabular">{formatBRL(sum("reserva"))}</p></div>
      </div>

      <div className="mb-4"><Segmented value={filter} onChange={setFilter} options={[{ value: "todas", label: "Todas" }, { value: "cotidiano", label: "Uso cotidiano" }, { value: "reserva", label: "Reserva" }]} /></div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((a) => (
          <article key={a.id} className={cn("group flex flex-col rounded-2xl border bg-card p-5 transition-shadow hover:shadow-sm", !a.active && "opacity-60")}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold" style={{ background: `color-mix(in oklab, ${a.color} 18%, transparent)`, color: a.color }}>{a.institution.slice(0, 2)}</div>
                <div><p className="text-sm font-semibold">{a.name}</p><p className="text-xs text-muted-foreground">{a.institution} · {KIND_LABEL[a.kind]}</p></div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Ações"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setDetails(a)}><Eye />Ver detalhes</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDetails(a)}><ListOrdered />Movimentações</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditing(a)}><Pencil />Editar conta</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAdjusting(a)}><Scale />Ajustar saldo</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">Saldo atual</p>
            <p className="font-display text-2xl font-medium tabular">{formatBRL(a.balance)}</p>
            <div className="mt-4 flex items-center gap-2 border-t pt-4">
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", a.use === "reserva" ? "bg-sand text-sand-foreground" : "bg-primary-soft text-accent-foreground")}>{a.use === "reserva" ? "Reserva" : "Uso cotidiano"}</span>
              <StatusBadge status={a.active ? "ativa" : "inativa"} />
              <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={() => setDetails(a)}>Detalhes</Button>
            </div>
          </article>
        ))}
      </div>

      <AccountForm open={editing !== null} account={editing === "new" ? null : editing} onClose={() => setEditing(null)}
        onSave={(acc) => { setAccounts((p) => p.some((x) => x.id === acc.id) ? p.map((x) => x.id === acc.id ? acc : x) : [...p, acc]); toast.success(editing === "new" ? "Conta adicionada" : "Conta atualizada"); setEditing(null); }} />

      <AdjustDialog account={adjusting} onClose={() => setAdjusting(null)} onSave={(v) => { setAccounts((p) => p.map((x) => x.id === adjusting!.id ? { ...x, balance: v } : x)); toast.success("Saldo ajustado", { description: `Novo saldo: ${formatBRL(v)}` }); setAdjusting(null); }} />

      <Sheet open={!!details} onOpenChange={(o) => !o && setDetails(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {details && <>
            <SheetHeader><SheetTitle className="font-display text-2xl font-medium">{details.name}</SheetTitle><SheetDescription>{details.institution} · {KIND_LABEL[details.kind]}</SheetDescription></SheetHeader>
            <div className="mt-6 rounded-2xl bg-muted p-5"><p className="text-xs text-muted-foreground">Saldo atual</p><p className="font-display text-3xl tabular">{formatBRL(details.balance)}</p></div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-xs text-muted-foreground">Classificação</dt><dd>{details.use === "reserva" ? "Reserva" : "Uso cotidiano"}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Status</dt><dd>{details.active ? "Ativa" : "Inativa"}</dd></div>
            </dl>
            <h3 className="mb-2 mt-6 text-sm font-semibold">Movimentações recentes</h3>
            {(() => { const txs = transactions.filter((t) => t.accountId === details.id || t.toAccountId === details.id); return txs.length ? <div className="divide-y">{txs.map((t) => <TransactionRow key={t.id} tx={t} compact />)}</div> : <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma movimentação nesta conta.</p>; })()}
          </>}
        </SheetContent>
      </Sheet>
    </>
  );
}

function AccountForm({ open, account, onClose, onSave }: { open: boolean; account: Account | null; onClose: () => void; onSave: (a: Account) => void }) {
  const [form, setForm] = useState({ institution: "", name: "", kind: "corrente" as AccountKind, use: "cotidiano" as AccountUse, balance: "", active: true });
  const [err, setErr] = useState(false);
  const [lastKey, setLastKey] = useState<string | null>(null);
  const key = open ? account?.id ?? "new" : null;
  if (key !== lastKey) {
    setLastKey(key);
    if (open) setForm(account ? { institution: account.institution, name: account.name, kind: account.kind, use: account.use, balance: account.balance.toFixed(2).replace(".", ","), active: account.active } : { institution: "", name: "", kind: "corrente", use: "cotidiano", balance: "", active: true });
    setErr(false);
  }
  const submit = () => {
    if (!form.institution.trim() || !form.name.trim()) { setErr(true); toast.error("Preencha instituição e nome da conta."); return; }
    onSave({ id: account?.id ?? `acc-${Date.now()}`, color: account?.color ?? "oklch(0.5 0.05 135)", institution: form.institution, name: form.name, kind: form.kind, use: form.use, balance: parseBRL(form.balance) || 0, active: form.active });
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="font-display text-xl font-medium">{account ? "Editar conta" : "Nova conta"}</DialogTitle><DialogDescription>Informe os dados da conta como aparecem no seu banco.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <Field label="Instituição" error={err && !form.institution ? "Obrigatório" : undefined}><Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="Ex.: Nubank" /></Field>
          <Field label="Nome da conta" error={err && !form.name ? "Obrigatório" : undefined}><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Conta principal" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo"><Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v as AccountKind })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(KIND_LABEL).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select></Field>
            <Field label={account ? "Saldo atual" : "Saldo inicial"}><MoneyInput value={form.balance} onChange={(v) => setForm({ ...form, balance: v })} disabled={!!account} /></Field>
          </div>
          <Field label="Classificação" hint={form.use === "reserva" ? "O saldo desta conta não conta como disponível para gastar." : "Usada para despesas do dia a dia."}>
            <Segmented value={form.use} onChange={(v) => setForm({ ...form, use: v })} options={[{ value: "cotidiano", label: "Uso cotidiano" }, { value: "reserva", label: "Reserva" }]} />
          </Field>
          <label className="flex items-center justify-between rounded-xl border p-3 text-sm">Conta ativa<Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /></label>
        </div>
        <DialogFooter className="gap-2"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={submit}>Salvar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdjustDialog({ account, onClose, onSave }: { account: Account | null; onClose: () => void; onSave: (v: number) => void }) {
  const [v, setV] = useState("");
  const n = parseBRL(v);
  return (
    <Dialog open={!!account} onOpenChange={(o) => { if (!o) { onClose(); setV(""); } }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle className="font-display text-xl font-medium">Ajustar saldo</DialogTitle><DialogDescription>Use quando o saldo do app não bater com o do banco.</DialogDescription></DialogHeader>
        {account && <div className="space-y-4">
          <div className="rounded-xl bg-muted p-3 text-sm">Saldo no app: <strong className="tabular">{formatBRL(account.balance)}</strong></div>
          <Field label="Saldo real no banco"><MoneyInput value={v} onChange={setV} autoFocus /></Field>
          {!isNaN(n) && <p className="text-xs text-muted-foreground">Será registrado um ajuste de <strong className={n - account.balance >= 0 ? "text-success" : "text-destructive"}>{formatBRL(n - account.balance)}</strong>.</p>}
        </div>}
        <DialogFooter className="gap-2"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button disabled={isNaN(n)} onClick={() => { onSave(n); setV(""); }}>Confirmar ajuste</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
