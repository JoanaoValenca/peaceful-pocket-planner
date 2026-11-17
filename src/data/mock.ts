/**
 * Centralized demo data. All screens read from here through the store.
 * Replace with real data sources when the backend is implemented.
 */
import type { Account, Pot, Reserve, Transaction, FixedExpense, InstallmentPurchase, Installment } from "./types";

export const accounts: Account[] = [
  { id: "acc-nubank", institution: "Nubank", name: "Conta principal", kind: "digital", use: "cotidiano", balance: 8420.5, active: true, color: "oklch(0.55 0.12 310)" },
  { id: "acc-itau", institution: "Itaú", name: "Conta salário", kind: "corrente", use: "cotidiano", balance: 3150, active: true, color: "oklch(0.65 0.14 55)" },
  { id: "acc-inter", institution: "Banco Inter", name: "Poupança carro", kind: "poupanca", use: "reserva", balance: 12000, active: true, color: "oklch(0.7 0.14 60)" },
  { id: "acc-xp", institution: "XP Investimentos", name: "Reserva de emergência", kind: "investimento", use: "reserva", balance: 18500, active: true, color: "oklch(0.35 0.03 250)" },
  { id: "acc-bb", institution: "Banco do Brasil", name: "Conta antiga", kind: "corrente", use: "cotidiano", balance: 0, active: false, color: "oklch(0.75 0.13 95)" },
];

export const pots: Pot[] = [
  { id: "pot-alim", name: "Alimentação", icon: "UtensilsCrossed", color: "oklch(0.6 0.09 140)", budget: 1400, reserved: 1200, spent: 812.4, periodicity: "mensal", leftoverRule: "acumular" },
  { id: "pot-transp", name: "Transporte", icon: "Car", color: "oklch(0.6 0.06 230)", budget: 600, reserved: 600, spent: 345.9, periodicity: "mensal", leftoverRule: "liberar" },
  { id: "pot-lazer", name: "Lazer", icon: "Ticket", color: "oklch(0.68 0.1 50)", budget: 500, reserved: 350, spent: 120, periodicity: "mensal", leftoverRule: "manual" },
  { id: "pot-saude", name: "Saúde", icon: "HeartPulse", color: "oklch(0.6 0.1 20)", budget: 450, reserved: 450, spent: 189.9, periodicity: "mensal", leftoverRule: "acumular" },
  { id: "pot-cuid", name: "Cuidados pessoais", icon: "Sparkles", color: "oklch(0.65 0.08 330)", budget: 250, reserved: 200, spent: 154, periodicity: "mensal", leftoverRule: "liberar" },
  { id: "pot-casa", name: "Casa", icon: "Home", color: "oklch(0.55 0.05 80)", budget: 900, reserved: 900, spent: 610.3, periodicity: "mensal", leftoverRule: "acumular" },
  { id: "pot-assin", name: "Assinaturas", icon: "Repeat", color: "oklch(0.5 0.06 280)", budget: 180, reserved: 180, spent: 159.7, periodicity: "mensal", leftoverRule: "liberar" },
  { id: "pot-educ", name: "Educação", icon: "GraduationCap", color: "oklch(0.55 0.08 190)", budget: 400, reserved: 300, spent: 0, periodicity: "mensal", leftoverRule: "acumular" },
];

export const reserves: Reserve[] = [
  { id: "res-emerg", name: "Reserva de emergência", goal: "6 meses de custo de vida", amount: 18500, target: 30000, location: "conta", accountId: "acc-xp" },
  { id: "res-carro", name: "Troca do carro", goal: "Entrada para um carro seminovo", amount: 12000, target: 25000, dueDate: "2027-12-01", location: "conta", accountId: "acc-inter" },
  { id: "res-viagem", name: "Viagem a Portugal", goal: "Passagens e hospedagem", amount: 2400, target: 9000, dueDate: "2027-07-15", location: "virtual", accountId: "acc-nubank" },
  { id: "res-natal", name: "Presentes de fim de ano", goal: "Presentes da família", amount: 600, target: 800, dueDate: "2026-12-20", location: "virtual", accountId: "acc-itau" },
];

