ETech Computers — Homepage Design Architecture
1. Overall page structure
┌──────────────────────────────────────────────────────────────┐
│ Announcement / Utility Bar                                  │
├──────────────────────────────────────────────────────────────┤
│ Main Header                                                  │
│ Logo | Search | Wishlist | Cart | Account | Admin Console   │
├──────────────────────────────────────────────────────────────┤
│ Primary Navigation                                           │
│ Home | Shop | Deals | Build PC | Brands | Support | About  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ HERO SECTION                                                 │
│                                                              │
│ Text / CTA                         Product Showcase          │
│                                                              │
│ "Built for Performance."          PC + GPU + Laptop         │
│ "Designed for You."               + Product Carousel        │
│                                                              │
│ Trust Indicators                                             │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ SERVICE / TRUST STRIP                                       │
│ Delivery | Warranty | Secure Checkout | Tech Advice         │
├──────────────────────────────────────────────────────────────┤
│ SHOP BY CATEGORY                                            │
│                                                              │
│ Laptop | PC | GPU | CPU | Motherboard | RAM | SSD | Monitor│
├──────────────────────────────────────────────────────────────┤
│ FEATURED / BEST SELLERS                                     │
│                                                              │
│ Product | Product | Product | Product                       │
├──────────────────────────────────────────────────────────────┤
│ SPECIAL OFFER / PROMOTION                                   │
├──────────────────────────────────────────────────────────────┤
│ NEW ARRIVALS                                                │
│                                                              │
│ Product | Product | Product | Product                       │
├──────────────────────────────────────────────────────────────┤
│ BUILD YOUR PC CTA                                           │
│                                                              │
│ Choose components → Build your system                       │
├──────────────────────────────────────────────────────────────┤
│ WHY ETECH COMPUTERS                                         │
│ Genuine | Warranty | Support | Branch Network               │
├──────────────────────────────────────────────────────────────┤
│ BRANDS                                                       │
│ NVIDIA | Intel | AMD | ASUS | MSI | Gigabyte | etc.         │
├──────────────────────────────────────────────────────────────┤
│ AI TECHNICAL ADVISOR                                        │
├──────────────────────────────────────────────────────────────┤
│ ABOUT / COMPANY INTRO                                       │
├──────────────────────────────────────────────────────────────┤
│ NEWSLETTER / CTA                                            │
├──────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
└──────────────────────────────────────────────────────────────┘

This fits your existing SPA architecture because #home is already defined as the main landing storefront.

2. Announcement / Utility Bar

A very thin bar at the very top.

Example
NEW     Build your dream PC with premium components.
        Free shipping on selected orders.


                         Track Order   Support   Contact Us
Design
Height: 32–36px
Background: #f1f5f9
Text: #475569
Small blue NEW badge
No large visual elements

This should be subtle. It shouldn't compete with the main navigation.

3. Main Header

This should be the most functional part of the header.

┌──────────────────────────────────────────────────────────────┐
│ ETechComputers     [ All Categories ▼ | Search...       🔍 ] │
│                    Wishlist     Cart     Account     Admin    │
└──────────────────────────────────────────────────────────────┘
Left

ETechComputers

ETechComputers
NEXT-GEN TECH STORE

Use your existing branding.

Center

Large search:

[ All Categories ▼ ] [ Search laptops, GPUs, processors... ] 🔍

Search is particularly important because your catalog supports searching product names, descriptions, categories and technical specifications.

Right
♡ Wishlist
🛒 Cart
👤 Account
⚙ Admin Console

The Admin Console should only be visible to appropriate authenticated users, consistent with your existing authentication logic.

4. Primary Navigation

Separate the navigation from the functional header.

Home
Shop Catalog ▼
Deals 🔥
Build Your PC
Brands
Support ▼
About Us
Active state
Home
━━━━

Use your existing Engineering Blue:

#2563EB

Your documentation already specifies a blue active-tab underline animation.

5. Hero Section

This is the most important redesign.

Your current hero is already using the documented 3-card carousel architecture.

I would keep that functionality but redesign the composition.

Hero layout
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  PREMIUM HARDWARE.                   ┌───────────────┐       │
│  POWERFUL PERFORMANCE.               │               │       │
│                                      │    GAMING PC   │       │
│  Built for Performance.              │      + GPU     │       │
│  Designed for You.                   │               │       │
│                                      └───────────────┘       │
│  Explore high-performance laptops,                           │
│  powerful components and premium                             │
│  peripherals from trusted brands.                            │
│                                                              │
│  [ Shop Catalog ] [ Build Your PC ]                          │
│                                                              │
│  ◉ Genuine     ◉ Expert Support     ◉ Warranty               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
Left side

Eyebrow:

PREMIUM HARDWARE. POWERFUL PERFORMANCE.

Headline:

Built for Performance.
Designed for You.

Blue emphasis:

You.

Description:

Explore high-performance laptops, powerful components, and premium peripherals from trusted brands.

