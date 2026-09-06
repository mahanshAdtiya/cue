import { redirect } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { TopBar } from "@/components/layout/top-bar";
import { HoverLayer } from "@/components/media/hover-layer";
import { getCurrentUser } from "@/lib/auth/session";
import { SIGN_OUT_PATH } from "@/lib/constants";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  if (!user) redirect(SIGN_OUT_PATH);

  return (
    <>
      <TopBar user={user} />
      {children}
      <Footer />
      <HoverLayer />
    </>
  );
}
