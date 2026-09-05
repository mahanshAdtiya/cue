import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

type PosterProps = {
  src: string | null;
  title: string;
  hue: number;
  sizes: string;
  priority?: boolean;
  children?: ReactNode;
  className?: string;
};

export function Poster({
  src,
  title,
  hue,
  sizes,
  priority,
  children,
  className,
}: PosterProps) {
  return (
    <span
      style={{ "--h": hue } as CSSProperties}
      className={`border-line relative block aspect-[2/3] overflow-hidden rounded-md border bg-[repeating-linear-gradient(115deg,hsl(var(--h)_20%_16%)_0_9px,hsl(var(--h)_20%_21%)_9px_18px)] ${className ?? ""}`}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          unoptimized
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 ease-cue"
        />
      ) : (
        <span className="text-w-34 text-micro absolute inset-x-2 bottom-2 font-mono leading-[1.35] tracking-[.08em] uppercase">
          {title}
        </span>
      )}
      {children}
    </span>
  );
}
