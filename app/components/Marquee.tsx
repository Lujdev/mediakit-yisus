type MarqueeProps = {
  items: string[];
  reverse?: boolean;
  className?: string;
};

/** Infinite CSS marquee. Duplicated track, paused on hover, static under reduced motion. */
export default function Marquee({ items, reverse = false, className = "" }: MarqueeProps) {
  const track = (hidden: boolean) => (
    <ul
      className={`marquee-track ${reverse ? "marquee-reverse" : ""}`}
      aria-hidden={hidden || undefined}
    >
      {items.map((item) => (
        <li key={item} className="flex items-center gap-10 md:gap-16 shrink-0">
          <span className="font-display text-5xl md:text-7xl tracking-wide">{item}</span>
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
