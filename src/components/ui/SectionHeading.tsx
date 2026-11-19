import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  index?: string;
  title: ReactNode;
  description?: ReactNode;
  tone?: "dark" | "light";
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  index,
  title,
  description,
  tone = "dark",
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const light = tone === "light";

  return (
    <div
      className={`${align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} ${className}`}
    >
      <p
        className={`eyebrow ${light ? "text-cream/55" : "text-ink-500"} ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        {index && <span className={light ? "text-brass-300" : "text-brass-600"}>{index}</span>}
        <span className={`h-px w-8 ${light ? "bg-cream/25" : "bg-ink-900/20"}`} aria-hidden="true" />
        {eyebrow}
      </p>
      <h2
        className={`mt-5 text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.03] ${
          light ? "text-cream" : "text-ink-950"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-6 max-w-xl text-[0.9375rem] leading-relaxed ${
            align === "center" ? "mx-auto" : ""
          } ${light ? "text-cream/65" : "text-ink-700/80"}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
