export const baseSlugFromStickerId = (id: unknown): string =>
  (id ?? "").toString().replace(/^stickers-/, "").replace(/-\d+$/, "");

export const fullSlugFromStickerId = (id: unknown): string =>
  (id ?? "").toString().replace(/^stickers-/, "");

export const normalizePathSlug = (slug: unknown): string =>
  (slug ?? "").toString().replace(/^\/+/, "").replace(/\/+$/, "");
