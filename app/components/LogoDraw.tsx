import { YC_CONTOURS, YC_HEIGHT, YC_WIDTH } from "./logo-paths";

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * The YC monogram "drawn like a pattern": a chalk outline traces each letter (0 to ~60%),
 * then the fill comes in (50% to 100%). Driven entirely by `progress` (0 to 1).
 */
export default function LogoDraw({ progress, className = "" }: { progress: number; className?: string }) {
  const draw = clamp(progress / 0.62);
  const fill = clamp((progress - 0.5) / 0.5);
  return (
    <svg viewBox={`0 0 ${YC_WIDTH} ${YC_HEIGHT}`} className={className} fill="none" aria-hidden>
      <g stroke="rgb(var(--logo))" strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round">
        {YC_CONTOURS.map((d, i) => (
          <path key={i} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        ))}
      </g>
      <path d={YC_CONTOURS.join(" ")} fill="rgb(var(--logo))" fillRule="evenodd" opacity={fill} />
    </svg>
  );
}
