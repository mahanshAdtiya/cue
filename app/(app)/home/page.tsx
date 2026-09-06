import { redirect } from "next/navigation";

import { EmptyHome } from "@/components/home/empty-home";
import { HomeFeed } from "@/components/home/home-feed";
import { HOME_RAIL_SIZE, HOME_RECENT_SIZE, SIGN_IN_PATH } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth/session";
import {
  countUserMediaByStatus,
  listRecentlyWatched,
  listUserMediaByStatus,
} from "@/lib/db/user-media";
import { toLibraryMedia } from "@/lib/media/library";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) redirect(SIGN_IN_PATH);

  const [counts, watching, want, recent] = await Promise.all([
    countUserMediaByStatus(user.id),
    listUserMediaByStatus(user.id, "CURRENTLY_WATCHING", HOME_RAIL_SIZE),
    listUserMediaByStatus(user.id, "WANT_TO_WATCH", HOME_RAIL_SIZE),
    listRecentlyWatched(user.id, HOME_RECENT_SIZE),
  ]);

  const tracked =
    counts.CURRENTLY_WATCHING + counts.WANT_TO_WATCH + counts.WATCHED;

  if (tracked === 0) return <EmptyHome />;

  return (
    <HomeFeed
      counts={counts}
      watching={watching.map(toLibraryMedia)}
      want={want.map(toLibraryMedia)}
      recent={recent.map(toLibraryMedia)}
    />
  );
}
