# Emmabyte Microservice Branding Guide

## Purpose

This document translates Emmabyte’s brand PDFs into implementation-friendly guidance for designing new internal or external microservice identities, UI shells, dashboards, landing pages, docs, and lightweight product marks.

It is written to be easy for humans and LLMs to follow consistently.

## Brand Goal

Every Emmabyte microservice should feel like it belongs to the same family as the parent brand:

- modern
- clean
- warm
- slightly playful
- technically sharp
- simple rather than busy
- polished rather than overly decorative

Microservice branding should feel **related to Emmabyte**, not like an unrelated startup, and not like a clone of the master logo.

---

## Core Brand Foundations

### 1. Parent Brand Identity

The parent brand uses a hummingbird mark with a warm gradient and pixel-like trailing squares. That gives the brand a blend of:

- motion
- speed
- precision
- lightweight technology
- friendliness

For microservices, the goal is usually to **echo these qualities** without literally reusing the full company logo unless the use case explicitly calls for a parent-brand lockup.

### 2. Design Personality

Use these traits when generating or reviewing assets:

- minimal
- geometric
- lightweight
- modern SaaS
- soft but confident
- crisp edges
- subtle motion cues
- approachable tech aesthetic

Avoid anything that feels:

- corporate-heavy
- dark and aggressive
- overly glossy
- skeuomorphic
- crowded
- retro unless explicitly requested
- cyberpunk/neon overload

---

## Approved Color System

### Primary Brand Colors

Use these exact colors from the brand guide:

- `#FA586D`
- `#FF6798`
- `#FFBA71`
- `#000000`
- `#8E4C50`
- `#FFE4E4`

### 5-Step Gradient

Preferred Emmabyte gradient sequence:

1. `#FFBA71`
2. `#FFA57B`
3. `#FF9185`
4. `#FF7C8E`
5. `#FF6798`

### Practical Usage Rules

#### Use the gradient when:

- creating hero elements
- designing service icons or badges
- making accents, strokes, glows, or subtle fills
- creating visual continuity with the parent brand

#### Use flat color when:

- small icons need clarity
- UI components require simplicity
- accessibility/contrast matters more than decoration
- the logo mark must work at tiny sizes

#### Preferred color roles

- `#FA586D` → strong primary brand accent
- `#FF6798` → bright secondary accent, energetic highlights
- `#FFBA71` → warm highlight, end/start of gradient, friendly emphasis
- `#000000` → primary text on light backgrounds
- `#8E4C50` → brand marks and print materials only (do NOT use for UI muted text — use pure neutral grays instead)
- `#FFE4E4` → very soft surface/background tint

### Color Balance Guidance

For microservices, do not flood everything with pink or warm tones. The interface should feel **predominantly neutral** — like a clean Vercel/Linear-style app with Emmabyte brand accents. A good default mix is:

- **Light mode**: white backgrounds, pure neutral gray borders, black text
- **Dark mode**: pure neutral dark grays (zero hue, zero saturation), light gray text
- brand gradient used sparingly for primary buttons, active navigation states, and key highlights
- occasional soft blush surfaces using `#FFE4E4` in light mode only
- muted text should be pure neutral gray, not warm-tinted (avoid `#8E4C50` for UI text — reserve it for brand marks only)

---

## Frontend Implementation Style

### Preferred UI Stack

Emmabyte strongly prefers:

- Tailwind CSS for styling
- shadcn-svelte for component structure and UI primitives
- utility-first styling over custom one-off CSS
- clean component composition with consistent spacing, radius, and state handling

This matters for brand execution because the visual system should not just look on-brand in static assets — it should also map cleanly into the way Emmabyte actually builds products.

### UI Character in Practice

When translating the brand into real product interfaces, prefer:

- soft card surfaces
- rounded corners
- clean borders
- restrained shadow usage
- strong spacing rhythm
- simple, modern component layouts
- polished dashboards and forms
- subtle color accents rather than loud saturation everywhere

### Tailwind / shadcn-svelte Guidance

When generating UI concepts, components, or layout systems for Emmabyte products:

