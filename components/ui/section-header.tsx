import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  as?: "h1" | "h2" | "h3";
  note?: string;
  action?: ReactNode;
};

export function SectionHeader({
  title,
  as: Heading = "h2",
  note,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-baseline gap-3">
      <Heading>{title}</Heading>
      {note ? <span className="text-mut-2 text-[13px]">{note}</span> : null}
      {action ? <span className="ml-auto shrink-0">{action}</span> : null}
    </div>
  );
}
