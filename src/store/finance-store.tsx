/**
 * Prototype-only in-memory store. Holds demo data in React state so screens can
 * simulate create/edit actions. No real financial rules live here — swap this
 * provider for real queries/mutations when the backend exists.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import * as mock from "@/data/mock";
import type { Account, Pot, Reserve, Transaction, FixedExpense, InstallmentPurchase } from "@/data/types";

type Setter<T> = React.Dispatch<React.SetStateAction<T>>;
interface Store {
  accounts: Account[]; setAccounts: Setter<Account[]>;
  pots: Pot[]; setPots: Setter<Pot[]>;
  reserves: Reserve[]; setReserves: Setter<Reserve[]>;
  transactions: Transaction[]; setTransactions: Setter<Transaction[]>;
  fixedExpenses: FixedExpense[]; setFixedExpenses: Setter<FixedExpense[]>;
  installments: InstallmentPurchase[]; setInstallments: Setter<InstallmentPurchase[]>;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
}
const Ctx = createContext<Store | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState(mock.accounts);
  const [pots, setPots] = useState(mock.pots);
  const [reserves, setReserves] = useState(mock.reserves);
  const [transactions, setTransactions] = useState(mock.transactions);
  const [fixedExpenses, setFixedExpenses] = useState(mock.fixedExpenses);
  const [installments, setInstallments] = useState(mock.installmentPurchases);
  const value = useMemo<Store>(() => ({
    accounts, setAccounts, pots, setPots, reserves, setReserves, transactions, setTransactions,
    fixedExpenses, setFixedExpenses, installments, setInstallments,
    addTransaction: (tx) => setTransactions((p) => [{ ...tx, id: `t-${Date.now()}` }, ...p]),
  }), [accounts, pots, reserves, transactions, fixedExpenses, installments]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFinance() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useFinance must be inside FinanceProvider");
  return c;
}

/** Demonstrative summary for the dashboard. Simple sums only — not final rules. */
export function useSummary() {
  const { accounts, pots, reserves, fixedExpenses, installments } = useFinance();
  return useMemo(() => {
    const active = accounts.filter((a) => a.active);
    const totalBalance = active.reduce((s, a) => s + a.balance, 0);
    const dailyBalance = active.filter((a) => a.use === "cotidiano").reduce((s, a) => s + a.balance, 0);
    const virtualReserves = reserves.filter((r) => r.location === "virtual").reduce((s, r) => s + r.amount, 0);
    const accountReserves = reserves.filter((r) => r.location === "conta").reduce((s, r) => s + r.amount, 0);
    const available = dailyBalance - virtualReserves;
    const potsRemaining = pots.reduce((s, p) => s + Math.max(p.reserved - p.spent, 0), 0);
    const undistributed = available - potsRemaining;
    const pendingFixed = fixedExpenses.filter((f) => f.status === "pendente" || f.status === "atrasada").reduce((s, f) => s + f.amount, 0);
    const pendingInstallments = installments.filter((i) => !i.cancelled).flatMap((i) => i.installments).filter((x) => x.status !== "paga").reduce((s, x) => s + x.amount, 0);
    return { totalBalance, dailyBalance, virtualReserves, accountReserves, available, potsRemaining, undistributed, pendingFixed, pendingInstallments, commitments: pendingFixed + pendingInstallments };
  }, [accounts, pots, reserves, fixedExpenses, installments]);
}
