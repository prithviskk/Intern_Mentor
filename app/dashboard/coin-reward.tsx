"use client";

import { useEffect, useMemo, useState } from "react";

type CoinRewardProps = {
  streakDays: number;
  hasCheckedInToday: boolean;
};

export default function CoinReward({
  streakDays,
  hasCheckedInToday,
}: CoinRewardProps) {
  const todayKey = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return `coin-reward-${today}`;
  }, []);

  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (!hasCheckedInToday) return;
    if (typeof window === "undefined") return;
    const alreadyShown = window.localStorage.getItem(todayKey);
    if (alreadyShown) return;
    setShowAnimation(true);
    window.localStorage.setItem(todayKey, "true");
    const timer = setTimeout(() => setShowAnimation(false), 2600);
    return () => clearTimeout(timer);
  }, [hasCheckedInToday, todayKey]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-200/10 bg-slate-950/60 px-4 py-4">
      <div className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">
        Daily reward
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-cyan-100/80">
        <span>
          Daily reward{" "}
          <span className="font-semibold text-white">Coins x 1</span>
        </span>
        <span className="coin-inline" aria-hidden="true" />
      </div>
      {showAnimation ? (
        <div className="mt-3 h-10">
          <div className="coin-float" aria-hidden="true" />
        </div>
      ) : null}
    </div>
  );
}
