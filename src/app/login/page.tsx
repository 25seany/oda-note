"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDictionary } from "@/lib/i18n/useDictionary";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/notes";
  const { dict: t } = useDictionary();

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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        router.push(next);
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage(t.login.signupSuccess);
        setMode("signin");
      }
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-semibold">{t.login.title}</h1>
        <p className="mb-6 text-center text-sm text-zinc-500">{t.login.subtitle}</p>

        <div className="mb-4 flex rounded-lg bg-zinc-100 p-1">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-md py-2 text-sm font-medium ${
              mode === "signin" ? "bg-white shadow" : "text-zinc-500"
            }`}
          >
            {t.login.signin}
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-md py-2 text-sm font-medium ${
              mode === "signup" ? "bg-white shadow" : "text-zinc-500"
            }`}
          >
            {t.login.signup}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder={t.login.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder={t.login.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? t.login.submitLoading : mode === "signin" ? t.login.submitSignin : t.login.submitSignup}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm text-zinc-600">{message}</p>}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
