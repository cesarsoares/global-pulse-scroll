export const TAG_RULES: { tag: string; terms: string[] }[] = [
  { tag: "Conflito", terms: ["guerra", "conflito", "ataque", "míssil", "militar", "bombard", "tropas", "ofensiva"] },
  { tag: "Diplomacia", terms: ["diplomac", "acordo", "cúpula", "negocia", "tratado", "embaixad", "onu", "otan"] },
  { tag: "Sanções", terms: ["sanç", "embargo", "tarifa", "bloqueio"] },
  { tag: "Comércio", terms: ["comércio", "exporta", "importa", "tarifa", "mercado", "agro", "soja", "commodit"] },
  { tag: "Energia", terms: ["petróleo", "gás", "energia", "opep", "urânio", "combustível"] },
  { tag: "Nuclear", terms: ["nuclear", "urânio", "atômic"] },
  { tag: "Eleições", terms: ["eleiç", "eleitor", "votação", "candidat", "posse"] },
  { tag: "Economia", terms: ["economia", "inflaç", "juros", "pib", "dólar", "banco central", "fmi"] },
  { tag: "Tecnologia", terms: ["tecnologia", "chips", "semicondut", "inteligência artificial", "ia ", "cyber", "ciber"] },
  { tag: "Segurança", terms: ["terror", "segurança", "narco", "fronteira", "espionagem", "golpe"] },
  { tag: "Clima", terms: ["clima", "cop3", "amazôn", "seca", "desastre", "ambient"] },
  { tag: "Migração", terms: ["migra", "refugiad", "imigra", "deporta"] },
];

// Expressões do poder nacional (doutrina ADESG): Política, Econômica,
// Psicossocial, Militar e Científico-Tecnológica.
export const EXPRESSION_BY_TAG: Record<string, string> = {
  Conflito: "Militar",
  Segurança: "Militar",
  Diplomacia: "Política",
  Eleições: "Política",
  Sanções: "Econômica",
  Comércio: "Econômica",
  Energia: "Econômica",
  Economia: "Econômica",
  Nuclear: "Científico-Tecnológica",
  Tecnologia: "Científico-Tecnológica",
  Clima: "Psicossocial",
  Migração: "Psicossocial",
};

/** Rótulo exibido: "MILITAR | CONFLITO". */
export function tagLabel(tag: string): string {
  const expr = EXPRESSION_BY_TAG[tag];
  return expr ? `${expr} | ${tag}` : tag;
}

export function extractTags(text: string): string[] {
  const t = text.toLowerCase();
  const tags = TAG_RULES.filter((r) => r.terms.some((term) => t.includes(term))).map(
    (r) => r.tag,
  );
  return tags.length ? tags.slice(0, 3) : ["Panorama"];
}

export const ALL_TAGS = [...TAG_RULES.map((r) => r.tag), "Panorama"];
