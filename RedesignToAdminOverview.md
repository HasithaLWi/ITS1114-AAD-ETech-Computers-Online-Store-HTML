1. Introduction to the development

The ETech Computers Management Console Overview will serve as the central operational dashboard for administrators and Super Admins. Its purpose is to provide a quick, real-time understanding of the company's sales performance, order processing, inventory health, branch status, and critical operational activities.

The page should follow the existing ETech design system: a light #f8fafc workspace, white surfaces, precise borders, Engineering Royal Blue as the primary action color, semantic green/amber/red states, Plus Jakarta Sans for normal UI text, and JetBrains Mono for technical values such as order IDs, SKUs and financial figures.

The Overview should therefore work as a command center:

Administrator opens console
          ↓
     KPI summary
          ↓
 Sales & order trends
          ↓
Operational health
 ┌────────┼─────────┐
Orders  Inventory  Branches
          ↓
   Critical attention
          ↓
    Recent activity

The important principle is:

Show the administrator what is happening, what is changing, and what requires action.

2. Recommended page structure

I would implement the generated design in this order:

A. Application shell
┌──────────────┬─────────────────────────────────────────────┐
│              │ Header                                      │
│   Sidebar    ├─────────────────────────────────────────────┤
│              │ KPI Cards                                   │
│              ├─────────────────────────────────────────────┤
│              │ Sales & Orders │ Order │ Inventory │ Branch │
│              ├─────────────────────────────────────────────┤
│              │ Critical Stock │ Recent Activity            │
│              ├─────────────────────────────────────────────┤
│              │ Footer                                      │
└──────────────┴─────────────────────────────────────────────┘

Your existing documentation already specifies a responsive collapsible admin sidebar and a full-screen admin workspace.

3. Technology stack for Vanilla JS

You do not need React, Vue, Angular, or a frontend chart framework to build this.

I recommend:

Purpose	Technology
Structure	HTML5
Styling	Tailwind CSS + your CSS variables
Application logic	Vanilla JavaScript ES Modules
Charts	Chart.js
Icons	Lucide Icons
Data tables	HTML <table> + Vanilla JS
API	Fetch API / your existing API layer
Authentication	JWT
Backend	Spring Boot
Database	MySQL

Your documentation already specifies Vanilla ES Modules + HTML5 + Tailwind CSS, with an API service layer prepared for Spring Boot/MySQL.

4. What should you use for the charts?
⭐ My recommendation: Chart.js

For your project, Chart.js is the best choice.

You can use it directly with Vanilla JavaScript:

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

Then:

<canvas id="salesChart"></canvas>

And:

const ctx = document.getElementById('salesChart');

