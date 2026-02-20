"use client";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "checkin", label: "Check-in" },
  { id: "tasks", label: "Tasks" },
  { id: "submissions", label: "Submissions" },
  { id: "materials", label: "Materials" },
  { id: "stats", label: "Stats" },
];

export default function UserNav() {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="mt-6 grid gap-3 text-sm text-cyan-100/80">
      {sections.map((section, index) => (
        <button
          key={section.id}
          className={`rounded-xl border px-4 py-2 text-left transition ${
            index === 0
              ? "border-cyan-300/30 bg-cyan-500/10 text-cyan-100"
              : "border-cyan-200/10 hover:border-cyan-300/40"
          }`}
          type="button"
          onClick={() => scrollTo(section.id)}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}
