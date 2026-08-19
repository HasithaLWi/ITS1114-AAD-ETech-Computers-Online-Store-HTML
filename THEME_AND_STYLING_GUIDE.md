# ETech Computers — Design System, Theme & Styling Specification

> **Version:** 3.0 (Modern Light Precision Theme)  
> **Status:** Active Production Design Standard  
> **Primary Target:** ETech Computers Online Store & Administration Console  
> **Aesthetic Archetype:** Modern Light Hardware Storefront (Clean White, Soft Slate, Precision Royal Blue, High-Contrast Typography)

---

## 1. Executive Summary & Design Philosophy

The **ETech Computers Design System (Modern Light Edition)** delivers a clean, high-precision aesthetic engineered for high-performance hardware retail, enterprise tech procurement, and intuitive store administration.

### Core Design Principles:
1. **Pristine White & Soft Slate Canvas**: Pure `#ffffff` card surfaces, soft `#f8fafc` (slate-50) backgrounds, and subtle `#f1f5f9` (slate-100) elevated elements provide maximum clarity, high contrast, and a modern retail feel.
2. **Precision Slate Boundaries**: Crisp 1px borders (`#e2e8f0` / `#cbd5e1`) outline components without muddy or overwhelming drop shadows.
3. **Vibrant Engineering Blue CTAs**: High-contrast royal blue (`#2563eb` / `#1d4ed8`) directs user focus for primary actions, active navigation indicators, and key badges.
4. **Dual-Font Precision System**: Modern sans-serif (`Plus Jakarta Sans`) for display headlines and interface copy paired with monospaced (`JetBrains Mono`) for SKUs, price tags, cryptographic IDs, and technical specs.
5. **High-Contrast Semantic State Accents**: Emerald (`#059669`), amber (`#d97706`), and rose (`#dc2626`) pills with soft tinted backgrounds (`bg-emerald-50`, `bg-amber-50`, `bg-rose-50`) deliver instantaneous stock health and order status communication.

---

## 2. File Architecture & Styling Stack

The styling system combines CSS Custom Properties (CSS variables) for design tokens with Tailwind CSS utility classes and custom CSS components:

```
src/
├── css/
│   ├── variables.css   # Single source of truth: Light tokens, spacing, typography, shadows
│   └── global.css      # Base resets, light scrollbars, 3D carousel styles & micro-animations
index.html              # HTML5 storefront with custom Tailwind configuration script
```

* **Entry Imports**: `src/css/variables.css` is imported at the top of `src/css/global.css`, which is linked across all store views and administrative consoles.
* **Tailwind Integration**: Tailwind CDN is configured with extended font families, light surface tokens, and engineering blue color palettes.

---

## 3. Color Palette & Token Reference

### 3.1 Primary Brand Scale (Engineering Royal Blue)

The primary color scale provides the primary brand identity, call-to-action buttons, active navigation indicators, and focus states.

| Token | Hex Value | RGB | Common Usage |
| :--- | :--- | :--- | :--- |
| `--color-primary-50` | `#eff6ff` | `rgb(239, 246, 255)` | Lightest blue tints, soft pill backgrounds |
| `--color-primary-100` | `#dbeafe` | `rgb(219, 234, 254)` | Ultra-soft highlight borders |
| `--color-primary-200` | `#bfdbfe` | `rgb(191, 219, 254)` | Light accent badges |
| `--color-primary-300` | `#93c5fd` | `rgb(147, 197, 253)` | Secondary links, link hovers |
| `--color-primary-400` | `#60a5fa` | `rgb(96, 165, 250)` | Subheaders, icons, focused tags |
| `--color-primary-500` | `#3b82f6` | `rgb(59, 130, 246)` | Hover states on primary buttons, active tabs |
| **`--color-primary-600`** | **`#2563eb`** | **`rgb(37, 99, 235)`** | **Core Brand Primary, Primary CTA buttons, Badges** |
| `--color-primary-700` | `#1d4ed8` | `rgb(29, 78, 216)` | Active/Pressed button states |
| `--color-primary-800` | `#1e40af` | `rgb(30, 64, 175)` | Deep blue container accents |
| `--color-primary-900` | `#172554` | `rgb(23, 37, 84)` | Dark contrast elements |