CTA

Primary:

Shop Catalog

Secondary:

Build Your PC

Your project documentation already defines the storefront's product discovery and catalog functionality, so these CTAs should lead to actual functionality rather than being decorative.

6. Hero Product Showcase

Instead of making the right side look like three unrelated white cards, make it feel like a single hardware presentation.

Center

Large:

Gaming PC
Laptop
GPU
CPU
Motherboard

Then use the 3-card carousel as supporting products.

                    1 / 3


        ┌───────────────────────┐
        │                       │
        │       GAMING PC       │
        │                       │
        │     ███████████       │
        │     RGB HARDWARE      │
        │                       │
        └───────────────────────┘


    ◀                                     ▶


       ● ━━━ ○ ○

The current documentation specifies:

left card scale(.88)
center card scale(1)
right card scale(.88)
center card gets the strongest elevation
3.5-second autoplay
pause on hover
touch swipe support

So keep this interaction, but improve the visual presentation.

7. Hero background

Don't use a strong gradient.

Use:

#F8FAFC

with extremely subtle technical elements:

       ·  ·  ·  ·
    ·              ·
  ·     circuit      ·
    ·              ·
       ·  ·  ·  ·

Very low opacity.

This supports your "precision hardware" identity without becoming a gaming website.

8. Hero Trust Indicators

Under the CTAs:

🛡
100%
Genuine Products


◉
24/7
Expert Support


✓
2 Years
Official Warranty

Your documentation already defines warranty and support as important storefront concepts.

Keep these inside the hero, but don't put them in four giant cards.

9. Service Trust Strip

Immediately after the hero.

┌──────────────────────────────────────────────────────────────┐
│ 🚚 Express Delivery │ 🛡 Official Warranty │ 🔒 Secure       │
│                     │                    Checkout            │
│ 🎧 24/7 Tech Advice                                         │
└──────────────────────────────────────────────────────────────┘
Four items

Express Delivery

Same-day dispatch on qualifying orders.

Official Warranty

Manufacturer warranty and support.

Secure Checkout

Safe checkout experience.

24/7 Tech Advice

Technical assistance for your PC build.

The fourth item is especially appropriate because your project includes the E-T AI Technical Advisor and local fallback support.

10. Shop By Category

This should be one of the strongest sections.

Header
Shop By Category                         View All Categories →
Grid
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Laptop │ │ Desktop│ │ GPU    │ │ CPU    │
│        │ │ PC     │ │        │ │        │
└────────┘ └────────┘ └────────┘ └────────┘


┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Mother- │ │ RAM    │ │Storage │ │Monitor │
│board   │ │        │ │        │ │        │
└────────┘ └────────┘ └────────┘ └────────┘
Card structure
[ Product Image ]


Graphics Cards


200+ Products

Use real product/category imagery rather than generic icons.

11. Best Sellers

After categories:

Best Sellers                              View All →

Use 4 products desktop.

Product card
┌───────────────────────┐
│ BEST SELLER           │
│                       │
│       PRODUCT         │
│        IMAGE          │
│                       │
├───────────────────────┤
│ ASUS RTX 4070 Super   │
│ ★★★★★  4.8           │
│                       │
│ Rs. 259,999           │
│                       │
│ [ Add to Cart ]   ♡   │
└───────────────────────┘

Don't make the cards too tall.

Your product model already contains price, original price, stock, badge, images, specifications and warranty information.

So the homepage cards can use that data directly.

12. Special Offer Banner

Rather than another generic product grid, introduce a strong promotional section.

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  WEEKEND TECH DEAL                                          │
│                                                              │
│  Upgrade your setup                                        │
│  Save up to 20% on selected components                     │
│                                                              │
│  [ Shop Deals ]                       02 : 14 : 45 : 30      │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Use blue as the main background here.

This gives the page visual rhythm:

white → products → blue promotion → white products

13. New Arrivals
New Arrivals                              View All →

Use 4 product cards.

Badges:

NEW ARRIVAL

Your existing carousel specifically derives its content from products marked "New Arrival" or newly added products.

Therefore, this section can use the same product data.

14. Build Your PC Section

This is something I'd strongly recommend for your particular store.

Instead of just selling individual components:

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│               BUILD YOUR DREAM PC                            │
│                                                              │
│      Choose components. Check compatibility.                  │
│      Create a system that fits your performance needs.        │
│                                                              │
│              [ Start Building ]                              │
│                                                              │
│      CPU → GPU → RAM → Storage → PSU → Case                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘

This makes ETech feel more specialized than a generic electronics store.

It also connects naturally with your technical-advisor functionality.

15. Why ETech Computers?

Instead of generic "Why choose us?" content, make it technical.

Why ETech Computers?


100% Genuine
Authentic hardware from trusted brands


Official Warranty
Manufacturer-backed warranty support


Expert Technical Support
Help choosing and configuring hardware


Multi-Branch Availability
Stock available across our branch network

