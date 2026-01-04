import { test, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";

import Footer from "../src/lib/components/Footer.svelte";

test("Footer renders a link to the source repo", () => {
  render(Footer);

  const link = screen.getByRole("link", { name: /source code/i });
  expect(link.getAttribute("href")).toBe("https://github.com/GrantBirki/stickers");
  expect(link.getAttribute("target")).toBe("_blank");
  expect(link.getAttribute("rel")).toMatch(/noopener/);
  expect(link.getAttribute("rel")).toMatch(/noreferrer/);

  expect(screen.getByText(/Made with/i)).toBeInTheDocument();
});
