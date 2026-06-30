"use client";

import {
    useState,
    useMemo,
    useRef,
    useEffect,
    useCallback,
    useId,
} from "react";

// ─── Types & Dataset re-exports ──────────────────────────────────────────────
import { SKILLS_DATASET, type Skill } from "@/lib/skills-dataset";
export type { Skill };
export { SKILLS_DATASET };


// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a hex color with the given alpha (0–1) as a CSS rgba string */
function hexAlpha(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function highlight(text: string, query: string) {
    if (!query) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-yellow-200 dark:bg-yellow-500/40 rounded px-0.5 not-italic">
                {text.slice(idx, idx + query.length)}
            </mark>
            {text.slice(idx + query.length)}
        </>
    );
}

// ─── SkillBadge ───────────────────────────────────────────────────────────────

interface SkillBadgeProps {
    skill: Skill;
    onRemove: () => void;
    /** If true renders a static (non-removable) display badge */
    readOnly?: boolean;
}

export function SkillBadge({ skill, onRemove, readOnly }: SkillBadgeProps) {
    return (
        <span
            role="listitem"
            className="inline-flex items-center gap-1.5 rounded-full pl-2.5 pr-1.5 py-1 text-xs font-semibold select-none transition-all duration-200 ease-out animate-[badgeIn_180ms_cubic-bezier(.34,1.56,.64,1)_both]"
            style={{
                background: hexAlpha(skill.color, 0.12),
                color: skill.color,
                border: `1.5px solid ${hexAlpha(skill.color, 0.35)}`,
            }}
        >
            <span aria-hidden="true">{skill.icon}</span>
            {skill.name}
            {!readOnly && (
                <button
                    type="button"
                    aria-label={`Remove ${skill.name}`}
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="ml-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors duration-150 hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                    style={{ focusVisibleOutlineColor: skill.color } as React.CSSProperties}
                >
                    <svg viewBox="0 0 12 12" fill="currentColor" className="h-2.5 w-2.5" aria-hidden="true">
                        <path d="M1 1l10 10M11 1 1 11" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                    </svg>
                </button>
            )}
        </span>
    );
}

// ─── DropdownOption ───────────────────────────────────────────────────────────

interface DropdownOptionProps {
    skill: Skill;
    isActive: boolean;
    isSelected: boolean;
    query: string;
    onClick: () => void;
    onMouseEnter: () => void;
    optionId: string;
}

