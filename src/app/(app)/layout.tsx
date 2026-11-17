import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { listCombinedNotifications } from "@/lib/notifications/combined";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const notifications = await listCombinedNotifications(supabase, user.id);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar isAdmin={user.profile.role === "admin"} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar userName={user.profile.full_name} notifications={notifications} />
        <main className="flex-1 overflow-y-auto px-8 py-7">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
