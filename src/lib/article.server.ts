export interface ArticlePreview {
  url: string;
  finalUrl: string;
  domain: string;
  title: string;
  description: string;
  image: string | null;
  siteName: string;
  excerpt: string;
}

function meta(html: string, keys: string[]): string {
  for (const key of keys) {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']+)["']`,
      "i",
    );
    const alt = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${key}["']`,
      "i",
    );
    const m = html.match(re) ?? html.match(alt);
    if (m?.[1]) return decode(m[1]);
  }
  return "";
}

function decode(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function firstParagraphs(html: string): string {
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
  const paras = [...body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => decode(m[1]!.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")))
    .filter((t) => t.length > 80);
  return paras.slice(0, 3).join("\n\n").slice(0, 1200);
}

export async function loadArticlePreview(url: string): Promise<ArticlePreview> {
  let finalUrl = url;
  let html = "";
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });
    finalUrl = res.url || url;
    html = await res.text();
    // Google News interstitial: extrai o link canônico do artigo.
    const redirect = html.match(/data-n-au=["']([^"']+)["']/) ??
      html.match(/<a[^>]+href=["'](https?:\/\/(?!news\.google)[^"']+)["'][^>]*>/);
    if (/news\.google\.com/.test(finalUrl) && redirect?.[1]) {
      const res2 = await fetch(redirect[1], {
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        },
      });
      finalUrl = res2.url || redirect[1];
      html = await res2.text();
    }
  } catch {
    /* devolve o que der */
  }

  let domain = "";
  try {
    domain = new URL(finalUrl).hostname.replace(/^www\./, "");
  } catch {
    domain = "";
  }

  const title =
    meta(html, ["og:title", "twitter:title"]) ||
    decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const description = meta(html, [
    "og:description",
    "twitter:description",
    "description",
  ]);
  let image = meta(html, ["og:image", "twitter:image", "og:image:secure_url"]);
  if (image && image.startsWith("/") && domain) image = `https://${domain}${image}`;

  return {
    url,
    finalUrl,
    domain,
    title,
    description,
    image: image || null,
    siteName: meta(html, ["og:site_name"]) || domain,
    excerpt: firstParagraphs(html),
  };
}
