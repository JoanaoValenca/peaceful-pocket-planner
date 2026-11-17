import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, MoneyInput, PotIcon } from "@/components/shared/ui-kit";
import { useFinance } from "@/store/finance-store";
import { formatBRL, parseBRL } from "@/lib/format";
import type { LeftoverRule, Periodicity, Pot } from "@/data/types";
import { cn } from "@/lib/utils";

export const RULE_LABEL: Record<LeftoverRule, { title: string; desc: string }> = {
  acumular: { title: "Acumular", desc: "O que sobrar continua no pote no próximo período." },
  liberar: { title: "Liberar", desc: "O que sobrar volta para o dinheiro não distribuído." },
  manual: { title: "Decidir no encerramento", desc: "Você escolhe o destino ao fechar o período." },
};
export const PERIOD_LABEL: Record<Periodicity, string> = { mensal: "Mensal", quinzenal: "Quinzenal", semanal: "Semanal" };
const ICONS: string[] = ["UtensilsCrossed", "Car", "Ticket", "HeartPulse", "Sparkles", "Home", "Repeat", "GraduationCap", "Dog", "Gift", "Shirt", "Plane"];
const COLORS: string[] = ["oklch(0.6 0.09 140)", "oklch(0.6 0.06 230)", "oklch(0.68 0.1 50)", "oklch(0.6 0.1 20)", "oklch(0.65 0.08 330)", "oklch(0.55 0.05 80)", "oklch(0.5 0.06 280)", "oklch(0.55 0.08 190)"];

export function RulePicker({ value, onChange }: { value: LeftoverRule; onChange: (r: LeftoverRule) => void }) {
  return (
    <div className="grid gap-2">
      {(Object.keys(RULE_LABEL) as LeftoverRule[]).map((r) => (
        <button key={r} type="button" onClick={() => onChange(r)} className={cn("flex items-start gap-3 rounded-xl border p-3 text-left transition-colors", value === r ? "border-primary bg-primary-soft" : "hover:bg-muted")}>
          <span className={cn("mt-0.5 h-4 w-4 shrink-0 rounded-full border-2", value === r ? "border-primary bg-primary shadow-[inset_0_0_0_2px_var(--card)]" : "border-input")} />
          <span><span className="block text-sm font-medium">{RULE_LABEL[r].title}</span><span className="text-xs text-muted-foreground">{RULE_LABEL[r].desc}</span></span>
        </button>
      ))}
    </div>
  );
}

