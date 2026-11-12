interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  headingId: string;
  align?: "left" | "center";
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  headingId,
  align = "left",
}: SectionHeaderProps) {
  const alignmentClasses =
    align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl";

  return (
    <div className={alignmentClasses}>
      <p className="font-mono text-xs font-medium uppercase tracking-wider text-slate-500">
        {eyebrow}
      </p>
      <h2
        id={headingId}
        className="mt-2 font-serif text-3xl font-normal tracking-tight text-balance text-[#14181f] sm:text-4xl"
      >
        {title}
      </h2>
      <p className="mt-3 text-base leading-7 text-pretty text-slate-600">
        {description}
      </p>
    </div>
  );
}
