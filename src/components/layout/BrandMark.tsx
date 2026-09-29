/** Grafismo da marca: os "leques" e círculos da logo do Itanhaém Prev, para uso decorativo */
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 240" className={className} aria-hidden focusable="false">
      <circle cx="30" cy="62" r="11" fill="#29b6f6" />
      <circle cx="72" cy="40" r="14" fill="#0b8fd9" />
      <circle cx="136" cy="14" r="14" fill="#1565c0" />
      <circle cx="176" cy="30" r="11" fill="#81d4fa" />
      <polygon points="8,108 60,86 112,232" fill="#4fc3f7" />
      <polygon points="42,110 104,68 112,232" fill="#039be5" />
      <polygon points="96,56 150,86 112,232" fill="#1976d2" />
      <polygon points="148,80 212,84 112,232" fill="#81d4fa" />
    </svg>
  );
}
