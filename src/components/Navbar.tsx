import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/notes" className="font-semibold">
          오답노트
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/capture" className="text-sm text-zinc-600 hover:text-zinc-900">
            촬영하기
          </Link>
          <Link href="/notes" className="text-sm text-zinc-600 hover:text-zinc-900">
            노트 목록
          </Link>
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}
