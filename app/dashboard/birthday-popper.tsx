"use client";

import { useEffect, useMemo, useState } from "react";

function isBirthday(dateOfBirth: string | null | undefined) {
  if (!dateOfBirth) return false;
  const today = new Date();
  const dob = new Date(dateOfBirth);
  return (
    today.getDate() === dob.getDate() &&
    today.getMonth() === dob.getMonth()
  );
}

export default function BirthdayPopper({
  dateOfBirth,
  name,
}: {
  dateOfBirth: string | null | undefined;
  name: string | null | undefined;
}) {
  const [show, setShow] = useState(false);
  const shouldShow = useMemo(() => isBirthday(dateOfBirth), [dateOfBirth]);

  useEffect(() => {
    if (!shouldShow) return;
    setShow(true);
    const timer = setTimeout(() => setShow(false), 4500);
    return () => clearTimeout(timer);
  }, [shouldShow]);

  if (!show) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-start justify-center pt-10">
      <div className="rounded-2xl border border-cyan-300/40 bg-slate-950/80 px-6 py-4 text-sm text-cyan-100 shadow-[0_0_40px_rgba(56,189,248,0.45)]">
        Happy Birthday{typeof name === "string" ? `, ${name}` : ""}!
      </div>
      <div className="birthday-burst">
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={`burst-${index}`} className="birthday-confetti" />
        ))}
      </div>
    </div>
  );
}
