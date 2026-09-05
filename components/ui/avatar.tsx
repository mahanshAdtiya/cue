type AvatarProps = { name: string };

export function Avatar({ name }: AvatarProps) {
  return (
    <span className="bg-gold text-gold-ink grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-semibold transition duration-[var(--dur)] ease-cue hover:brightness-110">
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
