import type { ComponentProps } from "react";

type FieldProps = { label: string } & ComponentProps<"input">;

export function Field({ label, className, ...props }: FieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="mono">{label}</span>
      <input
        className={`min-h-12 rounded-md border border-line p-3.5 font-sans text-[15px] focus:border-gold-55 ${className ?? ""}`}
        {...props}
      />
    </label>
  );
}