---

### 3.2 Surface & Background Hierarchy

The light theme enforces a structured 3-level depth model that prevents visual flatness and creates structured visual layering.

```
┌────────────────────────────────────────────────────────┐
│ Level 1: Canvas Background (--color-bg: #f8fafc)       │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Level 1.5: Soft Section (--color-bg-soft: #f1f5f9)│  │
│  │                                                  │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │ Level 2: Surface Card (--color-surface)    │  │  │
│  │  │ #ffffff (Pure White)                       │  │  │
│  │  │                                            │  │  │
│  │  │  ┌──────────────────────────────────────┐  │  │  │
│  │  │  │ Level 3: Elevated (--color-surface-2)│  │  │  │
│  │  │  │ #f8fafc / #f1f5f9                    │  │  │  │
│  │  │  │                                      │  │  │  │
│  │  │  │  ┌────────────────────────────────┐  │  │  │  │
│  │  │  │  │ Level 3.5: Active/Hover Item   │  │  │  │  │
│  │  │  │  │ (--color-surface-3: #e2e8f0)   │  │  │  │  │
│  │  │  │  └────────────────────────────────┘  │  │  │  │
│  │  │  └──────────────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

| Token | Hex Value | Elevation Role | Example Components |
| :--- | :--- | :--- | :--- |
| `--color-bg` | `#f8fafc` | **Level 1 (Base Canvas)** | Main page body, hero backdrop, cart table |
| `--color-bg-soft` | `#f1f5f9` | **Level 1.5 (Soft Canvas)** | Header bar, footer container, featured sections |
| `--color-surface` | `#ffffff` | **Level 2 (Cards & Panels)** | Product cards, filter sidebars, checkout panels, modals |
| `--color-surface-2` | `#f8fafc` | **Level 3 (Elevated Surfaces)** | Input boxes, thumbnail frames, dropdown menus |
| `--color-surface-3` | `#e2e8f0` | **Level 3.5 (Active/Hover)** | Active navigation items, table row hovers, selected chips |

---

### 3.3 Precision Border System

Borders create crisp structural separation without heavy dropshadows.

| Token | Hex Value | Purpose |
| :--- | :--- | :--- |
| `--color-border` | `#e2e8f0` | Default structural border on cards, inputs, tables, dividers |
| `--color-border-soft` | `#f1f5f9` | Subtle internal card dividers, table sub-lines |
| `--color-border-hover` | `#cbd5e1` | Interactive hover state for cards, input boxes, and buttons |
| `--color-border-focus` | `#2563eb` | High-visibility focus state for inputs and keyboard navigation |

---

### 3.4 Text & Content Contrast Scale

Strict WCAG AAA/AA compliant contrast against light slate surfaces.

| Token | Hex Value | CSS Class / Role | Typical Content |
| :--- | :--- | :--- | :--- |
| `--color-text-primary` | `#0f172a` | Primary Text (Slate 900) | Headings, titles, active labels, body copy |
| `--color-text-secondary` | `#475569` | Secondary Text (Slate 600) | Subtitles, input labels, breadcrumbs, descriptions |
| `--color-text-muted` | `#64748b` | Muted Text (Slate 500) | Metadata, timestamps, placeholders, footer links |
| `--color-text-disabled` | `#94a3b8` | Disabled Text (Slate 400) | Inactive controls, disabled buttons |

---

### 3.5 Semantic Status Colors

Standardized colors used for system alerts, inventory statuses, payment verification, and stock health monitors.

| State | Text & Border Hex | Background Hex | Role & Context |
| :--- | :--- | :--- | :--- |
| **Success** | `#059669` (text-emerald-700, border-emerald-200) | `#ecfdf5` (bg-emerald-50) | In Stock (>5), Order Delivered, Active System |
| **Warning** | `#d97706` (text-amber-700, border-amber-200) | `#fffbeb` (bg-amber-50) | Low Stock (1–5), Pending Orders, Action Required |
| **Danger** | `#dc2626` (text-rose-700, border-rose-200) | `#fff1f2` (bg-rose-50) | Depleted Stock (0), Cancelled Orders, Delete Actions |
| **Info / Tech** | `#2563eb` (text-blue-700, border-blue-200) | `#eff6ff` (bg-blue-50) | Hardware Spec Badges, Category Tags, System Info |

