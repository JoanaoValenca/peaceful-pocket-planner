import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, Panel, Field } from "@/components/shared/ui-kit";
import { useUsers, initials, ROLE_LABEL, type UserRole } from "@/store/users-store";

export const Route = createFileRoute("/usuarios")({
  head: () => ({ meta: [
    { title: "Usuários e acessos — Pote" },
    { name: "description", content: "Gerencie quem acessa o Pote e o perfil de cada pessoa." },
    { property: "og:title", content: "Usuários e acessos — Pote" },
    { property: "og:description", content: "Gerencie quem acessa o Pote e o perfil de cada pessoa." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: UsersPage,
});

function UsersPage() {
  const { users, current, currentId, setCurrent, addUser, updateUser, removeUser } = useUsers();
  const isAdmin = current.role === "admin";
  const admins = users.filter((u) => u.role === "admin" && u.active).length;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "usuario" as UserRole });
  const [err, setErr] = useState<{ name?: string; email?: string }>({});
  const [toRemove, setToRemove] = useState<string | null>(null);

  const changeRole = (id: string, role: UserRole) => {
    const u = users.find((x) => x.id === id)!;
    if (u.role === "admin" && role !== "admin" && admins <= 1) return toast.error("É preciso ter pelo menos um administrador ativo.");
    updateUser(id, { role });
    toast.success(`${u.name} agora é ${ROLE_LABEL[role]}.`);
  };
  const toggleActive = (id: string, active: boolean) => {
    const u = users.find((x) => x.id === id)!;
    if (!active && u.role === "admin" && admins <= 1) return toast.error("Não é possível desativar o único administrador.");
    if (!active && id === currentId) return toast.error("Você não pode desativar o próprio acesso.");
    updateUser(id, { active });
    toast.success(active ? "Acesso reativado." : "Acesso desativado.");
  };
  const submit = () => {
    const e: typeof err = {};
    if (!form.name.trim()) e.name = "Informe o nome.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Informe um e-mail válido.";
    else if (users.some((u) => u.email.toLowerCase() === form.email.toLowerCase())) e.email = "Este e-mail já está cadastrado.";
    setErr(e);
    if (Object.keys(e).length) return;
    addUser({ ...form, name: form.name.trim(), active: true });
    toast.success("Convite enviado (simulação).");
    setOpen(false); setForm({ name: "", email: "", role: "usuario" });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Usuários e acessos" description="Quem pode entrar no Pote e o que cada pessoa pode fazer."
        actions={isAdmin && <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Convidar pessoa</Button>} />

      {!isAdmin && (
        <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
          Você está com perfil de <strong>Usuário</strong>. Apenas administradores podem convidar pessoas ou mudar perfis.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Administrador" description="Gerencia usuários, contas, potes e configurações."><p className="text-sm text-muted-foreground">{admins} ativo(s)</p></Panel>
        <Panel title="Usuário" description="Registra movimentações e acompanha os potes, sem gerenciar acessos."><p className="text-sm text-muted-foreground">{users.filter((u) => u.role === "usuario" && u.active).length} ativo(s)</p></Panel>
      </div>

      <Panel title="Pessoas com acesso">
        <ul className="divide-y">
          {users.map((u) => (
            <li key={u.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand text-xs font-semibold text-sand-foreground">{initials(u.name)}</div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{u.name} {u.id === currentId && <Badge variant="secondary" className="ml-1">Você</Badge>} {!u.active && <Badge variant="outline" className="ml-1">Inativo</Badge>}</div>
                  <p className="truncate text-xs text-muted-foreground">{u.email} · Último acesso: {u.lastAccess}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Select value={u.role} onValueChange={(v) => changeRole(u.id, v as UserRole)} disabled={!isAdmin}>
                  <SelectTrigger className="w-40" aria-label={`Perfil de ${u.name}`}><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="admin">Administrador</SelectItem><SelectItem value="usuario">Usuário</SelectItem></SelectContent>
                </Select>
                <Switch checked={u.active} disabled={!isAdmin} onCheckedChange={(v) => toggleActive(u.id, v)} aria-label={`Acesso de ${u.name}`} />
                <Button variant="ghost" size="icon" title="Entrar como esta pessoa (simulação)" disabled={!u.active || u.id === currentId}
                  onClick={() => { setCurrent(u.id); toast.success(`Agora você vê o Pote como ${u.name}.`); }}><LogIn className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" title="Remover" disabled={!isAdmin || u.id === currentId} onClick={() => setToRemove(u.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Convidar pessoa</DialogTitle><DialogDescription>Ela receberá um convite por e-mail para criar a senha.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <Field label="Nome" error={err.name}><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="E-mail" error={err.email}><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Perfil">
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="admin">Administrador</SelectItem><SelectItem value="usuario">Usuário</SelectItem></SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={submit}>Enviar convite</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!toRemove} onOpenChange={(o) => !o && setToRemove(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Remover acesso?</DialogTitle><DialogDescription>{users.find((u) => u.id === toRemove)?.name} não poderá mais entrar no Pote.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setToRemove(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => {
              const u = users.find((x) => x.id === toRemove)!;
              if (u.role === "admin" && admins <= 1) { toast.error("É preciso ter pelo menos um administrador ativo."); return setToRemove(null); }
              removeUser(u.id); setToRemove(null); toast.success("Acesso removido.");
            }}>Remover</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
