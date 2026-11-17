import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Shuffle, ArrowLeftRight, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, EmptyState, InfoTip } from "@/components/shared/ui-kit";
import { PotCard, PotLegend } from "@/components/shared/PotCard";
import { PotFormDialog, PotTransferDialog, ClosePeriodDialog } from "@/components/dialogs/PotDialogs";
import { useFinance, useSummary } from "@/store/finance-store";
import { useQuickActions } from "@/components/layout/AppShell";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/potes/")({
  head: () => ({ meta: [
    { title: "Meus potes — Pote" },
    { name: "description", content: "Separe seu dinheiro por finalidade e acompanhe quanto resta em cada pote." },
    { property: "og:title", content: "Meus potes — Pote" },
    { property: "og:description", content: "Separe seu dinheiro por finalidade e acompanhe quanto resta em cada pote." },
  ] }),
  component: PotsPage,
});

function PotsPage() {
  const { pots } = useFinance();
  const s = useSummary();
  const qa = useQuickActions();
  const [creating, setCreating] = useState(false);
  const [transfer, setTransfer] = useState(false);
  const [closing, setClosing] = useState(false);
  const budget = pots.reduce((a, p) => a + p.budget, 0);
  const reserved = pots.reduce((a, p) => a + p.reserved, 0);
  const spent = pots.reduce((a, p) => a + p.spent, 0);

  return (
    <>
      <PageHeader title="Meus potes" description="Cada pote guarda uma parte do seu dinheiro disponível para uma finalidade."
        actions={<>
          <Button variant="outline" onClick={() => setClosing(true)}><CalendarCheck className="h-4 w-4" />Encerrar período</Button>
          <Button variant="outline" onClick={() => setTransfer(true)}><ArrowLeftRight className="h-4 w-4" />Transferir</Button>
          <Button variant="outline" onClick={() => setCreating(true)}><Plus className="h-4 w-4" />Criar pote</Button>
          <Button onClick={qa.distribute}><Shuffle className="h-4 w-4" />Distribuir dinheiro</Button>
        </>} />

      <section className="mb-6 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Não distribuído", v: s.undistributed, i: "Dinheiro disponível que ainda não está em nenhum pote.", strong: true },
          { l: "Reservado nos potes", v: reserved, i: "Dinheiro real já separado. Faz parte do saldo das contas." },
          { l: "Gasto nos potes", v: spent },
          { l: "Orçamento planejado", v: budget, i: "Soma dos planos de cada pote. Não é dinheiro — é uma meta de uso." },
        ].map((x) => (
          <div key={x.l} className="bg-card p-5">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">{x.l}{x.i && <InfoTip>{x.i}</InfoTip>}</p>
            <p className={x.strong ? "mt-2 font-display text-2xl tabular text-primary" : "mt-2 font-display text-2xl tabular"}>{formatBRL(x.v)}</p>
          </div>
        ))}
      </section>

      <div className="mb-4"><PotLegend /></div>
      {pots.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{pots.map((p) => <PotCard key={p.id} pot={p} />)}</div>
      ) : <EmptyState title="Você ainda não tem potes" description="Crie potes para separar dinheiro por finalidade." action={<Button onClick={() => setCreating(true)}>Criar primeiro pote</Button>} />}

      <PotFormDialog open={creating} pot={null} onClose={() => setCreating(false)} />
      <PotTransferDialog open={transfer} onClose={() => setTransfer(false)} />
      <ClosePeriodDialog open={closing} onClose={() => setClosing(false)} />
    </>
  );
}
