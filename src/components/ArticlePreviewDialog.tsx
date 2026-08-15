import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, Link2, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getArticlePreview } from "@/lib/article.functions";
import { CONTINENT_MAP, type NewsItem } from "@/lib/continents";
import { extractTags } from "@/lib/tags";

export function ArticlePreviewDialog({
  item,
  onClose,
}: {
  item: NewsItem | null;
  onClose: () => void;
}) {
  const fetchPreview = useServerFn(getArticlePreview);
  const { data, isLoading } = useQuery({
    queryKey: ["article-preview", item?.link],
    queryFn: () => fetchPreview({ data: { url: item!.link } }),
    enabled: !!item,
    staleTime: 30 * 60 * 1000,
  });

  const zone = item ? CONTINENT_MAP[item.continent] : null;

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-card sm:max-w-2xl">
        {item && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                <span style={{ color: zone!.hue }}>{zone!.name}</span>
                <span>·</span>
                <span>{data?.siteName || item.source}</span>
              </div>
              <DialogTitle className="mt-2 text-left font-display text-xl leading-snug">
                {data?.title || item.title}
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-wrap gap-2">
              {extractTags(item.title).map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>

            {isLoading && (
              <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                carregando pré-visualização do artigo…
              </div>
            )}

            {!isLoading && data?.image && (
              <img
                src={data.image}
                alt={data.title || item.title}
                loading="lazy"
                className="mt-1 max-h-64 w-full rounded-lg object-cover"
              />
            )}

            {!isLoading && (
              <div className="space-y-4">
                {data?.description && (
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {data.description}
                  </p>
                )}
                {data?.excerpt &&
                  data.excerpt
                    .split("\n\n")
                    .slice(0, 3)
                    .map((p, i) => (
                      <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                        {p}
                      </p>
                    ))}
                {!data?.description && !data?.excerpt && (
                  <p className="text-sm text-muted-foreground">
                    A fonte não liberou uma pré-visualização. Abra o artigo original abaixo.
                  </p>
                )}
              </div>
            )}

            <div className="mt-2 space-y-3 border-t border-border pt-4">
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                  fonte original
                </p>
                <p className="mt-1 text-sm">{data?.siteName || item.source}</p>
              </div>
              <div className="flex items-start gap-2 text-xs break-all text-muted-foreground">
                <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{data?.finalUrl || item.link}</span>
              </div>
              <a
                href={data?.finalUrl || item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-medium tracking-wide text-accent-foreground uppercase transition-opacity hover:opacity-90"
              >
                abrir artigo original
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
