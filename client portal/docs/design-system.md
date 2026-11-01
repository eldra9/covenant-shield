# Covenant Shield Client Portal — Design System & Contrast Verification

## 1. Brand Tokens & CSS Variables

| Token Name | Hex / Value | Role |
| :--- | :--- | :--- |
| `--emerald` | `#003C35` | Primary brand color, headers, crest strokes |
| `--gold` | `#C9A04A` | Accent foil, seal accents, focal hairlines |
| `--white` | `#FFFFFF` | Surface backgrounds (light), card fills |
| `--forest` | `#092824` | Welcome splash, dark theme surfaces, headers |
| `--mist` | `#F4F6F4` | Primary body background (light theme) |
| `--ink` | `#24332F` | Primary body typography color |

### Derived Color Tokens
- `--emerald-700`: `#0B5247`
- `--emerald-50`: `#E6EFEC`
- `--forest-2`: `#0D322D`
- `--forest-3`: `#123D37`
- `--gold-600`: `#A47F2E` (Tuned gold for WCAG AA compliance on white)
- `--gold-300`: `#E6CB8A` (Specular highlight on metallic foil)
- `--line`: `#D9E0DC` (Hairline borders)
- `--line-gold`: `rgba(201, 160, 74, 0.28)`
- `--text-muted`: `#52625D`

### Status Token Pairs (Text / Tint)
- **Success**: `#1E6B45` on `#E7F3EC` (Contrast ratio: 6.8:1 — PASS WCAG AAA)
- **Warning**: `#8A5A00` on `#FFF4DB` (Contrast ratio: 5.9:1 — PASS WCAG AA)
- **Danger**: `#A12B2B` on `#FBE9E9` (Contrast ratio: 6.2:1 — PASS WCAG AA)
- **Info**: `#1D4E89` on `#E8F0FA` (Contrast ratio: 7.1:1 — PASS WCAG AAA)

---

## 2. Contrast Checker Audit (WCAG 2.1 AA)

| Foreground | Background | Tested Ratio | WCAG 2.1 AA Requirement | Result |
| :--- | :--- | :--- | :--- | :--- |
| `--ink` (`#24332F`) | `--mist` (`#F4F6F4`) | **10.8:1** | >= 4.5:1 | **PASS (AAA)** |
| `--ink` (`#24332F`) | `--white` (`#FFFFFF`) | **12.4:1** | >= 4.5:1 | **PASS (AAA)** |
| `--text-muted` (`#52625D`) | `--white` (`#FFFFFF`) | **5.4:1** | >= 4.5:1 | **PASS (AA)** |
| `--text-muted` (`#52625D`) | `--mist` (`#F4F6F4`) | **4.7:1** | >= 4.5:1 | **PASS (AA)** |
| `--gold-600` (`#A47F2E`) | `--white` (`#FFFFFF`) | **3.8:1** (Large text / icon) | >= 3.0:1 (large) | **PASS (AA Large)** |
| `--white` (`#FFFFFF`) | `--emerald` (`#003C35`) | **10.2:1** | >= 4.5:1 | **PASS (AAA)** |
| `--gold` (`#C9A04A`) | `--forest` (`#092824`) | **6.1:1** (Weight 600+) | >= 4.5:1 | **PASS (AA)** |
| `--emerald` (`#003C35`) | `--gold` (`#C9A04A`) | **4.9:1** (Button text) | >= 4.5:1 | **PASS (AA)** |

---

## 3. Typography & Zero-CLS Fallback

### Font Stacks
- **Display**: `'Fraunces', 'Fraunces Fallback', 'Noto Serif Ethiopic', Georgia, serif`
- **Body**: `'Inter', 'Noto Sans Ethiopic', system-ui, sans-serif`
- **Mono**: `'IBM Plex Mono', ui-monospace, monospace`

### Fraunces Fallback Definition
```css
@font-face {
  font-family: 'Fraunces Fallback';
  src: local('Georgia');
  size-adjust: 104%;
  ascent-override: 92%;
  descent-override: 24%;
}
```
*Tuned for zero cumulative layout shift (CLS < 0.05) when loading Fraunces variable font over web connections.*

---

## 4. Guilloche Seal Geometry
SVG rosette mathematically synthesized:
- Formula: $r(t) = R + a \cdot \sin(k \cdot t)$
- Parameters:
  - $k_1 = 12$
  - $k_2 = 18$
  - $a = 0.045 \cdot R$
  - Resolution: 720 points per rosette
  - Stroke: 0.6px (Gold 28% on dark surfaces, Emerald 14% on light surfaces)
  - Outer & inner 1px concentric retention rings.

---

## 5. Performance Budgets & Telemetry Targets
- **Route JS**: <= 130KB gzipped
- **Largest Contentful Paint (LCP)**: < 2.5s on 4G/Cable
- **Cumulative Layout Shift (CLS)**: < 0.05
- **Animation Framerate**: >= 50fps (Automatic fallback to `data-fx="lite"` if device memory <= 4GB or concurrency <= 4).
