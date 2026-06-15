---
name: Agricultural Growth & Trust
colors:
  surface: '#fbf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ee'
  surface-container: '#f0eee9'
  surface-container-high: '#eae8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#414943'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#717973'
  outline-variant: '#c0c9c1'
  surface-tint: '#396851'
  primary: '#003421'
  on-primary: '#ffffff'
  primary-container: '#1b4b36'
  on-primary-container: '#89ba9f'
  inverse-primary: '#9fd2b6'
  secondary: '#765a05'
  on-secondary: '#ffffff'
  secondary-container: '#ffd87c'
  on-secondary-container: '#795d08'
  tertiary: '#452406'
  on-tertiary: '#ffffff'
  tertiary-container: '#60391a'
  on-tertiary-container: '#daa47c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bbeed1'
  primary-fixed-dim: '#9fd2b6'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#204f3a'
  secondary-fixed: '#ffdf96'
  secondary-fixed-dim: '#e7c268'
  on-secondary-fixed: '#251a00'
  on-secondary-fixed-variant: '#5a4400'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#f4bb92'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#653d1e'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
typography:
  headline-lg:
    fontFamily: Lexend
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Lexend
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-sm:
    fontFamily: Lexend
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Lexend
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The design system is anchored in the concept of "Digital Stewardship"—merging the precision of modern technology with the grounded, organic reliability of agriculture. The brand personality is professional and authoritative, yet remains deeply accessible to a diverse user base, including those in rural environments.

The visual style follows a **Modern-Earthy** approach. It utilizes expansive whitespace to reduce cognitive load and emphasizes high-contrast elements to ensure readability in high-glare outdoor conditions. The aesthetic avoids cold, clinical tech tropes in favor of warm neutrals and organic geometry, creating an emotional response of security, growth, and partnership.

## Colors

The palette is derived from the natural lifecycle of crops. 
- **Primary (Forest Green):** Represents stability, health, and established growth. Used for key actions and primary branding.
- **Secondary (Wheat Yellow):** Evokes harvest and optimism. Used sparingly for highlights, warnings, or secondary call-to-actions to ensure high visibility.
- **Tertiary (Terra Cotta):** A grounding earth tone used for accents and data visualization categories.
- **Neutral (Warm Linen):** A soft, off-white base that reduces eye strain compared to pure white, providing a comfortable canvas for long-form reading.

Success, Error, and Warning states should be slightly desaturated to remain harmonious with the earthy palette while maintaining clear functional communication.

## Typography

The design system utilizes **Lexend** across all levels. Lexend was specifically engineered to reduce visual stress and improve reading speed, making it the ideal choice for an accessible agricultural platform.

Large font sizes and generous line heights are prioritized to accommodate users who may be viewing the interface on varying device qualities. Headlines use a heavier weight and tighter letter spacing to establish a strong hierarchical anchor, while body text maintains a rhythmic leading to ensure legibility during extended periods of technical reading.

## Layout & Spacing

This design system employs a **Fluid Grid** model based on an 8px spacing rhythm. The layout is designed to breathe, utilizing "generous whitespace" to separate distinct content blocks, which prevents the UI from feeling cluttered or overwhelming.

- **Mobile:** 4-column grid with 16px side margins and 16px gutters.
- **Tablet:** 8-column grid with 32px side margins and 24px gutters.
- **Desktop:** 12-column grid with a maximum content width of 1280px to prevent excessive line lengths.

Touch targets for all interactive elements must be a minimum of 48x48px to ensure ease of use for manual laborers or those using devices in motion.

## Elevation & Depth

To maintain the "Modern yet Earthy" aesthetic, depth is communicated through **Tonal Layers** supplemented by soft, ambient shadows. 

Backgrounds utilize the neutral Linen tone, while interactive cards and containers sit on a pure white surface to create a subtle lift. Shadows are intentionally diffused and low-opacity, using a hint of the Primary Green in the shadow's tint to avoid a "dirty" grey appearance. This creates a tactile, paper-like stacking effect that feels physical and trustworthy rather than overly digital.

## Shapes

The shape language is defined by **Rounded (0.5rem)** corners. This curvature softens the professional tone, making the platform feel more approachable and "friendly." 

- **Standard Elements:** 8px (0.5rem) radius for buttons and input fields.
- **Containers/Cards:** 16px (1rem) radius to define major content areas.
- **Icons:** Should feature rounded terminals and soft joins to match the typographic character of Lexend.

Avoid sharp 90-degree angles to maintain the organic, growth-oriented theme.

## Components

### Buttons
Primary buttons use the Forest Green background with white text for maximum contrast. Secondary buttons use a thick 2px border in Forest Green with a transparent background. All buttons feature high-padding (min 16px horizontal) to create a substantial, "clickable" feel.

### Cards
Cards are the primary vehicle for information. They should have a subtle 1px border in a darkened neutral shade and a soft shadow on hover. Padding inside cards is generous (24px) to ensure content never feels cramped.

### Input Fields
Inputs use a warm-grey background with a clear 2px bottom border that transitions to Forest Green on focus. Labels always remain visible above the field to assist with cognitive clarity.

### Chips & Tags
Used for crop types or status indicators. These use the Secondary Wheat Yellow or Tertiary Terra Cotta with high-contrast dark text to ensure they pop against the neutral background.

### Lists
Lists should feature high-density information but with clear dividers. Use "Chevron" trailing icons to indicate drill-down actions, ensuring the interactive path is always obvious.