import { CONTINENTS, type ContinentId, type NewsItem } from "./continents";

const FEED = (query: string) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(query)}+when:2d&hl=pt-BR&gl=BR&ceid=BR:pt-419`;

function pick(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  if (!m) return "";
  return m[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

async function fetchContinent(
  continent: ContinentId,
  query: string,
): Promise<NewsItem[]> {
  try {
    const res = await fetch(FEED(query), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GeoIntelBot/1.0)" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
    return blocks.slice(0, 14).map((block, i) => {
      const rawTitle = pick(block, "title");
      const dashIdx = rawTitle.lastIndexOf(" - ");
      const source =
        pick(block, "source") ||
        (dashIdx > 20 ? rawTitle.slice(dashIdx + 3) : "Fonte desconhecida");
      const title = dashIdx > 20 ? rawTitle.slice(0, dashIdx) : rawTitle;
      const pub = pick(block, "pubDate");
      return {
        id: `${continent}-${i}-${title.slice(0, 24)}`,
        title,
        source,
        link: pick(block, "link"),
        publishedAt: pub ? new Date(pub).toISOString() : new Date().toISOString(),
        continent,
      };
    });
  } catch {
    return [];
  }
}

export async function collectWorldNews(): Promise<NewsItem[]> {
  const results = await Promise.all(
    CONTINENTS.map((c) => fetchContinent(c.id, c.query)),
  );
  return results
    .flat()
    .filter((n) => n.title && n.link)
    .sort(
      (a, b) =>
        new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
    );
}
