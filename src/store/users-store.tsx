import { createContext, useContext, useState, type ReactNode } from "react";

export type UserRole = "admin" | "usuario";
/** Every person is a "usuário"; `isAdmin` additionally lets them manage access. */
export interface AppUser { id: string; name: string; email: string; isAdmin: boolean; active: boolean; lastAccess: string; }

const INITIAL: AppUser[] = [
  { id: "u1", name: "Joana Valença", email: "joana@exemplo.com", isAdmin: true, active: true, lastAccess: "17/11/2026" },
  { id: "u2", name: "Rafael Valença", email: "rafael@exemplo.com", isAdmin: false, active: true, lastAccess: "15/11/2026" },
  { id: "u3", name: "Lia Moraes", email: "lia@exemplo.com", isAdmin: false, active: false, lastAccess: "02/10/2026" },
];

interface UsersCtx {
  users: AppUser[]; currentId: string; current: AppUser;
  /** Profile the current person is using right now. */
  mode: UserRole; setMode: (m: UserRole) => void; canManage: boolean;
  setCurrent: (id: string) => void;
  addUser: (u: Omit<AppUser, "id" | "lastAccess">) => void;
  updateUser: (id: string, patch: Partial<AppUser>) => void;
  removeUser: (id: string) => void;
}
const Ctx = createContext<UsersCtx | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState(INITIAL);
  const [currentId, setCurrentId] = useState("u1");
  const [modeState, setModeState] = useState<UserRole>("admin");
  const current = users.find((u) => u.id === currentId) ?? users[0]!;
  const mode: UserRole = current.isAdmin ? modeState : "usuario";
  const value: UsersCtx = {
    users, currentId, current, mode, canManage: mode === "admin",
    setMode: (m) => setModeState(m),
    setCurrent: (id) => { setCurrentId(id); setModeState(users.find((u) => u.id === id)?.isAdmin ? "admin" : "usuario"); },
    addUser: (u) => setUsers((l) => [...l, { ...u, id: `u${Date.now()}`, lastAccess: "Nunca acessou" }]),
    updateUser: (id, patch) => setUsers((l) => l.map((u) => (u.id === id ? { ...u, ...patch } : u))),
    removeUser: (id) => setUsers((l) => l.filter((u) => u.id !== id)),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useUsers() { const c = useContext(Ctx); if (!c) throw new Error("useUsers outside UsersProvider"); return c; }
export const initials = (n: string) => n.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");
export const ROLE_LABEL: Record<UserRole, string> = { admin: "Administrador", usuario: "Usuário" };