---

## 4. Typography System

### 4.1 Font Families

| Font Family | Declaration | Role |
| :--- | :--- | :--- |
| **Sans-serif (Primary)** | `'Plus Jakarta Sans', Inter, system-ui, -apple-system, sans-serif` | All display headings, body copy, navigation, buttons, and form labels. |
| **Monospace (Technical)** | `'JetBrains Mono', 'Fira Code', monospace` | Pricing (`Rs. 250,000`), SKU IDs, Order References (`#ETC-89241`), stock counts, RAM/GPU specs, and timestamps. |

### 4.2 Typographic Hierarchy & Scale

| Token | Rem | Pixels | Recommended Weight | Example Use Case |
| :--- | :--- | :--- | :--- | :--- |
| `--text-xs` | `0.75rem` | `12px` | 600 SemiBold / 700 Bold | Badges, superheaders, table headers, captions |
| `--text-sm` | `0.875rem` | `14px` | 400 Regular / 500 Medium | Form labels, secondary body, card descriptions |
| `--text-base` | `1.0rem` | `16px` | 400 Regular / 600 SemiBold | Standard body copy, primary navigation tabs |
| `--text-lg` | `1.125rem` | `18px` | 700 Bold | Card titles, modal headers, subsection titles |
| `--text-xl` | `1.25rem` | `20px` | 700 Bold / 800 ExtraBold | Section subheaders, shopping cart totals |
| `--text-2xl` | `1.5rem` | `24px` | 800 ExtraBold | Section titles, feature headlines |
| `--text-3xl` | `1.875rem` | `30px` | 800 ExtraBold | Page titles (`Computer Hardware & Accessories`) |
| `--text-4xl` | `2.25rem` | `36px` | 800 ExtraBold | Primary marketing headlines (Tablet/Laptop) |
| `--text-5xl` | `3.0rem` | `48px` | 800 ExtraBold | Hero Banner Headline (`Built for Performance`) |

---

## 5. Spacing, Geometry & Elevation Scale

### 5.1 Spacing Scale

The layout spacing follows a 4px/8px modular scale for predictable rhythm:

| Token | Rem | Pixels | Usage |
| :--- | :--- | :--- | :--- |
| `--space-1` | `0.25rem` | `4px` | Micro gap, icon padding, badge interior |
| `--space-2` | `0.5rem` | `8px` | Small button padding, input compact padding |
| `--space-3` | `0.75rem` | `12px` | Standard button padding (vertical), gap between chips |
| `--space-4` | `1.0rem` | `16px` | Card interior padding (mobile), standard margin |
| `--space-6` | `1.5rem` | `24px` | Section gap, modal interior padding |
| `--space-8` | `2.0rem` | `32px` | Grid column spacing, container margin |
| `--space-12` | `3.0rem` | `48px` | Major section vertical padding |
| `--space-16` | `4.0rem` | `64px` | Large section separators |
| `--space-20` | `5.0rem` | `80px` | Hero section padding, top/bottom canvas padding |

---

### 5.2 Geometry & Border Radius

Precision radius ensures structural, hardware-inspired edges without bubbly rounded pill designs for cards:

| Token | Value | Applied To |
| :--- | :--- | :--- |
| `--radius-sm` | `0.25rem` (4px) | Badges, mini tags, code snippets, scrollbar thumbs |
| `--radius-md` | `0.375rem` (6px) | Form inputs, select dropdowns, secondary buttons |
| `--radius-lg` | `0.5rem` (8px) | Product cards, category cards, modal windows, sidebars |
| `--radius-xl` | `0.75rem` (12px) | Feature callout banners, hero layered cards |
| `--radius-2xl` | `1.0rem` (16px) | Full-screen promotional overlays, large hero frames |
| `--radius-full` | `9999px` | Notification counter badges, avatar circles, FAB button |

