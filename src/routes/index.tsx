import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { ArrowDown, Globe2, RefreshCw, Radio, ExternalLink, Search, X } from "lucide-react";

import { ContinentShape } from "@/components/ContinentShape";
import { ArticlePreviewDialog } from "@/components/ArticlePreviewDialog";
import { extractTags, ALL_TAGS, tagLabel } from "@/lib/tags";
import { getWorldNews } from "@/lib/news.functions";
import {
  CONTINENTS,
  CONTINENT_MAP,
  type ContinentId,
  type NewsItem,
} from "@/lib/continents";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orbe — Radar geopolítico global por continente" },
      {
        name: "description",
        content:
          "Radar de notícias geopolíticas em tempo real, segmentado por continente. Role para acompanhar os despachos mais recentes do mundo.",
      },
      { property: "og:title", content: "Orbe — Radar geopolítico global" },
      {
        property: "og:description",
        content:
          "Balões por continente e uma linha do tempo que revela notícias mais atuais conforme você desce a página.",
      },
    ],
  }),
  component: Index,
});

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h`;
  return `${Math.round(h / 24)} d`;
}

function Index() {
  const fetchNews = useServerFn(getWorldNews);
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["world-news"],
    queryFn: () => fetchNews(),
    refetchInterval: 5 * 60 * 1000,
  });
  const [active, setActive] = useState<ContinentId | null>(null);
  const [query, setQuery] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [exprs, setExprs] = useState<string[]>([]);
  const [selected, setSelected] = useState<NewsItem | null>(null);

  const items = data?.items ?? [];
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const i of items) c[i.continent] = (c[i.continent] ?? 0) + 1;
    return c;
  }, [items]);

  const tagged = useMemo(
    () => items.map((i) => ({ item: i, tags: extractTags(i.title) })),
    [items],
  );

  const availableTags = useMemo(() => {
    const present = new Set(tagged.flatMap((t) => t.tags));
    return ALL_TAGS.filter((t) => present.has(t));
  }, [tagged]);

  const feed = useMemo(() => {
    const q = query.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    return tagged
      .filter(({ item, tags: itemTags }) => {
        if (active && item.continent !== active) return false;
        if (tags.length && !tags.some((t) => itemTags.includes(t))) return false;
        if (terms.length) {
          const haystack = `${item.title} ${item.source} ${itemTags.join(" ")}`.toLowerCase();
          if (!terms.every((t) => haystack.includes(t))) return false;
        }
        return true;
      })
      .map((t) => t.item);
  }, [tagged, active, tags, query]);

  const feedTags = useMemo(
    () => new Map(tagged.map((t) => [t.item.id, t.tags])),
    [tagged],
  );

  const hasFilters = !!active || tags.length > 0 || query.trim().length > 0;
  const clearFilters = () => {
    setActive(null);
    setTags([]);
    setQuery("");
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[60vh] bg-halo" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <Globe2 className="h-5 w-5 text-accent" />
          <span className="font-display text-lg tracking-[0.35em] uppercase">Orbe</span>
        </div>
        <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-signal signal-pulse" />
            {isFetching ? "sincronizando" : "sinal ativo"}
          </span>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 transition-colors hover:border-accent hover:text-accent"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            atualizar
          </button>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-8 pt-6">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
          briefing geopolítico · {items.length} despachos
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] sm:text-6xl">
          O mundo em <span className="text-accent">painéis</span>, a atualidade em queda
													</h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Cada painel concentra o volume de despachos de um continente. Busque por
          palavras-chave, combine tags temáticas e desça a página: a linha do tempo avança
          do contexto recente para o que acabou de acontecer.
        </p>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-14">
        <div className="flex flex-wrap items-stretch justify-center gap-4 sm:gap-5">
          {CONTINENTS.map((c, idx) => {
            const n = counts[c.id] ?? 0;
            const isActive = active === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActive(isActive ? null : c.id)}
                style={{
                  ["--zone" as string]: c.hue,
                  animationDelay: `${idx * 0.45}s`,
                }}
                className={`zone-card float ${isActive ? "zone-card-active" : ""}`}
              >
                <ContinentShape
                  continent={c.id}
                  className="zone-shape"
                  style={{ color: c.hue }}
                />
                <div className="relative flex items-baseline justify-between">
                  <span className="font-display text-3xl">{n}</span>
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                    {c.short}
                  </span>
                </div>
                <span className="relative mt-2 text-[0.65rem] uppercase tracking-[0.22em] opacity-85">
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-12 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <ArrowDown className="h-4 w-4 animate-bounce" />
          notícias mais atuais abaixo
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-32">
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por palavra-chave, país ou fonte…"
              aria-label="Buscar notícias"
              className="w-full rounded-full border border-border bg-card/80 py-3 pr-10 pl-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Limpar busca"
                className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground transition-colors hover:text-accent"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {availableTags.map((t) => {
              const on = tags.includes(t);
              return (
                <button
                  key={t}
                  onClick={() =>
                    setTags((prev) =>
                      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
                    )
                  }
                  className={`rounded-full border px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.18em] transition-colors ${
                    on
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-border text-muted-foreground hover:border-accent/60 hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              );
            })}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="rounded-full border border-border px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-destructive"
              >
                limpar filtros
              </button>
            )}
          </div>
        </div>

        <div className="mb-8 flex items-baseline justify-between border-b border-border pb-3">
          <h2 className="font-display text-sm uppercase tracking-[0.3em]">
            {active ? CONTINENT_MAP[active].name : "Todos os teatros"}
          </h2>
          <span className="text-xs text-muted-foreground">{feed.length} itens</span>
        </div>

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-card" />
            ))}
          </div>
        )}

        {!isLoading && feed.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum despacho corresponde aos filtros atuais.
          </p>
        )}

        <ol className="relative space-y-3 border-l border-border pl-6">
          {feed.map((item, i) => {
            const c = CONTINENT_MAP[item.continent];
            const heat = feed.length > 1 ? i / (feed.length - 1) : 1;
            return (
              <li key={item.id + i} className="relative">
                <span
                  className="absolute -left-[1.72rem] top-5 h-2 w-2 rounded-full"
                  style={{ backgroundColor: c.hue, opacity: 0.35 + heat * 0.65 }}
                />
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className="dispatch group w-full text-left"
                  style={{ ["--zone" as string]: c.hue, opacity: 0.62 + heat * 0.38 }}
                >
                  <div className="flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                    <span style={{ color: c.hue }}>{c.short}</span>
                    <span className="truncate">{item.source}</span>
                    <span className="ml-auto shrink-0">{timeAgo(item.publishedAt)}</span>
                  </div>
                  <h3 className="mt-2 text-base leading-snug transition-colors group-hover:text-accent">
                    {item.title}
                  </h3>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {(feedTags.get(item.id) ?? []).map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-border px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground"
                      >
                        {tagLabel(t)}
                      </span>
                    ))}
                    <span className="ml-auto flex items-center gap-1 text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-80">
                      pré-visualizar
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <ArticlePreviewDialog item={selected} onClose={() => setSelected(null)} />

      <footer className="relative z-10 border-t border-border px-6 py-8 text-center text-xs uppercase tracking-[0.25em] text-muted-foreground">
        Orbe · agregação de fontes abertas · atualizado{" "}
        {data ? timeAgo(data.fetchedAt) + " atrás" : "—"}
      </footer>
    </div>
  );
}
