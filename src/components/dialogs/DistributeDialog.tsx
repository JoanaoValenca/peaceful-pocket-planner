import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoneyInput, PotIcon } from "@/components/shared/ui-kit";
import { useFinance, useSummary } from "@/store/finance-store";
import { formatBRL, parseBRL } from "@/lib/format";
import { cn } from "@/lib/utils";

export function DistributeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { pots, setPots, addTransaction } = useFinance();
  const { undistributed } = useSummary();
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => { if (open) setValues({}); }, [open]);

  const total = Object.values(values).reduce((s, v) => s + (parseBRL(v) || 0), 0);
  const remaining = undistributed - total;
  const over = remaining < 0;

  const fillBudget = () => {
    const next: Record<string, string> = {};
    pots.forEach((p) => { const gap = p.budget - p.reserved; if (gap > 0) next[p.id] = gap.toFixed(2).replace(".", ","); });
    setValues(next);
  };
  const confirm = () => {
    if (total <= 0) { toast.error("Informe ao menos um valor para distribuir."); return; }
    if (over) { toast.error("O total ultrapassa o dinheiro não distribuído."); return; }
    setPots((ps) => ps.map((p) => ({ ...p, reserved: p.reserved + (parseBRL(values[p.id] ?? "") || 0) })));
    addTransaction({ type: "distribuicao", amount: total, date: "2026-11-17", description: "Distribuição entre potes" });
    toast.success(`${formatBRL(total)} distribuídos entre os potes`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-medium">Distribuir dinheiro</DialogTitle>
          <DialogDescription>Separe parte do dinheiro disponível para cada finalidade.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted p-3 text-center">
          <div><p className="text-[11px] text-muted-foreground">Disponível</p><p className="text-sm font-semibold tabular">{formatBRL(undistributed)}</p></div>
          <div><p className="text-[11px] text-muted-foreground">Distribuindo</p><p className="text-sm font-semibold tabular text-primary">{formatBRL(total)}</p></div>
          <div><p className="text-[11px] text-muted-foreground">Restará</p><p className={cn("text-sm font-semibold tabular", over && "text-destructive")}>{formatBRL(remaining)}</p></div>
        </div>
        <div className="flex justify-end"><Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={fillBudget}>Completar até o orçamento</Button></div>
        <div className="-mx-1 flex-1 space-y-1 overflow-y-auto px-1">
          {pots.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted/60">
              <PotIcon icon={p.icon} color={p.color} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-[11px] text-muted-foreground tabular">Reservado {formatBRL(p.reserved)} de {formatBRL(p.budget)}</p>
              </div>
              <div className="w-32"><MoneyInput value={values[p.id] ?? ""} onChange={(v) => setValues((s) => ({ ...s, [p.id]: v }))} className="h-9 pl-9 text-right" /></div>
            </div>
          ))}
        </div>
        {over && <p className="text-xs text-destructive">O total distribuído ultrapassa o dinheiro disponível em {formatBRL(-remaining)}.</p>}
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={confirm} disabled={over || total <= 0}>Confirmar distribuição</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
