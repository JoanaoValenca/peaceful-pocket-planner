import { createContext, useContext, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Plus, ArrowDownLeft, ArrowUpRight, Shuffle, PanelLeftClose, PanelLeft, Menu, LayoutDashboard, PiggyBank, ArrowLeftRight, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TransactionDialog } from "@/components/dialogs/TransactionDialog";
import { DistributeDialog } from "@/components/dialogs/DistributeDialog";
import { NAV_GROUPS } from "./nav";
import { useUsers, initials, ROLE_LABEL } from "@/store/users-store";
import { cn } from "@/lib/utils";
import type { TxType } from "@/data/types";

interface QuickActions { newTransaction: (type?: TxType) => void; distribute: () => void; }
const QuickCtx = createContext<QuickActions | null>(null);
export const useQuickActions = () => {
  const c = useContext(QuickCtx);
  if (!c) throw new Error("useQuickActions outside AppShell");
  return c;
};

function Brand({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Sprout className="h-4 w-4" /></div>
      {!compact && <span className="font-display text-xl font-medium tracking-tight">Pote</span>}
    </Link>
  );
}

function useIsActive() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (to: string) => (to === "/" ? path === "/" : path.startsWith(to));
}

function NavList({ compact, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const isActive = useIsActive();
  return (
    <nav className="space-y-5">
      {NAV_GROUPS.map((g) => (
        <div key={g.label}>
          {!compact && <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">{g.label}</p>}
          <div className="space-y-0.5">
            {g.items.map((it) => {
              const active = isActive(it.to);
              return (
                <Link key={it.to} to={it.to} onClick={onNavigate} title={compact ? it.label : undefined}
                  className={cn("group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                    compact && "justify-center px-0",
                    active ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground")}>
                  {active && <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />}
                  <it.icon className="h-4 w-4 shrink-0" />
                  {!compact && <span className="truncate">{it.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function QuickMenu({ actions, children }: { actions: QuickActions; children: ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => actions.newTransaction("receita")}><ArrowDownLeft className="text-success" />Adicionar receita</DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions.newTransaction("despesa")}><ArrowUpRight className="text-destructive" />Registrar despesa</DropdownMenuItem>
        <DropdownMenuItem onClick={actions.distribute}><Shuffle className="text-primary" />Distribuir entre potes</DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions.newTransaction("transferencia")}><ArrowLeftRight />Outra movimentação</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [txOpen, setTxOpen] = useState(false);
  const [txType, setTxType] = useState<TxType>("despesa");
  const [distOpen, setDistOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { current } = useUsers();
  const isActive = useIsActive();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const actions: QuickActions = { newTransaction: (t = "despesa") => { setTxType(t); setTxOpen(true); }, distribute: () => setDistOpen(true) };
  const mobileTabs = [
    { to: "/", label: "Início", icon: LayoutDashboard },
    { to: "/movimentacoes", label: "Movimentos", icon: ArrowLeftRight },
  ] as const;
  const mobileTabsRight = [{ to: "/potes", label: "Potes", icon: PiggyBank }] as const;

  return (
    <QuickCtx.Provider value={actions}>
      <div className="flex min-h-screen w-full bg-background">
        {/* Desktop sidebar */}
        <aside className={cn("sticky top-0 hidden h-screen shrink-0 flex-col border-r bg-sidebar transition-[width] duration-200 lg:flex", collapsed ? "w-[72px]" : "w-64")}>
          <div className={cn("flex h-16 items-center px-5", collapsed && "justify-center px-0")}><Brand compact={collapsed} /></div>
          <div className={cn("px-4 pb-4", collapsed && "px-3")}>
            <QuickMenu actions={actions}>
              <Button className={cn("w-full", collapsed && "px-0")} aria-label="Nova ação"><Plus className="h-4 w-4" />{!collapsed && "Nova ação"}</Button>
            </QuickMenu>
          </div>
          <div className={cn("flex-1 overflow-y-auto px-3")}><NavList compact={collapsed} /></div>
          <div className={cn("flex items-center gap-3 border-t p-4", collapsed && "flex-col")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sand text-xs font-semibold text-sand-foreground">{initials(current.name)}</div>
            {!collapsed && <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{current.name}</p><p className="text-[11px] text-muted-foreground">{ROLE_LABEL[current.role]}</p></div>}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCollapsed((c) => !c)} aria-label="Recolher menu">
              {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/85 px-4 backdrop-blur lg:hidden">
            <Brand />
            <Button variant="ghost" size="icon" onClick={() => setMoreOpen(true)} aria-label="Abrir menu"><Menu className="h-5 w-5" /></Button>
          </header>
          <main key={path} className="mx-auto w-full max-w-7xl flex-1 animate-page-in px-4 pb-28 pt-6 md:px-8 md:pt-10 lg:pb-12">{children}</main>
        </div>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          <div className="grid h-16 grid-cols-5 items-center">
            {mobileTabs.map((t) => (
              <Link key={t.to} to={t.to} className={cn("flex flex-col items-center gap-1 text-[10px] font-medium", isActive(t.to) ? "text-primary" : "text-muted-foreground")}>
                <t.icon className="h-5 w-5" />{t.label}
              </Link>
            ))}
            <div className="flex justify-center">
              <QuickMenu actions={actions}>
                <button aria-label="Nova ação" className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"><Plus className="h-6 w-6" /></button>
              </QuickMenu>
            </div>
            {mobileTabsRight.map((t) => (
              <Link key={t.to} to={t.to} className={cn("flex flex-col items-center gap-1 text-[10px] font-medium", isActive(t.to) ? "text-primary" : "text-muted-foreground")}>
                <t.icon className="h-5 w-5" />{t.label}
              </Link>
            ))}
            <button onClick={() => setMoreOpen(true)} className="flex flex-col items-center gap-1 text-[10px] font-medium text-muted-foreground"><Menu className="h-5 w-5" />Mais</button>
          </div>
        </nav>

        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetContent side="left" className="w-72 bg-sidebar p-0">
            <SheetHeader className="p-5"><SheetTitle className="text-left"><Brand /></SheetTitle></SheetHeader>
            <div className="px-3"><NavList onNavigate={() => setMoreOpen(false)} /></div>
          </SheetContent>
        </Sheet>

        <TransactionDialog open={txOpen} onOpenChange={setTxOpen} initialType={txType} />
        <DistributeDialog open={distOpen} onOpenChange={setDistOpen} />
      </div>
    </QuickCtx.Provider>
  );
}
