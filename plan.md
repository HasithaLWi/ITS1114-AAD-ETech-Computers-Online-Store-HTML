Recommended direction: “Premium Tech / Precision”

Think of brands such as high-end hardware stores, workstation manufacturers, enterprise software, and premium PC builders rather than a gaming website.

New color palette
:root {
  /* =========================================================
     ETECH COMPUTERS — PREMIUM TECH THEME
     ========================================================= */

  /* ── Brand / Primary ───────────────────────────────────── */
  --color-primary-50:  #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #172554;

  /* ── Premium Accent ────────────────────────────────────── */
  --color-accent-400: #22d3ee;
  --color-accent-500: #06b6d4;
  --color-accent-600: #0891b2;

  /* ── Backgrounds ───────────────────────────────────────── */
  --color-bg:          #080b12;
  --color-bg-soft:     #0c111b;
  --color-surface:     #101722;
  --color-surface-2:   #141c28;
  --color-surface-3:   #192332;

  /* ── Borders ────────────────────────────────────────────── */
  --color-border:      #202b3a;
  --color-border-soft: #182231;
  --color-border-hover:#34445a;

  /* ── Text ───────────────────────────────────────────────── */
  --color-text-primary:   #f4f7fb;
  --color-text-secondary: #a7b3c4;
  --color-text-muted:     #718096;
  --color-text-disabled:  #4b5565;

  /* ── Semantic ───────────────────────────────────────────── */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger:  #ef4444;
  --color-info:    #38bdf8;

  /* ── Typography ─────────────────────────────────────────── */
  --font-family-sans:
    'Plus Jakarta Sans',
    Inter,
    system-ui,
    -apple-system,
    sans-serif;

  --font-family-mono:
    'JetBrains Mono',
    'Fira Code',
    monospace;

  /* ── Font Sizes ─────────────────────────────────────────── */
  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  1.875rem;
  --text-4xl:  2.25rem;
  --text-5xl:  3rem;

  /* ── Spacing ────────────────────────────────────────────── */
  --space-1:  0.25rem;
  --space-2:  0.5rem;
  --space-3:  0.75rem;
  --space-4:  1rem;
  --space-6:  1.5rem;
  --space-8:  2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  

  /* ── More Professional Radius ──────────────────────────── */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;

  /* ── Shadows ────────────────────────────────────────────── */
  --shadow-sm:
    0 1px 2px rgba(0, 0, 0, 0.25);

  --shadow-md:
    0 4px 12px rgba(0, 0, 0, 0.28);

  --shadow-lg:
    0 12px 30px rgba(0, 0, 0, 0.35);

  --shadow-xl:
    0 20px 50px rgba(0, 0, 0, 0.45);

  /* Very subtle brand glow */
  --shadow-glow-blue:
    0 0 24px rgba(37, 99, 235, 0.18);

  --shadow-glow-cyan:
    0 0 24px rgba(6, 182, 212, 0.12);

  /* ── Transitions ────────────────────────────────────────── */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.16, 1, 0.3, 1);

  --duration-fast:   150ms;
  --duration-normal: 200ms;
  --duration-slow:   300ms;
}
The biggest visual changes I recommend
1. Stop using indigo as a second major brand color

Your current design has:

Blue → Indigo → Purple

For example:

#3b82f6
#6366f1
#4f46e5

That gradient combination is one of the things making the site feel more like a gaming dashboard.

Instead:

Blue = primary brand

Cyan = small technical accent

So:

Primary       #2563EB
Accent        #06B6D4
Background    #080B12
Surface       #101722
Border        #202B3A
Text          #F4F7FB
Muted         #718096

This gives ETech a much more mature identity.

2. Make the background almost black

Your current background is already dark, but I would make the hierarchy clearer:

body {
    background: var(--color-bg);
    color: var(--color-text-primary);
}

Then use:

Page background
#080B12

Section background
#0C111B

Card
#101722

Elevated card
#141C28

Instead of making everything look like one giant blue-black gradient.

3. Reduce the rounded-card effect

This is particularly important from your screenshots.

You have many:

border-radius: 16px;
border-radius: 20px;
border-radius: 24px;

on almost everything.

That contributes heavily to the "childish / gaming" feeling.

Use:

--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 12px;

For example:

Product card
.product-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
}

That will immediately make the catalog look more like a professional hardware marketplace.

4. Make buttons less “glowy”

Your current buttons look something like:

🔵 bright blue/purple + glow + large rounded corners

Instead:

.btn-primary {
    background: var(--color-primary-600);
    color: #fff;
    border: 1px solid var(--color-primary-500);
    border-radius: 6px;
    box-shadow: none;

    transition:
        background var(--duration-normal) var(--ease-default),
        border-color var(--duration-normal) var(--ease-default),
        transform var(--duration-fast) var(--ease-default);
}

.btn-primary:hover {
    background: var(--color-primary-500);
    border-color: var(--color-primary-400);
    transform: translateY(-1px);
}

