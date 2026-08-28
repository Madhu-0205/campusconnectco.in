"use client";

import { useState } from"react";

import SkillSelector, { SkillBadge, type Skill } from"@/components/SkillSelector";

// ─── Demo Container ───────────────────────────────────────────────────────────

export default function SkillSelectorDemo() {
 const [selected, setSelected] = useState<Skill[]>([]);
 const [submitted, setSubmitted] = useState<string[] | null>(null);

 function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
 e.preventDefault();
 const data = new FormData(e.currentTarget);
 const ids = JSON.parse(data.get("skills") as string) as string[];
 setSubmitted(ids);
 }

 return (
 <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary-light/30 px-4 py-14">
 <div className="mx-auto max-w-2xl space-y-10">

 {/* ── Page header ── */}
 <div className="text-center">
 <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-4 py-1.5 font-semibold uppercase tracking-widest text-primary">
 ⚡ UI/UX Pro Max
 </div>
 <h1 className="font-extrabold tracking-tight text-slate-900 sm:text-5xl">
 Skill Selector
 </h1>
 <p className="mt-3 text-slate-500">
 Multi-select autocomplete with animated badges, keyboard navigation &amp; full accessibility.
 </p>
 </div>

 {/* ── Demo card ── */}
 <div className="rounded-2xl border border-white/10/60 bg-[#111116] p-6 shadow-sm">

 <form onSubmit={handleSubmit} noValidate className="space-y-6">

 {/* VARIANT 1 — Unlimited, fully controlled */}
 <div className="relative">
 <SkillSelector
 label="Your UI/UX Skills"
 placeholder="Search e.g. 'animation', 'tailwind'…"
 value={selected}
 onChange={setSelected}
 name="skills"
 />
 </div>

 {/* Feature chips */}
 <div className="flex flex-wrap gap-2">
 {["Multi-select","Autocomplete","Keyboard ↑↓ ↵","Backspace removes","Animated badges","ARIA combobox","Form-ready"].map((f) => (
 <span key={f} className="rounded-full bg-white/5 px-3 py-1 font-medium text-slate-500">
 {f}
 </span>
 ))}
 </div>

 {/* ── Selected summary ── */}
 {selected.length > 0 && (
 <div className="rounded-xl bg-white/5/40 p-4 space-y-2">
 <p className="font-semibold uppercase tracking-wider text-slate-400">
 {selected.length} skill{selected.length !== 1 ?"s" :""} selected
 </p>
 <div className="flex flex-wrap gap-1.5">
 {selected.map((s) => (
 <SkillBadge key={s.id} skill={s} onRemove={() => { }} readOnly />
 ))}
 </div>
 </div>
 )}

 {/* Submit */}
 <button
 type="submit"
 className="w-full rounded-xl bg-primary py-3 font-semibold text-white shadow-sm transition hover:bg-primary active:scale-[.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
 disabled={selected.length === 0}
 >
 Submit selected skills →
 </button>
 </form>

 {/* Form output */}
 {submitted && (
 <div className="mt-5 rounded-xl bg-green-50 border border-green-200 p-4 animate-[scaleIn_200ms_ease-out_both]">
 <p className="mb-2 font-semibold uppercase tracking-wider text-green-700">
 ✅ Form submitted — skill IDs
 </p>
 <pre className="whitespace-pre-wrap break-all text-green-800 font-mono">
 {JSON.stringify(submitted, null, 2)}
 </pre>
 </div>
 )}
 </div>

 {/* ── Variant 2 — Max 3 selections ── */}
 <div className="rounded-2xl border border-white/10/60 bg-[#111116] p-6 shadow-sm space-y-4">
 <div>
 <h2 className="font-bold text-slate-800">Variant — Max 3 selections</h2>
 <p className="text-slate-500">Once you hit 3 skills, the input locks with a hint.</p>
 </div>
 <SkillSelector
 label="Top 3 Skills"
 maxSelections={3}
 placeholder="Pick up to 3 skills…"
 name="skills_max3"
 />
 </div>

 {/* ── Variant 3 — Disabled ── */}
 <div className="rounded-2xl border border-white/10/60 bg-[#111116] p-6 shadow-sm space-y-4">
 <div>
 <h2 className="font-bold text-slate-800">Variant — Disabled state</h2>
 <p className="text-slate-500">Greys out and blocks all interaction.</p>
 </div>
 <SkillSelector
 label="Skills (read-only)"
 disabled
 placeholder="Disabled…"
 name="skills_disabled"
 />
 </div>

 {/* ── Keyboard shortcuts reference ── */}
 <div className="rounded-2xl border border-white/10 p-5">
 <p className="mb-3 font-semibold uppercase tracking-wider text-slate-400">Keyboard shortcuts</p>
 <div className="grid grid-cols-2 gap-x-6 text-slate-600">
 {[
 ["↑ / ↓","Navigate dropdown"],
 ["↵ Enter","Toggle skill"],
 ["⌫ Backspace","Remove last badge"],
 ["Esc","Close dropdown"],
 ["Tab","Close & blur"],
 ["Click ✕ on badge","Remove that skill"],
 ].map(([key, desc]) => (
 <div key={key} className="flex items-center gap-2">
 <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-slate-500">{key}</kbd>
 <span className="text-xs">{desc}</span>
 </div>
 ))}
 </div>
 </div>

 {/* ── Footer ── */}
 <p className="text-slate-400">
 Source: <span className="font-mono">skills.sh/sickn33/antigravity-awesome-skills/ui-ux-pro-max</span>
 </p>
 </div>
 </div>
 );
}