function DropdownOption({
    skill, isActive, isSelected, query, onClick, onMouseEnter, optionId,
}: DropdownOptionProps) {
    return (
        <li
            id={optionId}
            role="option"
            aria-selected={isSelected}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors duration-100 ${isActive ? "bg-slate-100 dark:bg-slate-700" : "hover:bg-slate-50 dark:hover:bg-slate-800/60" }`}
        >
            {/* Icon bubble */}
            <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
                style={{ background: hexAlpha(skill.color, 0.14), border: `1.5px solid ${hexAlpha(skill.color, 0.3)}` }}
                aria-hidden="true"
            >
                {skill.icon}
            </span>

            {/* Text */}
            <span className="flex-1 min-w-0">
                <span className="block font-medium text-slate-800 dark:text-slate-100 truncate">
                    {highlight(skill.name, query)}
                </span>
                <span className="block text-slate-400 dark:text-slate-500 truncate">
                    {skill.category}
                </span>
            </span>

            {/* Checkmark */}
            <span
                className={`shrink-0 transition-all duration-150 ${isSelected ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
                style={{ color: skill.color }}
                aria-hidden="true"
            >
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                </svg>
            </span>
        </li>
    );
}

// ─── SkillSelector ────────────────────────────────────────────────────────────

export interface SkillSelectorProps {
    /** Controlled: currently selected skills */
    value?: Skill[];
    /** Fires whenever the selected set changes */
    onChange?: (skills: Skill[]) => void;
    /** Custom skill dataset (defaults to SKILLS_DATASET) */
    skills?: Skill[];
    /** Input placeholder */
    placeholder?: string;
    /** Maximum number of selected skills (0 = unlimited) */
    maxSelections?: number;
    /** Label text shown above the control */
    label?: string;
    /** Required flag forwarded to the hidden input */
    required?: boolean;
    /** Disable the entire control */
    disabled?: boolean;
    /** name attribute for form submission */
    name?: string;
}

export default function SkillSelector({
    value,
    onChange,
    skills = SKILLS_DATASET,
    placeholder = "Search skills…",
    maxSelections = 0,
    label = "Skills",
    required = false,
    disabled = false,
    name = "skills",
}: SkillSelectorProps) {
    const uid = useId();
    const listboxId = `${uid}-listbox`;
    const inputId = `${uid}-input`;
    const labelId = `${uid}-label`;

    // ── State ──────────────────────────────────────────────────────────────────

    const [internalSelected, setInternalSelected] = useState<Skill[]>([]);
    const selected = value ?? internalSelected;
    const setSelected = useCallback(
        (fn: (prev: Skill[]) => Skill[]) => {
            const next = fn(selected);
            setInternalSelected(next);
            onChange?.(next);
        },
        [selected, onChange],
    );

    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number>(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // ── Filtered options ───────────────────────────────────────────────────────

    const options = useMemo(() => {
        const q = query.toLowerCase().trim();
        return skills.filter((s) => {
            if (!q) return true;
            return (
                s.name.toLowerCase().includes(q) ||
                s.category.toLowerCase().includes(q) ||
                s.keywords.some((k) => k.includes(q))
            );
        });
    }, [skills, query]);

    const selectedIds = useMemo(() => new Set(selected.map((s) => s.id)), [selected]);

    const reachedMax = maxSelections > 0 && selected.length >= maxSelections;

    // ── Actions ────────────────────────────────────────────────────────────────

    const toggleSkill = useCallback(
        (skill: Skill) => {
            if (selectedIds.has(skill.id)) {
                setSelected((prev) => prev.filter((s) => s.id !== skill.id));
            } else {
                if (reachedMax) return;
                setSelected((prev) => [...prev, skill]);
                setQuery("");
                inputRef.current?.focus();
            }
        },
        [selectedIds, reachedMax, setSelected],
    );

    const removeLastSelected = useCallback(() => {
        if (query === "" && selected.length > 0) {
            setSelected((prev) => prev.slice(0, -1));
        }
    }, [query, selected, setSelected]);

    // ── Keyboard handler ───────────────────────────────────────────────────────

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setIsOpen(true);
                    setActiveIndex((i) => Math.min(i + 1, options.length - 1));
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setActiveIndex((i) => Math.max(i - 1, 0));
                    break;
                case "Enter":
                    e.preventDefault();
                    if (activeIndex >= 0 && activeIndex < options.length) {
                        toggleSkill(options[activeIndex]);
                    }
                    break;
                case "Escape":
                    setIsOpen(false);
                    setActiveIndex(-1);
                    break;
                case "Backspace":
                    removeLastSelected();
                    break;
                case "Tab":
                    setIsOpen(false);
                    break;
            }
        },
        [activeIndex, options, toggleSkill, removeLastSelected],
    );

    // ── Scroll active item into view ───────────────────────────────────────────

    useEffect(() => {
        if (activeIndex < 0 || !listRef.current) return;
        const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
        el?.scrollIntoView({ block: "nearest" });
    }, [activeIndex]);

    // ── Close on outside click ─────────────────────────────────────────────────

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (!containerRef.current?.contains(e.target as Node)) {
                setIsOpen(false);
                setActiveIndex(-1);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ── Reset active index on options change ───────────────────────────────────

    useEffect(() => { 
        requestAnimationFrame(() => {
            setActiveIndex(-1); 
        });
    }, [options]);

    // ─────────────────────────────────────────────────────────────────────────

    const activedOptionId = activeIndex >= 0 ? `${uid}-option-${activeIndex}` : undefined;

    return (
        <div ref={containerRef} className="relative w-full">

            {/* Label */}
            <label
                id={labelId}
                htmlFor={inputId}
                className="mb-1.5 block font-semibold text-slate-700 dark:text-slate-200"
            >
                {label}
                {required && <span className="ml-1 text-rose-500" aria-hidden="true">*</span>}
                {maxSelections > 0 && (
                    <span className="ml-2 font-normal text-slate-400">
                        ({selected.length}/{maxSelections})
                    </span>
                )}
            </label>

            {/* Control box */}
            <div
                className={`relative flex min-h-[46px] cursor-text flex-wrap items-center gap-1.5 rounded-xl border bg-white dark:bg-slate-900 px-3 py-2 transition-all duration-200 ${isOpen ? "border-indigo-400 ring-2 ring-indigo-400/25 dark:border-indigo-500" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600" } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
                onClick={() => !disabled && inputRef.current?.focus()}
                role="presentation"
            >
                {/* Selected badges */}
                <span role="list" aria-label="Selected skills" className="contents">
                    {selected.map((skill) => (
                        <SkillBadge
                            key={skill.id}
                            skill={skill}
                            onRemove={() => toggleSkill(skill)}
                        />
                    ))}
                </span>

                {/* Autocomplete input */}
                <input
                    ref={inputRef}
                    id={inputId}
                    type="text"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-controls={listboxId}
                    aria-expanded={isOpen}
                    aria-activedescendant={activedOptionId}
                    aria-labelledby={labelId}
                    aria-required={required}
                    disabled={disabled}
                    value={query}
                    placeholder={selected.length === 0 ? placeholder : ""}
                    autoComplete="off"
                    spellCheck={false}
                    className={`flex-1 min-w-[120px] bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none ${reachedMax ? "opacity-40 pointer-events-none" : ""}`}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        setActiveIndex(-1);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                />

                {/* Clear-all button */}
                {selected.length > 0 && (
                    <button
                        type="button"
                        aria-label="Clear all selected skills"
                        onClick={(e) => { e.stopPropagation(); setSelected(() => []); setQuery(""); }}
                        className="ml-1 shrink-0 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-3.5 w-3.5" aria-hidden="true">
                            <path d="M2 2l12 12M14 2 2 14" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && !disabled && (
                <div
                    className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/40 animate-[dropIn_140ms_ease-out_both]"
                >

                    {/* Result count header */}
                    {query && (
                        <div className="border-slate-100 dark:border-slate-800 px-3 py-2">
                            <p className="font-medium text-slate-400 dark:text-slate-500">
                                {options.length} result{options.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
                            </p>
                        </div>
                    )}

                    {/* Options list */}
                    <ul
                        ref={listRef}
                        id={listboxId}
                        role="listbox"
                        aria-label="Skill suggestions"
                        aria-multiselectable="true"
                        className="max-h-64 overflow-y-auto overscroll-contain py-1"
                    >
                        {options.length > 0 ? (
                            options.map((skill, i) => (
                                <DropdownOption
                                    key={skill.id}
                                    optionId={`${uid}-option-${i}`}
                                    skill={skill}
                                    isActive={activeIndex === i}
                                    isSelected={selectedIds.has(skill.id)}
                                    query={query}
                                    onClick={() => toggleSkill(skill)}
                                    onMouseEnter={() => setActiveIndex(i)}
                                />
                            ))
                        ) : (
                            <li className="flex flex-col items-center gap-2 py-8 text-center" role="option" aria-selected={false}>
                                <span className="text-3xl" aria-hidden="true">🔍</span>
                                <p className="text-slate-500 dark:text-slate-400">No skills match &ldquo;{query}&rdquo;</p>
                            </li>
                        )}
                    </ul>

                    {/* Footer hint */}
                    <div className="border-slate-100 dark:border-slate-800 px-3 py-2 flex items-center gap-3">
                        <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 text-slate-500">↑↓</kbd>
                        <span className="text-slate-400">navigate</span>
                        <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 text-slate-500">↵</kbd>
                        <span className="text-slate-400">select</span>
                        <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 text-slate-500">⌫</kbd>
                        <span className="text-slate-400">remove last</span>
                        <kbd className="ml-auto rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 text-slate-500">Esc</kbd>
                        <span className="text-slate-400">close</span>
                    </div>
                </div>
            )}

            {/* Hidden form input for form submission */}
            <input
                type="hidden"
                name={name}
                value={JSON.stringify(selected.map((s) => s.id))}
            />

            {/* Max selection hint */}
            {reachedMax && (
                <p role="alert" className="mt-1.5 text-amber-600 dark:text-amber-400">
                    Maximum of {maxSelections} skill{maxSelections !== 1 ? "s" : ""} reached.
                </p>
            )}
        </div>
    );
}
