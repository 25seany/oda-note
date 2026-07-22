import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getServerDictionary } from "@/lib/i18n/server";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { dict: t } = await getServerDictionary();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href={user ? "/notes" : "/"} className="font-semibold text-zinc-900">
          {t.nav.brand}
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/capture" className="text-sm font-medium text-zinc-600 hover:text-blue-600">
                {t.nav.scan}
              </Link>
              <Link href="/notes" className="text-sm font-medium text-zinc-600 hover:text-blue-600">
                {t.nav.myNotes}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-blue-600">
              {t.nav.login}
            </Link>
          )}
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