---

### 5.3 Elevation & Soft Shadow Scale

Shadows are calibrated for modern light theme aesthetics with subtle elevation and soft ambient occlusion:

| Token | Value | Visual Purpose |
| :--- | :--- | :--- |
| `--shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.05)` | Micro elevation for badges and compact chips |
| `--shadow-md` | `0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05)` | Default card elevation and button rest state |
| `--shadow-lg` | `0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)` | Elevated cards, sticky sidebars, dropdown menus |
| `--shadow-xl` | `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)` | Modals, floating chatbot panel, 3D center card |
| `--shadow-glow-blue` | `0 0 20px rgba(37, 99, 235, 0.12)` | Hover state on primary cards and active focal points |
| `--shadow-glow-cyan` | `0 0 20px rgba(6, 182, 212, 0.10)` | AI Advisor active state, special promotional cards |

---

## 6. Motion, Transitions & Micro-Animations

### 6.1 Transition Curves & Timing

```css
:root {
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce:  cubic-bezier(0.16, 1, 0.3, 1);

  --duration-fast:   150ms; /* Color changes, hover borders, opacity */
  --duration-normal: 200ms; /* Dropdown slide, modal fades, tab transitions */
  --duration-slow:   300ms; /* Drawer expands, hero 3D carousel motion */
}
```

### 6.2 Keyframe Animations

#### 1. Pulse Animation (`et-pulse`)
Used for the floating chatbot launcher (FAB) and live online system status indicators:
```css
@keyframes et-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.35);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(37, 99, 235, 0);
  }
}
```

#### 2. Chatbot Typing Dots (`et-dot`)
Used in the AI Tech Assistant message stream while waiting for responses:
```css
@keyframes et-dot {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
```

#### 3. Sliding Active Tab Underline
Precision horizontal underline bar that animates smoothly between active navigation tabs:
```css
.nav-tab-btn::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 14px;
  right: 14px;
  height: 2.5px;
  background-color: #2563eb;
  border-radius: 2px 2px 0 0;
  opacity: 0;
  transform: scaleX(0.7);
  transition: opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
}
.nav-tab-btn.active::after {
  opacity: 1 !important;
  transform: scaleX(1) !important;
  background-color: #2563eb !important;
}
```

---

## 7. Component Styling Specifications

### 7.1 Navigation Header
* **Backdrop**: `bg-white/95 backdrop-blur-md`
* **Border**: `border-b border-[#e2e8f0]`
* **Height**: `h-20` (80px)
* **Active Indicator**: Royal blue underline with scale-x transition.
* **Cart Badge**: `bg-blue-600 text-white font-extrabold text-[10px] ring-2 ring-white rounded-full`

---

### 7.2 Buttons & Action Controls

| Button Variant | Classes & Styles | Usage |
| :--- | :--- | :--- |
| **Primary Action (Solid Blue)** | `bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg px-4 py-2 text-xs transition-all shadow-sm` | "Explore Catalog", "Checkout", "Save Product" |
| **Secondary / Ghost Surface** | `bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0f172a] font-semibold rounded-lg px-4 py-2 text-xs border border-[#e2e8f0] hover:border-[#cbd5e1] transition-all shadow-sm` | "View Hot Deals", "Reset Filters", "Cancel" |
| **Elevated Action** | `bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 font-bold rounded-md px-3 py-2 border border-blue-200 shadow-sm` | "Edit Profile", "Apply Coupon", "Filters" |
| **Danger / Destructive** | `bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-md px-3 py-2 shadow-sm` | "Delete Item", "Sign Out Account", "Clear Cart" |

---

### 7.3 Form Inputs & Focus States
All inputs share a dedicated focus style:
```css
input:focus,
select:focus,
textarea:focus {
  outline: none !important;
  border-color: #2563eb !important;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2) !important;
}
```
* **Base Input**: `bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] placeholder-[#94a3b8] rounded-md px-3.5 py-2.5 text-sm`

---

