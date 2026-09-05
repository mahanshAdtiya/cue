export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 items-start justify-center px-pad py-[clamp(12px,5vh,56px)]">
      <div className="border-line bg-bg-2 my-auto flex w-[min(420px,100%)] flex-col gap-3.5 rounded-xl border p-[clamp(24px,4vw,34px)]">
        {children}
      </div>
    </main>
  );
}
