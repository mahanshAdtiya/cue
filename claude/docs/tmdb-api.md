# TMDB API — reference for Cue

Everything an agent needs before touching `lib/tmdb/`. Read this first.

**Provenance.** Rows marked **[live]** were verified against the real API during
this session (2026-09-06) with our own read token. Rows marked **[docs]** come
from developer.themoviedb.org. Where the two disagree, **[live]** wins — the
published docs are thin and in places out of date. Re-verify **[live]** claims
before relying on them a year from now.

Every documentation page is available as clean markdown by appending `.md` to
its URL, and the full index is at `https://developer.themoviedb.org/llms.txt`.

---

## 0. The five things that actually bite

1. **`media_type` is missing from most list endpoints.** Only `/trending/*` and
   `/search/multi` include it. `/movie/top_rated`, `/tv/top_rated`,
   `/movie/now_playing` etc. do not — a mapper that reads `media_type` returns an
   **empty array** for them, silently. See §7.
2. **`release_date` / `first_air_date` come back as `""`, not `null`.** Straight
   into a Postgres `date` column that is an error. Coerce empty to null.
3. **`/search/multi` returns people.** Person results have `name` but no `title`
   and no `release_date`; a `title ? movie : tv` guess mislabels them as TV.
   Filter on `media_type` and drop anything that is not `movie` or `tv`.
4. **Pages cap at 500.** Page 501 is a 422, not an empty list. See §6.
5. **TMDB sends no rate-limit headers**, so you cannot throttle pre-emptively.
   You learn you are over the limit only from a 429. See §4.

---

## 1. Authentication

| | v3 API key | v4 Read Access Token |
|---|---|---|
| Sent as | `?api_key=<key>` query param | `Authorization: Bearer <token>` header |
| Works on | v3 | v3 **and** v4 |
| Access level | identical | identical |

**[docs]** "Both authentication methods provide the same level of access, and
which one you choose is completely up to you."

**Cue uses the Bearer token, always.** A key in the query string is a key in
every access log, every error message, and every HTTP cache key. Also send
`accept: application/json`. Both live in `lib/tmdb/client.ts`; nothing else in
the codebase should read `TMDB_READ_TOKEN`.

Env vars (see `.env.example`): `TMDB_READ_TOKEN`, `TMDB_API_BASE`,
`TMDB_IMAGE_BASE`, `TMDB_TIMEOUT_MS`.

---

## 2. Hosts

| Purpose | Host |
|---|---|
| API | `https://api.themoviedb.org/3` |
| Images | `https://image.tmdb.org/t/p` **[live]** |
| Daily ID exports | `https://files.tmdb.org/p/exports/` **[docs]** |

**[live]** `/configuration` reports `secure_base_url: https://image.tmdb.org/t/p/`
— note the trailing slash, which is why `lib/tmdb/media.ts` strips one before
joining.

---

## 3. Errors

Every failure returns JSON shaped like this, with an HTTP status **and** a TMDB
`status_code` that is more specific:

```json
{ "success": false, "status_code": 22, "status_message": "Invalid page: ..." }
```

**[live]** confirmed shape. Always read `status_message` for the human reason;
fall back to `statusText` because gateway errors return HTML, not JSON.

### Full status code table **[docs]**

