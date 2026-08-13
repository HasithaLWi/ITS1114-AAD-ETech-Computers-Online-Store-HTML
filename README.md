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
│   │   ├── admin-dashboard.js  Admin/staff management console
│   │   ├── chatbot.js        E-T AI chatbot widget
│   │   ├── product-details.js  Product detail page renderer
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

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Structure  | HTML5 (semantic)                    |
| Styling    | Tailwind CSS v3 (CDN) + custom CSS |
| Logic      | Vanilla JavaScript (ES Modules)    |
| Fonts      | Plus Jakarta Sans (Google Fonts)   |
| Data       | LocalStorage (client-side mock)    |

## Key Features

- **SPA-style routing** via hash-based navigation
- **Product catalog** with category filtering, search, and sort
- **Shopping cart** with quantity management and checkout flow
- **User authentication** (LocalStorage-based registration/login)
- **Admin dashboard** for product/order/branch/user management
- **E-T AI Chatbot** with Gemini API integration
- **Responsive design** optimized for mobile and desktop

## License

© 2026 ETech Computers. All rights reserved.
