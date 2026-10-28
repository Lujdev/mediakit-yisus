export type MarqueeItem = { name: string; logo?: string | null };

type MarqueeProps = {
  items: MarqueeItem[];
  reverse?: boolean;
  /** "logo" renders white-tinted logos when available; "outline" renders names as outlined text. */
  variant?: "logo" | "outline";
  className?: string;
};

/** Infinite CSS marquee. Duplicated track, paused on hover, static under reduced motion. */
export default function Marquee({ items, reverse = false, variant = "logo", className = "" }: MarqueeProps) {
  // Few items would leave visible gaps in the loop, so repeat them to fill the track.
  const repeats = items.length >= 6 ? 1 : Math.ceil(6 / Math.max(items.length, 1));
  const filled = Array.from({ length: repeats }, () => items).flat();

  const track = (hidden: boolean) => (
    <ul
      className={`marquee-track ${reverse ? "marquee-reverse" : ""}`}
      aria-hidden={hidden || undefined}
    >
      {filled.map((item, i) => (
        <li key={`${item.name}-${i}`} className="flex items-center gap-10 md:gap-16 shrink-0">
          {variant === "logo" && item.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.logo}
              alt={hidden ? "" : item.name}
              loading="lazy"
              className="h-10 md:h-14 w-auto max-w-[220px] md:max-w-[300px] object-contain opacity-80 hover:opacity-100 transition-opacity [filter:brightness(0)_invert(1)]"
            />
          ) : (
            <span className="font-display text-5xl md:text-7xl tracking-wide">{item.name}</span>
          )}
          <span className="text-accent-lime text-2xl md:text-4xl" aria-hidden>
            ✦
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`marquee ${className}`}>
      {track(false)}
      {track(true)}
    </div>
  );
}
