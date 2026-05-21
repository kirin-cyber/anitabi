"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import AnimeImage from "@/components/AnimeImage";
import ShareButtons from "@/components/ShareButtons";
import { QUESTIONS, GACHI_QUESTIONS, Q7_QUESTION } from "@/constants/diagnosis";
import { useLanguage } from "@/contexts/LanguageContext";

const OPTION_KEY_MAP: Record<string, string> = {
  "笑いたい": "q1_laugh", "泣きたい": "q1_cry", "ドキドキしたい": "q1_thrill",
  "ゾクゾクしたい": "q1_chill", "癒されたい": "q1_relax",
  "アクション派": "q2_action", "ストーリー派": "q2_story", "どっちも好き": "q2_both",
  "短め": "q3_short", "スタンダード": "q3_standard", "長編OK": "q3_long",
  "一気見": "q4_binge", "毎週": "q4_weekly", "のんびり": "q4_casual",
  "漫画": "q5_manga", "小説": "q5_novel", "オリジナル": "q5_original", "何でも": "q5_any",
  "最強系": "q6_strong", "成長系": "q6_growth", "チームもの": "q6_team", "日常系": "q6_slice",
  "グロ": "q7_gore", "鬱": "q7_dark", "ハーレム": "q7_harem", "百合": "q7_yuri",
  "BL": "q7_bl", "指定なし": "q7_none",
};
const Q_TITLE_KEYS: Record<string, string> = {
  q1: "q1title", q2: "q2title", q3: "q3title",
  q4: "q4title", q5: "q5title", q6: "q6title", q7: "q7title",
};
const Q_SUB_KEYS: Record<string, string> = {
  q1: "q1sub", q2: "q2sub", q3: "q3sub",
  q4: "q4sub", q5: "q5sub", q6: "q6sub", q7: "q7sub",
};

type Mode = "quick" | "full" | null;

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

const ALL_QUESTIONS = [...QUESTIONS, ...GACHI_QUESTIONS] as unknown as {
  id: string;
  title: string;
  subtitle: string;
  options: { value: string; emoji: string; label: string }[];
}[];

