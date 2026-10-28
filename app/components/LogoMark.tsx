/**
 * The YC monogram in the current logo colour (lime on dark, ink on light). Set the height via className.
 * With `glint`, a quick sheen crosses it every few seconds.
 */
export default function LogoMark({
  className = "",
  label,
  glint = false,
}: {
  className?: string;
  label?: string;
  glint?: boolean;
}) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  if (!glint) return <span className={`logo-mark ${className}`} {...a11y} />;
  return (
    <span className={`relative inline-block ${className}`} {...a11y}>
      <span className="logo-mark block h-full" />
      <span
        aria-hidden
        className="logo-mark glint absolute inset-0 h-full animate-[glint-rare_9s_ease-in-out_2s_infinite]"
        style={{
          backgroundColor: "transparent",
          backgroundImage: "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.9) 50%, transparent 62%)",
          backgroundSize: "260% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "130% 0",
        }}
      />
    </span>
  );
}
