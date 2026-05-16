"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "送信失敗");
      }
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "送信に失敗しました");
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <article className="mx-auto max-w-2xl px-4 py-10">
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">お問い合わせ</h1>
          <p className="mb-8 text-sm text-text-sub">
            バグ報告・情報修正依頼・ご意見はこちらからどうぞ。
          </p>

          {status === "done" ? (
            <div className="rounded-2xl border border-accent/30 bg-accent/10 px-6 py-10 text-center">
              <p className="text-2xl mb-2">✅</p>
              <p className="font-bold text-text-main">送信が完了しました</p>
              <p className="mt-1 text-sm text-text-sub">
                お問い合わせいただきありがとうございます。内容を確認の上、ご連絡いたします。
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex h-10 items-center justify-center rounded-full border border-text-sub/30 px-6 text-sm text-text-sub transition-colors hover:border-accent hover:text-text-main"
              >
                ← トップに戻る
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-main">
                    お名前 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="山田 太郎"
                    className="w-full rounded-xl border border-text-sub/20 bg-background-secondary px-4 py-2.5 text-sm text-text-main placeholder:text-text-sub/40 focus:border-accent/60 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-main">
                    メールアドレス <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="example@email.com"
                    className="w-full rounded-xl border border-text-sub/20 bg-background-secondary px-4 py-2.5 text-sm text-text-main placeholder:text-text-sub/40 focus:border-accent/60 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-main">
                  件名 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="サイトの不具合について"
                  className="w-full rounded-xl border border-text-sub/20 bg-background-secondary px-4 py-2.5 text-sm text-text-main placeholder:text-text-sub/40 focus:border-accent/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-main">
                  お問い合わせ内容 <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="お問い合わせ内容を入力してください"
                  className="w-full rounded-xl border border-text-sub/20 bg-background-secondary px-4 py-2.5 text-sm text-text-main placeholder:text-text-sub/40 focus:border-accent/60 focus:outline-none resize-none"
                />
              </div>

              {status === "error" && (
                <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="h-11 w-full rounded-xl bg-accent font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                {status === "sending" ? "送信中..." : "送信する"}
              </button>
            </form>
          )}
        </article>
      </main>

      <footer className="border-t border-text-sub/20 bg-background-secondary/50">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-6 text-center text-xs text-text-sub">
          <p>&copy; 2026 <span className="font-bold text-text-main">AniTabi</span> by kirin</p>
        </div>
      </footer>
    </>
  );
}
