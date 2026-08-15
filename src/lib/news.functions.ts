import { createServerFn } from "@tanstack/react-start";
import { collectWorldNews } from "./news.server";

export const getWorldNews = createServerFn({ method: "GET" }).handler(
  async () => {
    const items = await collectWorldNews();
    return { items, fetchedAt: new Date().toISOString() };
  },
);
