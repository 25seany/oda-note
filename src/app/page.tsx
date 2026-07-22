import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerDictionary } from "@/lib/i18n/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/notes");

  const { dict: t } = await getServerDictionary();

  const steps = [
    { title: t.landing.step1Title, body: t.landing.step1Body, emoji: "📷" },
    { title: t.landing.step2Title, body: t.landing.step2Body, emoji: "⚡" },
    { title: t.landing.step3Title, body: t.landing.step3Body, emoji: "📓" },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-4 pb-10 pt-14 text-center sm:pt-20">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {t.landing.kicker}
        </span>
        <h1 className="mt-4 whitespace-pre-line text-3xl font-bold leading-tight text-zinc-900 sm:text-5xl">
          {t.landing.title}
        </h1>
        <p className="mt-4 max-w-md text-sm text-zinc-600 sm:text-base">
          {t.landing.subtitle}
        </p>

        <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:flex-row sm:max-w-none sm:justify-center">
          <Link
            href="/capture"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700"
          >
            {t.landing.ctaPrimary}
          </Link>
          <a
            href="#how-it-works"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 hover:border-blue-300 hover:text-blue-700"
          >
            {t.landing.ctaSecondary}
          </a>
        </div>
        <p className="mt-4 text-xs text-zinc-500">{t.landing.trustLine}</p>
      </section>

      <section id="how-it-works" className="border-t border-zinc-200 bg-white py-14">
        <div className="mx-auto w-full max-w-3xl px-4">
          <h2 className="text-center text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t.landing.howItWorks}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <span className="text-3xl">{step.emoji}</span>
                <h3 className="mt-3 text-sm font-semibold text-zinc-900">{step.title}</h3>
                <p className="mt-1 text-sm text-zinc-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-8 text-center text-xs text-zinc-500">
        {t.landing.footerNote}
      </footer>
    </div>
  );
}
