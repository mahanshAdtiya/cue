import type { ReactNode } from "react";

export function MediaRail({ children }: { children: ReactNode }) {
  return (
    <div className="rail-fade no-scrollbar flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-1 [&>*]:w-[clamp(112px,15vw,150px)] [&>*]:shrink-0 [&>*]:snap-start">
      {children}
    </div>
  );
}
