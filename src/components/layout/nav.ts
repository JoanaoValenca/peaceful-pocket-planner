import { LayoutDashboard, Landmark, PiggyBank, ShieldCheck, ArrowLeftRight, CalendarClock, CalendarRange, BarChart3, Users } from "lucide-react";

export const NAV_GROUPS = [
  { label: "Início", items: [{ to: "/", label: "Visão geral", icon: LayoutDashboard }] },
  { label: "Dinheiro", items: [
    { to: "/contas", label: "Contas bancárias", icon: Landmark },
    { to: "/potes", label: "Meus potes", icon: PiggyBank },
    { to: "/reservas", label: "Reservas financeiras", icon: ShieldCheck },
  ] },
  { label: "Fluxo", items: [
    { to: "/movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
    { to: "/compromissos", label: "Despesas e compromissos", icon: CalendarClock },
    { to: "/planejamento", label: "Planejamento mensal", icon: CalendarRange },
  ] },
  { label: "Análise", items: [{ to: "/relatorios", label: "Relatórios", icon: BarChart3 }] },
  { label: "Conta", items: [{ to: "/usuarios", label: "Usuários e acessos", icon: Users }] },
] as const;

export type NavPath = (typeof NAV_GROUPS)[number]["items"][number]["to"];
