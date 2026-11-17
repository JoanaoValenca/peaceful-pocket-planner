import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, MoneyInput, Segmented } from "@/components/shared/ui-kit";
import { useFinance } from "@/store/finance-store";
import { parseBRL, todayISO } from "@/lib/format";
import type { Nature, TxType } from "@/data/types";
import { cn } from "@/lib/utils";

export const TX_LABELS: Record<TxType, string> = {
  receita: "Receita", despesa: "Despesa", transferencia: "Transferência entre contas", distribuicao: "Distribuição para pote",
  transferencia_pote: "Transferência entre potes", deposito_reserva: "Depósito em reserva", retirada_reserva: "Retirada de reserva", ajuste: "Ajuste de saldo",
};
const TYPES = Object.keys(TX_LABELS) as TxType[];

export function TransactionDialog({ open, onOpenChange, initialType = "despesa" }: { open: boolean; onOpenChange: (o: boolean) => void; initialType?: TxType }) {
  const { accounts, pots, reserves, addTransaction } = useFinance();
  const [type, setType] = useState<TxType>(initialType);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [accountId, setAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [potId, setPotId] = useState("");
  const [toPotId, setToPotId] = useState("");
  const [reserveId, setReserveId] = useState("");
  const [category, setCategory] = useState("");
  const [nature, setNature] = useState<Nature | "">("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Partial<Record<"amount" | "desc" | "account" | "toAccount" | "nature" | "pot" | "toPot" | "reserve", string>>>({});

  useEffect(() => {
    if (open) { setType(initialType); setDesc(""); setAmount(""); setDate(todayISO()); setAccountId(""); setToAccountId(""); setPotId(""); setToPotId(""); setReserveId(""); setCategory(""); setNature(""); setNote(""); setErrors({}); }
  }, [open, initialType]);

  const activeAccounts = accounts.filter((a) => a.active);
  const needsAccount = ["receita", "despesa", "transferencia", "ajuste", "deposito_reserva", "retirada_reserva"].includes(type);
  const needsDesc = ["receita", "despesa", "ajuste"].includes(type);

  const submit = () => {
    const e: Partial<Record<"amount" | "desc" | "account" | "toAccount" | "nature" | "pot" | "toPot" | "reserve", string>> = {};
    const v = parseBRL(amount);
    if (!v || v <= 0) e.amount = "Informe um valor maior que zero.";
    if (needsDesc && !desc.trim()) e.desc = "Informe uma descrição.";
    if (needsAccount && !accountId) e.account = "Selecione uma conta.";
    if (type === "transferencia" && (!toAccountId || toAccountId === accountId)) e.toAccount = "Escolha uma conta de destino diferente.";
    if (type === "despesa" && !nature) e.nature = "Classifique como necessidade ou impulso.";
    if ((type === "distribuicao" || type === "transferencia_pote") && !potId) e.pot = "Selecione um pote.";
    if (type === "transferencia_pote" && (!toPotId || toPotId === potId)) e.toPot = "Escolha um pote de destino diferente.";
    if ((type === "deposito_reserva" || type === "retirada_reserva") && !reserveId) e.reserve = "Selecione uma reserva.";
    setErrors(e);
    if (Object.keys(e).length) { toast.error("Revise os campos destacados."); return; }
    addTransaction({
      type, amount: v, date, description: desc.trim() || TX_LABELS[type],
      accountId: accountId || undefined, toAccountId: toAccountId || undefined, potId: potId || undefined, toPotId: toPotId || undefined,
      reserveId: reserveId || undefined, category: category || undefined, nature: nature || undefined, note: note || undefined,
    });
    toast.success(`${TX_LABELS[type]} registrada`, { description: "Dados demonstrativos — nada foi salvo de verdade." });
    onOpenChange(false);
  };

  const AccountSelect = ({ value, onChange, label, error }: { value: string; onChange: (v: string) => void; label: string; error?: string | undefined }) => (
    <Field label={label} error={error}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn(error && "border-destructive")}><SelectValue placeholder="Selecione" /></SelectTrigger>
        <SelectContent>{activeAccounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.institution} · {a.name}</SelectItem>)}</SelectContent>
      </Select>
    </Field>
  );
  const PotSelect = ({ value, onChange, label, error, optional }: { value: string; onChange: (v: string) => void; label: string; error?: string | undefined; optional?: boolean }) => (
    <Field label={label} error={error}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn(error && "border-destructive")}><SelectValue placeholder={optional ? "Opcional" : "Selecione"} /></SelectTrigger>
        <SelectContent>{pots.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
      </Select>
    </Field>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-medium">Registrar movimentação</DialogTitle>
          <DialogDescription>O formulário se adapta ao tipo escolhido.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Tipo">
            <Select value={type} onValueChange={(v) => { setType(v as TxType); setErrors({}); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{TX_LABELS[t]}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          {(needsDesc || type === "transferencia") && (
            <Field label="Descrição" error={errors.desc}>
              <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={type === "receita" ? "Ex.: Salário" : "Ex.: Supermercado"} className={cn(errors.desc && "border-destructive")} />
            </Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor" error={errors.amount}><MoneyInput value={amount} onChange={setAmount} className={cn("pl-9", errors.amount && "border-destructive")} /></Field>
            <Field label="Data"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          </div>
          {type === "receita" && <>
            <AccountSelect label="Conta de destino" value={accountId} onChange={setAccountId} error={errors.account} />
            <Field label="Categoria (opcional)"><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex.: Freelance" /></Field>
          </>}
          {type === "despesa" && <>
            <AccountSelect label="Conta de origem" value={accountId} onChange={setAccountId} error={errors.account} />
            <PotSelect label="Pote ou categoria" value={potId} onChange={setPotId} optional />
            <Field label="Classificação" error={errors.nature}>
              <div className="grid grid-cols-2 gap-2">
                {(["necessidade", "impulso"] as Nature[]).map((n) => (
                  <button key={n} type="button" onClick={() => setNature(n)}
                    className={cn("rounded-xl border px-3 py-3 text-left text-sm transition-all", nature === n ? "border-primary bg-primary-soft" : "hover:bg-muted", errors.nature && !nature && "border-destructive")}>
                    <span className="flex items-center gap-2 font-medium"><span className={cn("h-2 w-2 rounded-full", n === "necessidade" ? "bg-primary" : "bg-impulse")} />{n === "necessidade" ? "Necessidade" : "Impulso"}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{n === "necessidade" ? "Essencial ou planejado" : "Compra não planejada"}</span>
                  </button>
                ))}
              </div>
            </Field>
          </>}
          {type === "transferencia" && <div className="grid gap-3 sm:grid-cols-2">
            <AccountSelect label="Conta de origem" value={accountId} onChange={setAccountId} error={errors.account} />
            <AccountSelect label="Conta de destino" value={toAccountId} onChange={setToAccountId} error={errors.toAccount} />
          </div>}
          {type === "distribuicao" && <PotSelect label="Pote de destino" value={potId} onChange={setPotId} error={errors.pot} />}
          {type === "transferencia_pote" && <div className="grid gap-3 sm:grid-cols-2">
            <PotSelect label="Pote de origem" value={potId} onChange={setPotId} error={errors.pot} />
            <PotSelect label="Pote de destino" value={toPotId} onChange={setToPotId} error={errors.toPot} />
          </div>}
          {(type === "deposito_reserva" || type === "retirada_reserva") && <>
            <Field label="Reserva" error={errors.reserve}>
              <Select value={reserveId} onValueChange={setReserveId}>
                <SelectTrigger className={cn(errors.reserve && "border-destructive")}><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{reserves.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <AccountSelect label={type === "deposito_reserva" ? "Conta de origem" : "Conta de destino"} value={accountId} onChange={setAccountId} error={errors.account} />
          </>}
          {type === "ajuste" && <AccountSelect label="Conta" value={accountId} onChange={setAccountId} error={errors.account} />}
          <Field label="Observação (opcional)"><Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit}>Registrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
