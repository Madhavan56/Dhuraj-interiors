type LogoProps = {
  tone?: "light" | "dark";
  compact?: boolean;
};

export function Logo({ tone = "dark", compact = false }: LogoProps) {
  const light = tone === "light";

  return (
    <span className="flex items-center gap-3">
      <span
        className={`grid size-10 shrink-0 place-items-center overflow-hidden rounded-[0.7rem] shadow-sm ring-1 sm:size-11 ${
          light ? "ring-white/20" : "ring-plum-900/10"
        }`}
      >
        <img
          src="/logo-mark.svg"
          alt=""
          width={44}
          height={44}
          className="size-full object-cover"
          aria-hidden="true"
        />
      </span>
      {!compact && (
        <span className="leading-none">
          <span
            className={`block font-display text-[1.3rem] leading-none tracking-[-0.02em] sm:text-[1.45rem] ${
              light ? "text-cream" : "text-ink-950"
            }`}
          >
            Dhuraj
          </span>
          <span
            className={`mt-1 block text-[0.58rem] font-medium uppercase tracking-[0.3em] ${
              light ? "text-cream/60" : "text-ink-500"
            }`}
          >
            Interiors
          </span>
        </span>
      )}
    </span>
  );
}
