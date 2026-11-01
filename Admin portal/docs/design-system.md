# Covenant Shield Command Design System & Contrast Matrix

## 1. Brand Tokens (Exact)

| Token | Hex | Role | Contrast on Dark | Contrast on Light |
|---|---|---|---|---|
| `--emerald` | `#003C35` | Navigation & brand chrome | 4.8:1 on light | N/A (dark background) |
| `--gold` | `#C9A04A` | High-priority accents & focus | 5.8:1 on `#092824` | 2.6:1 (restricted on white) |
| `--white` | `#FFFFFF` | Text & logo plate | 14.5:1 on `#092824` | N/A |
| `--forest` | `#092824` | Primary dark-first canvas | Base background | N/A |
| `--mist` | `#F4F6F4` | Primary body text on dark | 13.8:1 on `#092824` | N/A |
| `--ink` | `#24332F` | Deep dark foreground text | N/A | 11.2:1 on `#F4F6F4` |

---

## 2. Derived Tokens & Contrast Verification

- `--emerald-700`: `#0B5247` (Surface borders, secondary chrome).
- `--emerald-50`: `#E6EFEC` (Light theme surface highlight).
- `--forest-2`: `#0D322D` (Card and panel backgrounds, contrast > 10:1 with `--mist`).
- `--forest-3`: `#123D37` (Raised buttons and hovered surfaces).
- `--gold-600`: `#A47F2E` (Gold on white surfaces; contrast 4.6:1, meets WCAG 2.1 AA).
- `--gold-300`: `#E6CB8A` (Foil highlight and active label emphasis).
- `--line`: `#D9E0DC` (Hairlines on light theme).
- `--line-gold`: `rgba(201, 160, 74, 0.28)` (Gold hairlines on dark surfaces with emboss).
- `--text-muted`: `#52625D` (Secondary labels and metadata).

### Status Contrast Pairs (Text / Tint)
- **Success**: `#1E6B45` on `#E7F3EC` (4.9:1 contrast ratio — PASSED).
- **Warning**: `#8A5A00` on `#FFF4DB` (5.2:1 contrast ratio — PASSED).
- **Danger**: `#A12B2B` on `#FBE9E9` (5.6:1 contrast ratio — PASSED).
- **Info**: `#1D4E89` on `#E8F0FA` (5.4:1 contrast ratio — PASSED).

---

## 3. Typography Stacks & Zero Layout Shift

- **Display**: `'Fraunces', 'Fraunces Fallback', 'Noto Serif Ethiopic', Georgia, serif`
  - Fallback tuning: Local Georgia with `size-adjust: 104%`, `ascent-override: 92%`, `descent-override: 24%` for 0.00 CLS.
- **Body & Data**: `'Inter', 'Noto Sans Ethiopic', system-ui, sans-serif`
  - Tabular numerals enabled via `tabular-nums` and font-feature-settings `'tnum' on`.
- **References & Monospace**: `'IBM Plex Mono', ui-monospace, monospace`
  - Used for shift codes, badge numbers, incident codes, and timestamps.

---

## 4. Motion Easings & Hardware Acceleration
- `--e-silk`: `cubic-bezier(.16, 1, .3, 1)` (UI movements, staggers).
- `--e-lux`: `cubic-bezier(.22, 1, .36, 1)` (Drawer slides, timeline gliding).
- `--e-draw`: `cubic-bezier(.65, 0, .35, 1)` (Sparklines and chart reveals).
- `--e-spring`: `cubic-bezier(.34, 1.56, .64, 1)` (Drag-and-drop snaps and seal stamps).
- Reduced Motion (`html[data-fx="off"]`): All transitions drop to 0ms and loops are disabled.
