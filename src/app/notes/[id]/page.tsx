import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerDictionary } from "@/lib/i18n/server";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { locale, dict: t } = await getServerDictionary();

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
        {t.notes.backToList}
      </Link>

      <div className="mt-4 flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            note.is_correct
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {note.is_correct ? t.notes.correct : t.notes.incorrect}
        </span>
        <span className="text-xs text-zinc-400">{note.subject}</span>
        <span className="text-xs text-zinc-400">
          {new Date(note.created_at).toLocaleString(locale)}
        </span>
      </div>

      {signedUrlData?.signedUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={signedUrlData.signedUrl}
          alt="Captured problem"
          className="mt-4 w-full rounded-lg border border-zinc-200 object-contain"
        />
      )}

      <div className="mt-6 flex flex-col gap-4">
        <section>
          <h2 className="text-sm font-semibold text-zinc-500">{t.capture.questionLabel}</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm">{note.question_text}</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-zinc-500">{t.capture.yourAnswerLabel}</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm">
            {note.user_answer || t.notes.noAnswerRecognized}
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-zinc-500">{t.capture.correctAnswerLabel}</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm">{note.correct_answer}</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-zinc-500">{t.capture.explanationLabel}</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm">{note.explanation}</p>
        </section>
      </div>
    </div>
  );
}