| Code | HTTP | Message |
|---|---|---|
| 1 | 200 | Success |
| 2 | 501 | Invalid service: this service does not exist |
| 3 | 401 | Authentication failed: no permissions to access |
| 4 | 405 | Invalid format: service doesn't exist in that format |
| 5 | 422 | Invalid parameters: request parameters incorrect |
| 6 | 404 | Invalid id: pre-requisite id invalid or not found |
| 7 | 401 | Invalid API key: must be granted a valid key |
| 8 | 403 | Duplicate entry: submitted data already exists |
| 9 | 503 | Service offline: temporarily offline |
| 10 | 401 | Suspended API key: account access suspended |
| 11 | 500 | Internal error: contact TMDB |
| 12 | 201 | Item/record updated successfully |
| 13 | 200 | Item/record deleted successfully |
| 14 | 401 | Authentication failed. |
| 15 | 500 | Failed. |
| 16 | 401 | Device denied. |
| 17 | 401 | Session denied. |
| 18 | 400 | Validation failed. |
| 19 | 406 | Invalid accept header. |
| 20 | 422 | Invalid date range: Should be a range no longer than 14 days. |
| 21 | 200 | Entry not found: The item you are trying to edit cannot be found. |
| 22 | 400 | Invalid page: Pages start at 1 and max at 500. They are expected to be an integer. |
| 23 | 400 | Invalid date: Format needs to be YYYY-MM-DD. |
| 24 | 504 | Your request to the backend server timed out. Try again. |
| 25 | 429 | Your request count (#) is over the allowed limit of (40). |
| 26 | 400 | You must provide a username and password. |
| 27 | 400 | Too many append to response objects: The maximum number of remote calls is 20. |
| 28 | 400 | Invalid timezone: Please consult the documentation for a valid timezone. |
| 29 | 400 | You must confirm this action: Please provide a confirm=true parameter. |
| 30 | 401 | Invalid username and/or password: You did not provide a valid login. |
| 31 | 401 | Account disabled: Your account is no longer active. Contact TMDB if this is an error. |
| 32 | 401 | Email not verified: Your email address has not been verified. |
| 33 | 401 | Invalid request token: The request token is either expired or invalid. |
| 34 | 404 | The resource you requested could not be found. |
| 35 | 401 | Invalid token. |
| 36 | 401 | This token hasn't been granted write permission by the user. |
| 37 | 404 | The requested session could not be found. |
| 38 | 401 | You don't have permission to edit this resource. |
| 39 | 401 | This resource is private. |
| 40 | 200 | Nothing to update. |
| 41 | 422 | This request token hasn't been approved by the user. |
| 42 | 405 | This request method is not supported for this resource. |
| 43 | 502 | Couldn't connect to the backend server. |
| 44 | 500 | The ID is invalid. |
| 45 | 403 | This user has been suspended. |
| 46 | 503 | The API is undergoing maintenance. Try again later. |
| 47 | 400 | The input is not valid. |

### Which of these are worth retrying

Retry: `408, 425, 429, 500, 502, 503, 504` plus any transport failure (timeout,
DNS, socket reset). This covers codes 9, 11, 24, 25, 43 and 46.

Never retry: 401 (7, 10 — bad or suspended token), 404 (6, 34 — no such title),
422 (5 — bad params). These fail identically forever; retrying only adds
latency to a guaranteed failure. Implemented in `RETRYABLE_STATUSES`.

---

## 4. Rate limiting

**[docs]** The old published limit of 40 requests / 10 seconds was **disabled on
16 December 2019**. The current ceiling is roughly **40 requests per second**,
explicitly "not rigidly defined" and it "could change at any time".

**[live]** TMDB returns **no `x-ratelimit-*` or `ratelimit-*` headers at all** —
checked on `/movie/{id}`. So there is no way to see how much budget is left; you
discover the limit only by receiving a 429 (status code 25).

Consequences for Cue:
- Honour `Retry-After` on a 429 in preference to our own backoff.
- Back off with **jitter**, never a fixed delay — server-rendered pages that
  failed together would otherwise retry together and rebuild the spike.
- Cache aggressively (§5). The cheapest way to stay under a rate limit is to not
  make the request.

---

## 5. Caching

**[live]** TMDB sits behind CloudFront (`x-cache: Hit from cloudfront`) and sends
a per-response `cache-control: public, max-age=N` plus a weak `ETag`. Observed
values, which vary per response because they count down to the next
invalidation:

| Endpoint | observed `max-age` |
|---|---|
| `/trending/all/week` | ~581 s (≈10 min) |
| `/movie/top_rated` | ~947 s (≈16 min) |
| `/movie/{id}` | ~7908 s (≈2.2 h) |
| `/search/multi` | ~15268 s (≈4.2 h) |
| `/configuration` | ~21234 s (≈5.9 h) |

Useful as calibration for our own `next.revalidate` windows: TMDB itself treats
trending as ~10-minute data and title details as multi-hour data. Our
`TMDB_REVALIDATE_SHORT_S` (6 h) is deliberately longer than TMDB's own hint —
fine for a personal tracker, but that is the knob to turn if Explore feels stale.

Caching in Cue is **opt-in**: Next 16 does not cache `fetch` unless
`next.revalidate` is set. Tag every call so `revalidateTag` can purge it later.

---

## 6. Pagination

- Default page size is **20** results **[docs]**.
- `page` starts at 1 and **maxes at 500** — **[live]** verified: page 501 returns
  HTTP 422 with status code 22, not an empty result set.
- Paged responses carry `page`, `results`, `total_pages`, `total_results`.
- The `/changes` endpoints are the exception at **100 per page** **[docs]**.

So the deepest any list can be walked is 500 × 20 = 10,000 records, regardless
of what `total_results` claims.

---

## 7. `media_type` — which endpoints include it

**[live]** verified per endpoint. This is the single most important table here.

| Endpoint | `media_type` present? |
|---|---|
| `/search/multi` | **yes** — `movie`, `tv`, or `person` |
| `/trending/all/{window}` | **yes** |
| `/movie/top_rated` | **no** |
| `/tv/top_rated` | **no** |
| `/movie/now_playing`, `/movie/popular`, `/movie/upcoming` | **no** |
| `/movie/{id}`, `/tv/{id}` (details) | **no** |

The rule: an endpoint tells you `media_type` only when the result set is
genuinely mixed. When you called a single-type endpoint, **you** already know the
type — pass it to the mapper rather than trying to read it off the payload.

This is why `lib/tmdb/media.ts` exposes both `toMediaSummary` (reads
`media_type`, drops people) and a typed variant (takes the type as an argument),
and why details have `toMovieDetails` / `toTvDetails` rather than one function.

---

## 8. Search, and the search → details workflow

**[docs]** The intended pattern is two-step: search to get an `id`, then call the
details endpoint for the full record. Search results are deliberately thin —
they carry `genre_ids`, not `genres`; no runtime, no season or episode counts.

`/search/multi` parameters **[docs]**:

| Param | Type | Default |
|---|---|---|
| `query` | string | required |
| `include_adult` | boolean | `false` |
| `language` | string | `en-US` |
| `page` | integer | `1` |

The typed search endpoints (`/search/movie`, `/search/tv`) additionally accept
`year`, `primary_release_year` / `first_air_date_year`, and `region`.

Notes for Cue:
- Always pass `include_adult: false` explicitly rather than relying on the
  default.
- Short-circuit an empty or whitespace-only query in our code — do not send it.
  A blank `query` is a 422, and it wastes a request on every cleared search box.
- Search is user-facing and interactive, so it should use fewer retry attempts
  than a background rail. Nobody waits out three timeouts for a typeahead.

### Shape differences between search and details

| | search result | details response |
|---|---|---|
| Genres | `genre_ids: number[]` | `genres: {id, name}[]` |
| Movie title | `title` | `title` |
| TV title | `name` | `name` |
| Movie date | `release_date` | `release_date` |
| TV date | `first_air_date` | `first_air_date` |
| Counts | absent | `runtime` / `number_of_seasons`, `number_of_episodes` |

Anything deriving from genres (our anime heuristic) has to handle both shapes.

---

## 9. `append_to_response`

**[docs]** Combines sub-requests into one HTTP call. Supported on the top-level
detail methods for movies, TV shows, TV seasons, TV episodes and people.

```
/movie/157336?append_to_response=videos,images,credits
```

**[live]** verified: that exact call returns `videos`, `images` and `credits` as
extra top-level keys on the single response.

- **Maximum 20 appended objects** — exceeding it is status code 27.
- Appended sub-requests still honour their own query params, which is why
  `include_image_language` matters when appending `images` (§10).

This is the main lever for keeping Cue under the rate limit: the media page
needs details plus videos plus credits, and that is one request, not three.

---

## 10. Images

Images are **not** returned as URLs. TMDB gives you a `file_path` like
`/vUHlpA5c1NXkds59reY3HMb4Abs.jpg`, and you build:

```
{secure_base_url}{size}{file_path}
→ https://image.tmdb.org/t/p/w342/vUHlpA5c1NXkds59reY3HMb4Abs.jpg
```

### Available sizes **[live]**, from `/configuration`

| Kind | Sizes |
|---|---|
| `poster_sizes` | w92, w154, w185, w342, w500, w780, original |
| `backdrop_sizes` | w300, w780, w1280, original |
| `logo_sizes` | w45, w92, w154, w185, w300, w500, original |
| `profile_sizes` | w45, w185, h632, original |
| `still_sizes` | w92, w185, w300, original |

**[docs]** TMDB recommends reading these from `/configuration` rather than
hardcoding, since the list can change. Cue hardcodes `TMDB_POSTER_SIZE` and
`TMDB_BACKDROP_SIZE` in `lib/constants.ts` — a deliberate trade (one fewer
request, one fewer failure mode) that must be revisited if a size disappears.

**[docs]** `logo_path` returns PNG by default; use size `original` to get SVG.

### `include_image_language`

**[docs]** The `language` param *filters* images, which usually over-filters.
`include_image_language` is the fallback list, and accepts the literal `null`
for untagged images:

```
?include_image_language=en,null
```

### Storage rule for Cue

Store the raw `file_path` in Postgres (`media.poster_path`), never a full URL.
Size and host are presentation concerns; baking them into rows makes a size
change a migration, and `TMDB_IMAGE_BASE` is env-derived so it must not be
frozen into data.

---

## 11. Languages

**[docs]** Format is ISO 639-1, optionally with an ISO 3166-1 country:
`en-US`, `pt-BR`. Default is `en-US`.

- Some languages have no ISO 639-1 representation; TMDB has no plan to move to
  ISO 639-3.
- **Person names and characters are never translated**, regardless of `language`.
- `language` filters images as well as text — see `include_image_language`.

Cue is English-only for V1 and relies on the default, so we do not send
`language`. If that changes, it belongs in `lib/tmdb/client.ts` as a default
param on every request, not sprinkled through call sites.

---

## 12. Regions

**[docs]** `region` is an ISO 3166-1 code (`US`, `DE`). It filters *release date*
information, and pairs with `language` — `language=de-DE&region=DE` gives German
text with German release dates. It also combines with `with_release_type` on
discover endpoints, and with `release_date.gte` / `release_date.lte`.

Affects search, discover, and the date-sensitive movie lists (`now_playing`,
`upcoming`). Where region-specific data is missing, TMDB falls back to the
primary release date.

Not used by Cue today. Relevant the moment "in theatres near you" appears.

---

## 13. Popularity and trending

**[docs]** Two different scores, often confused:

- **Popularity** is a *lifetime* score. For movies it blends daily votes, views,
  favourites, watchlist adds, release date, total votes and the previous day's
  score. For TV it also weighs next/last episode air dates. There is no API to
  inspect the breakdown; daily exports carry the values back to 28 April 2017.
- **Trending** uses much shorter windows — `day` and `week` — and is meant to
  surface "the new stuff" rather than sustained interest.

For an Explore rail, trending is almost always the one you want. `popularity`
sorts a catalogue; trending answers "what is happening now".

---

## 14. Finding by external ID

**[docs]** `/find/{external_id}?external_source={source}` maps an ID from
elsewhere onto TMDB.

Allowed `external_source` values: `imdb_id`, `tvdb_id`, `wikidata_id`,
`facebook_id`, `instagram_id`, `tiktok_id`, `twitter_id`, `youtube_id`.

Response contains five arrays: `movie_results`, `person_results`, `tv_results`,
`tv_episode_results`, `tv_season_results`.

Relevant to Cue only for an import feature (bring your list over from IMDb).

---

## 15. Tracking changes

**[docs]** `/movie/changes`, `/tv/changes`, `/person/changes` list IDs modified
in the last 24 hours.

- `start_date` / `end_date`, `YYYY-MM-DD`, spanning **at most 14 days** (status
  code 20 if exceeded).
- 100 results per page, with the usual `page` / `total_pages` / `total_results`.
- Each result is just `{ id, adult }` — it tells you *what* changed, not what
  changed about it. Re-fetch the record.

This is the mechanism for keeping cached rows in `media` fresh without polling
every title. Not needed while we cache in Next's data cache with a revalidate
window; it becomes relevant once TMDB data is persisted long-term in Postgres.

---

## 16. Daily ID exports

**[docs]** Bulk lists of valid IDs plus a few attributes (adult, video,
popularity) — not full records.

- `https://files.tmdb.org/p/exports/{type}_ids_MM_DD_YYYY.json.gz`
- Job starts ~07:00 UTC, all files ready by 08:00 UTC.
- gzipped, **one JSON object per line** (not a single JSON array) — stream it
  line by line.
- Types: movies, TV series, people, collections, TV networks, keywords,
  production companies, plus separate adult exports since 5 July 2023.
- Files are deleted after 3 months.

---

## 17. Response format

**[docs]** JSON only. A `callback` query param wraps responses as JSONP — Cue has
no use for it, since we never call TMDB from the browser. Send
`accept: application/json`.

---

## 18. Attribution and licensing — obligations, not suggestions

**[docs]** These apply to Cue as soon as it is public:

- Display the TMDB logo, plus the notice: **"This product uses the TMDB API but
  is not endorsed or certified by TMDB."**
- Attribution belongs in an About or Credits section, and must link to
  `https://www.themoviedb.org`.
- The logo may not be recoloured, re-proportioned, flipped or rotated, and must
  be **less prominent** than Cue's own mark.
- Refer to them only as "TMDB" or "The Movie Database".
- **Non-commercial use only** under the free tier. A project whose "primary
  purpose is to create revenue for the benefit of the owner" needs a paid
  licence via sales@themoviedb.org.

Cue's footer needs the notice and logo before any public deploy.

---

## 19. How this maps onto our code

| Concern | Where it lives |
|---|---|
| Auth, URL building, timeout, retry, errors | `lib/tmdb/client.ts` |
| Payload types and TMDB → domain mapping | `lib/tmdb/media.ts` |
| Endpoint paths and cache windows | `lib/tmdb/queries.ts` |
| Sizes, windows, retry policy, anime heuristic | `lib/constants.ts` |
| Token and hosts | `.env.local` / `.env.example` |

Rules that follow from this document:

1. **The browser never calls TMDB.** The token is server-only, and the data cache
   is shared across users only if the fetch happens on the server.
2. **Nothing outside `lib/tmdb/` sees a raw TMDB field name.** `snake_case` stops
   at the mapper.
3. **Nothing outside `lib/tmdb/queries.ts` knows an endpoint path or a revalidate
   number.**
4. **`lib/tmdb/` is server-only** and the key never reaches the client — this is
   the `AGENTS.md` rule, and `import "server-only"` is what enforces it.
