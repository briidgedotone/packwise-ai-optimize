# QuantiPackAI Logo Assets

This directory contains the official QuantiPackAI logo files in various formats.

## Available Logo Files

### 1. `logo.svg` (Full Logo - Horizontal)
- **Dimensions**: 180x60px
- **Usage**: Primary logo for headers, navigation bars, landing pages
- **Contains**: Purple box icon + "QuantiPackAI" text
- **Background**: Transparent
- **Text Color**: Dark gray (#1F2937)

### 2. `logo-icon.svg` (Icon Only)
- **Dimensions**: 48x48px
- **Usage**: Favicons, app icons, social media profile pictures, compact spaces
- **Contains**: Purple box icon only (no text)
- **Background**: Purple (#767AFA)
- **Icon Color**: White

### 3. `logo-white.svg` (Full Logo - White Version)
- **Dimensions**: 180x60px
- **Usage**: Dark backgrounds, hero sections with colored backgrounds
- **Contains**: White/transparent box icon + white "QuantiPackAI" text
- **Background**: Transparent
- **Text Color**: White

## Brand Colors

- **Primary Purple**: `#767AFA`
- **Text Dark**: `#1F2937` (Gray-900)
- **White**: `#FFFFFF`

## Usage Guidelines

### Header/Navigation
```tsx
<img src="/logo.svg" alt="QuantiPackAI Logo" className="h-12" />
```

### Footer
```tsx
<img src="/logo.svg" alt="QuantiPackAI Logo" className="h-10" />
```

### Favicon
Use `logo-icon.svg` or convert to ICO/PNG formats:
- 16x16px - Browser tab
- 32x32px - Browser bookmark
- 48x48px - Desktop shortcut

### Dark Backgrounds
```tsx
<img src="/logo-white.svg" alt="QuantiPackAI Logo" className="h-12" />
```

## File Locations

All logo assets are located in the `/public/` directory and can be referenced directly:
- `/logo.svg`
- `/logo-icon.svg`
- `/logo-white.svg`

## Design Specifications

### Box Icon Design
- Isometric 3D box/package illustration
- Represents packaging optimization
- White stroke, 2px width
- Rounded corners (12px border-radius for backgrounds)

### Typography
- **Font**: Plus Jakarta Sans (Bold/700 weight)
- **Size**: 24px (in SVG coordinates)
- **Spacing**: Consistent spacing between icon and text

## Converting to Other Formats

### To PNG (using any SVG converter or browser):
1. Open SVG in browser
2. Take screenshot or use export tool
3. Recommended sizes: 48px, 96px, 192px, 512px

### To ICO (for favicon):
Use online converters or tools like:
- https://realfavicongenerator.net/
- ImageMagick: `convert logo-icon.svg -define icon:auto-resize=16,32,48 favicon.ico`

## Version History

- **v1.0** (2024) - Initial logo creation with SVG assets
