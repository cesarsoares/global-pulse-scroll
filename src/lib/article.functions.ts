import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { loadArticlePreview } from "./article.server";

export const getArticlePreview = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ url: z.string().url() }).parse(data),
  )
  .handler(async ({ data }) => loadArticlePreview(data.url));