- assume Tailwind utility classes are the primary styling method
- assume shadcn-svelte component patterns are the default starting point
- prefer tokenized, reusable classes and variants
- keep styling implementation realistic for a Svelte app using shadcn-svelte
- avoid design ideas that depend on heavy bespoke CSS or highly ornamental visual treatment

### Brand-to-UI Translation Rule

If a design looks beautiful as a mockup but would be awkward to implement cleanly with Tailwind and shadcn-svelte, it is usually not the right default direction for Emmabyte.

## Typography

### Approved Typeface

Use **Montserrat**.

### Approved Weights

- Regular
- Medium
- Semi Bold

### Typography Guidance

#### Headlines

- Montserrat Semi Bold
- concise
- confident
- not overly condensed

#### Subheads / labels

- Montserrat Medium
- clear and modern

#### Body text

- Montserrat Regular
- plain and readable

### Font Loading

When generating code, always use the official Google Fonts source. Do not fall back to system fonts without also loading Montserrat.

```html
<!-- HTML link -->
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
```

```css
/* CSS import */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');
```

```js
// Tailwind config
fontFamily: {
  sans: ['Montserrat', 'system-ui', 'sans-serif'],
}
```

If Montserrat cannot be loaded (e.g. offline environments), use `system-ui, sans-serif` as the fallback stack — never a serif or monospace font.

### Tone of typography

Typography should feel:

- clean
- airy
- modern
- structured

Avoid decorative typefaces, serif pairings, or condensed fonts unless a very specific exception is requested.

---

## Logo Relationship Rules

### What microservices should do

A microservice mark should usually be one of these:

1. a simple standalone symbol inspired by Emmabyte’s motion/gradient language
2. a microservice-specific icon that fits beside the parent brand
3. a service badge or app tile that visually belongs to the Emmabyte family

### What microservices should usually NOT do

Do not automatically:

- reuse the full Emmabyte master logo as the microservice logo
- redraw the hummingbird
- stretch or distort existing brand assets
- alter the relative proportions of the parent logo
- add random effects like bevels, heavy shadows, or glows
- place white marks on pale backgrounds
- place logos on noisy or high-contrast backgrounds that reduce clarity

### Parent logo handling

If the parent Emmabyte logo appears anywhere:

- use official art only
- preserve proportions exactly
- do not recreate, retype, or redraw it
- maintain strong contrast with the background

---

## Icon and Microservice Mark Style

### Shape Language

Preferred shapes:

- circles
- rounded rectangles
- soft squares
- simple abstract geometric marks
- minimal motion lines or pulse/routing/signal motifs
- subtle pixel or modular grid references

### Visual Cues That Fit the Brand

Good motifs for Emmabyte-related microservices:

- pulse lines
- signal arcs
- routing paths
- pixels/squares dissolving or assembling
- simple wing-like motion forms
- node/link systems
- dashboards, streams, or flow indicators

### Icon Construction Principles

A good microservice icon should be:

- readable at 16px to 128px
- simple enough to recognize quickly
- built from 1–3 major shapes
- not dependent on tiny details
- able to work in full color and monochrome

### Recommended Icon Variants

Each microservice icon should ideally have:

- full-color version
- white-on-brand-color version
- dark/black version
- small-size simplified variant if needed

---

## Composition and Layout

### General Layout Style

Use layouts that feel:

- centered or grid-aligned
- balanced
- spacious
- minimal

### Preferred UI / Graphic Traits

- generous whitespace
- rounded corners where appropriate
- subtle depth only if needed
- soft cards rather than harsh panels
- clear visual hierarchy
- accent color used intentionally, not everywhere

### Avoid

- cluttered dashboards
- over-illustrated assets
- harsh gradients everywhere
- thick outlines unless intentional
- overly complex mascots or symbolic scenes

---

## Voice and Communication Style

When naming, describing, or presenting microservices, the written tone should match the visuals.

### Preferred tone

- clear
- confident
- helpful
- modern
- warm
- technically competent

### Avoid tone that feels

- buzzword-heavy
- overly playful
- robotic and sterile
- needlessly formal
- edgy for the sake of it

---

## Default Rules for New Microservices

Use these defaults unless a project brief says otherwise.

### Naming

Microservice names should be:

- short
- memorable
- easy to say
- easy to use in docs, URLs, and dashboards
- ideally one word or a tight compound

### Logo strategy

For a new microservice, default to:

- a simple symbol
- optional wordmark in Montserrat
- warm Emmabyte gradient accent
- minimal geometry

### UI strategy

For internal tools, dashboards, and admin panels:

- support light, dark, and system (auto) modes — system mode is the default
- in light mode: use white backgrounds, black text, neutral gray borders
- in dark mode: use pure neutral dark backgrounds (no warm tinting), light text, subtle neutral borders
- use brand accent colors (`#FA586D`, gradient) only for primary actions, active states, and intentional highlights
- keep neutral surfaces dominant — the interface should feel clean and professional, not colorful
- use cards, chips, and status elements with clean spacing
- keep the interface professional and calm

---

## LLM-Friendly Generation Instructions

Use the following rules when asking an LLM or design model to generate a new Emmabyte-aligned microservice brand.

### Required brand constraints

- Must feel like part of the Emmabyte family.
- Must use Montserrat for any text.
- Must use the Emmabyte palette.
- Should prefer the 5-step warm gradient for accents.
- Should be minimal, modern, geometric, and clean.
- Should not redraw or distort the parent logo.
- Should avoid busy details and visual clutter.

### Preferred visual keywords

- modern SaaS
- warm tech
- minimal vector
- soft geometric
- crisp
- subtle motion
- gradient accent
- polished
- lightweight

### Negative prompt / avoid list

- no skeuomorphism
- no metallic effects
- no bevel emboss
- no photorealism
- no gritty texture
- no cyberpunk overload
- no overly dark palette
- no serif fonts
- no crowded compositions
- no logo distortion

---

## Reusable Prompt Template

```md
Create a branding concept for an Emmabyte microservice called "[SERVICE_NAME]".

Brand relationship:
- It should clearly belong to the Emmabyte family, but it should not copy or redraw the main hummingbird logo.
- The design should feel like a sibling product or internal service.

Visual style:
- minimal
- modern SaaS
- geometric
- warm tech aesthetic
- clean vector style
- subtle sense of motion and precision

Color rules:
- Use the Emmabyte palette: #FA586D, #FF6798, #FFBA71, #000000, #8E4C50, #FFE4E4
- Prefer the 5-step gradient: #FFBA71 → #FFA57B → #FF9185 → #FF7C8E → #FF6798
- Keep backgrounds mostly light and uncluttered

Typography:
- Use Montserrat only
- Prefer Semi Bold for headings, Medium for labels, Regular for body

Icon guidance:
- Build a simple symbol using 1–3 major shapes
- Should read clearly at small sizes
- Avoid tiny details
- Consider motifs like signal, flow, pixels, routing, pulse, dashboard, or lightweight motion

Avoid:
- copying the parent logo
- stretching or distorting any logo
- busy compositions
- noisy backgrounds
- heavy shadows or effects
- pale logo on pale background

Deliverables:
- primary icon
- monochrome variant
- app-tile / badge version
- optional wordmark lockup
```

---

## Microservice Design Heuristics

Use these heuristics to keep sibling services consistent.

### If the service is about monitoring, logs, or observability

Favor:

- pulse lines
- nodes
- stream paths
- circular status indicators
- dashboard-like rhythm

### If the service is about automation or orchestration

Favor:

- flow arrows
- connected blocks
- modular paths
- grid systems
- abstract movement from left to right

### If the service is about AI or intelligence

Favor:

- subtle spark or signal motifs
- connected dots
- layered waveforms
- simple abstract cognition/network shapes

### If the service is about security or trust

Favor:

- shield-adjacent geometry without cliché lock icons
- stable symmetry
- controlled motion
- high clarity and restrained color use

---

## Accessibility and Practicality

All generated branding should remain usable in real software contexts.

### Theme Mode Strategy

Emmabyte products support three modes: **light**, **dark**, and **system** (auto). **System mode is the default** — the app follows the user's OS preference. Users may override to force light or dark.

When building new microservices, always implement all three modes from the start. Use CSS custom properties (HSL format) and a `.dark` class on the root element to toggle themes.