### 7.4 Product Cards & Grid Units
* **Container**: `bg-white border border-[#e2e8f0] rounded-lg p-4 transition-all duration-200 hover:border-[#cbd5e1] hover:-translate-y-1 hover:shadow-md flex flex-col justify-between`
* **Image Canvas**: `bg-[#f8fafc] border border-[#e2e8f0] rounded-md overflow-hidden aspect-video flex items-center justify-center`
* **Price Tag**: `font-mono font-extrabold text-[#0f172a] text-base`
* **Category Tag**: `text-[10px] font-mono uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold`

---

### 7.5 Hero 3D Layered Carousel
The 3-Card 3D hero carousel presents featured hardware in an overlapping isometric depth layout:

* **Left Card (`.card-3d-left`)**: `transform: translate3d(-20%, 0, 0) scale(0.88); opacity: 0.55; z-index: 10;`
* **Center Card (`.card-3d-center`)**: `transform: translate3d(0, 0, 0) scale(1); opacity: 1; z-index: 30; box-shadow: 0 16px 36px rgba(0,0,0,0.12);`
* **Right Card (`.card-3d-right`)**: `transform: translate3d(20%, 0, 0) scale(0.88); opacity: 0.55; z-index: 10;`
* **Hover Interaction**: Center card lifts (`translate3d(0, -3px, 0) scale(1.01)`) with soft blue ambient glow (`0 0 20px rgba(37, 99, 235, 0.12)`).

---

### 7.6 Admin Management Console & Sidebar
* **Layout**: Full-height responsive layout with collapsible sidebar.
* **Collapsed Mode (`.sidebar-force-collapsed`)**: Compact 72px (`4.5rem`) icon-only width with floating hover tooltips:
  ```css
  .sidebar-tooltip {
    background-color: #ffffff;
    color: #0f172a;
    font-size: 11px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.12), 0 0 12px rgba(37,99,235,0.08);
  }
  ```
* **Expanded Mode (`.sidebar-force-expanded`)**: Full 256px (`16rem`) sidebar displaying icon + descriptive labels.
* **Data Tables**: `bg-white` container, `border-[#e2e8f0]` cell dividers, `hover:bg-[#f8fafc]` row highlight, `text-[#0f172a]` table data, `text-xs font-mono` for IDs and pricing.

---

### 7.7 E-T AI Chatbot Widget
* **FAB Button**: Fixed 52px circle (`bottom-6 right-6`), `bg-blue-600`, pulsing ring animation (`et-pulse`), toggle icon animation.
* **Chat Panel**: `w-[380px] max-h-[560px] bg-white border border-[#e2e8f0] rounded-lg shadow-2xl`
* **Header**: `bg-[#f8fafc] border-b border-[#e2e8f0]` with online status dot (`bg-emerald-500`).
* **Message Bubbles**:
  * **User**: `bg-blue-600 text-white rounded-2xl rounded-tr-sm self-end`
  * **AI Assistant**: `bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] rounded-2xl rounded-tl-sm self-start`
* **Quick Suggestions**: `bg-[#f8fafc] hover:bg-[#f1f5f9] text-blue-700 text-xs px-2.5 py-1 rounded-full border border-blue-200 font-semibold`

---

### 7.8 Precision Scrollbar
Discrete, modern scrollbars across all scrollable viewports:
```css
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #f8fafc;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
```

---

## 8. Responsive Breakpoints & Device Adaptation

| Breakpoint Prefix | Min Width | Target Devices | Layout Behavior |
| :--- | :--- | :--- | :--- |
| *(default)* | `< 640px` | Mobile Phones (Portrait) | Single column grid, mobile navigation drawer, full-screen chatbot panel (`100vw`, `100vh`). |
| `sm:` | `640px` | Large Phones / Small Tablets | 2-column product grids, inline trust badges. |
| `md:` | `768px` | Tablets (Portrait/Landscape) | Persistent horizontal nav bar opens, multi-column footer. |
| `lg:` | `1024px` | Laptops / Small Desktops | 3-column or 4-column product grids, persistent sticky filter sidebar, 2-column checkout. |
| `xl:` | `1280px` | High-Resolution Desktops | Maximum container width constrained (`container mx-auto`), optimal viewing density. |

