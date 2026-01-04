export const baseSlugFromStickerId = (id) =>
  (id ?? "").toString().replace(/^stickers-/, "").replace(/-\d+$/, "");

export const fullSlugFromStickerId = (id) => (id ?? "").toString().replace(/^stickers-/, "");

export const normalizePathSlug = (slug) =>
  (slug ?? "").toString().replace(/^\/+/, "").replace(/\/+$/, "");

