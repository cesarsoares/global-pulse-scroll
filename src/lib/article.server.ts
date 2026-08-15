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

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

// Links de agregador escondem a URL do publisher; resolve via o endpoint de redirect.
async function resolveAggregatorUrl(url: string): Promise<string> {
  if (!/news\.google\.com/.test(url)) return url;
  const id = url.split("/articles/")[1]?.split("?")[0];
  if (!id) return url;
  try {
    const page = await (
      await fetch(url, { headers: { "User-Agent": UA } })
    ).text();
    const ts = page.match(/data-n-a-ts="([^"]+)"/)?.[1];
    const sg = page.match(/data-n-a-sg="([^"]+)"/)?.[1];
    const fullId = page.match(/data-n-a-id="([^"]+)"/)?.[1] ?? id;
    if (!ts || !sg) return url;

    const payload = JSON.stringify([
      "garturlreq",
      [
        ["pt-BR", "BR", ["FINANCE_TOP_INDICES", "WEB_TEST_1_0_0"], null, null, 1, 1, "BR:pt-419", null, null, null, null, null, null, null, 0],
        "pt-BR",
        "BR",
        1,
        [2, 4, 8],
        1,
        1,
        null,
        0,
        0,
        null,
        0,
      ],
      fullId,
      ts,
      sg,
    ]);
    const body = new URLSearchParams({
      "f.req": JSON.stringify([[["Fbv4je", payload]]]),
    });
    const res = await fetch(
      "https://news.google.com/_/DotsSplashUi/data/batchexecute",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "User-Agent": UA,
        },
        body,
      },
    );
    const text = await res.text();
    const found = text.match(/https?:\/\/(?!news\.google)[^\\"]{20,}/)?.[0];
    return found ?? url;
  } catch {
    return url;
  }
}

export async function loadArticlePreview(url: string): Promise<ArticlePreview> {
  let finalUrl = await resolveAggregatorUrl(url);
  let html = "";
  try {
    const res = await fetch(finalUrl, {
      redirect: "follow",
      headers: {
        "User-Agent": UA,
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });
    finalUrl = res.url || finalUrl;
    html = await res.text();
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
