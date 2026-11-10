export type MarqueeItem = { id?: number; name: string; logo?: string | null };

type MarqueeProps = {
  items: MarqueeItem[];
  reverse?: boolean;
  /** "logo" renders white-tinted logos when available; "outline" renders names as outlined text. */
  variant?: "logo" | "outline";
  /** Editorial italic serif phrases instead of the condensed display face. */
  serif?: boolean;
  className?: string;
  videoCounts?: Map<number, number>;
  videoLabel?: string;
  onOpen?: (item: MarqueeItem) => void;
  onPeek?: (item: MarqueeItem | null, element?: HTMLElement) => void;
  paused?: boolean;
};

/** Infinite CSS marquee. Duplicated track, paused on hover, static under reduced motion. */
export default function Marquee({ items, reverse = false, variant = "logo", serif = false, className = "", videoCounts, videoLabel, onOpen, onPeek, paused = false }: MarqueeProps) {
  // Few items would leave visible gaps in the loop, so repeat them to fill the track.
  const repeats = items.length >= 6 ? 1 : Math.ceil(6 / Math.max(items.length, 1));
  const filled = Array.from({ length: repeats }, () => items).flat();

  const track = (hidden: boolean) => (
    <ul
      className={`marquee-track ${reverse ? "marquee-reverse" : ""}`}
      aria-hidden={hidden || undefined}
      style={paused ? { animationPlayState: "paused" } : undefined}
    >
      {filled.map((item, i) => {
        const count = item.id == null ? 0 : videoCounts?.get(item.id) ?? 0;
        const face = variant === "logo" && item.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.logo}
              alt={hidden ? "" : item.name}
              loading="lazy"
              className="h-8 md:h-14 w-auto max-w-[180px] md:max-w-[300px] object-contain opacity-80 hover:opacity-100 transition-opacity logo-silhouette"
            />
          ) : (
            <span className={serif ? "font-serif text-4xl italic md:text-7xl" : "font-display text-4xl md:text-7xl tracking-wide"}>{item.name}</span>
          );
        return <li key={`${item.name}-${i}`} className="flex items-center gap-8 md:gap-16 shrink-0">
          {count > 0 && onOpen ? <button type="button" tabIndex={hidden || i >= items.length ? -1 : undefined} aria-label={`${item.name}: ${count} ${videoLabel}`} className="relative min-h-11 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-lime" onClick={() => onOpen(item)} onPointerEnter={(e) => e.pointerType === "mouse" && onPeek?.(item, e.currentTarget)} onPointerLeave={() => onPeek?.(null)} onFocus={(e) => onPeek?.(item, e.currentTarget)} onBlur={() => onPeek?.(null)}>{face}<span aria-hidden className="ml-2 align-top text-xs text-accent-ink">▶ {count}</span></button> : face}
          <span aria-hidden className="h-6 w-px bg-line/20 md:h-12" />
        </li>;
      })}
    </ul>
  );

  return (
    <div className={`marquee ${className}`}>
      {track(false)}
      {track(true)}
    </div>
  );
}
