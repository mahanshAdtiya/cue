import { EmptyHome } from "@/components/home/empty-home";
import { HomeFeed } from "@/components/home/home-feed";
import { getCurrentUser } from "@/lib/auth/session";
import { getHomeItems } from "@/lib/db/entries";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) return null;

  const items = await getHomeItems(user.id);

  return items.length === 0 ? (
    <EmptyHome />
  ) : (
    <HomeFeed />
  );
}