Your system actually has a four-branch inventory architecture covering Colombo, Kandy, Galle and Matara.

That makes this a real business advantage, not filler content.

16. Brands

A simple section:

Trusted Brands


[NVIDIA] [AMD] [Intel] [ASUS] [MSI]
[GIGABYTE] [CORSAIR] [Kingston] [Samsung]

Keep logos monochrome/neutral until hover.

Don't make this section visually loud.

17. E-T AI Technical Advisor

This is a major differentiator in your project.

Your documentation describes the chatbot as an AI hardware consultant with PC-building recommendations and quick suggestions.

So give it a proper homepage section.

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Meet E-T                                                     │
│  Your Technical Advisor                                      │
│                                                              │
│  Not sure which GPU to buy?                                  │
│  Need help building a PC?                                    │
│                                                              │
│  "Build me a gaming PC under Rs. 300,000"                   │
│                                                              │
│  [ Ask E-T ]                                                 │
│                                                              │
│                         ┌──────────────────────────┐          │
│                         │ E-T AI                  │          │
│                         │                         │          │
│                         │ What are you building?  │          │
│                         │                         │          │
│                         └──────────────────────────┘          │
└──────────────────────────────────────────────────────────────┘

This is much more valuable than having only a floating chatbot button.

18. About ETech

A short section rather than a full About page.

Powering Better Computing


ETech Computers provides computers, components,
peripherals, technical support and hardware solutions.


[ Learn About Us ]

Then:

Colombo     Kandy     Galle     Matara

Your documentation already defines the About route and corporate profile functionality.

19. Newsletter / final CTA

Keep it simple.

Stay Updated on New Hardware


Get notified about new arrivals,
deals and hardware updates.


[ Enter your email              ] [ Subscribe ]

Don't make this huge.

20. Footer

I'd use a dark navy footer to create a strong ending.

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│ ETechComputers                                               │
│ Next-Gen Tech Store                                          │
│                                                              │
│ SHOP                 SUPPORT              COMPANY             │
│ Laptops              Contact Us           About Us            │
│ Desktop PCs           Warranty             Branches            │
│ Graphics Cards        Shipping             Careers             │
│ Components            FAQ                  Policies            │
│                                                              │
│ ──────────────────────────────────────────────────────────── │
│                                                              │
│ © 2026 ETech Computers                    Privacy | Terms    │
└──────────────────────────────────────────────────────────────┘

Your project also has dedicated Privacy, Terms, Warranty and Policy routes, so the footer should expose these rather than using placeholder links.

Final Homepage Hierarchy

I would therefore make the complete page:

01  Announcement Bar
       ↓
02  Main Header
       ↓
03  Primary Navigation
       ↓
04  HERO
       ├── Eyebrow
       ├── Main headline
       ├── Description
       ├── Shop Catalog
       ├── Build Your PC
       ├── Trust metrics
       └── 3D Product Carousel
       ↓
05  Service Trust Strip
       ↓
06  Shop By Category
       ↓
07  Best Sellers
       ↓
08  Special Offer
       ↓
09  New Arrivals
       ↓
10  Build Your PC
       ↓
11  Why ETech Computers
       ↓
12  Trusted Brands
       ↓
13  E-T AI Technical Advisor
       ↓
14  About ETech
       ↓
15  Newsletter / Final CTA
       ↓
16  Footer
Visual rhythm

The important thing is not to make every section a card.

I'd use this rhythm:

LIGHT
══════════════════════
Header


LIGHT BLUE
══════════════════════
Hero


WHITE
══════════════════════
Trust Strip


WHITE
══════════════════════
Categories


WHITE
══════════════════════
Best Sellers


BLUE
══════════════════════
Special Offer


WHITE
══════════════════════
New Arrivals


LIGHT BLUE
══════════════════════
Build Your PC


WHITE
══════════════════════
Why ETech


WHITE
══════════════════════
Brands


VERY LIGHT BLUE
══════════════════════
E-T Advisor


WHITE
══════════════════════
About


NAVY
══════════════════════
Footer

That will make the page feel much more premium and intentional than putting every section inside a white card.

Design tokens to keep unchanged

I would not replace your documented design system. Your current values are already coherent:

Primary: #2563EB
Primary dark: #1D4ED8
Navy: #0F172A
Page background: #F8FAFC
Surface: #FFFFFF
Border: #E2E8F0
Secondary text: #475569
Cyan technical accent: #0284C7
Success: #059669
Warning: #D97706
Danger: #DC2626

These are directly defined in your project's design specification.

And keep Plus Jakarta Sans + JetBrains Mono exactly as documented. Use the monospace font selectively for prices, SKUs, order IDs and technical specifications.

The biggest improvement over your current screenshot should therefore be layout hierarchy, spacing, product presentation, and section rhythm—not changing the blue/white theme. Your underlying design system is already strong; the homepage needs to make that system feel more like a polished real-world computer retailer.