### Dark Mode Guidance

Dark mode surfaces must be **pure neutral** — no warm hue tinting on backgrounds, cards, or borders. The brand warmth comes exclusively from accent colors, not from tinted grays. This keeps the interface clean, Vercel-like, and professional, with brand color used only for intentional highlights.

| Light Mode                           | Dark Mode Equivalent         | Role                      |
| ------------------------------------ | ---------------------------- | ------------------------- |
| `#FFFFFF` (white bg)                 | `hsl(0 0% 3.5%)` (~`#090909`) | Primary background       |
| `#F9FAFB` / `#F5F5F5` (soft grey bg) | `hsl(0 0% 7%)` (~`#121212`)  | Card / elevated surface   |
| `#FFE4E4` (brand soft)               | `hsl(0 0% 11%)` (~`#1C1C1C`) | Soft tinted surface       |
| `#000000` (text)                     | `hsl(0 0% 93%)` (~`#EDEDED`) | Primary text              |
| `hsl(0 0% 40%)` (muted text)        | `hsl(0 0% 50%)` (~`#808080`) | Muted/secondary text      |
| `hsl(0 0% 90%)` (border)            | `hsl(0 0% 13%)` (~`#212121`) | Borders and inputs        |
| `#FA586D` (brand primary)            | `#FA586D`                    | Accent — no change needed |
| `#FF6798` (brand secondary)          | `#FF6798`                    | Accent — no change needed |
| `#FFBA71` (brand highlight)          | `#FFBA71`                    | Accent — no change needed |

Key rules for dark mode:

- **All neutral surfaces use hue `0`, saturation `0%`** — pure gray, no warm tinting
- Brand accent colors (`#FA586D`, `#FF6798`, `#FFBA71`) stay the same — they have enough luminance to work on dark backgrounds
- The 5-step gradient works as-is on dark surfaces
- Never use pure `#000000` as a dark background — use very dark grays like `hsl(0 0% 3.5%)` for softer depth
- Card borders on dark backgrounds should use low-lightness neutral grays (`hsl(0 0% 13%)`) or `rgba(255, 255, 255, 0.08)`
- Reduce shadow intensity significantly in dark mode — prefer subtle border separation instead
- Do NOT use warm-tinted dark surfaces (e.g. `#2A1A1C`, `#1A1412`) — these muddy the interface and fight with the accent colors

### Light Mode Guidance

Light mode surfaces should be clean white or near-white with pure neutral grays:

- Primary background: `#FFFFFF`
- Card / elevated surfaces: `#FFFFFF` with neutral border
- Soft tinted surfaces: `#FFE4E4` (brand soft) — use sparingly
- Primary text: `#000000` or very dark neutral
- Muted text: `hsl(0 0% 40%)` — pure neutral gray
- Borders: `hsl(0 0% 90%)` — light neutral gray

The overall impression should be **predominantly white/neutral** with brand color appearing only for buttons, active states, and intentional accents.

### CSS Custom Property Reference

Use HSL-based CSS custom properties for theming. This is the standard pattern for shadcn-svelte and ensures consistent mode switching:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 7%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 7%;
  --primary: 353 95% 66%;       /* #FA586D */
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 96%;
  --muted: 0 0% 96%;
  --muted-foreground: 0 0% 40%;
  --accent: 0 0% 96%;
  --border: 0 0% 90%;
  --ring: 353 95% 66%;
  --radius: 1rem;
}

