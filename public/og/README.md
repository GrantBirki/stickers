# Open Graph Images

Drop PNGs in this folder to control link previews (Twitter/X, Discord, iMessage, Slack, etc).

Required (default/fallback):

- `public/og/default.png` -> used for any page without a specific override

Optional overrides (drop-in; no code changes):

- Static routes:
  - `public/og/about.png` -> `/about/`
  - `public/og/contact.png` -> `/contact/`
  - `public/og/services.png` -> `/services/`
  - `public/og/work.png` -> `/work/`
  - `public/og/privacy.png` -> `/privacy/`
  - `public/og/terms.png` -> `/terms/`
  - `public/og/examples.png` -> `/examples/` (and `/example/`)
- Sticker inspect routes:
  - `public/og/stickers/<slug>.png` -> `/stickers/<slug>/`

Recommended size:

- 1200x630 (Open Graph "large" preview)