const t = (id: string, date: string, description: string, rest: Partial<Transaction> & Pick<Transaction, "type" | "amount">): Transaction => ({ id, date, description, ...rest });
export const transactions: Transaction[] = [
  t("t1", "2026-11-16", "Supermercado Pão de Açúcar", { type: "despesa", amount: 286.4, accountId: "acc-nubank", potId: "pot-alim", nature: "necessidade" }),
  t("t2", "2026-11-15", "Cinema e pipoca", { type: "despesa", amount: 78, accountId: "acc-nubank", potId: "pot-lazer", nature: "impulso" }),
  t("t3", "2026-11-14", "Uber para o trabalho", { type: "despesa", amount: 32.9, accountId: "acc-nubank", potId: "pot-transp", nature: "necessidade" }),
  t("t4", "2026-11-13", "Tênis de corrida", { type: "despesa", amount: 154, accountId: "acc-itau", potId: "pot-cuid", nature: "impulso" }),
  t("t5", "2026-11-12", "Distribuição para potes", { type: "distribuicao", amount: 1200, accountId: "acc-nubank", potId: "pot-alim" }),
  t("t6", "2026-11-10", "Depósito viagem", { type: "deposito_reserva", amount: 400, reserveId: "res-viagem", accountId: "acc-nubank" }),
  t("t7", "2026-11-10", "Farmácia São Paulo", { type: "despesa", amount: 89.9, accountId: "acc-nubank", potId: "pot-saude", nature: "necessidade" }),
  t("t8", "2026-11-08", "Delivery iFood", { type: "despesa", amount: 64.5, accountId: "acc-nubank", potId: "pot-alim", nature: "impulso" }),
  t("t9", "2026-11-06", "Transferência para Nubank", { type: "transferencia", amount: 2000, accountId: "acc-itau", toAccountId: "acc-nubank" }),
  t("t10", "2026-11-05", "Salário", { type: "receita", amount: 7800, accountId: "acc-itau", category: "Salário" }),
  t("t11", "2026-11-05", "Aluguel", { type: "despesa", amount: 2100, accountId: "acc-itau", category: "Moradia", nature: "necessidade" }),
  t("t12", "2026-11-04", "Projeto freelance", { type: "receita", amount: 1500, accountId: "acc-nubank", category: "Freelance" }),
  t("t13", "2026-11-03", "Lazer → Alimentação", { type: "transferencia_pote", amount: 50, potId: "pot-lazer", toPotId: "pot-alim" }),
  t("t14", "2026-11-02", "Conta de luz", { type: "despesa", amount: 186.3, accountId: "acc-nubank", potId: "pot-casa", nature: "necessidade" }),
  t("t15", "2026-11-01", "Netflix e Spotify", { type: "despesa", amount: 77.8, accountId: "acc-nubank", potId: "pot-assin", nature: "impulso" }),
  t("t16", "2026-10-28", "Feira orgânica", { type: "despesa", amount: 92, accountId: "acc-nubank", potId: "pot-alim", nature: "necessidade" }),
  t("t17", "2026-10-20", "Ajuste de saldo Itaú", { type: "ajuste", amount: 12.4, accountId: "acc-itau" }),
];

export const fixedExpenses: FixedExpense[] = [
  { id: "fx-aluguel", name: "Aluguel", amount: 2100, category: "Moradia", nature: "necessidade", frequency: "mensal", nextDue: "2026-11-05", status: "paga" },
  { id: "fx-cond", name: "Condomínio", amount: 480, category: "Moradia", potId: "pot-casa", nature: "necessidade", frequency: "mensal", nextDue: "2026-11-10", status: "atrasada" },
  { id: "fx-luz", name: "Energia elétrica", amount: 186.3, category: "Moradia", potId: "pot-casa", nature: "necessidade", frequency: "mensal", nextDue: "2026-11-02", status: "paga" },
  { id: "fx-net", name: "Internet fibra", amount: 119.9, category: "Moradia", potId: "pot-casa", nature: "necessidade", frequency: "mensal", nextDue: "2026-11-20", status: "pendente" },
  { id: "fx-acad", name: "Academia", amount: 129.9, category: "Saúde", potId: "pot-saude", nature: "necessidade", frequency: "mensal", nextDue: "2026-11-22", status: "pendente" },
  { id: "fx-stream", name: "Streaming (Netflix + Spotify)", amount: 77.8, category: "Assinaturas", potId: "pot-assin", nature: "impulso", frequency: "mensal", nextDue: "2026-12-01", status: "pendente" },
  { id: "fx-ingles", name: "Curso de inglês", amount: 290, category: "Educação", potId: "pot-educ", nature: "necessidade", frequency: "mensal", nextDue: "2026-11-25", status: "pendente" },
  { id: "fx-ipva", name: "IPVA", amount: 1840, category: "Transporte", nature: "necessidade", frequency: "anual", nextDue: "2027-01-15", status: "pendente" },
];