export function PotFormDialog({ open, pot, onClose }: { open: boolean; pot: Pot | null; onClose: () => void }) {
  const { setPots } = useFinance();
  const [f, setF] = useState({ name: "", icon: ICONS[0]!, color: COLORS[0]!, budget: "", periodicity: "mensal" as Periodicity, leftoverRule: "acumular" as LeftoverRule });
  const [lastKey, setLastKey] = useState<string | null>(null);
  const key = open ? pot?.id ?? "new" : null;
  if (key !== lastKey) {
    setLastKey(key);
    if (open) setF(pot ? { name: pot.name, icon: pot.icon, color: pot.color, budget: pot.budget.toFixed(2).replace(".", ","), periodicity: pot.periodicity, leftoverRule: pot.leftoverRule } : { name: "", icon: ICONS[0]!, color: COLORS[0]!, budget: "", periodicity: "mensal", leftoverRule: "acumular" });
  }
  const save = () => {
    const budget = parseBRL(f.budget);
    if (!f.name.trim()) return toast.error("Dê um nome ao pote.");
    if (!budget || budget <= 0) return toast.error("Informe um orçamento planejado.");
    setPots((ps) => pot ? ps.map((p) => p.id === pot.id ? { ...p, ...f, budget } : p) : [...ps, { id: `pot-${Date.now()}`, ...f, budget, reserved: 0, spent: 0 }]);
    toast.success(pot ? "Pote atualizado" : "Pote criado");
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle className="font-display text-xl font-medium">{pot ? "Editar pote" : "Novo pote"}</DialogTitle><DialogDescription>Um pote é uma finalidade para a qual você separa parte do seu dinheiro.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <PotIcon icon={f.icon} color={f.color} size="lg" />
            <div className="flex-1"><Field label="Nome"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ex.: Alimentação" /></Field></div>
          </div>
          <Field label="Ícone"><div className="flex flex-wrap gap-1.5">{ICONS.map((i) => <button key={i} type="button" onClick={() => setF({ ...f, icon: i })} className={cn("rounded-xl p-0.5 ring-2 ring-transparent", f.icon === i && "ring-primary")}><PotIcon icon={i} color={f.color} size="sm" /></button>)}</div></Field>
          <Field label="Cor"><div className="flex gap-2">{COLORS.map((c) => <button key={c} type="button" aria-label="Cor" onClick={() => setF({ ...f, color: c })} className={cn("h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-card", f.color === c ? "ring-foreground/40" : "ring-transparent")} style={{ background: c }} />)}</div></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Orçamento planejado" hint="Quanto pretende usar no período."><MoneyInput value={f.budget} onChange={(v) => setF({ ...f, budget: v })} /></Field>
            <Field label="Periodicidade"><Select value={f.periodicity} onValueChange={(v) => setF({ ...f, periodicity: v as Periodicity })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PERIOD_LABEL).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select></Field>
          </div>
          <Field label="Ao final do período, o saldo restante deve…"><RulePicker value={f.leftoverRule} onChange={(r) => setF({ ...f, leftoverRule: r })} /></Field>
        </div>
        <DialogFooter className="gap-2"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={save}>Salvar pote</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PotTransferDialog({ open, onClose, fromId }: { open: boolean; onClose: () => void; fromId?: string }) {
  const { pots, setPots, addTransaction } = useFinance();
  const [from, setFrom] = useState(fromId ?? "");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [step, setStep] = useState<"form" | "review">("form");
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) { setWasOpen(open); if (open) { setFrom(fromId ?? ""); setTo(""); setAmount(""); setNote(""); setStep("form"); } }
  const src = pots.find((p) => p.id === from), dst = pots.find((p) => p.id === to);
  const v = parseBRL(amount);
  const avail = src ? src.reserved - src.spent : 0;
  const error = !src || !dst ? "Selecione origem e destino." : from === to ? "Origem e destino devem ser diferentes." : !v || v <= 0 ? "Informe um valor." : v > avail ? `O pote de origem tem apenas ${formatBRL(avail)} disponíveis.` : null;
  const confirm = () => {
    setPots((ps) => ps.map((p) => p.id === from ? { ...p, reserved: p.reserved - v } : p.id === to ? { ...p, reserved: p.reserved + v } : p));
    addTransaction({ type: "transferencia_pote", amount: v, date: "2026-11-17", description: `${src!.name} → ${dst!.name}`, potId: from, toPotId: to, note });
    toast.success("Transferência entre potes concluída");
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="font-display text-xl font-medium">Transferir entre potes</DialogTitle><DialogDescription>{step === "form" ? "Mova dinheiro reservado de um pote para outro." : "Confira antes de confirmar."}</DialogDescription></DialogHeader>
        {step === "form" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <Field label="De"><Select value={from} onValueChange={setFrom}><SelectTrigger><SelectValue placeholder="Origem" /></SelectTrigger><SelectContent>{pots.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></Field>
              <ArrowRight className="mb-2.5 h-4 w-4 text-muted-foreground" />
              <Field label="Para"><Select value={to} onValueChange={setTo}><SelectTrigger><SelectValue placeholder="Destino" /></SelectTrigger><SelectContent>{pots.filter((p) => p.id !== from).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></Field>
            </div>
            {src && <p className="text-xs text-muted-foreground">Disponível em {src.name}: <strong className="tabular">{formatBRL(avail)}</strong></p>}
            <Field label="Valor"><MoneyInput value={amount} onChange={setAmount} /></Field>
            <Field label="Observação (opcional)"><Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
            {error && amount && <p className="text-xs text-destructive">{error}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-muted p-4">
              <div className="flex flex-col items-center gap-1.5 text-center"><PotIcon icon={src!.icon} color={src!.color} /><span className="text-xs font-medium">{src!.name}</span><span className="text-[11px] tabular text-muted-foreground">{formatBRL(avail)} → {formatBRL(avail - v)}</span></div>
              <div className="text-center"><p className="font-display text-xl tabular">{formatBRL(v)}</p><ArrowRight className="mx-auto h-4 w-4 text-muted-foreground" /></div>
              <div className="flex flex-col items-center gap-1.5 text-center"><PotIcon icon={dst!.icon} color={dst!.color} /><span className="text-xs font-medium">{dst!.name}</span><span className="text-[11px] tabular text-muted-foreground">{formatBRL(dst!.reserved - dst!.spent)} → {formatBRL(dst!.reserved - dst!.spent + v)}</span></div>
            </div>
            {note && <p className="text-xs text-muted-foreground">Observação: {note}</p>}
          </div>
        )}
        <DialogFooter className="gap-2">
          {step === "form" ? <><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button disabled={!!error} onClick={() => setStep("review")}>Revisar</Button></>
            : <><Button variant="ghost" onClick={() => setStep("form")}>Voltar</Button><Button onClick={confirm}>Confirmar transferência</Button></>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ClosePeriodDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pots, setPots } = useFinance();
  const [choices, setChoices] = useState<Record<string, "acumular" | "liberar">>({});
  const leftovers = pots.map((p) => ({ p, left: Math.max(p.reserved - p.spent, 0) })).filter((x) => x.left > 0);
  const pending = leftovers.filter((x) => x.p.leftoverRule === "manual" && !choices[x.p.id]);
  const confirm = () => {
    setPots((ps) => ps.map((p) => {
      const left = Math.max(p.reserved - p.spent, 0);
      const rule = p.leftoverRule === "manual" ? choices[p.id] : p.leftoverRule;
      return { ...p, spent: 0, reserved: rule === "acumular" ? left : 0 };
    }));
    toast.success("Período encerrado", { description: "Os potes foram preparados para dezembro (simulação)." });
    setChoices({}); onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[92vh] flex-col sm:max-w-lg">
        <DialogHeader><DialogTitle className="font-display text-xl font-medium">Encerrar novembro</DialogTitle><DialogDescription>Veja o que acontece com o saldo restante de cada pote, conforme a regra configurada.</DialogDescription></DialogHeader>
        <div className="-mx-1 flex-1 space-y-2 overflow-y-auto px-1">
          {leftovers.map(({ p, left }) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border p-3">
              <PotIcon icon={p.icon} color={p.color} size="sm" />
              <div className="min-w-0 flex-1"><p className="text-sm font-medium">{p.name}</p><p className="text-xs tabular text-muted-foreground">Sobra {formatBRL(left)}</p></div>
              {p.leftoverRule === "manual" ? (
                <Select value={choices[p.id] ?? ""} onValueChange={(v) => setChoices((c) => ({ ...c, [p.id]: v as "acumular" | "liberar" }))}>
                  <SelectTrigger className="h-8 w-36 border-warning/50 text-xs"><SelectValue placeholder="Escolher…" /></SelectTrigger>
                  <SelectContent><SelectItem value="acumular">Acumular</SelectItem><SelectItem value="liberar">Liberar</SelectItem></SelectContent>
                </Select>
              ) : <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium">{RULE_LABEL[p.leftoverRule].title}</span>}
            </div>
          ))}
        </div>
        {pending.length > 0 && <p className="text-xs text-warning">Defina o destino de {pending.length} pote(s) para continuar.</p>}
        <DialogFooter className="gap-2"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button disabled={pending.length > 0} onClick={confirm}>Encerrar período</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
