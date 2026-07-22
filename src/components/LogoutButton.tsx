"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDictionary } from "@/lib/i18n/useDictionary";

export default function LogoutButton() {
  const router = useRouter();
  const { dict: t } = useDictionary();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-zinc-500 hover:text-zinc-800"
    >
      {t.nav.logout}
    </button>
  );
}
