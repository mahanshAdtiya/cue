import Image from "next/image";
import type { CSSProperties } from "react";

import { TITLE_BACKDROP_SIZES } from "@/lib/constants";

type TitleBackdropProps = {
  src: string | null;
  hue: number;
};

export function TitleBackdrop({ src, hue }: TitleBackdropProps) {
  return (
    <span
      aria-hidden
      style={{ "--h": hue } as CSSProperties}
      className="animate-fade pointer-events-none absolute inset-x-0 top-0 z-0 block h-[min(72vh,720px)] overflow-hidden"
    >
      <span className="title-art absolute inset-0 block bg-[linear-gradient(150deg,hsl(var(--h)_30%_24%),hsl(var(--h)_16%_11%)_55%,hsl(220_18%_12%))] opacity-55">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            unoptimized
            priority
            sizes={TITLE_BACKDROP_SIZES}
            className="object-cover object-[50%_22%]"
          />
        ) : null}
      </span>
      <span className="title-scrim absolute inset-0 block" />
    </span>
  );
}
