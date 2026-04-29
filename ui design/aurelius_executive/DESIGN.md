# Design System Strategy: The Architectural Ledger

This design system is built to transform the utility-heavy nature of a mobile CRM into a high-end editorial experience. We are moving away from the "grid of boxes" and toward a philosophy called **The Architectural Ledger**. 

Our Creative North Star focuses on **intentional asymmetry** and **tonal depth**. We treat the mobile screen not as a flat canvas, but as a series of layered, physical materials—fine paper, frosted glass, and heavy stone. By utilizing generous whitespace and high-contrast typography scales, we create a sense of calm authority and professional trust.

---

### 1. Color Strategy & The "No-Line" Rule

The palette is rooted in deep emeralds (`primary: #00453e`) and sophisticated neutrals. To maintain a premium feel, we strictly adhere to the following logic:

#### The "No-Line" Rule
Standard UI relies on 1px borders to separate content. **In this design system, 1px solid borders are prohibited for sectioning.** Boundaries must be defined solely through background color shifts.
- **Sectioning:** Use `surface-container-low` (#f3f3f6) for the main background and `surface-container-lowest` (#ffffff) for interactive cards. 
- **Definition:** The eye should perceive the end of a container by the change in tone, not a "stroke."

#### Surface Hierarchy & Nesting
Treat the UI as nested layers. To create a "pop-out" effect for a customer card:
1. **Base Layer:** `surface` (#f9f9fc)
2. **Content Area:** `surface-container-low` (#f3f3f6)
3. **Interactive Component:** `surface-container-lowest` (#ffffff)
This hierarchy creates natural depth without visual clutter.

#### The "Glass & Gradient" Rule
To elevate the experience beyond a standard template:
- **Floating Elements:** Use `surface` at 80% opacity with a `backdrop-blur` of 20px for top navigation bars or bottom sheets.
- **Signature Textures:** For high-value actions (e.g., "Close Deal"), use a subtle linear gradient from `primary` (#00453e) to `primary_container` (#005f56) at a 45-degree angle. This provides "soul" and visual weight that flat fills lack.

---

### 2. Typography: The Editorial Voice

We use **Manrope** across the entire system. Its geometric yet slightly humanist character conveys modernism and reliability.

- **The Power of Scale:** Use `display-lg` (3.5rem) for high-impact numbers (e.g., Monthly Revenue). Large typography serves as a visual anchor, allowing us to remove bulky icons.
- **Visual Rhythm:** 
    - **Headlines:** Use `headline-lg` for screen titles, but pair it with generous top padding (48px+) to let the title "breathe."
    - **Labels:** `label-md` should be used for metadata. To add a premium touch, apply a 5-10% letter-spacing (tracking) to labels to mimic high-end print design.
- **Contrast as Hierarchy:** Instead of making text bigger to show importance, toggle between `on_surface` (#1a1c1e) for primary data and `on_surface_variant` (#3f4947) for secondary details.

---

### 3. Elevation & Depth: Tonal Layering

Traditional "drop shadows" are often a crutch for poor layout. We achieve hierarchy through **Tonal Layering**.

- **The Layering Principle:** Depth is achieved by stacking `surface-container` tiers. A card doesn't need a shadow if it is `#ffffff` sitting on a `#f3f3f6` background.
- **Ambient Shadows:** When a shadow is required (e.g., for a floating action button), use a "Long-Tail Shadow." 
    - **Color:** Use a tinted shadow (e.g., `on_surface` at 6% opacity).
    - **Blur:** High diffusion (24px to 40px) with a subtle Y-offset (8px). Never use pure black shadows.
- **The "Ghost Border" Fallback:** If a layout requires a container on an identical background (rare), use a **Ghost Border**. Apply `outline_variant` (#bec9c6) at 15% opacity. It should be felt, not seen.

---

### 4. Components

#### Buttons
- **Primary:** Filled with `primary` (#00453e). Use `md` (0.375rem) roundedness. No shadow.
- **Secondary:** `surface-container-high` (#e8e8ea) fill with `on_surface` text.
- **Tertiary:** Text-only using `primary` color, but with a 12px horizontal padding to maintain a clear "tap target" feel without a box.

#### Input Fields
- **Style:** Minimalist. No enclosing box. Use a 1px `outline_variant` line *only* at the bottom. 
- **States:** On focus, the bottom line transitions to `primary` (#00453e) and thickens to 2px. The label should animate to a `label-sm` position above the value.

#### Cards & Lists
- **The Divider Ban:** Never use horizontal lines to separate list items. Use **Vertical Spacing Scale**. 
- **List Items:** Separate items by 16px of whitespace. Use a subtle `surface-container-low` background on hover or press.
- **CRM Context (The "Contact Card"):** Use an asymmetrical layout. Place the contact's initials in a large `display-sm` type on the left, with details stacked on the right. This breaks the "standard" list look.

#### Status Chips
- Use `primary_fixed` (#a6f1e4) for positive states (e.g., "Lead Qualified") and `error_container` (#ffdad6) for high-risk states. Keep the text `on_primary_fixed_variant` (#005048) to maintain high-end legibility.

---

### 5. Do's and Don'ts

#### Do
- **Do** use whitespace as a structural element. If a screen feels "busy," increase the padding rather than adding a border.
- **Do** use "Optical Alignment." Sometimes a label looks better shifted 1px to the left to align with a heavy headline's vertical stem.
- **Do** use Glassmorphism for overlays to keep the user grounded in the CRM's data-rich environment.

#### Don't
- **Don't** use 100% black (#000000) for text. Use `on_surface` (#1a1c1e) to keep the contrast sophisticated, not jarring.
- **Don't** use standard "Material Design" ripples for touch feedback. Use a subtle opacity shift or a tonal change (e.g., from `surface` to `surface-dim`).
- **Don't** crowd the edges. Maintain a minimum of 24px horizontal margin on all mobile screens to frame the content like an editorial layout.