export function EpicFlourish({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 24"
      className={`h-5 w-full max-w-md text-epic-gold/70 sm:h-6 ${className}`}
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M0 12h140c20-8 40-8 60 0s40 8 60 0h140M200 12c-8-6-16-6-24 0 8 6 16 6 24 0 8-6 16-6 24 0-8-6-16-6-24 0z"
        opacity="0.5"
      />
      <circle cx="200" cy="12" r="4" />
      <path
        fill="currentColor"
        d="M185 12l15-6 15 6-15 6zm30 0l15-6 15 6-15 6z"
        opacity="0.35"
      />
    </svg>
  );
}

export function EpicCorner({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={`h-10 w-10 text-epic-gold/40 sm:h-14 sm:w-14 ${className}`} aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        d="M4 44V4h40M4 4c12 8 20 16 24 28M4 4c8 12 12 24 16 40"
      />
    </svg>
  );
}

export function EpicQuillMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={`h-12 w-12 text-epic-gold/30 sm:h-16 sm:w-16 ${className}`} aria-hidden>
      <path
        fill="currentColor"
        d="M32 4c-2 12-8 22-16 28 4-2 10-4 16-4-6 8-10 18-12 28 2-10 6-20 12-28-6 0-12 2-16 4 8-6 14-16 16-28z"
        opacity="0.6"
      />
    </svg>
  );
}
