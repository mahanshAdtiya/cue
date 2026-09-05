/* The bordered "01 / Find it / body" tile. The only step tile in the app —
   used by the landing page and the empty home state. Mirrors .step in the
   prototype. */
type StepCardProps = {
  num: string;
  title: string;
  body: string;
};

export function StepCard({ num, title, body }: StepCardProps) {
  return (
    <div className="border-line bg-bg-2 flex flex-col gap-[9px] rounded-xl border p-5">
      <span className="mono text-gold">{num}</span>
      <b className="font-serif text-[22px] font-normal">{title}</b>
      <p className="text-mut text-[13px] leading-[1.6]">{body}</p>
    </div>
  );
}
