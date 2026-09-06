import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import {
  SEARCH_MIN_QUERY_LENGTH,
  SEARCH_QUERY_PARAM,
  SEARCH_UNAVAILABLE_MESSAGE,
} from "@/lib/constants";
import { withTracking } from "@/lib/media/tracking";
import type { SearchResponse } from "@/lib/search/response";
import { searchMedia } from "@/lib/tmdb/queries";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return new NextResponse(null, { status: 401 });
  }

  const raw = request.nextUrl.searchParams.get(SEARCH_QUERY_PARAM) ?? "";
  const query = raw.trim();

  if (query.length < SEARCH_MIN_QUERY_LENGTH) {
    return NextResponse.json<SearchResponse>(
      { items: [] },
      { headers: NO_STORE },
    );
  }

  try {
    const page = await searchMedia(query);
    const items = await withTracking(page.items);

    return NextResponse.json<SearchResponse>({ items }, { headers: NO_STORE });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: SEARCH_UNAVAILABLE_MESSAGE },
      { status: 503, headers: NO_STORE },
    );
  }
}