export default function DiagnosisWizard() {
  const [mode, setMode] = useState<Mode>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [freeTexts, setFreeTexts] = useState<FreeTexts>({});
  const [otherOpen, setOtherOpen] = useState<string | null>(null);
  const [q7Selections, setQ7Selections] = useState<string[]>([]);
  const [results, setResults] = useState<DiagnosisResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, locale } = useLanguage();
  const tOpt = (value: string) => {
    const key = OPTION_KEY_MAP[value];
    return key ? t("diagnosis", key) : value;
  };
  const tQTitle = (qId: string) => t("diagnosis", Q_TITLE_KEYS[qId] ?? qId);
  const tQSub = (qId: string) => t("diagnosis", Q_SUB_KEYS[qId] ?? qId);

  const totalSteps = mode === "full" ? ALL_QUESTIONS.length + 1 : QUESTIONS.length;
  const isQ7 = mode === "full" && step === ALL_QUESTIONS.length;
  const currentQuestion = isQ7 ? null : ALL_QUESTIONS[step];

  useEffect(() => {
    if (otherOpen && inputRef.current) inputRef.current.focus();
  }, [otherOpen]);

  const callApi = async (finalAnswers: Answers, finalQ7: string[]) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q1: finalAnswers.q1 ?? "",
        q2: finalAnswers.q2 ?? "",
        q3: finalAnswers.q3 ?? "",
      });
      if (mode === "full") {
        params.set("mode", "full");
        if (finalAnswers.q4) params.set("q4", finalAnswers.q4);
        if (finalAnswers.q5) params.set("q5", finalAnswers.q5);
        if (finalAnswers.q6) params.set("q6", finalAnswers.q6);
        if (finalQ7.length > 0) params.set("q7", finalQ7.join(","));
      }
      const res = await fetch(`/api/diagnosis?${params}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const advanceOrFinish = (newAnswers: Answers) => {
    const lastNormalStep = totalSteps - 1 - (mode === "full" ? 1 : 0);
    if (step < lastNormalStep) {
      setTimeout(() => {
        setOtherOpen(null);
        setStep((prev) => prev + 1);
      }, 300);
    } else if (mode === "full" && step === lastNormalStep) {
      // Q6終了 → Q7（多選択）へ
      setTimeout(() => {
        setOtherOpen(null);
        setStep((prev) => prev + 1);
      }, 300);
    } else {
      setTimeout(() => callApi(newAnswers, q7Selections), 300);
    }
  };

  const handleSelect = (value: string) => {
    if (!currentQuestion) return;
    setOtherOpen(null);
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    advanceOrFinish(newAnswers);
  };

  const handleOtherToggle = () => {
    if (!currentQuestion) return;
    setOtherOpen((prev) => (prev === currentQuestion.id ? null : currentQuestion.id));
  };

  const handleOtherSubmit = () => {
    if (!currentQuestion) return;
    const text = freeTexts[currentQuestion.id]?.trim();
    if (!text) return;
    const newAnswers = { ...answers, [currentQuestion.id]: `その他: ${text}` };
    setAnswers(newAnswers);
    advanceOrFinish(newAnswers);
  };

  const handleQ7Toggle = (value: string) => {
    if (value === "指定なし") {
      setQ7Selections(["指定なし"]);
    } else {
      setQ7Selections((prev) => {
        const without = prev.filter((v) => v !== "指定なし");
        return without.includes(value)
          ? without.filter((v) => v !== value)
          : [...without, value];
      });
    }
  };

  const handleQ7Submit = () => {
    const finalSelections = q7Selections.length === 0 ? ["指定なし"] : q7Selections;
    callApi(answers, finalSelections);
  };

  const handleBack = () => {
    if (step > 0) {
      setOtherOpen(null);
      setStep(step - 1);
    } else {
      setMode(null);
    }
  };

  const handleReset = () => {
    setMode(null);
    setStep(0);
    setAnswers({});
    setFreeTexts({});
    setOtherOpen(null);
    setQ7Selections([]);
    setResults(null);
  };

  // ========== ローディング ==========
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        <p className="mt-4 text-sm text-text-sub">{t("diagnosis", "loading")}</p>
      </div>
    );
  }

  // ========== 結果画面 ==========
  if (results) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm text-text-sub">
            {mode === "full" ? t("diagnosis", "gachiMode") : t("diagnosis", "quickMode")}
          </p>
          <h2 className="text-2xl font-bold md:text-3xl">
            {t("diagnosis", "resultTitle")} <span className="text-accent">{results.length}</span>
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {results.map((anime, i) => (
            <Link
              key={anime.id}
              href={`/anime/${anime.id}`}
              className="group overflow-hidden rounded-xl border border-text-sub/15 bg-card transition-colors hover:border-accent/50"
            >
              <div className="flex">
                <div className="h-32 w-24 shrink-0 overflow-hidden bg-background sm:w-28">
                  <AnimeImage src={anime.image} alt={anime.title} className="h-full w-full" />
                </div>
                <div className="flex-1 p-3 sm:p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    {anime.genres.slice(0, 3).map((g) => (
                      <span key={g} className="rounded-full bg-gray-500 px-2 py-0.5 text-[10px] font-medium text-white">
                        {g}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-bold leading-snug text-text-main transition-colors group-hover:text-accent">{anime.title}</h3>
                  <div className="mt-2 flex items-center gap-3 text-xs text-text-sub">
                    {anime.episodes > 0 && <span>{locale === "en" ? `${anime.episodes} eps` : `全${anime.episodes}話`}</span>}
                    {anime.seasonYear && <span>{anime.seasonYear}年</span>}
                  </div>
                  {anime.score > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${anime.score}%` }} />
                      </div>
                      <span className="text-xs font-bold text-accent">{anime.score}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <ShareButtons title="AniTabiのアニメ診断をやってみた！" url="https://anitabi.site/diagnosis" />
        </div>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={handleReset}
            className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 font-bold text-white transition-opacity hover:opacity-90"
          >
            {t("diagnosis", "retry")}
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border border-text-sub/30 px-8 text-sm text-text-sub transition-colors hover:border-accent hover:text-text-main"
          >
            {locale === "en" ? "Back to Home" : "トップに戻る"}
          </Link>
        </div>
      </div>
    );
  }

  // ========== モード選択画面 ==========
  if (mode === null) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-bold md:text-2xl">{t("diagnosis", "modeTitle")}</h2>
          <p className="mt-1 text-sm text-text-sub">{t("diagnosis", "modeSubtitle")}</p>
        </div>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setMode("quick")}
            className="flex items-start gap-4 rounded-2xl border-2 border-text-sub/15 bg-card p-6 text-left transition-all hover:border-accent/50 hover:bg-card/80"
          >
            <span className="text-4xl">⚡</span>
            <div>
              <p className="text-lg font-bold text-text-main">{t("diagnosis", "quickMode")} ({t("diagnosis", "quickDesc")})</p>
              <p className="mt-1 text-sm text-text-sub">{locale === "en" ? "Answer 3 quick questions to find your anime." : "気分・スタイル・話数の3問でサクッと診断。手軽に試したいならこちら。"}</p>
            </div>
          </button>
          <button
            onClick={() => setMode("full")}
            className="flex items-start gap-4 rounded-2xl border-2 border-accent/40 bg-accent/5 p-6 text-left transition-all hover:border-accent hover:bg-accent/10"
          >
            <span className="text-4xl">🎯</span>
            <div>
              <p className="text-lg font-bold text-accent">{t("diagnosis", "gachiMode")} ({t("diagnosis", "gachiDesc")})</p>
              <p className="mt-1 text-sm text-text-sub">{locale === "en" ? "7 detailed questions for more accurate results." : "視聴ペース・原作・キャラ像・避けたい要素まで細かく設定。より精度の高い結果が出るよ。"}</p>
              <span className="mt-2 inline-block rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-white">{locale === "en" ? "Recommended" : "おすすめ"}</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ========== Q7（多選択）画面 ==========
  if (isQ7) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-text-sub">
            <span>{step + 1} / {totalSteps}</span>
            <button onClick={handleBack} className="transition-colors hover:text-text-main">{t("diagnosis", "back")}</button>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-background-secondary">
            <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: "100%" }} />
          </div>
        </div>

        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold md:text-2xl">{tQTitle("q7")}</h2>
          <p className="mt-1 text-sm text-text-sub">{tQSub("q7")}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {Q7_QUESTION.options.map((option) => {
            const isSelected = q7Selections.includes(option.value);
            return (
              <button
                key={option.value}
                onClick={() => handleQ7Toggle(option.value)}
                className={`flex items-center gap-2 rounded-xl border-2 p-3 text-left transition-all ${
                  isSelected
                    ? "border-accent bg-accent/15 scale-[1.02]"
                    : "border-text-sub/15 bg-card hover:border-accent/40"
                }`}
              >
                <span className="text-xl">{option.emoji}</span>
                <span className={`text-sm font-medium ${isSelected ? "text-accent" : "text-text-main"}`}>
                  {tOpt(option.value)}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleQ7Submit}
          className="mt-6 w-full rounded-full bg-accent py-3 font-bold text-white transition-opacity hover:opacity-90"
        >
          {q7Selections.length === 0
            ? (locale === "en" ? "Skip & Find Anime" : "指定なしで診断する")
            : (locale === "en" ? "Find Anime with These Filters" : "この条件で診断する")}
        </button>
      </div>
    );
  }

  // ========== 通常質問画面（Q1〜Q6）==========
  const isOtherOpen = otherOpen === currentQuestion!.id;
  const isOtherSelected = answers[currentQuestion!.id]?.startsWith("その他:");
  const freeText = freeTexts[currentQuestion!.id] ?? "";
  const showOther = currentQuestion!.id in OTHER_PLACEHOLDERS;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {/* プログレスバー */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs text-text-sub">
          <span>{step + 1} / {totalSteps}</span>
          <button onClick={handleBack} className="transition-colors hover:text-text-main">
            {step === 0
              ? (locale === "en" ? "← Back to Mode Select" : "← モード選択に戻る")
              : t("diagnosis", "back")}
          </button>
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
        <h2 className="text-xl font-bold md:text-2xl">{tQTitle(currentQuestion!.id)}</h2>
        <p className="mt-1 text-sm text-text-sub">{tQSub(currentQuestion!.id)}</p>
      </div>

      {/* 選択カード */}
      <div className="flex flex-col gap-3">
        {currentQuestion!.options.map((option) => {
          const isSelected = answers[currentQuestion!.id] === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                isSelected ? "border-accent bg-accent/15 scale-[1.02]" : "border-text-sub/15 bg-card hover:border-accent/40"
              }`}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span className={`font-medium ${isSelected ? "text-accent" : "text-text-main"}`}>
                {tOpt(option.value)}
              </span>
              {isSelected && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="ml-auto h-5 w-5 text-accent">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </button>
          );
        })}

        {/* その他（Q1-Q3のみ表示） */}
        {showOther && (
          <div>
            <button
              onClick={handleOtherToggle}
              className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                isOtherOpen || isOtherSelected ? "border-accent bg-accent/15 scale-[1.02]" : "border-text-sub/15 bg-card hover:border-accent/40"
              }`}
            >
              <span className="text-2xl">✏️</span>
              <span className={`font-medium ${isOtherOpen || isOtherSelected ? "text-accent" : "text-text-main"}`}>
                {t("diagnosis", "other")}
              </span>
              {isOtherSelected && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="ml-auto h-5 w-5 text-accent">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${isOtherOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">
                <div className="flex gap-2 rounded-xl border-2 border-text-sub/15 bg-card p-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={freeText}
                    onChange={(e) => setFreeTexts((prev) => ({ ...prev, [currentQuestion!.id]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") handleOtherSubmit(); }}
                    placeholder={OTHER_PLACEHOLDERS[currentQuestion!.id]}
                    className="flex-1 bg-transparent text-sm text-text-main placeholder:text-text-sub/50 outline-none"
                  />
                  <button
                    onClick={handleOtherSubmit}
                    disabled={!freeText.trim()}
                    className="shrink-0 rounded-lg bg-accent px-4 py-1.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-30"
                  >
                    {t("diagnosis", "confirm")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
