# ETech Computers — Online Store (HTML/JS Front-End)

> A premium, single-page application for a next-generation computer and gaming hardware online store, built with **HTML**, **Tailwind CSS**, and **vanilla ES Modules**.

---

## Project Structure

```
root/
├── public/                   Static assets (images, fonts, favicon)
│   ├── images/
│   └── fonts/
│
├── src/                      Application source code
│   ├── css/
│   │   ├── global.css        Custom styles & animations
│   │   └── variables.css     Design system tokens (colors, fonts, spacing)
│   │
│   ├── js/
│   │   ├── app.js            SPA router & global app logic
│   │   ├── admin_dashboard_controller.js  Admin/staff management console
│   │   ├── chatbot_controller.js        E-T AI chatbot widget
│   │   ├── product-details_controller.js  Product detail page renderer
│   │   ├── components/       UI rendering modules
│   │   ├── services/         Data flow & business logic (auth, cart)
│   │   ├── utils/            Helper functions (branches, shop filters)
│   │   └── models/           Data definitions & schemas
│   │
│   ├── pages/
│   │   ├── login.html        Authentication (Sign In / Register)
│   │   ├── administrator_dashboard.html  Admin console
│   │   └── chatbot.html      Standalone Gemini chatbot
│   │
│   └── data/
│       └── products.json     Placeholder for future API data
│
├── index.html                Main entry point (landing page)
├── script.js                 Central ES Module bridge (window bindings)
├── .gitignore
└── README.md
```

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd ITS1114-AAD-ETech-Computers-Online-Store-HTML
   ```

2. **Serve locally** — Use any static file server (e.g., VS Code Live Server, `npx serve`, or Python):
   ```bash
   npx serve .
   ```

3. **Open in browser** — Navigate to `http://localhost:3000` (or your server's port).

## Backend Migration & REST API Integration

> 📌 **Looking to integrate a Spring Boot & MySQL backend?**
> Check out the complete **[Backend API Integration Specification (BACKEND_API_MIGRATION.md)](file:///f:/IJSE/SECOND%20SEM/SECOND%20SEM%20-%20ITS%201114%20-%20AAD/ITS1114-AAD-ETech-Computers-Online-Store-HTML/BACKEND_API_MIGRATION.md)** for:
> - MySQL Relational Schema (DDL)
> - Spring Boot Controller Endpoints (`/api/v1/products`, `/api/v1/orders`, `/api/v1/inventory`, `/api/v1/branches`, `/api/v1/auth`)
> - Mapping from client `localStorage` keys to REST APIs
> - Guide on which client-side validations/computations to strip out once the backend is connected

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Structure  | HTML5 (Single-file SPA architecture)|
| Styling    | Tailwind CSS v3 (CDN) + custom CSS  |
| Logic      | Vanilla JavaScript (ES Modules)     |
| Fonts      | Plus Jakarta Sans (Google Fonts)    |
| Data       | LocalStorage (client mock) -> Spring Boot (target) |

## Key Features

- **Single-page application (SPA)** with hash routing (`#home`, `#shop`, `#cart`, `#checkout`, `#login`, `#admin`)
- **Product catalog & 5-image gallery** with category filtering, search, and sorting
- **Stock Health & Advanced Inventory Alert Center** with regional warehouse monitoring (Colombo, Galle, Matara, Kandy)
- **Shopping cart & checkout** with automated warehouse selection and distance calculation
- **Role-based access** (`ADMIN`, `STAFF`, `CUSTOMER`)
- **Admin & Staff Console** (Products, Orders, Stock Health, Branches, Users, Financial Reports)
- **E-T AI Chatbot** with Gemini AI integration

## License

© 2026 ETech Computers. All rights reserved.
