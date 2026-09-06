"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

import { SearchPreview } from "@/components/search/search-preview";
import { SearchRecents } from "@/components/search/search-recents";
import { SearchResults } from "@/components/search/search-results";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import {
  SEARCH_COUNT_LABEL,
  SEARCH_DISMISS_LABEL,
  SEARCH_HINTS,
  SEARCH_LABEL,
  SEARCH_PLACEHOLDER,
  SEARCH_SHORTCUT,
  SEARCH_SHORTCUT_KEY,
} from "@/lib/constants";
import { useDisclosure } from "@/lib/hooks/use-disclosure";
import { counted, mediaHref } from "@/lib/media/display";
import type { TrackedMedia } from "@/lib/media/tracking";
import {
  clearRecents,
  forgetRecent,
  readRecents,
  rememberRecent,
  type RecentSearch,
} from "@/lib/search/recents";
import { useSearch } from "@/lib/search/use-search";

export function SearchPalette() {
  const { open, close, toggle } = useDisclosure({ lockScroll: true });
  const { query, setQuery, term, items, status } = useSearch();
  const [selected, setSelected] = useState(0);
  const [recents, setRecents] = useState<RecentSearch[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const idle = status === "idle";
  const preview = idle ? null : (items[selected] ?? null);

  useEffect(() => {
    const onShortcut = (event: globalThis.KeyboardEvent) => {
      if (!event.metaKey && !event.ctrlKey) return;
      if (event.key.toLowerCase() !== SEARCH_SHORTCUT_KEY) return;

      event.preventDefault();
      toggle();
    };

    document.addEventListener("keydown", onShortcut);

    return () => document.removeEventListener("keydown", onShortcut);
  }, [toggle]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }

    input.current?.focus();
    setRecents(readRecents());
  }, [open, setQuery]);

  useEffect(() => {
    setSelected(0);
  }, [items]);

  useEffect(() => {
    list.current
      ?.querySelector("[data-selected]")
      ?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const remember = useCallback((item: TrackedMedia | RecentSearch) => {
    setRecents(
      rememberRecent({
        externalId: item.externalId,
        type: item.type,
        title: item.title,
      }),
    );
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!items.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelected((index) => Math.min(items.length - 1, index + 1));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelected((index) => Math.max(0, index - 1));
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const item = items[selected];

      if (!item) return;

      remember(item);
      router.push(mediaHref(item));
      close();
    }
  }

  return (
    <>
      <IconButton
        aria-label={SEARCH_LABEL}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
        className="gap-2.5"
      >
        <Icon name="search" />
        <span className="text-mut-2 text-mini tablet:inline hidden font-mono tracking-[.14em]">
          {SEARCH_SHORTCUT}
        </span>
      </IconButton>

      {open &&
        createPortal(
          <div
            className="bg-scrim animate-fade px-pad fixed inset-0 z-50 flex items-start justify-center pt-[max(8vh,48px)]"
            onClick={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={SEARCH_LABEL}
              className="border-line-2 bg-bg-2 animate-pop flex max-h-[min(680px,80vh)] w-[min(980px,100%)] flex-col overflow-hidden rounded-xl border shadow-[0_30px_70px_rgba(0,0,0,.6)]"
            >
              <div className="border-line flex h-[70px] shrink-0 items-center gap-4 border-b px-[18px]">
                <Icon name="search" className="text-mut" />
                <input
                  ref={input}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={onKeyDown}
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={SEARCH_PLACEHOLDER}
                  aria-label={SEARCH_PLACEHOLDER}
                  className="text-fg placeholder:text-mut-2 min-w-0 flex-1 bg-transparent text-[clamp(15px,2.4vw,19px)] outline-none"
                />
                <button
                  type="button"
                  onClick={close}
                  className="border-line-2 text-mut-2 hover:border-line-3 hover:text-fg text-mini ease-cue rounded-md border px-2.5 py-1.5 font-mono tracking-[.14em] transition duration-[var(--dur)]"
                >
                  {SEARCH_DISMISS_LABEL}
                </button>
              </div>

              <div className="flex min-h-0 flex-1">
                <div
                  ref={list}
                  className="no-scrollbar flex-1 overflow-y-auto py-4"
                >
                  {idle ? (
                    <SearchRecents
                      entries={recents}
                      onOpen={remember}
                      onForget={(entry) => setRecents(forgetRecent(entry))}
                      onClear={() => setRecents(clearRecents())}
                    />
                  ) : (
                    <SearchResults
                      status={status}
                      items={items}
                      term={term}
                      selected={selected}
                      onSelect={setSelected}
                      onOpen={remember}
                    />
                  )}
                </div>

                <aside className="border-line no-scrollbar tablet:block hidden w-[300px] shrink-0 overflow-y-auto border-l p-5">
                  <SearchPreview item={preview} />
                </aside>
              </div>

              <div className="border-line text-mut-2 flex h-14 shrink-0 items-center gap-5 border-t px-[18px]">
                {SEARCH_HINTS.map((hint) => (
                  <span key={hint.label} className="flex items-center gap-2">
                    <b className="border-line-2 text-mini rounded border px-1.5 py-1 font-mono font-normal">
                      {hint.keys}
                    </b>
                    <span className="text-mini font-mono tracking-[.2em] uppercase">
                      {hint.label}
                    </span>
                  </span>
                ))}

                {items.length ? (
                  <span className="text-mini ml-auto font-mono tracking-[.2em] uppercase">
                    {counted(items.length, SEARCH_COUNT_LABEL)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
