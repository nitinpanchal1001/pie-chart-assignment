import type { ThemePreference } from '../lib/useTheme'

const OPTIONS: { id: ThemePreference; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'Auto' },
]

export default function ThemeToggle({
  preference,
  onChange,
}: {
  preference: ThemePreference
  onChange: (preference: ThemePreference) => void
}) {
  return (
    <div
      className="inline-flex gap-0.5 rounded-[9px] border border-edge bg-raised p-0.5"
      role="group"
      aria-label="Colour theme"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          className="rounded-[7px] px-3 py-[5px] text-[12.5px] font-medium text-ink-2
            transition-colors hover:text-ink-1 aria-pressed:bg-plane
            aria-pressed:text-ink-1 aria-pressed:shadow-[inset_0_0_0_1px_var(--edge)]"
          aria-pressed={preference === option.id}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
