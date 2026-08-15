import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { ArrowDown, Globe2, RefreshCw, Radio, ExternalLink } from "lucide-react";

import { ContinentShape } from "@/components/ContinentShape";
import { getWorldNews } from "@/lib/news.functions";
import { CONTINENTS, CONTINENT_MAP, type ContinentId } from "@/lib/continents";

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

  const items = data?.items ?? [];
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const i of items) c[i.continent] = (c[i.continent] ?? 0) + 1;
    return c;
  }, [items]);

  const feed = active ? items.filter((i) => i.continent === active) : items;

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
          O mundo em <span className="text-accent">balões</span>, a atualidade em queda
													</h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Cada balão concentra o volume de despachos de um continente. Selecione um teatro
          de operações e desça a página: a linha do tempo avança do contexto recente para o
          que acabou de acontecer.
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
            Nenhum despacho capturado agora. Tente atualizar em instantes.
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
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dispatch group"
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
                  <ExternalLink className="absolute right-4 bottom-4 h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
                </a>
              </li>
            );
          })}
        </ol>
      </section>

      <footer className="relative z-10 border-t border-border px-6 py-8 text-center text-xs uppercase tracking-[0.25em] text-muted-foreground">
        Orbe · agregação de fontes abertas · atualizado{" "}
        {data ? timeAgo(data.fetchedAt) + " atrás" : "—"}
      </footer>
    </div>
  );
}
