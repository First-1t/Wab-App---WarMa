---
name: WarMa
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3e4a3d'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6e7b6c'
  outline-variant: '#bdcaba'
  surface-tint: '#006e2d'
  primary: '#006b2c'
  on-primary: '#ffffff'
  primary-container: '#00873a'
  on-primary-container: '#f7fff2'
  inverse-primary: '#62df7d'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#8d4b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#b15f00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#7ffc97'
  primary-fixed-dim: '#62df7d'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005320'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

The brand personality balances agronomic precision with grounded rural warmth. Designed specifically for Thai cassava growers operating in varied outdoor environments, the visual character avoids cold enterprise abstraction in favor of high-legibility, tactical clarity and calm reassurance. 

The aesthetic is a hybrid of Modern Functional Utility and Tactile Clarity:
- **Outdoor Legibility:** High contrast, deliberate color hierarchy, and solid containment ensure effortless viewing under direct sunlight and high ambient field glare.
- **Agricultural Tactility:** Soft, purposeful surface elevations layered over warm, earthy neutrals establish an approachable, natural context without falling into rustic clutter.
- **Information Density Control:** Essential data (soil moisture, rainfall forecasts, irrigation timelines) is presented via glanceable step cards, dial-like radial gauges, and crisp pill markers that minimize cognitive load during active field operations.

## Colors

The color palette reflects the lifecycle of cassava production: lush foliage, controlled water flow, fertile earth, and actionable weather warnings.

- **Primary (`#16A34A` / Deep Emerald `#15803D`):** Represents crop vitality and optimal farm conditions. Used for key interactive actions, healthy state readouts, and primary navigation elements.
- **Secondary (`#0284C7` / Hydration Cyan `#E0F2FE`):** Direct visual metaphor for water resources, rain metrics, and irrigation schedules. Serves as functional counterpoints to vegetative green.
- **Tertiary / Warning (`#D97706` / Amber Soft `#FEF3C7`):** Critical for drought risk, pest alerts, and maintenance warnings. Demands attention without triggering unwarranted alarm.
- **Neutral Foundations:** Core surfaces rely on clean white (`#FFFFFF`) card containers floating atop a soil-slate tinted canvas (`#F8FAFC`), with contextual warnings accented by warm cream (`#FEFCE8`). Deep slate (`#0F172A`) and balanced slate-600 (`#475569`) replace pure black to maintain natural contrast and reduce eye fatigue.

## Typography

Typographic scale prioritizes immediate legibility, generous vertical spacing, and structural clarity for outdoor visibility. Plus Jakarta Sans provides geometric balance and open counters that match seamlessly with clean modern Thai scripts (such as Prompt and Sarabun) when localized.

- **Numerics & Readouts:** Numeric data within irrigation timers, moisture percentages, and rainfall indicators use semi-bold and bold weights with tabular figure alignments to preserve column balance.
- **Headlines:** Display and headline tiers maintain tight line spacing to group complex agronomic terms and status updates into digestible chunks.
- **Labels & Microcopy:** High-contrast label styles ensure small units of measurement (`mm`, `m³/rai`, `% RH`) are instantly recognizable at arm’s length.

## Layout & Spacing

The layout philosophy follows a mobile-first fluid approach anchored by safe margins for one-handed thumb interaction. 

- **Grid Architecture:** 
  - **Mobile (<640px):** 4-column layout with `1rem` margins and `1rem` gutters. Touch targets for high-frequency actions never drop below 48px in height.
  - **Tablet (640px–1024px):** 8-column layout with `1.5rem` margins and `1rem` gutters, enabling split view between weather timelines and field-level sensor metrics.
  - **Desktop (>1024px):** 12-column layout maxing out at `1200px` container width, centering the operations dashboard while preserving card modularity.
- **Vertical Rhythm:** Components use an incremental spacing rhythm. Internal card groupings stay tight (`0.5rem` to `0.75rem`), while discrete agricultural advisory cards and timeline stages use `1.25rem` spacing to maintain visual independence.

