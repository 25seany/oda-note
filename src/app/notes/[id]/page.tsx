import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: note } = await supabase
    .from("wrong_notes")
    .select("*")
    .eq("id", id)
    .single();

  if (!note) notFound();

  const { data: signedUrlData } = await supabase.storage
    .from("problem-images")
    .createSignedUrl(note.image_path, 60 * 60);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <Link href="/notes" className="text-sm text-zinc-500">
        ← 목록으로
      </Link>

      <div className="mt-4 flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            note.is_correct
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {note.is_correct ? "정답" : "오답"}
        </span>
        <span className="text-xs text-zinc-400">{note.subject}</span>
        <span className="text-xs text-zinc-400">
          {new Date(note.created_at).toLocaleString("ko-KR")}
        </span>
      </div>

      {signedUrlData?.signedUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={signedUrlData.signedUrl}
          alt="문제 사진"
          className="mt-4 w-full rounded-lg border border-zinc-200 object-contain"
        />
      )}

      <div className="mt-6 flex flex-col gap-4">
        <section>
          <h2 className="text-sm font-semibold text-zinc-500">문제</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm">
            {note.question_text}
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-zinc-500">내가 쓴 답</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm">
            {note.user_answer || "(인식된 답안 없음)"}
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-zinc-500">정답</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm">
            {note.correct_answer}
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-zinc-500">해설</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm">
            {note.explanation}
          </p>
        </section>
      </div>
    </div>
  );
}
