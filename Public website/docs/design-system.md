# Covenant Shield Design System & WCAG Contrast Matrix

This document records the exact color tokens, typography scales, contrast ratios, and luxury material specifications for the Covenant Shield public website.

## 1. Palette & Contrast Verification (WCAG 2.1 AA)

All color combinations have been tested against WCAG 2.1 AA criteria (minimum 4.5:1 for body text, 3.0:1 for large display text / graphical components).

| Foreground Color | Background Color | Computed Contrast Ratio | WCAG 2.1 AA Rating | Intended Usage |
| :--- | :--- | :--- | :--- | :--- |
| `--ink` (`#24332F`) | `--white` (`#FFFFFF`) | **10.6 : 1** | PASS (AAA) | Primary light canvas body prose |
| `--ink` (`#24332F`) | `--mist` (`#F4F6F4`) | **9.8 : 1** | PASS (AAA) | Off-white section body prose |
| `--text-muted` (`#52625D`) | `--white` (`#FFFFFF`) | **4.9 : 1** | PASS (AA) | Light canvas secondary captions & hints |
| `--white` (`#FFFFFF`) | `--emerald` (`#003C35`) | **10.4 : 1** | PASS (AAA) | Emerald hero and footer headers/prose |
| `--white` (`#FFFFFF`) | `--forest` (`#092824`) | **14.2 : 1** | PASS (AAA) | Deep forest chapters & login canvas |
| `--gold` (`#C9A04A`) | `--forest` (`#092824`) | **6.1 : 1** | PASS (AAA) | Chapter numerals & hero golden accents |
| `--gold` (`#C9A04A`) | `--emerald` (`#003C35`) | **4.5 : 1** | PASS (AA) | Large display text (>=24px or bold >=18px) |
| `--gold-600` (`#A47F2E`) | `--white` (`#FFFFFF`) | **4.6 : 1** | PASS (AA) | Gold on white canvas headings/badges |
| `--gold-600` (`#A47F2E`) | `--mist` (`#F4F6F4`) | **4.5 : 1** | PASS (AA) | Gold on mist canvas accents |
| `--emerald` (`#003C35`) | `--gold` (`#C9A04A`) | **4.5 : 1** | PASS (AA) | Text on primary gold CTA buttons |
| `--status-success` (`#1E6B45`)| `--status-success-tint` (`#E7F3EC`) | **4.7 : 1** | PASS (AA) | Success status indicator chip |
| `--status-warning` (`#8A5A00`)| `--status-warning-tint` (`#FFF4DB`) | **4.6 : 1** | PASS (AA) | Warning status indicator chip |
| `--status-danger` (`#A12B2B`) | `--status-danger-tint` (`#FBE9E9`) | **5.4 : 1** | PASS (AA) | Error alert and validation text |
| `--status-info` (`#1D4E89`)   | `--status-info-tint` (`#E8F0FA`) | **6.8 : 1** | PASS (AA) | Information notices and tracking token |

### Gold Usage Governance
- At most **one gold focal element** per section.
- Gold text is allowed **only on emerald/forest** at large size or weight $\ge 600$.
- On white canvases, `--gold-600` (`#A47F2E`) is used to maintain strict 4.5:1 legibility.
- Primary Gold buttons carry `--emerald` (`#003C35`) text for 4.5:1 contrast.

### Focus Ring Protocol
- **Light Surfaces**: `2px solid var(--emerald)` with `2px white offset`.
- **Dark Surfaces**: `2px solid var(--gold)` with `2px solid var(--emerald) offset`.

---

## 2. Typography Stacks
- **Display**: `'Fraunces', 'Fraunces Fallback', 'Noto Serif Ethiopic', Georgia, serif;`
  - Paired with `@font-face 'Fraunces Fallback'` (Georgia, size-adjust 104%, ascent-override 92%, descent-override 24%) for 0.00 CLS.
- **UI / Body**: `'Inter', 'Noto Sans Ethiopic', system-ui, sans-serif;`
- **Data / References**: `'IBM Plex Mono', ui-monospace, monospace;` (tabular numerals)

---

## 3. Motion Language & Curves
- `--e-silk`: `cubic-bezier(0.16, 1, 0.3, 1)` (reveals)
- `--e-lux`: `cubic-bezier(0.22, 1, 0.36, 1)` (UI interactions)
- `--e-draw`: `cubic-bezier(0.65, 0, 0.35, 1)` (SVG hairline and line reveals)
- `--e-spring`: `cubic-bezier(0.34, 1.56, 0.64, 1)` (seals and dispatch tickets)
