import { redirect } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { TopBar } from "@/components/layout/top-bar";
import { HoverLayer } from "@/components/media/hover-layer";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  if (!user) redirect("/signin");

  return (
    <>
      <TopBar user={user} />
      {children}
      <Footer />
      <HoverLayer />
    </>
  );
}
