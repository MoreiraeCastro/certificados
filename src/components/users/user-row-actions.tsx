"use client";

import { useTransition } from "react";
import { setUserActive, setUserRole, setUserGroup } from "@/lib/users/actions";
import { Select } from "@/components/ui/input";
import type { UserRole } from "@/lib/types/database";

export function UserRowActions({
  profileId,
  role,
  active,
  groupId,
  groups,
  isSelf,
}: {
  profileId: string;
  role: UserRole;
  active: boolean;
  groupId: string | null;
  groups: { id: string; name: string }[];
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <Select
        value={role}
        disabled={isPending || isSelf}
        onChange={(e) => startTransition(() => setUserRole(profileId, e.target.value as UserRole))}
        className="w-28"
      >
        <option value="user">Usuário</option>
        <option value="admin">Admin</option>
      </Select>
      <Select
        value={groupId ?? ""}
        disabled={isPending}
        onChange={(e) => startTransition(() => setUserGroup(profileId, e.target.value || null))}
        className="w-36"
      >
        <option value="">Sem grupo</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </Select>
      <button
        type="button"
        disabled={isPending || isSelf}
        onClick={() => startTransition(() => setUserActive(profileId, !active))}
        className={`btn btn-secondary btn-sm ${active ? "!text-[#b03a3a]" : "!text-[#1b7a51]"} ${isSelf ? "cursor-not-allowed opacity-50" : ""}`}
      >
        {active ? "Desativar" : "Ativar"}
      </button>
    </div>
  );
}
