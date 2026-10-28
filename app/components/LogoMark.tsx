/** The YC monogram in the current ink colour (lime on dark, olive on light). Set the height via className. */
export default function LogoMark({ className = "", label }: { className?: string; label?: string }) {
  return (
    <span
      className={`logo-mark ${className}`}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    />
  );
}
