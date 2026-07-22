"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
      } else {
        router.push("/notes");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage(
          "가입 확인 메일이 발송되었어요. (Supabase 설정에서 이메일 확인을 꺼두었다면 바로 로그인해 주세요.)"
        );
        setMode("signin");
      }
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-semibold">오답노트</h1>
        <p className="mb-6 text-center text-sm text-zinc-500">
          문제를 찍으면 자동으로 오답노트를 만들어드려요
        </p>

        <div className="mb-4 flex rounded-lg bg-zinc-100 p-1">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-md py-2 text-sm font-medium ${
              mode === "signin" ? "bg-white shadow" : "text-zinc-500"
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-md py-2 text-sm font-medium ${
              mode === "signup" ? "bg-white shadow" : "text-zinc-500"
            }`}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "처리 중..." : mode === "signin" ? "로그인" : "회원가입"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-zinc-600">{message}</p>
        )}
      </div>
    </div>
  );
}
