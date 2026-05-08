"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import AnimeImage from "@/components/AnimeImage";
import ShareButtons from "@/components/ShareButtons";
import { QUESTIONS } from "@/constants/diagnosis";

interface DiagnosisResult {
  id: number;
  title: string;
  image: string;
  genres: string[];
  episodes: number;
  score: number;
  seasonYear: number | null;
}

type Answers = Record<string, string>;
type FreeTexts = Record<string, string>;

const OTHER_PLACEHOLDERS: Record<string, string> = {
  q1: "例：ファンタジーが見たい、異世界ものが好き...",
  q2: "例：ロボットものが好き、魔法バトルが見たい...",
  q3: "例：50話以上の長編、映画作品も含めて...",
};

export default function DiagnosisWizard() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [freeTexts, setFreeTexts] = useState<FreeTexts>({});
  const [otherOpen, setOtherOpen] = useState<string | null>(null);
  const [results, setResults] = useState<DiagnosisResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = QUESTIONS[step];
  const totalSteps = QUESTIONS.length;

  // 「その他」展開時に入力欄へフォーカス
  useEffect(() => {
    if (otherOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [otherOpen]);

  const advanceOrFinish = (newAnswers: Answers) => {
    if (step < totalSteps - 1) {
      setTimeout(() => {
        setOtherOpen(null);
        setStep((prev) => prev + 1);
      }, 300);
    } else {
      // 最終問 → API呼び出し
      setTimeout(async () => {
        setLoading(true);
        try {
          const params = new URLSearchParams({
            q1: newAnswers.q1,
            q2: newAnswers.q2,
            q3: newAnswers.q3,
          });
          const res = await fetch(`/api/diagnosis?${params}`);
          const data = await res.json();
          setResults(data.results ?? []);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    }
  };

  const handleSelect = (value: string) => {
    setOtherOpen(null);
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    advanceOrFinish(newAnswers);
  };

  const handleOtherToggle = () => {
    const qId = currentQuestion.id;
    if (otherOpen === qId) {
      // 既に開いている → 閉じる
      setOtherOpen(null);
    } else {
      // 開く
      setOtherOpen(qId);
    }
  };

  const handleOtherSubmit = () => {
    const qId = currentQuestion.id;
    const text = freeTexts[qId]?.trim();
    if (!text) return;
    const newAnswers = { ...answers, [qId]: `その他: ${text}` };
    setAnswers(newAnswers);
    advanceOrFinish(newAnswers);
  };

  const handleBack = () => {
    if (step > 0) {
      setOtherOpen(null);
      setStep(step - 1);
    }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({});
    setFreeTexts({});
    setOtherOpen(null);
    setResults(null);
  };

  // ========== ローディング ==========
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        <p className="mt-4 text-sm text-text-sub">
          あなたにぴったりのアニメを探しています...
        </p>
      </div>
    );
  }

  // ========== 結果画面 ==========
  if (results) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm text-text-sub">診断結果</p>
          <h2 className="text-2xl font-bold md:text-3xl">
            あなたにおすすめの<span className="text-accent">{results.length}作品</span>
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {results.map((anime, i) => (
            <article
              key={anime.id}
              className="overflow-hidden rounded-xl border border-text-sub/15 bg-card transition-colors hover:border-accent/50"
            >
              <div className="flex">
                {/* サムネイル */}
                <div className="h-32 w-24 shrink-0 overflow-hidden bg-background sm:w-28">
                  <AnimeImage
                    src={anime.image}
                    alt={anime.title}
                    className="h-full w-full"
                  />
                </div>

                <div className="flex-1 p-3 sm:p-4">
                  {/* 順位 + ジャンルバッジ */}
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    {anime.genres.slice(0, 3).map((g) => (
                      <span
                        key={g}
                        className="rounded-full bg-gray-500 px-2 py-0.5 text-[10px] font-medium text-white"
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  <h3 className="font-bold leading-snug text-text-main">
                    {anime.title}
                  </h3>

                  <div className="mt-2 flex items-center gap-3 text-xs text-text-sub">
                    {anime.episodes > 0 && <span>全{anime.episodes}話</span>}
                    {anime.seasonYear && <span>{anime.seasonYear}年</span>}
                  </div>

                  {/* スコアバー */}
                  {anime.score > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${anime.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-accent">
                        {anime.score}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* シェアボタン */}
        <div className="mt-6 flex justify-center">
          <ShareButtons
            title="AniTabiのアニメ診断をやってみた！"
            url="https://anitabi.jp/diagnosis"
          />
        </div>

        {/* アクションボタン */}
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={handleReset}
            className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 font-bold text-white transition-opacity hover:opacity-90"
          >
            もう一度診断する
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border border-text-sub/30 px-8 text-sm text-text-sub transition-colors hover:border-accent hover:text-text-main"
          >
            トップに戻る
          </Link>
        </div>
      </div>
    );
  }

  // ========== 質問画面 ==========
  const isOtherOpen = otherOpen === currentQuestion.id;
  const isOtherSelected = answers[currentQuestion.id]?.startsWith("その他:");
  const freeText = freeTexts[currentQuestion.id] ?? "";

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {/* プログレスバー */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs text-text-sub">
          <span>
            {step + 1} / {totalSteps}
          </span>
          {step > 0 && (
            <button
              onClick={handleBack}
              className="transition-colors hover:text-text-main"
            >
              ← 戻る
            </button>
          )}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-background-secondary">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* 質問テキスト */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold md:text-2xl">
          {currentQuestion.title}
        </h2>
        <p className="mt-1 text-sm text-text-sub">
          {currentQuestion.subtitle}
        </p>
      </div>

      {/* 選択カード */}
      <div className="flex flex-col gap-3">
        {currentQuestion.options.map((option) => {
          const isSelected = answers[currentQuestion.id] === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                isSelected
                  ? "border-accent bg-accent/15 scale-[1.02]"
                  : "border-text-sub/15 bg-card hover:border-accent/40"
              }`}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span
                className={`font-medium ${isSelected ? "text-accent" : "text-text-main"}`}
              >
                {option.label}
              </span>
              {isSelected && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="ml-auto h-5 w-5 text-accent"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </button>
          );
        })}

        {/* その他カード */}
        <div>
          <button
            onClick={handleOtherToggle}
            className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
              isOtherOpen || isOtherSelected
                ? "border-accent bg-accent/15 scale-[1.02]"
                : "border-text-sub/15 bg-card hover:border-accent/40"
            }`}
          >
            <span className="text-2xl">✏️</span>
            <span
              className={`font-medium ${isOtherOpen || isOtherSelected ? "text-accent" : "text-text-main"}`}
            >
              その他
            </span>
            {isOtherSelected && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="ml-auto h-5 w-5 text-accent"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
          </button>

          {/* スライド展開する入力欄 */}
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              isOtherOpen
                ? "grid-rows-[1fr] opacity-100 mt-2"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex gap-2 rounded-xl border-2 border-text-sub/15 bg-card p-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={freeText}
                  onChange={(e) =>
                    setFreeTexts((prev) => ({
                      ...prev,
                      [currentQuestion.id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleOtherSubmit();
                  }}
                  placeholder={OTHER_PLACEHOLDERS[currentQuestion.id]}
                  className="flex-1 bg-transparent text-sm text-text-main placeholder:text-text-sub/50 outline-none"
                />
                <button
                  onClick={handleOtherSubmit}
                  disabled={!freeText.trim()}
                  className="shrink-0 rounded-lg bg-accent px-4 py-1.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-30"
                >
                  決定
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
