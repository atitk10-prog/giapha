# Neumorphic Trading UI Design System

This document captures the exact CSS variables and design tokens for the pixel-perfect "Neumorphic Trading Terminal" style. Use these values when applying a neumorphic look to trading dashboards, charts, and dark-mode data interfaces.

## Color Palette & Shadows

### Dark Mode (Base)
- **Background (`--nm-bg`)**: `#2b3035` (Warm deep gray, preferred over purple-tinted darks)
- **Shadow Dark**: `#202428` (Solid color, avoid rgba for deeper effect)
- **Shadow Light**: `#363c42` (Solid color)
- **Text Primary**: `#e2e8f0`
- **Text Secondary**: `#cbd5e0`
- **Chart Grid**: `rgba(255,255,255,0.08)`

### Light Mode (Base)
- **Background (`--nm-bg`)**: `#e0e5ec` (Classic neumorphic gray)
- **Shadow Dark**: `#a3b1c6`
- **Shadow Light**: `#ffffff`
- **Text Primary**: `#4a5568`
- **Text Secondary**: `#718096`
- **Chart Grid**: `rgba(163,177,198,0.2)`

## Trading Specific Tokens

- **Bullish / Up Candle**: `#00b894` (Teal/Mint green)
- **Bearish / Down Candle**: `#d63031` (Deep red)
- **Neutral**: `#fdcb6e` (Warm yellow/gold)
- **Chart Background**: `transparent` (Always let the neumorphic surface show through)
- **Volume Up**: `rgba(0,184,148,0.20)`
- **Volume Down**: `rgba(214,48,49,0.20)`

## Neumorphic Shadow Effects

Use these exact box-shadow values for authentic depth:

```css
/* Standard Button / Card */
--nm-raised: 8px 8px 16px var(--nm-shadow-dark), -8px -8px 16px var(--nm-shadow-light);

/* Deep Card (Modals, Large Containers) */
--nm-raised-lg: 20px 20px 60px var(--nm-shadow-dark), -20px -20px 60px var(--nm-shadow-light);

/* Pressed / Inset Button */
--nm-pressed: inset 6px 6px 12px var(--nm-shadow-dark), inset -6px -6px 12px var(--nm-shadow-light);

/* Deep Inset (Chart Containers) */
--nm-pressed-deep: inset 8px 8px 16px var(--nm-shadow-dark), inset -8px -8px 16px var(--nm-shadow-light);
```

## Border Radius Standards

- **Modal Cards**: `30px`
- **Chart Containers**: `20px`
- **Buttons & Small Elements**: `12px`

## Implementation Details

### The "Deep Chart" Effect (Canvas under shadow)
To make a canvas (like Lightweight Charts) sit perfectly *under* the neumorphic inset shadow without being padded away from it, use a `::after` pseudo-element over the container:

```css
.chart-container {
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  /* NO padding */
}

/* Shadow applied on top of the chart canvas */
.chart-container::after {
  content: '';
  position: absolute;
  inset: 0;
  box-shadow: var(--nm-pressed-deep);
  pointer-events: none; /* Let clicks pass through to chart */
  border-radius: inherit;
  z-index: 10;
}
```

### Hiding Scrollbars
For trading terminals, hide scrollbars to maintain the clean neumorphic illusion:
```css
*::-webkit-scrollbar { display: none; }
* { -ms-overflow-style: none; scrollbar-width: none; }
```