.dark {
  --background: 0 0% 3.5%;
  --foreground: 0 0% 93%;
  --card: 0 0% 7%;
  --card-foreground: 0 0% 93%;
  --primary: 353 95% 66%;       /* same accent */
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 10%;
  --muted: 0 0% 11%;
  --muted-foreground: 0 0% 50%;
  --accent: 0 0% 11%;
  --border: 0 0% 13%;
  --ring: 353 95% 66%;
}
```

Note: All neutral values use `0 0%` (zero hue, zero saturation). Only `--primary` and `--ring` carry the brand hue (`353`).

### Must-haves

- high contrast for text
- recognizable at small sizes
- scalable as SVG/vector
- usable on light and dark backgrounds where possible
- simple enough for favicon/app icon adaptation

### Nice-to-haves

- monochrome fallback
- square avatar/app tile version
- horizontal lockup version
- dark-mode friendly adaptation

---

## Implementation Tokens

These are good starter tokens for codebases.

```json
{
  "fontFamily": "Montserrat, system-ui, sans-serif",
  "colors": {
    "brandPrimary": "#FA586D",
    "brandSecondary": "#FF6798",
    "brandHighlight": "#FFBA71",
    "brandDark": "#000000",
    "brandMuted": "#8E4C50",
    "brandSoft": "#FFE4E4"
  },
  "gradients": {
    "brand5Step": ["#FFBA71", "#FFA57B", "#FF9185", "#FF7C8E", "#FF6798"]
  },
  "radius": {
    "card": "16px",
    "button": "12px",
    "badge": "999px",
    "input": "8px"
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px",
    "3xl": "64px",
    "sectionGap": "48px",
    "pageMargin": "24px"
  },
  "iconSizes": {
    "favicon": "16px",
    "inline": "20px",
    "default": "24px",
    "medium": "32px",
    "large": "48px",
    "appTile": "128px"
  },
  "logoMinClearSpace": "equal to the height of the icon mark on all sides"
}
```

### Spacing Guidance

Maintain a consistent `8px` base rhythm. All spacing values should be multiples of 8 (with `4px` allowed for tight internal padding only). This keeps layouts visually aligned and predictable across microservices.

- Card internal padding: `24px`
- Gap between cards or sections: `24px–48px`
- Page-level horizontal padding: `24px` minimum
- Minimum clear space around any logo or mark: equal to the mark's own height on all sides

---

## Correct vs. Incorrect Examples

Use these contrastive descriptions to calibrate outputs. When reviewing a generated result, compare it against these patterns.

### Example 1: Microservice Icon

**Correct:** A simple rounded square app tile with a white background. In the center, two thin arcs suggest a signal or pulse, rendered using the 5-step brand gradient. The mark is made of just 2–3 shapes, reads cleanly at 24px, and feels like a sibling to the Emmabyte brand.

**Incorrect:** A detailed illustration of a hummingbird holding a wrench inside a hexagon badge, using a dark blue-to-purple gradient not in the palette, with a drop shadow and bevel effect. It looks busy at any size and doesn't connect to Emmabyte visually.

### Example 2: Dashboard Layout

**Correct:** A clean white background with a left sidebar navigation. Cards are spaced evenly with `24px` gaps, have `16px` rounded corners, and use `#FFE4E4` as a soft highlight for the active status section. Text is black Montserrat. One gradient accent bar runs across the top of the page. Plenty of whitespace.

**Incorrect:** A dark charcoal interface with neon pink and orange glowing elements, dense 12-column grid packed edge-to-edge, heavy drop shadows on every element, a condensed sans-serif font, and gradient backgrounds on every card. It looks like a cyberpunk dashboard, not an Emmabyte product.

### Example 3: Microservice Name and Wordmark

**Correct:** The service is called "Relay." The wordmark is set in Montserrat Semi Bold, all lowercase, in `#000000`, with a small gradient dot accent to the right of the name. Simple, easy to type in a URL, and easy to say in conversation.

**Incorrect:** The service is called "SynaptiCore DataMesh Pro." The wordmark uses a custom serif font with metallic gradient fills, a tagline below in italic, and a complex interlocking monogram. It feels disconnected from Emmabyte and is hard to use in documentation or code.

### Example 4: Color Usage

**Correct:** A settings page with a white background, black body text, a single `#FA586D` accent on the primary action button, and `#FFE4E4` used as a subtle highlight on the selected card. The gradient appears only in the top nav bar. The overall impression is calm and professional.

**Incorrect:** Every section header uses a different brand color. Cards alternate between pink and orange backgrounds. The gradient is applied to buttons, cards, dividers, and the footer simultaneously. The page feels saturated and chaotic.

---

## Final Decision Rule

When choosing between two design options, prefer the one that is:

- simpler
- clearer at small size
- more obviously related to Emmabyte
- less visually noisy
- easier to reuse in software and documentation

That is usually the more brand-correct choice.
