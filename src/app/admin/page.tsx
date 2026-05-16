"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "anitabi_admin_pw";

type NotionStatus = {
  total: number;
  withDescription: number;
  withoutDescription: number;
  updatedAt: string;
};

type UpdateResult = {
  season: string;
  count: number;
  updatedAt: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [notionStatus, setNotionStatus] = useState<NotionStatus | null>(null);
  const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) verifyAndSet(saved, false);
  }, []);

  async function verifyAndSet(pw: string, showError: boolean) {
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      sessionStorage.setItem(STORAGE_KEY, pw);
      setAuthed(true);
      setAuthError("");
    } else if (showError) {
      setAuthError("パスワードが違います");
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    verifyAndSet(password, true);
  }

  function handleLogout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
    setPassword("");
  }

  async function fetchNotionStatus() {
    const pw = sessionStorage.getItem(STORAGE_KEY) ?? "";
    setLoading("notion");
    const res = await fetch("/api/admin/notion-status", {
      headers: { "x-admin-password": pw },
    });
    const data = await res.json();
    setNotionStatus(data);
    setLoading(null);
  }

  async function runCronUpdate() {
    setLoading("cron");
    const res = await fetch("/api/cron/update-anime");
    const data = await res.json();
    setUpdateResult(data);
    setLoading(null);
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <h1 className="mb-6 text-center text-xl font-bold text-text-main">AniTabi 管理画面</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="管理者パスワード"
              className="w-full rounded-xl border border-text-sub/20 bg-card px-4 py-3 text-sm text-text-main placeholder:text-text-sub/40 focus:border-accent/60 focus:outline-none"
            />
            {authError && <p className="text-sm text-red-400">{authError}</p>}
            <button
              type="submit"
              className="h-11 w-full rounded-xl bg-accent font-medium text-white hover:opacity-80"
            >
              ログイン
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-text-sub hover:text-text-main">← サイトに戻る</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-main">AniTabi 管理画面</h1>
          <button
            onClick={handleLogout}
            className="rounded-full border border-text-sub/30 px-4 py-1.5 text-xs text-text-sub hover:border-accent hover:text-text-main"
          >
            ログアウト
          </button>
        </div>

        <div className="space-y-6">
          {/* お問い合わせ */}
          <section className="rounded-2xl border border-text-sub/15 bg-card p-6">
            <h2 className="mb-4 font-bold text-text-main">お問い合わせ</h2>
            <p className="text-sm text-text-sub">
              お問い合わせはメールで受信されます。
            </p>
            <a
              href="https://mail.google.com/mail/u/0/#search/to%3Akirin9867%2Bani%40gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex h-9 items-center gap-2 rounded-xl border border-text-sub/20 bg-background-secondary px-4 text-sm text-text-main hover:border-accent/40"
            >
              Gmail で確認 ↗
            </a>
          </section>

          {/* 今季アニメ手動更新 */}
          <section className="rounded-2xl border border-text-sub/15 bg-card p-6">
            <h2 className="mb-1 font-bold text-text-main">今季アニメ手動更新</h2>
            <p className="mb-4 text-sm text-text-sub">Annict API から今季アニメを取得します（毎日0時 JST に自動実行）。</p>
            <button
              onClick={runCronUpdate}
              disabled={loading === "cron"}
              className="h-9 rounded-xl bg-accent px-5 text-sm font-medium text-white hover:opacity-80 disabled:opacity-50"
            >
              {loading === "cron" ? "更新中..." : "今すぐ更新"}
            </button>
            {updateResult && (
              <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-text-main">
                ✅ {updateResult.season} / {updateResult.count}件取得 — {new Date(updateResult.updatedAt).toLocaleString("ja-JP")}
              </div>
            )}
          </section>

          {/* Notion同期状況 */}
          <section className="rounded-2xl border border-text-sub/15 bg-card p-6">
            <h2 className="mb-1 font-bold text-text-main">声優データ Notion 同期状況</h2>
            <p className="mb-4 text-sm text-text-sub">Notion データベースの声優データを確認します。</p>
            <button
              onClick={fetchNotionStatus}
              disabled={loading === "notion"}
              className="h-9 rounded-xl border border-text-sub/20 bg-background-secondary px-5 text-sm text-text-main hover:border-accent/40 disabled:opacity-50"
            >
              {loading === "notion" ? "確認中..." : "状況を確認"}
            </button>
            {notionStatus && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-text-sub/15 bg-background-secondary p-3 text-center">
                  <p className="text-2xl font-bold text-text-main">{notionStatus.total}</p>
                  <p className="text-xs text-text-sub">総登録数</p>
                </div>
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-3 text-center">
                  <p className="text-2xl font-bold text-accent">{notionStatus.withDescription}</p>
                  <p className="text-xs text-text-sub">説明文あり</p>
                </div>
                <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-center">
                  <p className="text-2xl font-bold text-red-400">{notionStatus.withoutDescription}</p>
                  <p className="text-xs text-text-sub">説明文なし</p>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-text-sub hover:text-text-main">← サイトに戻る</Link>
        </div>
      </div>
    </main>
  );
}
