export type ContinentId =
  | "americas"
  | "europe"
  | "asia"
  | "middle-east"
  | "africa"
  | "oceania";

export interface Continent {
  id: ContinentId;
  name: string;
  short: string;
  query: string;
  hue: string;
}

export const CONTINENTS: Continent[] = [
  {
    id: "americas",
    name: "Américas",
    short: "AM",
    query: "geopolítica Estados Unidos OR Brasil OR América Latina",
    hue: "var(--zone-americas)",
  },
  {
    id: "europe",
    name: "Europa",
    short: "EU",
    query: "geopolítica Europa OR União Europeia OR Ucrânia OR Rússia",
    hue: "var(--zone-europe)",
  },
  {
    id: "asia",
    name: "Ásia",
    short: "AS",
    query: "geopolítica China OR Índia OR Japão OR Taiwan",
    hue: "var(--zone-asia)",
  },
  {
    id: "middle-east",
    name: "Oriente Médio",
    short: "OM",
    query: "geopolítica Oriente Médio OR Irã OR Israel OR Golfo",
    hue: "var(--zone-mideast)",
  },
  {
    id: "africa",
    name: "África",
    short: "AF",
    query: "geopolítica África OR Sahel OR Nigéria OR Egito",
    hue: "var(--zone-africa)",
  },
  {
    id: "oceania",
    name: "Oceania",
    short: "OC",
    query: "geopolítica Austrália OR Pacífico OR Indo-Pacífico",
    hue: "var(--zone-oceania)",
  },
];

export const CONTINENT_MAP = Object.fromEntries(
  CONTINENTS.map((c) => [c.id, c]),
) as Record<ContinentId, Continent>;

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  link: string;
  publishedAt: string;
  continent: ContinentId;
}
