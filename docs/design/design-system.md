# Design System: PriceHive "Honey-Tech" (Refined)

## 1. Brand Essence
PriceHive transmits **Intelligence, Transparency, and Community**. The visual language is professional, clean, and data-driven, now refined for **Tranquility and Premium Feel**.

## 2. Design Tokens

### Colors (Refined Palette)
We use a sophisticated Gold and Slate palette that provides warmth without being aggressive.

| Token | HSL | HEX (Approx) | Use Case |
| :--- | :--- | :--- | :--- |
| **Primary (Gold)** | `35 45% 40%` | `#947638` | Primary Brand Color, Main Actions |
| **Primary FG** | `35 20% 98%` | `#FCFBF7` | Text on Primary |
| **Secondary (Slate)** | `215 15% 40%` | `#56657F` | Secondary actions, text |
| **Background** | `210 40% 98%` | `#F8FAFC` | App Background |
| **Accent** | `35 50% 96%` | `#FDF8F0` | Soft backgrounds, highlights |
| **Border** | `214 20% 90%` | `#E2E8F0` | Dividers, Card borders |

### Typography
- **Headings**: `Manrope` (Tracking-tight). Used for all titles to give a modern, tech-focused look.
- **Body**: `Inter`. High legibility for data and long text.
- **Data/Monospace**: `JetBrains Mono`. Used for prices, points, and numeric values.

### Radii & Shadows
- **Cards/Buttons**: `0.75rem` (12px). Soft but professional.
- **Dialogs/Modals**: `1.5rem` (24px). Premium feel.
- **Shadow (Card)**: `0 2px 8px rgba(0,0,0,0.04)` - Subtle depth.
- **Shadow (Float)**: `0 8px 30px rgba(0,0,0,0.12)` - Used for dropdowns and floating elements.

## 3. Brand Assets
### BrandMark
The PriceHive logo is a stylized hexagonal hive geometry with tech/data nodes, representing the collective intelligence of the community.

### Easter Egg
A subtle brand interaction where the BrandMark appears randomly (every 30-60s) in the bottom-right corner. Clicking it rewards the user with a positive brand message.

## 4. Components Rules
- **Buttons**: All primary buttons use the Gold primary color. Scale transitions (105%) on hover.
- **Cards**: Minimalist, white background, subtle border, and card-shadow.
- **Layout**: Fixed top navigation with a "Glass" effect (backdrop-blur) on scroll.

## 5. Accessibility
- **Contrast**: Primary gold on background meets WCAG AA for large text. High-contrast Slate-900 used for primary body text.
- **Touch Targets**: All interactive elements have a minimum height of 40px for mobile friendliness.