new Chart(ctx, {
    type: 'line',
    data: {
        labels: [
            'Jul 28',
            'Aug 02',
            'Aug 07',
            'Aug 12',
            'Aug 17',
            'Aug 22',
            'Aug 27'
        ],
        datasets: [
            {
                label: 'Revenue',
                data: [
                    520000,
                    680000,
                    610000,
                    820000,
                    760000,
                    930000,
                    1380000
                ]
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

You can then style it to match your ETech blue/green design.

Why Chart.js?

Because your dashboard needs:

Line charts
Bar charts
Doughnut charts
Tooltips
Legends
Responsive charts
Animations
Multiple datasets
Dynamic API data

And Chart.js works perfectly with plain JavaScript.

5. Charts I recommend for this exact dashboard
① Sales & Orders Performance

Chart.js Line Chart

Your generated design has:

Revenue ────────────────╮
                       ╱ ╲
        ╭────╮    ╭───╯   ╲
────────╯    ╰────╯         ──

Orders ───────────────────────

You can have two datasets:

datasets: [
    {
        label: 'Revenue',
        data: revenueData
    },
    {
        label: 'Orders',
        data: orderData
    }
]

However, because Revenue (Rs.) and Orders (count) have completely different scales, I recommend either:

Option A — Separate charts

Best for readability.

Option B — Chart.js dual Y-axis
Revenue              Orders
Rs. 1.5M ──╮       150 ──╮
           │╲             │
Rs. 1.0M ──│─╲      100 ──│╲
           │  ╲           │ ╲
Rs. 500K ──╯   ╲     50 ──╯  ╲

Chart.js supports this.

6. Order Pipeline

I wouldn't use a complicated chart here.

Use HTML + CSS + Vanilla JS:

Pending       14
Processing     8
Shipped       21
Delivered     85

You could also use a horizontal bar chart, but visually the simple operational list is better.

The order system already has lifecycle states such as Pending, Processing, Shipped, Delivered and Cancelled.

7. Inventory Health

Here I recommend a doughnut chart if you want a visual summary:

          Healthy
        ┌──────────┐
      ╱              ╲
     │      842       │
      ╲              ╱
        └──────────┘

Low Stock     31
Critical       6
Out of Stock   3

Chart.js:

new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: [
            'Healthy',
            'Low Stock',
            'Critical',
            'Out of Stock'
        ],
        datasets: [{
            data: [842, 31, 6, 3]
        }]
    }
});

But there's an important UX point:

Don't make the doughnut the only representation.

The administrator still needs the exact numbers.

8. Branch Network

For your generated design, I wouldn't use a chart.

Use a status list:

Galle Tech Center       ● Healthy

Matara Branch           ● Healthy

Colombo Branch          ● Attention

Kandy Branch            ● Healthy

When the system grows, you could add:

Branch
Revenue
Orders
Stock Health
Pending Orders

and then use a bar chart for branch comparison.

9. Critical Attention table

This is probably the most important non-chart component.

Your existing documentation specifically supports stock thresholds, quick restocking and inter-branch transfers.

I'd structure it as:

Product	SKU	Branch	Stock	Minimum	Status	Action
RTX 4070	ETC-...	Galle	2	5	Critical	Restock
MSI B550	ETC-...	Colombo	3	6	Low	Restock
Corsair 16GB	ETC-...	Matara	4	8	Low	Transfer
Cooler Master	ETC-...	Kandy	0	4	Out	Restock

This should be real API data, not hardcoded dashboard values.

10. Recommended JavaScript architecture

Your documentation already has:

src/js/
├── api/
├── app/
├── components/
├── controller/
└── models/

So I would extend that rather than creating a completely different architecture.

For the dashboard:

src/
├── js/
│   ├── api/
│   │   └── dashboardApi.js
│   │
│   ├── controller/
│   │   └── admin_dashboard_controller.js
│   │
│   ├── components/
│   │   ├── kpi_card.js
│   │   ├── sales_chart.js
│   │   ├── inventory_health.js
│   │   ├── branch_status.js
│   │   └── activity_timeline.js
│   │
│   └── models/
│       └── dashboard_model.js
11. API architecture

Eventually the Overview should request something like:

GET /api/v1/dashboard/overview

and receive:

{
    revenue: {
        current: 1380000,
        change: 12.8
    },

    orders: {
        total: 128,
        change: 8.4
    },

    pendingOrders: 14,

    lowStockItems: 6,

    activeBranches: 4,

    salesTrend: [],

    orderPipeline: {
        pending: 14,
        processing: 8,
        shipped: 21,
        delivered: 85
    },

    inventoryHealth: {
        healthy: 842,
        lowStock: 31,
        critical: 6,
        outOfStock: 3
    },

    branches: [],

    criticalProducts: [],

    recentActivity: []
}

That is much better than making 10 separate API calls every time the Overview loads.

12. One important improvement to your current project

Your documentation already contains an:

analytics_and_report_controller.js

described as the Financial Analytics & Sales Report Summarizer.

I would make that responsible for the business analytics calculations, while the dashboard controller handles presentation.

For example:

API
 ↓
dashboardApi.js
 ↓
dashboard_model.js
 ↓
admin_dashboard_controller.js
 ↓
 ┌──────────────┬───────────────┬──────────────┐
 KPI Cards    Chart.js       Stock Table    Activity

This separation will make your dashboard much easier to maintain.

Final technology recommendation

For this exact generated design, I recommend:

Frontend

HTML5 + Tailwind CSS + Vanilla ES Modules

Charts

⭐ Chart.js

Icons

Lucide Icons

Data

Fetch API → Spring Boot REST API

Backend

Spring Boot

Database

MySQL

Architecture

Your existing Controller → Model → API structure