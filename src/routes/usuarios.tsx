import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, LogIn, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, Panel, Field } from "@/components/shared/ui-kit";
import { useUsers, initials } from "@/store/users-store";

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
  const { users, currentId, setCurrent, addUser, updateUser, removeUser, canManage } = useUsers();
  const admins = users.filter((u) => u.isAdmin && u.active).length;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", isAdmin: false });
  const [err, setErr] = useState<{ name?: string; email?: string }>({});
  const [toRemove, setToRemove] = useState<string | null>(null);

  const changeAdmin = (id: string, isAdmin: boolean) => {
    const u = users.find((x) => x.id === id)!;
    if (!isAdmin && u.isAdmin && admins <= 1) { toast.error("É preciso ter pelo menos um administrador ativo."); return; }
    updateUser(id, { isAdmin });
    toast.success(isAdmin ? `${u.name} agora também é Administrador.` : `${u.name} agora é apenas Usuário.`);
  };
  const toggleActive = (id: string, active: boolean) => {
    const u = users.find((x) => x.id === id)!;
    if (!active && u.isAdmin && admins <= 1) { toast.error("Não é possível desativar o único administrador."); return; }
    if (!active && id === currentId) { toast.error("Você não pode desativar o próprio acesso."); return; }
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
    setOpen(false); setForm({ name: "", email: "", isAdmin: false });
  };

  if (!canManage) return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted"><Lock className="h-5 w-5 text-muted-foreground" /></div>
      <h1 className="font-display text-2xl">Acesso restrito</h1>
      <p className="text-sm text-muted-foreground">A gestão de acessos é exclusiva para administradores. Se você também é administrador, troque de perfil no menu lateral.</p>
      <Button asChild variant="outline"><Link to="/">Voltar à visão geral</Link></Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Usuários e acessos" description="Quem pode entrar no Pote e o que cada pessoa pode fazer."
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Convidar pessoa</Button>} />


      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Administradores" description="Também são usuários, e além disso gerenciam acessos."><p className="text-sm text-muted-foreground">{admins} ativo(s)</p></Panel>
        <Panel title="Apenas usuários" description="Registram movimentações e acompanham os potes, sem gerenciar acessos."><p className="text-sm text-muted-foreground">{users.filter((u) => !u.isAdmin && u.active).length} ativo(s)</p></Panel>
      </div>

      <Panel title="Pessoas com acesso">
        <ul className="divide-y">
          {users.map((u) => (
            <li key={u.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand text-xs font-semibold text-sand-foreground">{initials(u.name)}</div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{u.name} {u.id === currentId && <Badge variant="secondary" className="ml-1">Você</Badge>} {u.isAdmin && <Badge variant="outline" className="ml-1">Admin</Badge>} {!u.active && <Badge variant="outline" className="ml-1">Inativo</Badge>}</div>
                  <p className="truncate text-xs text-muted-foreground">{u.email} · Último acesso: {u.lastAccess}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-muted-foreground"><Switch checked={u.isAdmin} onCheckedChange={(v) => changeAdmin(u.id, v)} aria-label={`${u.name} é administrador`} />Administrador</label>
                <label className="flex items-center gap-2 text-xs text-muted-foreground"><Switch checked={u.active} onCheckedChange={(v) => toggleActive(u.id, v)} aria-label={`Acesso de ${u.name}`} />Ativo</label>
                <Button variant="ghost" size="icon" title="Entrar como esta pessoa (simulação)" disabled={!u.active || u.id === currentId}
                  onClick={() => { setCurrent(u.id); toast.success(`Agora você vê o Pote como ${u.name}.`); }}><LogIn className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" title="Remover" disabled={u.id === currentId} onClick={() => setToRemove(u.id)}><Trash2 className="h-4 w-4" /></Button>
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
            <label className="flex items-center justify-between rounded-lg border p-3 text-sm"><span>Também é administrador<span className="block text-xs text-muted-foreground">Poderá gerenciar acessos.</span></span><Switch checked={form.isAdmin} onCheckedChange={(v) => setForm({ ...form, isAdmin: v })} /></label>
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
              if (u.isAdmin && admins <= 1) { toast.error("É preciso ter pelo menos um administrador ativo."); return setToRemove(null); }
              removeUser(u.id); setToRemove(null); toast.success("Acesso removido.");
            }}>Remover</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
