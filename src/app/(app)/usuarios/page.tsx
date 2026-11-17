import { getCurrentUser, requireAdmin } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { NewUserForm } from "@/components/users/new-user-form";
import { UserRowActions } from "@/components/users/user-row-actions";
import type { Profile } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const currentUser = await getCurrentUser();
  requireAdmin(currentUser);

  const supabase = await createClient();
  const [{ data: profiles }, { data: groups }] = await Promise.all([
    supabase.from("profiles").select("*").order("full_name"),
    supabase.from("permission_groups").select("id, name").order("name"),
  ]);

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="page-title">Usuários</h1>
        <p className="page-subtitle">Gerencie quem tem acesso ao sistema.</p>
      </div>

      <div className="card p-5">
        <h2 className="card-title mb-3">Novo usuário</h2>
        <NewUserForm />
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Status</th>
              <th>Perfil / Grupo / Ações</th>
            </tr>
          </thead>
          <tbody>
            {((profiles ?? []) as Profile[]).map((profile) => (
              <tr key={profile.id} className="border-b border-slate-100 last:border-0">
                <td className="cell-strong">
                  {profile.full_name}
                  {profile.id === currentUser.id && <span className="ml-1 text-xs text-slate-400">(você)</span>}
                </td>
                <td>{profile.email}</td>
                <td>
                  {profile.active ? (
                    <span className="text-emerald-700">Ativo</span>
                  ) : (
                    <span className="text-slate-400">Inativo</span>
                  )}
                </td>
                <td>
                  <UserRowActions
                    profileId={profile.id}
                    role={profile.role}
                    active={profile.active}
                    groupId={profile.group_id}
                    groups={groups ?? []}
                    isSelf={profile.id === currentUser.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
