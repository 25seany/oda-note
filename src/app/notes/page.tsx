import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const showAll = filter === "all";

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
        <h1 className="text-xl font-semibold">오답노트</h1>
        <Link
          href="/capture"
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
        >
          + 새로 찍기
        </Link>
      </div>

      <div className="mb-4 flex gap-2 text-sm">
        <Link
          href="/notes"
          className={`rounded-full px-3 py-1 ${
            !showAll ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
          }`}
        >
          오답만
        </Link>
        <Link
          href="/notes?filter=all"
          className={`rounded-full px-3 py-1 ${
            showAll ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
          }`}
        >
          전체
        </Link>
      </div>

      {!notes || notes.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-400">
          아직 기록된 문제가 없어요. 첫 문제를 찍어보세요!
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notes.map((note) => (
            <li key={note.id}>
              <Link
                href={`/notes/${note.id}`}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-300"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {note.question_text}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {note.subject} ·{" "}
                    {new Date(note.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <span
                  className={`ml-3 shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                    note.is_correct
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {note.is_correct ? "정답" : "오답"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
