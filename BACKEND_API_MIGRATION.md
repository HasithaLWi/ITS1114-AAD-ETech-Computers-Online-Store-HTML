# ETech Computers — Backend API Integration & Spring Boot / MySQL Migration Specification

> **Purpose**: This document serves as the master blueprint for transitioning the ETech Computers Online Store frontend from client-side mock datasets and `localStorage` to a production-ready **Spring Boot REST API** backed by a **MySQL Database**.
> 
> *This documentation will be maintained and updated continuously whenever frontend data models or controllers evolve.*

---

## Table of Contents
1. [System Architecture: Current vs. Target Backend](#1-system-architecture-current-vs-target-backend)
2. [Current `localStorage` Keys & Mock Repositories](#2-current-localstorage-keys--mock-repositories)
3. [MySQL Relational Database Schema (DDL)](#3-mysql-relational-database-schema-ddl)
4. [Spring Boot REST Endpoints Specification](#4-spring-boot-rest-endpoints-specification)
   - [Auth & User Management (`/api/v1/auth`, `/api/v1/users`)](#auth--user-management)
   - [Product Catalog & Gallery (`/api/v1/products`)](#product-catalog--gallery)
   - [Branch Warehouses (`/api/v1/branches`)](#branch-warehouses)
   - [Stock Health & Inventory Alerts (`/api/v1/inventory`)](#stock-health--inventory-alerts)
   - [Orders & Fulfillment (`/api/v1/orders`)](#orders--fulfillment)
5. [Client-Side Simplifications (What to Remove Upon Backend Integration)](#5-client-side-simplifications-what-to-remove-upon-backend-integration)
6. [Frontend API Service Layer Architecture (`src/js/api/`)](#6-frontend-api-service-layer-architecture-srcjsapi)

---

## 1. System Architecture: Current vs. Target Backend

```mermaid
flowchart TD
    subgraph Frontend["Frontend SPA (HTML5 / Vanilla JS)"]
        UI["UI Layer (index.html, DOM Renderers)"]
        Controllers["Controllers (cart, product, order, stock_health, auth)"]
        APILayer["API Client (src/js/api/) - Future HTTP Fetch Client"]
    end

    subgraph Current["Current State (Mock / Offline)"]
        LocalStorage[("Browser localStorage\netech_products, etech_orders,\netech_branches, etech_users")]
    end

    subgraph Target["Target Backend (Spring Boot + MySQL)"]
        Controllers --> APILayer
        APILayer -->|HTTP / JSON (JWT Auth)| SpringBoot["Spring Boot REST API (Port 8080)"]
        SpringBoot --> SpringData["Spring Data JPA / Hibernate"]
        SpringData --> MySQL[("MySQL Relational Database")]
    end

    Controllers -.->|Current Direct Access| LocalStorage
```

---

## 2. Current `localStorage` Keys & Mock Repositories

| Key | Current File | Current Purpose | Target Spring Boot Endpoint | Action Upon Backend Switch |
|---|---|---|---|---|
| `etech_products` | `src/js/models/data.js` | Stores all product catalog data, specs, image URLs, total stock, and branch stock maps | `GET /api/v1/products`<br>`POST /api/v1/products`<br>`PUT /api/v1/products/{id}`<br>`DELETE /api/v1/products/{id}` | **Replace completely** with API fetch calls. Remove manual array find/filter/save logic. |
| `etech_branches` | `src/js/controller/branch_controller.js` | Stores regional warehouse hubs (Colombo, Galle, Matara, Kandy) with geo coordinates & base rates | `GET /api/v1/branches`<br>`POST /api/v1/branches`<br>`PUT /api/v1/branches/{id}`<br>`DELETE /api/v1/branches/{id}` | **Replace completely** with API fetch calls. |
| `etech_orders` | `src/js/controller/order_management_controller.js` | Stores customer orders, delivery distances, fulfillment branch, item arrays, and status | `GET /api/v1/orders`<br>`GET /api/v1/orders/my-orders`<br>`POST /api/v1/orders`<br>`PATCH /api/v1/orders/{id}/status` | **Replace completely** with API fetch calls. Remove client-side order ID generation. |
| `etech_users` | `src/js/controller/login_controller.js` | Stores user directory with role badges (`ADMIN`, `STAFF`, `CUSTOMER`) and branch assignments | `GET /api/v1/users`<br>`POST /api/v1/auth/register`<br>`PUT /api/v1/users/{id}/role` | **Replace completely** with API calls. Spring Security will manage user entities. |
| `etech_current_user` | `src/js/controller/login_controller.js` | Stores current logged-in user profile & role session | `POST /api/v1/auth/login`<br>`GET /api/v1/auth/me` | **Keep minimal**: Store only the **JWT Bearer Token** and cached basic user profile in `localStorage` or `sessionStorage`. |
| `etech_cart` | `src/js/controller/cart_controller.js` | Stores active shopping cart items and quantities | Optional: `GET/POST /api/v1/cart` (or keep in `localStorage` for guest sessions) | Can **remain in `localStorage`** for guest carts, syncing to backend on login. |

---

## 3. MySQL Relational Database Schema (DDL)

```sql
-- 1. Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'STAFF', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
    assigned_branch_id VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Branches Table
CREATE TABLE branches (
    id VARCHAR(20) PRIMARY KEY, -- e.g., 'BR-COL', 'BR-GAL'
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    base_shipping_rate DECIMAL(10, 2) NOT NULL DEFAULT 350.00,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Products Table
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    original_price DECIMAL(12, 2) NOT NULL,
    rating DECIMAL(2, 1) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    image_url TEXT NOT NULL,
    description TEXT,
    full_description LONGTEXT,
    sku VARCHAR(100) NOT NULL UNIQUE,
    badge VARCHAR(50) DEFAULT '',
    warranty VARCHAR(150) DEFAULT '1-Year Warranty',
    alert_enabled BOOLEAN DEFAULT TRUE,
    low_stock_margin INT DEFAULT 5,
    specs_json JSON,        -- e.g. {"Processor": "i9-14900HX", "RAM": "32GB"}
    features_json JSON,     -- e.g. ["Liquid Metal Cooling", "RGB Keyboard"]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Product Gallery Images
CREATE TABLE product_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 5. Branch Warehouse Stock Allocation (Many-to-Many Bridge)
CREATE TABLE branch_inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    branch_id VARCHAR(20) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_branch (product_id, branch_id)
);

-- 6. Orders Table
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'ORD-2026-8492'
    user_id BIGINT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    shipping_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    fulfillment_branch_id VARCHAR(20) NOT NULL,
    distance_km DECIMAL(6, 2) DEFAULT 0.0,
    subtotal DECIMAL(12, 2) NOT NULL,
    shipping_fee DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Credit Card',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (fulfillment_branch_id) REFERENCES branches(id)
);

-- 7. Order Items Table
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## 4. Spring Boot REST Endpoints Specification

### Auth & User Management

| Method | Endpoint | Description | Request Body | Response Body |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticate user & return JWT token | `{ "email": "admin@etech.com", "password": "..." }` | `{ "token": "jwt...", "user": { "id": 1, "name": "...", "email": "...", "role": "ADMIN" } }` |
| `POST` | `/api/v1/auth/register` | Register new customer account | `{ "name": "...", "email": "...", "password": "..." }` | `{ "token": "jwt...", "user": { ... } }` |
| `GET` | `/api/v1/auth/me` | Fetch authenticated profile from token | Headers: `Authorization: Bearer <token>` | `{ "id": 1, "name": "...", "email": "...", "role": "ADMIN" }` |
| `GET` | `/api/v1/users` | List all users (Admin only) | None | `[ { "id": 1, "name": "...", "role": "STAFF", "assignedBranch": "BR-COL" } ]` |
| `PATCH` | `/api/v1/users/{id}/role` | Update user role / branch | `{ "role": "STAFF", "assignedBranch": "BR-GAL" }` | Updated User Object |

### Product Catalog & Gallery

| Method | Endpoint | Description | Request Body | Response Body |
|---|---|---|---|---|
| `GET` | `/api/v1/products` | Get products with branch inventory & filters (`?category=laptops&search=rtx`) | None | `[ { "id": 1, "name": "Apex Raider", "branchStock": {"BR-COL": 11, "BR-GAL": 0}, "totalStock": 21, "images": [...] } ]` |
| `GET` | `/api/v1/products/{id}` | Get single product with full specs & gallery | None | Single Product DTO |
| `POST` | `/api/v1/products` | Create new product with 5 images & initial branch stock | Product Form DTO | Created Product DTO |
| `PUT` | `/api/v1/products/{id}` | Update product details & specifications | Product Form DTO | Updated Product DTO |
| `DELETE` | `/api/v1/products/{id}` | Remove product from inventory | None | `{ "success": true, "message": "Product deleted" }` |

### Branch Warehouses

| Method | Endpoint | Description | Request Body | Response Body |
|---|---|---|---|---|
| `GET` | `/api/v1/branches` | List all regional warehouse hubs | None | `[ { "id": "BR-COL", "name": "Colombo Main Hub", "baseShippingRate": 350.00 } ]` |
| `POST` | `/api/v1/branches` | Create new warehouse branch | Branch DTO | Created Branch DTO |
| `PUT` | `/api/v1/branches/{id}` | Update branch details / coordinates | Branch DTO | Updated Branch DTO |
| `DELETE` | `/api/v1/branches/{id}` | Decommission branch | None | `{ "success": true }` |

### Stock Health & Inventory Alerts

| Method | Endpoint | Description | Request Body | Response Body |
|---|---|---|---|---|
| `GET` | `/api/v1/inventory/health-report` | Get branch status metrics, health scores & depleted/low alert lists | None | `{ "totalActiveAlerts": 3, "totalDepletedUnits": 1, "branchStats": {...}, "alertItems": [...] }` |
| `PATCH` | `/api/v1/inventory/{productId}/settings` | Toggle alert monitoring & set low stock margin | `{ "alertEnabled": true, "lowStockMargin": 5 }` | Updated settings |
| `POST` | `/api/v1/inventory/{productId}/adjust` | Quick restock: Add or set branch warehouse stock | `{ "branchId": "BR-GAL", "quantityDelta": 10 }` | Updated Product Inventory |
| `POST` | `/api/v1/inventory/{productId}/transfer` | Inter-branch warehouse stock transfer | `{ "fromBranchId": "BR-COL", "toBranchId": "BR-GAL", "quantity": 5 }` | `{ "success": true, "transferred": 5 }` |

### Orders & Fulfillment

| Method | Endpoint | Description | Request Body | Response Body |
|---|---|---|---|---|
| `GET` | `/api/v1/orders` | List all orders (Admin/Staff) | None | `[ { "orderCode": "ORD-2026-001", "totalAmount": 2499, "status": "Pending", "items": [...] } ]` |
| `GET` | `/api/v1/orders/my-orders` | Get orders for logged-in customer | Headers: `Authorization: Bearer <token>` | List of user's orders |
| `POST` | `/api/v1/orders` | Place new order (deducts warehouse stock atomically via `@Transactional`) | Order Placement DTO | Created Order DTO |
| `PATCH` | `/api/v1/orders/{id}/status` | Update fulfillment status (`Processing`, `Shipped`, `Delivered`) | `{ "status": "Shipped" }` | Updated Order DTO |

---

## 5. Client-Side Simplifications & Role-Based UI Security (RBAC)

### Role-Based Access & Header Visibility Rules
- 👑 **`ADMIN` Role**: Full access to Admin Console navigation and all management tabs (Products, Orders, Stock Health, Branches, Users, Financial Reports). Header shows `[Admin Console]` and account profile.
- 🧑‍💼 **`STAFF` Role**: Access to operational tabs (Products, Orders, Stock Health). System configuration tabs (Branches, Users, Financials) are hidden. Header shows `[Admin Console]` and account profile.
- 👤 **`CUSTOMER` / Guest**: `Admin Console` button is **completely hidden** from both desktop header and mobile drawer. Direct URL navigation to `#admin` is blocked by route guards and redirects to `#home` or `#login`. On the backend, Spring Security will enforce `@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")` returning `403 Forbidden`.

### What to Strip Out Upon Backend Integration
When connecting the frontend to Spring Boot, the following complex/unnecessary client-side logic should be **stripped out** and left to the backend:

1. **Client-Side ID Generation**:
   - *Current*: `Math.max(...all.map(p => p.id)) + 1` and random SKU generators.
   - *Spring Boot*: Database handles auto-increment IDs (`@GeneratedValue(strategy = GenerationType.IDENTITY)`) and business SKU generator services.
2. **Client-Side Stock Deduction**:
   - *Current*: `deductBranchStock(productId, branchId, qty)` running inside `checkout_controller.js`.
   - *Spring Boot*: Handled automatically inside the `@Transactional` `OrderService.createOrder(...)` method in Java. Prevents race conditions and inventory drift.
3. **Client-Side Validation Redundancies**:
   - Heavy password hashing, unique email checks, and duplicate SKU checks should be handled via Spring validation annotations (`@Valid`, `@NotBlank`, `@Email`, `@Column(unique=true)`).
4. **Client-Side Seed Data Hydration**:
   - *Current*: `localStorage.setItem('etech_products', ...)` seeding on first run in `data.js`.
   - *Spring Boot*: Handled by a clean `data.sql` file or `CommandLineRunner` seed script in Spring Boot.

---

## 6. Frontend API Service Layer Architecture (`src/js/api/`)

To keep the transition effortless, create thin service wrappers inside `src/js/api/`. When ready to connect to Spring Boot, controllers only need to call these async methods instead of `localStorage`.

### Base API Client (`src/js/api/apiClient.js`):
```javascript
const BASE_URL = 'http://localhost:8080/api/v1';

export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('etech_jwt_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
}
```

### Product API Service (`src/js/api/productApi.js`):
```javascript
import { apiRequest } from './apiClient.js';

export const ProductApi = {
    getAll: (params = '') => apiRequest(`/products${params}`),
    getById: (id) => apiRequest(`/products/${id}`),
    create: (productData) => apiRequest('/products', { method: 'POST', body: JSON.stringify(productData) }),
    update: (id, productData) => apiRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) }),
    delete: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' })
};
```

---
*Documentation last updated: August 2026 for ETech Computers AAD ITS 1114 Coursework.*