The glow should be something users occasionally notice, not something surrounding every interactive element.

5. Use cyan very carefully

I really like cyan as ETech's technical accent.

For example:

.tech-accent {
    color: #06b6d4;
}

Use it for things like:

stock status
small icons
technical labels
specifications
selected indicators
tiny highlights
hover states

For example:

IN STOCK

could use green.

While:

PC COMPONENTS

could use cyan.

This creates a much stronger visual hierarchy.

6. Product cards should look more expensive

Your current product cards are good, but I would simplify them.

Something like:

.product-card {
    background: #101722;
    border: 1px solid #202B3A;
    border-radius: 8px;
    overflow: hidden;

    transition:
        border-color 200ms ease,
        transform 200ms ease,
        box-shadow 200ms ease;
}

.product-card:hover {
    border-color: #34445A;
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}

Notice:

No huge blue glow.

The border changes slightly and the card rises only 2px.

That's much more professional.

7. Your header can become much more premium

Your current header is good structurally.

I'd use:

.header {
    background: rgba(8, 11, 18, 0.94);
    border-bottom: 1px solid #202B3A;
    backdrop-filter: blur(16px);
}

Navigation:

.nav-link {
    color: #8F9CAF;
}

.nav-link:hover {
    color: #F4F7FB;
}

.nav-link.active {
    color: #FFFFFF;
    background: #192332;
    border: 1px solid #2A394D;
}

Rather than a large glowing blue pill around Home.

That one change would make your header considerably more mature.

8. Hero section

Your hero currently has:

Unleash Ultimate
Computing Power

The typography is good, but the blue gradient and large glowing elements push it toward gaming.

I'd keep the large typography but make the gradient much more subtle.

.hero-title {
    color: #F4F7FB;
}

.hero-title .accent {
    color: #60A5FA;
}

Or:

.hero-title .accent {
    background: linear-gradient(
        90deg,
        #60A5FA,
        #38BDF8
    );

    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

Only use the gradient on the headline, not throughout the interface.

9. Your stats should be more minimal

Currently:

100%
Genuine Hardware

24/7
Expert Tech Support

2 Years
Official Warranty

I'd make them feel more like a premium technology company:

100%
GENUINE HARDWARE

24/7
TECH SUPPORT

02 YRS
WARRANTY

Use smaller labels and stronger spacing.

10. Your catalog filter can look much better

Instead of a big rounded dark box:

.filter-panel {
    background: #0E151F;
    border: 1px solid #202B3A;
    border-radius: 8px;
}

Inputs:

input,
select {
    background: #080D15;
    border: 1px solid #253246;
    color: #F4F7FB;
    border-radius: 6px;
}

input:focus,
select:focus {
    border-color: #3B82F6;
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12);
}

That tiny focus ring is much more professional than a large glow.

11. Use a 3-level surface system

This is one of the most important changes.

Don't randomly choose dark colors for every component.

Use only three major levels:

LEVEL 1
#080B12
Page

LEVEL 2
#101722
Cards / panels

LEVEL 3
#141C28
Hover / elevated elements

Then borders separate things:

#202B3A

This creates a clean visual system.

12. Your new visual hierarchy

I would aim for approximately:

                ETECH COMPUTERS

         ┌──────────────────────────┐
         │      NAVIGATION          │
         └──────────────────────────┘

              HERO / PRODUCT

       WHITE
       LARGE HEADLINE

       Light blue accent

       Muted description

       [ PRIMARY BUTTON ]  [ Secondary ]

────────────────────────────────────────────

              SHOP BY CATEGORY

      ┌────────┐ ┌────────┐ ┌────────┐
      │        │ │        │ │        │
      │ PRODUCT│ │ PRODUCT│ │ PRODUCT│
      │        │ │        │ │        │
      └────────┘ └────────┘ └────────┘

────────────────────────────────────────────

             TRUST / SERVICES

      Express     Warranty     Secure
      Delivery    Support      Checkout

Very little visual noise.

Color usage I'd use for ETech
Purpose	Color
Main background	#080B12
Section	#0C111B
Card	#101722
Elevated card	#141C28
Border	#202B3A
Border hover	#34445A
Main text	#F4F7FB
Secondary text	#A7B3C4
Muted text	#718096
Primary blue	#2563EB
Light blue	#60A5FA
Technical cyan	#06B6D4
Success	#22C55E
Warning	#F59E0B
Error	#EF4444
The overall difference

Current ETech

Gaming / neon / futuristic / youthful

New ETech

Premium / technical / professional / trustworthy / modern

And I wouldn't completely redesign your existing UI. Your screenshots already have a good layout. I'd keep the structure, product imagery, navigation, hero concept, catalog/filter structure and footer, and primarily change the design language: colors, radii, borders, shadows, typography weight, spacing, and how much glow/gradient is used.

If you're using the CSS variables you posted throughout the site, replacing the design tokens first will let you change the overall appearance without rewriting the entire website.