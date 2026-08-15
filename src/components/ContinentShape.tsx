import type { ContinentId } from "@/lib/continents";

// Silhuetas simplificadas (viewBox 0 0 100 100) — traço estilizado de cartografia.
const PATHS: Record<ContinentId, string[]> = {
  americas: [
    // América do Norte
    "M20 12 L38 8 L54 12 L66 10 L72 18 L64 24 L58 34 L52 38 L46 34 L40 40 L34 34 L26 30 L18 22 Z",
    // América Central + Sul
    "M46 44 L54 42 L58 48 L62 58 L60 70 L54 82 L48 94 L44 84 L42 70 L38 58 L40 48 Z",
  ],
  europe: [
    "M14 68 L20 52 L16 40 L26 34 L34 40 L44 32 L56 30 L66 22 L78 24 L86 32 L80 42 L86 52 L74 56 L66 66 L54 62 L46 70 L36 66 L28 74 L20 78 Z",
  ],
  asia: [
    "M8 40 L20 26 L36 20 L52 14 L70 16 L86 24 L92 38 L84 48 L88 60 L76 66 L66 62 L58 72 L48 66 L40 76 L30 70 L22 58 L12 52 Z",
    "M74 78 L84 74 L88 82 L80 88 Z",
  ],
  "middle-east": [
    "M22 24 L40 18 L58 22 L74 20 L86 30 L80 44 L70 52 L64 66 L54 78 L44 70 L38 56 L28 48 L20 38 Z",
  ],
  africa: [
    "M30 14 L52 10 L70 16 L74 30 L68 44 L62 56 L58 70 L50 86 L42 74 L38 60 L30 48 L24 34 L26 22 Z",
  ],
  oceania: [
    "M24 42 L44 34 L62 36 L76 44 L78 58 L66 70 L48 74 L32 68 L22 56 Z",
    "M82 70 L90 66 L92 76 L84 82 Z",
  ],
};

export function ContinentShape({
  continent,
  className,
}: {
  continent: ContinentId;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {PATHS[continent].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
