import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getServerDictionary } from "@/lib/i18n/server";

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const showAll = filter === "all";
  const { locale, dict: t } = await getServerDictionary();

  const supabase = await createClient();
  let query = supabase
    .from("wrong_notes")
    .select("id, subject, question_text, is_correct, created_at")
    .order("created_at", { ascending: false });

  if (!showAll) {
    query = query.eq("is_correct", false);
  }

  const { data: notes } = await query;

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t.notes.title}</h1>
        <Link
          href="/capture"
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
        >
          {t.notes.newScan}
        </Link>
      </div>

      <div className="mb-4 flex gap-2 text-sm">
        <Link
          href="/notes"
          className={`rounded-full px-3 py-1 ${
            !showAll ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {t.notes.filterWrongOnly}
        </Link>
        <Link
          href="/notes?filter=all"
          className={`rounded-full px-3 py-1 ${
            showAll ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {t.notes.filterAll}
        </Link>
      </div>

      {!notes || notes.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-400">{t.notes.empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notes.map((note) => (
            <li key={note.id}>
              <Link
                href={`/notes/${note.id}`}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-300"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{note.question_text}</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {note.subject} · {new Date(note.created_at).toLocaleDateString(locale)}
                  </p>
                </div>
                <span
                  className={`ml-3 shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                    note.is_correct
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {note.is_correct ? t.notes.correct : t.notes.incorrect}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
