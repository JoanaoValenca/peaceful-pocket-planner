const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const formatBRL = (v: number) => brl.format(v);
export const formatDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};
export const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
export const MONTHS_SHORT = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
/** Parses "1.234,56" or "1234.56" into a number. Returns NaN when invalid. */
export const parseBRL = (s: string) => {
  const clean = s.replace(/[R$\s]/g, "");
  if (!clean) return NaN;
  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  return Number(normalized);
};
export const pct = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);
export const todayISO = () => "2026-11-17";
