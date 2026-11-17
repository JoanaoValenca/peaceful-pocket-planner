export type AccountKind = "corrente" | "poupanca" | "investimento" | "digital";
export type AccountUse = "cotidiano" | "reserva";
export interface Account { id: string; institution: string; name: string; kind: AccountKind; use: AccountUse; balance: number; active: boolean; color: string; }

export type LeftoverRule = "acumular" | "liberar" | "manual";
export type Periodicity = "mensal" | "quinzenal" | "semanal";
export interface Pot { id: string; name: string; icon: string; color: string; budget: number; reserved: number; spent: number; periodicity: Periodicity; leftoverRule: LeftoverRule; }

export interface Reserve { id: string; name: string; goal: string; amount: number; target: number; dueDate?: string | undefined; location: "virtual" | "conta"; accountId: string; }

export type TxType = "receita" | "despesa" | "transferencia" | "distribuicao" | "transferencia_pote" | "deposito_reserva" | "retirada_reserva" | "ajuste";
export type Nature = "necessidade" | "impulso";
export interface Transaction { id: string; date: string; description: string; type: TxType; amount: number; accountId?: string | undefined; toAccountId?: string | undefined; potId?: string | undefined; toPotId?: string | undefined; reserveId?: string | undefined; category?: string | undefined; nature?: Nature | undefined; note?: string | undefined; }

export type ExpenseStatus = "paga" | "pendente" | "atrasada" | "cancelada";
export interface FixedExpense { id: string; name: string; amount: number; category: string; potId?: string | undefined; nature: Nature; frequency: "mensal" | "anual" | "semanal"; nextDue: string; status: ExpenseStatus; }

export interface Installment { n: number; amount: number; due: string; status: "paga" | "pendente" | "atrasada"; paidAt?: string | undefined; }
export interface InstallmentPurchase { id: string; description: string; total: number; count: number; purchaseDate: string; firstDue: string; nature: Nature; potId?: string | undefined; installments: Installment[]; cancelled?: boolean | undefined; }