## Elevation & Depth

To preserve legibility under direct sunlight, the design system minimizes deep, blurry shadows in favor of crisp, low-contrast boundary borders and soft ambient drops.

- **Base Layer (Level 0):** Canvas background (`#F8FAFC`), completely flat.
- **Content Surfaces (Level 1):** Primary cards and panels utilize solid `#FFFFFF` backgrounds bound by a fine structural border (`1px solid #E2E8F0`) paired with an ultra-soft ambient shadow (`0 2px 4px -1px rgba(15, 23, 42, 0.04), 0 4px 6px -1px rgba(15, 23, 42, 0.02)`).
- **Floating Controls & Modals (Level 2):** Quick-action irrigation triggers, sticky bottom navigation, and warning sheets elevate cleanly (`0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`) with borders shifting to `#CBD5E1`.
- **Active State Highlights:** Selected cards swap structural gray borders for a vibrant `2px solid #16A34A` outline accompanied by an ambient green-tinted halo (`0 0 0 3px rgba(22, 163, 74, 0.15)`).

## Shapes

A balanced `roundedness: 2` (base `0.5rem` / 8px) anchors the design system, balancing structured engineering precision with biological softness.

- **Primary Cards & Containers:** Styled with `rounded-lg` (`1rem` / 16px) to frame complex multi-metric field data cleanly without harsh visual edges.
- **Interactive Controls (Inputs, Standard Buttons):** Styled with base `0.5rem` (8px) corner radii to present defined, pressable tactile targets.
- **Status Badges & Quick Chips:** Use complete pill styling (`rounded-full` / 9999px) to establish visual contrast against rectangular card layouts, reinforcing their role as discrete metadata tokens.

## Components

### Buttons & Quick Actions
- **Primary Action (Irrigate, Confirm):** Solid `#16A34A` background with `#FFFFFF` text. Minimum height `48px`. On active state, shifts to `#15803D`.
- **Secondary Water Action (Schedule Water, Log Rain):** `#E0F2FE` background with `#0284C7` text and border `1px solid rgba(2, 132, 199, 0.2)`.
- **Destructive/Halt:** Tinted amber background (`#FEF3C7`) with `#D97706` text for temporary holds or alert acknowledgments.

### Chips & Status Pills
- Compact, fully rounded elements (`rounded-full`) with `space-xs` vertical and `space-md` horizontal padding.
- **Hydrated/Optimal:** `#DCFCE7` background, `#15803D` bold text.
- **Water Deficit/Low Moisture:** `#FEF3C7` background, `#B45309` bold text.
- **Rain Impending:** `#E0F2FE` background, `#0369A1` bold text.

### Metric Gauges (Soil Moisture & Water Level)
- Circular and semi-circular radial indicators featuring an unsegmented track (`#E2E8F0`, stroke width 8px) and an active indicator stroke filled with `#0284C7` or `#16A34A`.
- Large centered metric readouts (`display-lg-mobile`) paired directly with sub-label text (`label-md`) indicating safety thresholds (e.g., "Optimal: 60-70%").

### Timeline Step Cards (Planting to Harvest Water Cycle)
- Segmented vertical or horizontal progressive cards connected by a `2px` dashed track line (`#CBD5E1`), turning solid `#16A34A` upon milestone completion.
- Each card contains an operational phase header, recommended irrigation amount (`m³/rai`), and an inline pill indicator highlighting current status (e.g., "Tuber Bulking Phase").

### Input Fields & Controls
- Checkboxes and radio buttons feature expanded hitboxes (`44x44px` minimum) with solid green checkmarks on selection.
- Text input fields use solid `#FFFFFF` backgrounds, `1px solid #CBD5E1` borders, and generous `space-md` padding to ensure ease of manual input with field-gloved or damp hands.