---

## 9. Tailwind CSS Configuration Reference

The Tailwind configuration script embedded in `index.html` extends default Tailwind utility classes:

```javascript
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#172554',
        },
        accent: {
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        dark: {
          bg: '#f8fafc',
          soft: '#f1f5f9',
          surface: '#ffffff',
          elevated: '#f8fafc',
          active: '#e2e8f0',
          border: '#e2e8f0',
          'border-soft': '#f1f5f9',
          'border-hover': '#cbd5e1',
          text: '#0f172a',
          secondary: '#475569',
          muted: '#64748b',
        }
      }
    }
  }
}
```

---

## 10. Reusable Code Templates & Snippets

### Snippet A: Product Card
```html
<div class="bg-white border border-[#e2e8f0] rounded-lg p-4 hover:border-[#cbd5e1] hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between group shadow-sm">
  <div>
    <!-- Image Canvas -->
    <div class="relative bg-[#f8fafc] border border-[#e2e8f0] rounded-md overflow-hidden aspect-video flex items-center justify-center mb-3">
      <img src="public/images/products/sample.png" alt="Hardware Name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
      <span class="absolute top-2 left-2 text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
        Graphics Cards
      </span>
    </div>

    <!-- Title & Specs -->
    <h3 class="text-sm font-bold text-[#0f172a] group-hover:text-blue-600 transition-colors line-clamp-1">
      NVIDIA GeForce RTX 4080 Super 16GB
    </h3>
    <p class="text-xs text-[#64748b] mt-1 line-clamp-2">
      Ada Lovelace architecture with DLSS 3 & full ray-tracing support.
    </p>
  </div>

  <!-- Price & CTA -->
  <div class="mt-4 pt-3 border-t border-[#e2e8f0] flex items-center justify-between">
    <div class="flex flex-col">
      <span class="text-[10px] uppercase text-[#64748b] font-medium">Price</span>
      <span class="font-mono font-bold text-base text-[#0f172a]">Rs. 385,000</span>
    </div>
    <button class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-md shadow-sm transition-all flex items-center space-x-1">
      <span>Add to Cart</span>
    </button>
  </div>
</div>
```

---

### Snippet B: Status Badge System
```html
<!-- In Stock / Success -->
<span class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
  <span>In Stock (14 units)</span>
</span>

<!-- Low Stock / Warning -->
<span class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
  <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
  <span>Low Stock (2 units left)</span>
</span>

<!-- Out of Stock / Danger -->
<span class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
  <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
  <span>Out of Stock</span>
</span>
```

---

### Snippet C: Standard Form Input Field
```html
<div class="space-y-1.5">
  <label class="block text-xs font-bold text-[#475569] uppercase tracking-wider">
    Product Name <span class="text-blue-600">*</span>
  </label>
  <input 
    type="text" 
    placeholder="e.g. Corsair Vengeance 32GB DDR5"
    class="w-full px-3.5 py-2.5 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] placeholder-[#94a3b8] text-sm focus:border-blue-600 transition-colors"
    required
  >
  <span class="text-[11px] text-[#64748b]">Include brand, model, and primary specification.</span>
</div>
```

---

## 11. Maintenance & Best Practices

1. **Always Use Established CSS Variables**: Avoid creating one-off hardcoded colors or ad-hoc border colors. Always reference `var(--color-...)` or standard Tailwind classes mapped to the palette.
2. **Monospace for Data & Numbers**: Always use `font-mono` (`--font-family-mono`) for currency values, SKU IDs, order numbers, IP addresses, dates, and technical capacities (RAM/GB/MHz/Watts).
3. **Preserve the Light Hierarchy**: Ensure modals sit on `--color-surface` (`#ffffff`), elevated child dropdowns on `--color-surface-2` (`#f8fafc`), and main page backgrounds on `--color-bg` (`#f8fafc`).
4. **Maintain Contrast Ratios**: Ensure all text elements meet WCAG AAA/AA standards by pairing Slate-900 / Slate-600 typography with white / slate-50 backgrounds.
