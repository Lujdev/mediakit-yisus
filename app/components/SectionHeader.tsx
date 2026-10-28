import Reveal from "./Reveal";
import SplitHeading from "./SplitHeading";

type SectionHeaderProps = {
  index: string;
  eyebrow: string;
  title: string[];
  accentLine?: number;
  description?: string;
  align?: "left" | "center";
};

export default function SectionHeader({
  index,
  eyebrow,
  title,
  accentLine,
  description,
  align = "left",
}: SectionHeaderProps) {
  const center = align === "center";
  return (
    <header className={`mb-14 md:mb-20 ${center ? "text-center" : ""}`}>
      <Reveal>
        <p
          className={`flex items-center gap-3 text-accent-lime text-xs md:text-sm tracking-[0.3em] uppercase mb-5 ${
            center ? "justify-center" : ""
          }`}
        >
          <span className="font-mono text-text-secondary">{index}</span>
          <span className="h-px w-10 bg-accent-lime/60" />
          {eyebrow}
        </p>
      </Reveal>
      <h2 className="font-display text-6xl md:text-8xl lg:text-9xl leading-[0.9] text-text-primary">
        <SplitHeading lines={title} accentLine={accentLine} />
      </h2>
      {description && (
        <Reveal delay={0.2}>
          <p className={`mt-6 text-text-secondary max-w-xl text-base md:text-lg ${center ? "mx-auto" : ""}`}>
            {description}
          </p>
        </Reveal>
      )}
    </header>
  );
}
