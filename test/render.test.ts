import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { adjust, clamp, round } from "../src/lib/helpers/Math.ts";
import { baseSlugFromStickerId, fullSlugFromStickerId, normalizePathSlug } from "../src/lib/helpers/stickerSlugs.ts";
import {
  buildSlugMap,
  escapeHtml,
  formatDropDate,
  normalizeBase,
  publicUrl,
  renderCard,
  renderDocument,
  renderExamples,
  renderHome,
  renderInspect,
  renderStaticPage,
  resolveImgSrc,
} from "../src/lib/render.ts";
import type { CardData } from "../src/lib/types.ts";

const sticker: CardData = {
  id: "stickers-test-card-001",
  name: "Test & <Card>",
  set: "stickers",
  number: "0001",
  rarity: "spiral-holographic",
  sticker_img: "img/test sticker.png",
  card_front_img: "/img/front.png",
  card_back_img: "/img/back.png",
  drop_date: "2026-01-02",
  description: "A test card",
  total_prints: 10,
};

describe("pure helpers", () => {
  test("math helpers preserve card interaction behavior", () => {
    assert.equal(round(1.23456, 2), 1.23);
    assert.equal(clamp(-1), 0);
    assert.equal(clamp(101), 100);
    assert.equal(adjust(10, 0, 100, 100, 0), 90);
  });

  test("slug and path helpers normalize identifiers", () => {
    assert.equal(baseSlugFromStickerId("stickers-hello-001"), "hello");
    assert.equal(fullSlugFromStickerId("stickers-hello-001"), "hello-001");
    assert.equal(normalizePathSlug("/hello/"), "hello");
    assert.equal(baseSlugFromStickerId(null), "");
    assert.equal(normalizeBase("repo"), "/repo/");
    assert.equal(normalizeBase("/"), "/");
    assert.equal(publicUrl("/repo/", "/asset.js"), "/repo/asset.js");
  });

  test("escaping and local image resolution do not create remote fallbacks", () => {
    assert.equal(escapeHtml(`<a href="x">'&`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;");
    assert.equal(resolveImgSrc("./img/a.png"), "/img/a.png");
    assert.equal(resolveImgSrc("/img/a.png"), "/img/a.png");
    assert.equal(resolveImgSrc("https://example.com/a.png"), "https://example.com/a.png");
    assert.equal(resolveImgSrc("data:image/png;base64,x"), "data:image/png;base64,x");
    assert.equal(resolveImgSrc(undefined), "");
    assert.equal(formatDropDate("2026-01-02"), "2026/01/02");
    assert.equal(formatDropDate("soon"), "soon");
    assert.equal(formatDropDate(null), "");
  });
});

describe("static rendering", () => {
  test("slug collisions fall back to full sticker ids", () => {
    const map = buildSlugMap([
      { ...sticker, id: "stickers-card-001" },
      { ...sticker, id: "stickers-card-002" },
      { ...sticker, id: "" },
      { ...sticker, id: "../../outside" },
    ]);
    assert.deepEqual(map, {
      "stickers-card-001": "card",
      "stickers-card-002": "card-002",
    });
  });

  test("sticker cards render owned art, metadata, foil, and inspect routing", () => {
    const html = renderCard(sticker, { inspectSlug: "test-card", priority: true });
    assert.match(html, /data-sticker-foil="full"/);
    assert.match(html, /data-inspect-href="\/stickers\/test-card\/"/);
    assert.match(html, /src="\/img\/test sticker.png"/);
    assert.match(html, /Test &amp; &lt;Card&gt;/);
    assert.match(html, /2026\/01\/02/);
    assert.match(html, /fetchpriority="high"/);
    assert.match(html, /data-card-name="Test &amp; &lt;Card&gt;"/);
  });

  test("common, mystery, and demo cards take their distinct render paths", () => {
    const common = renderCard({ ...sticker, rarity: "common", card_front_img: undefined });
    assert.match(common, /data-sticker-foil="art"/);

    const mystery = renderCard({ id: "mystery", name: "Mystery", set: "stickers", variant: "mystery", hidden: true, card_front_img: "/img/mystery.png" });
    assert.match(mystery, /data-hidden="true"/);
    assert.match(mystery, /mystery__face/);

    const demo = renderCard({ id: "demo", name: "Demo", number: "TG01", types: ["Fire"], img: "./img/demo.png", mask: "/img/mask.png", foil: "/img/foil.png" }, { flipOnClick: true, showcase: true });
    assert.match(demo, /data-trainer-gallery="true"/);
    assert.match(demo, /data-showcase="true"/);
    assert.match(demo, /data-flip-on-click="true"/);
    assert.match(demo, /--mask:/);
    assert.match(demo, /class="card__shine"/);
  });

  test("all page variants render without a client framework", () => {
    const home = renderHome([sticker], { display_next_card_as_hidden: true });
    assert.match(home, /Sticker Drops/);
    assert.match(home, /stickers-mystery/);
    assert.match(renderHome([sticker], { display_next_card_as_hidden: false }), /inspect-fab/);
    assert.match(renderExamples(), /demo-shiny-vmax/);
    assert.match(renderStaticPage("About", "Tiny studio"), /Tiny studio/);
    assert.match(renderInspect(sticker), /data-flip-on-click="true"/);

    const normal = renderDocument(home, {
      base: "/repo",
      metadata: { canonicalPath: "", description: "Description", ogImage: "og/default.png", title: "Title" },
      siteUrl: "https://example.com",
    });
    assert.match(normal, /https:\/\/example.com\/repo\//);
    assert.match(normal, /\/repo\/assets\/main.js/);
    assert.match(normal, /studio-footer/);

    const inspect = renderDocument(renderInspect(sticker), {
      base: "/",
      inspect: true,
      metadata: { canonicalPath: "stickers/test/", description: "Inspect", ogImage: "og/default.png", title: "Inspect" },
      siteUrl: "",
    });
    assert.doesNotMatch(inspect, /theme-toggle/);
    assert.match(inspect, /content--inspect/);
  });
});
