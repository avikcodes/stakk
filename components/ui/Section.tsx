import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

interface SectionProps {
  id?: string;
  labelledBy?: string;
  muted?: boolean;
  bordered?: boolean;
  className?: string;
  children: ReactNode;
}

export function Section({
  id,
  labelledBy,
  muted = false,
  bordered = true,
  className = "",
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`py-20 sm:py-28 ${
        muted ? "bg-[#f4f4f1]/70" : "bg-transparent"
      } ${bordered ? "border-t border-stone-200/80" : ""} ${className}`}
    >
      <Container>{children}</Container>
    </section>
  );
}
