"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDictionary } from "@/lib/i18n/useDictionary";
import type { Analysis } from "@/lib/gradeImage";

const PENDING_KEY = "snapgrade_pending_note";

type Pending = {
  imageBase64: string;
  imageType: string;
  analysis: Analysis;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CapturePage() {
  const router = useRouter();
  const { dict: t } = useDictionary();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [grading, setGrading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [resumeMessage, setResumeMessage] = useState<string | null>(null);

  // If we just got redirected back from /login after saving a note as a
  // guest, finish the save automatically.
  useEffect(() => {
    async function resume() {
      const raw = sessionStorage.getItem(PENDING_KEY);
      if (!raw) return;
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setResumeMessage(t.login.savingPending);
      const pending = JSON.parse(raw) as Pending;
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pending),
      });
      const data = await res.json();
      sessionStorage.removeItem(PENDING_KEY);
      if (res.ok) {
        router.push(`/notes/${data.id}`);
      } else {
        setResumeMessage(null);
        setError(data.error || t.capture.genericError);
      }
    }
    resume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setAnalysis(null);
    setError(null);
  }

  async function handleGrade() {
    if (!file) return;
    setGrading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.capture.genericError);
      setAnalysis(data.analysis as Analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.capture.genericError);
    } finally {
      setGrading(false);
    }
  }

  async function handleSave() {
    if (!file || !analysis) return;
    setSaving(true);
    setError(null);
    try {
      const imageBase64 = await fileToBase64(file);
      const pending: Pending = { imageBase64, imageType: file.type, analysis };

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
        router.push("/login?next=/capture");
        return;
      }

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pending),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.capture.genericError);
      router.push(`/notes/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.capture.genericError);
      setSaving(false);
    }
  }

  function reset() {
    setFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setError(null);
  }

  if (resumeMessage) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-8 text-sm text-zinc-500">
        {resumeMessage}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-4 px-4 py-8">
      <h1 className="text-xl font-semibold text-zinc-900">{t.capture.title}</h1>
      <p className="text-center text-sm text-zinc-600">{t.capture.subtitle}</p>

      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Captured problem preview"
          className="w-full rounded-lg border border-zinc-200 object-contain"
        />
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 text-zinc-500 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-600"
        >
          <span className="text-4xl">📷</span>
          <span className="text-sm font-medium">{t.capture.tapToShoot}</span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!analysis && (
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm font-medium text-zinc-700 hover:border-blue-300 hover:text-blue-700"
          >
            {t.capture.retake}
          </button>
          <button
            type="button"
            disabled={!file || grading}
            onClick={handleGrade}
            className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {grading ? t.capture.grading : t.capture.grade}
          </button>
        </div>
      )}

      {analysis && (
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                analysis.is_correct
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {analysis.is_correct ? t.capture.correct : t.capture.incorrect}
            </span>
            <span className="text-xs font-medium text-zinc-500">{analysis.subject}</span>
          </div>

          <section>
            <h2 className="text-sm font-semibold text-zinc-600">{t.capture.questionLabel}</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-900">{analysis.question_text}</p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-zinc-600">{t.capture.yourAnswerLabel}</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-900">{analysis.user_answer || "—"}</p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-zinc-600">{t.capture.correctAnswerLabel}</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-900">{analysis.correct_answer}</p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-zinc-600">{t.capture.explanationLabel}</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-900">{analysis.explanation}</p>
          </section>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={reset}
              className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm font-medium text-zinc-700 hover:border-blue-300 hover:text-blue-700"
            >
              {t.capture.tryAnother}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? t.capture.saving : t.capture.saveCta}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
