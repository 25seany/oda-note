"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CapturePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setError(null);
  }

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "분석에 실패했어요.");
      }

      router.push(`/notes/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-4 px-4 py-8">
      <h1 className="text-xl font-semibold">문제 촬영</h1>
      <p className="text-center text-sm text-zinc-500">
        문제와 내가 쓴 답이 함께 보이도록 찍어주세요.
      </p>

      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="촬영한 문제 미리보기"
          className="w-full rounded-lg border border-zinc-200 object-contain"
        />
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 text-zinc-400"
        >
          <span className="text-4xl">📷</span>
          <span className="text-sm">탭해서 사진 찍기</span>
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

      <div className="flex w-full gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm font-medium"
        >
          다시 찍기
        </button>
        <button
          type="button"
          disabled={!file || loading}
          onClick={handleAnalyze}
          className="flex-1 rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "분석 중..." : "채점하기"}
        </button>
      </div>
    </div>
  );
}