const buildInstallments = (count: number, amount: number, firstDue: string, paid: number): Installment[] => {
  const [y = 2026, m = 1, d = 1] = firstDue.split("-").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(Date.UTC(y, m - 1 + i, d));
    const due = date.toISOString().slice(0, 10);
    const isPaid = i < paid;
    return { n: i + 1, amount, due, status: isPaid ? "paga" : due < "2026-11-17" ? "atrasada" : "pendente", paidAt: isPaid ? due : undefined };
  });
};

export const installmentPurchases: InstallmentPurchase[] = [
  { id: "ins-geladeira", description: "Geladeira Brastemp", total: 3600, count: 10, purchaseDate: "2026-06-03", firstDue: "2026-07-10", nature: "necessidade", potId: "pot-casa", installments: buildInstallments(10, 360, "2026-07-10", 5) },
  { id: "ins-notebook", description: "Notebook para trabalho", total: 5400, count: 12, purchaseDate: "2026-03-12", firstDue: "2026-04-15", nature: "necessidade", installments: buildInstallments(12, 450, "2026-04-15", 7) },
  { id: "ins-sofa", description: "Sofá retrátil", total: 2280, count: 6, purchaseDate: "2026-09-20", firstDue: "2026-10-20", nature: "impulso", potId: "pot-casa", installments: buildInstallments(6, 380, "2026-10-20", 1) },
];

/** Monthly history used by charts (last 6 months). */
export const monthlyHistory = [
  { month: "jun", receitas: 8900, despesas: 7420, necessidade: 5800, impulso: 1620, saldo: 34800 },
  { month: "jul", receitas: 9100, despesas: 7980, necessidade: 6050, impulso: 1930, saldo: 35920 },
  { month: "ago", receitas: 9300, despesas: 7210, necessidade: 5990, impulso: 1220, saldo: 38010 },
  { month: "set", receitas: 8800, despesas: 8150, necessidade: 6400, impulso: 1750, saldo: 38660 },
  { month: "out", receitas: 9600, despesas: 7330, necessidade: 6120, impulso: 1210, saldo: 40930 },
  { month: "nov", receitas: 9300, despesas: 3069.7, necessidade: 2695.5, impulso: 374.2, saldo: 42070.5 },
];

export const balanceDaily = [
  { day: "01/11", saldo: 38420 }, { day: "04/11", saldo: 39710 }, { day: "05/11", saldo: 45410 },
  { day: "08/11", saldo: 44980 }, { day: "10/11", saldo: 44400 }, { day: "13/11", saldo: 43120 },
  { day: "15/11", saldo: 42460 }, { day: "17/11", saldo: 42070.5 },
];

export const plannedIncome = [
  { id: "inc-sal", description: "Salário", amount: 7800, date: "2026-11-05", received: true },
  { id: "inc-free", description: "Projeto freelance", amount: 1500, date: "2026-11-04", received: true },
  { id: "inc-free2", description: "Freelance — segunda entrega", amount: 1200, date: "2026-11-28", received: false },
];
export const plannedExtraordinary = [
  { id: "ex-pres", description: "Presente de aniversário da mãe", amount: 250, date: "2026-11-24" },
  { id: "ex-rev", description: "Revisão do carro", amount: 680, date: "2026-11-29" },
];
