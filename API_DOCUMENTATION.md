# ETech Computers — Backend API Reference & Testing Guide

> **Base URL**: `http://localhost:8080/api/v1`  
> **Security Protocol**: Stateless JWT Bearer Authentication (`Authorization: Bearer <JWT_TOKEN>`)  
> **Content-Type**: `application/json`  
> **Database**: MySQL 8.x (`jdbc:mysql://localhost:3306/etech_online_store`)  
> **Framework**: Spring Boot 3.x with Spring Security 6 & Spring Data JPA (Hibernate)

---

## Table of Contents
1. [System Overview & Server Configuration](#1-system-overview--server-configuration)
2. [Default Seed Data & Credentials](#2-default-seed-data--credentials)
3. [Authentication Flow & Headers](#3-authentication-flow--headers)
4. [Standard Response Envelopes & Error Models](#4-standard-response-envelopes--error-models)
5. [Auth Module Endpoints (`/api/v1/auth`)](#5-auth-module-endpoints)
   - [1. User Login (`POST /api/v1/auth/login`)](#1-user-login)
   - [2. Customer Registration (`POST /api/v1/auth/register`)](#2-customer-registration)
   - [3. Current User Session (`GET /api/v1/auth/me`)](#3-current-user-session)
6. [User Management Module Endpoints (`/api/v1/users`)](#6-user-management-module-endpoints)
   - [4. List Users Directory (`GET /api/v1/users`)](#4-list-users-directory)
   - [5. Get User by ID (`GET /api/v1/users/{id}`)](#5-get-user-by-id)
   - [6. Create User Account (`POST /api/v1/users`)](#6-create-user-account)
   - [7. Update User Details (`PUT /api/v1/users/{id}`)](#7-update-user-details)
   - [8. Change User Role (`PATCH /api/v1/users/{id}/role`)](#8-change-user-role)
   - [9. Delete User Account (`DELETE /api/v1/users/{id}`)](#9-delete-user-account)
   - [10. Update Self Profile (`PUT /api/v1/users/me/profile`)](#10-update-self-profile)
   - [11. Change Self Password (`PUT /api/v1/users/me/password`)](#11-change-self-password)
7. [Product Catalog & Inventory Module Endpoints (`/api/v1/products`)](#7-product-catalog--inventory-module-endpoints)
   - [12. Get All Products (`GET /api/v1/products/all`)](#12-get-all-products)
   - [13. Filter Products with Pagination (`GET /api/v1/products/filter`)](#13-filter-products-with-pagination)
   - [14. Get Product by ID (`GET /api/v1/products/{id}`)](#14-get-product-by-id)
   - [15. Get Product by SKU (`GET /api/v1/products/sku/{sku}`)](#15-get-product-by-sku)
   - [16. Get Products by Status (`GET /api/v1/products/status`)](#16-get-products-by-status)
   - [17. Create Product (`POST /api/v1/products/create`)](#17-create-product)
   - [18. Update Product (`PUT /api/v1/products/update/{id}`)](#18-update-product)
   - [19. Update Branch Inventory Stock (`PATCH /api/v1/products/update-inventory`)](#19-update-branch-inventory-stock)
   - [20. Update Product Status (`PATCH /api/v1/products/update-status/{id}`)](#20-update-product-status)
   - [21. Delete Product (`DELETE /api/v1/products/delete/{id}`)](#21-delete-product)
8. [Category Management Module Endpoints (`/api/v1/categories`)](#8-category-management-module-endpoints)
   - [22. Create Category (`POST /api/v1/categories/create`)](#22-create-category)
   - [23. Get All Categories (`GET /api/v1/categories/all`)](#23-get-all-categories)
   - [24. Get Category by ID (`GET /api/v1/categories/{id}`)](#24-get-category-by-id)
   - [25. Get Category by Slug (`GET /api/v1/categories/slug/{slug}`)](#25-get-category-by-slug)
   - [26. Get Category by Name (`GET /api/v1/categories/name/{name}`)](#26-get-category-by-name)
   - [27. Filter Categories (`GET /api/v1/categories/filter`)](#27-filter-categories)
   - [28. Get Categories by Status (`GET /api/v1/categories/status`)](#28-get-categories-by-status)
   - [29. Update Category (`PUT /api/v1/categories/update/{id}`)](#29-update-category)
   - [30. Update Category Status (`PATCH /api/v1/categories/update-status/{id}`)](#30-update-category-status)
   - [31. Delete Category (Soft Delete) (`DELETE /api/v1/categories/delete/{id}`)](#31-delete-category-soft-delete)
   - [32. Permanently Delete Category (`DELETE /api/v1/categories/perma-delete/{id}`)](#32-permanently-delete-category)
9. [Brand Management Module Endpoints (`/api/v1/brands`)](#9-brand-management-module-endpoints)
   - [33. Create Brand (`POST /api/v1/brands/create`)](#33-create-brand)
   - [34. Get All Brands (`GET /api/v1/brands/all`)](#34-get-all-brands)
   - [35. Get Featured Brands (`GET /api/v1/brands/featured`)](#35-get-featured-brands)
   - [36. Get Brand by ID (`GET /api/v1/brands/{id}`)](#36-get-brand-by-id)
   - [37. Get Brand by Slug (`GET /api/v1/brands/slug/{slug}`)](#37-get-brand-by-slug)
   - [38. Get Brand by Name (`GET /api/v1/brands/name/{name}`)](#38-get-brand-by-name)
   - [39. Filter Brands (`GET /api/v1/brands/filter`)](#39-filter-brands)
   - [40. Get Brands by Status (`GET /api/v1/brands/status/{status}`)](#40-get-brands-by-status)
   - [41. Update Brand (`PUT /api/v1/brands/update/{id}`)](#41-update-brand)
   - [42. Update Brand Status (`PATCH /api/v1/brands/update-status/{id}`)](#42-update-brand-status)
   - [43. Delete Brand (Soft Delete) (`DELETE /api/v1/brands/delete/{id}`)](#43-delete-brand-soft-delete)
   - [44. Permanently Delete Brand (`DELETE /api/v1/brands/perma-delete/{id}`)](#44-permanently-delete-brand)
10. [Badge & Rules Engine Module Endpoints (`/api/v1/badges`)](#10-badge--rules-engine-module-endpoints)
    - [45. Create Badge (`POST /api/v1/badges/create`)](#45-create-badge)
    - [46. Get All Badges (`GET /api/v1/badges/all`)](#46-get-all-badges)
    - [47. Get Active Badges (`GET /api/v1/badges/active`)](#47-get-active-badges)
    - [48. Get Badge by ID (`GET /api/v1/badges/{id}`)](#48-get-badge-by-id)
    - [49. Get Badge by Slug (`GET /api/v1/badges/slug/{slug}`)](#49-get-badge-by-slug)
    - [50. Get Badge by Name (`GET /api/v1/badges/name/{name}`)](#50-get-badge-by-name)
    - [51. Filter Badges (`GET /api/v1/badges/filter`)](#51-filter-badges)
    - [52. Update Badge (`PUT /api/v1/badges/update/{id}`)](#52-update-badge)
    - [53. Update Badge Status (`PATCH /api/v1/badges/update-status/{id}`)](#53-update-badge-status)
    - [54. Delete Badge (Soft Delete) (`DELETE /api/v1/badges/delete/{id}`)](#54-delete-badge-soft-delete)
    - [55. Permanently Delete Badge (`DELETE /api/v1/badges/perma-delete/{id}`)](#55-permanently-delete-badge)
11. [Role-Based Access Control (RBAC) Matrix](#11-role-based-access-control-rbac-matrix)
12. [Frontend Integration Client Helper (`JavaScript Fetch`)](#12-frontend-integration-client-helper)

---

## 1. System Overview & Server Configuration

- **Server Port**: `8080`
- **Application Context**: `/` (API mapped to `/api/v1`)
- **Authentication**: JWT Bearer Tokens (HMAC-SHA256, 24-hour expiration)
- **CORS Configuration**: Allowed all origins (`*`), credentials enabled, supported methods `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`.
- **Enumerations**:
  - `UserRole`: `SUPERADMIN`, `ADMIN`, `STAFF`, `CUSTOMER`
  - `Status`: `ACTIVE`, `INACTIVE`, `DELETED`
  - `BadgeRuleType`: `automatic`, `manual`, `system`

---

## 2. Default Seed Data & Credentials

Upon backend initialization (`DataInitializer`), the database is automatically seeded with default branches, user accounts, taxonomy categories, hardware partner brands, badges, and catalog products:

### Default User Accounts

| Username | Password | Role | Assigned Branch | Description / Permissions |
|---|---|---|---|---|
| `superadmin` | `admin123` | `SUPERADMIN` | `null` (Store-Wide Owner) | Root system owner; immutable role & undeletable account; can manage all users, assign all roles, and perform permanent deletions. |
| `admin` | `admin123` | `ADMIN` | `null` (Store Administrator) | Store manager; can manage staff and customers, create products/brands/categories/badges; cannot modify or delete Superadmin or other Admins. |
| `staff_colombo` | `staff123` | `STAFF` | `BR-COL` (Colombo Hub) | Branch staff; can view directory, create and update products and branch inventories. |
| `kasun` | `customer123` | `CUSTOMER` | `null` (Storefront Customer) | Storefront customer account; can browse catalog, self-manage profile and change password. |

### Regional Warehouse Branches

| Branch ID | Branch Name | City | Address | Hotline | Base Rate |
|---|---|---|---|---|---|
| `BR-COL` | Colombo Main Hub | Colombo | 450 Galle Road, Colombo 03 | +94 11 234 5678 | LKR 350.00 |
| `BR-GAL` | Galle Tech Hub | Galle | 12 Wakwella Road, Galle | +94 91 223 4567 | LKR 450.00 |
| `BR-MAT` | Matara Regional Hub | Matara | 88 Anagarika Dharmapala Mawatha, Matara | +94 41 222 3456 | LKR 500.00 |
| `BR-KAN` | Kandy Central Hub | Kandy | 102 Dalada Veediya, Kandy | +94 81 220 1234 | LKR 450.00 |

### Seed Categories

- `cat-laptops` (Laptops & Notebooks, slug: `laptops`, icon: 💻, featured: `true`, order: `1`)
- `cat-components` (PC Components, slug: `components`, icon: ⚙️, featured: `true`, order: `2`)
- `cat-peripherals` (Peripherals & Accessories, slug: `peripherals`, icon: 🖱️, featured: `true`, order: `3`)
- `cat-monitors` (Monitors & Displays, slug: `monitors`, icon: 🖥️, featured: `true`, order: `4`)
- `cat-storage` (Storage & Memory, slug: `storage`, icon: 💾, featured: `false`, order: `5`)
- `cat-networking` (Networking Gear, slug: `networking`, icon: 🌐, featured: `false`, order: `6`)

### Seed Brands

- `brd-asus` (ASUS, slug: `asus`, country: `Taiwan`, tagline: *"In Search of Incredible"*, order: `1`)
- `brd-msi` (MSI, slug: `msi`, country: `Taiwan`, tagline: *"True Gaming"*, order: `2`)
- `brd-corsair` (Corsair, slug: `corsair`, country: `USA`, tagline: *"Game On"*, order: `3`)
- `brd-intel` (Intel, slug: `intel`, country: `USA`, tagline: *"Do More"*, order: `4`)
- `brd-logitech` (Logitech, slug: `logitech`, country: `Switzerland`, tagline: *"Defy Logic"*, order: `5`)
- `brd-razer` (Razer, slug: `razer`, country: `USA`, tagline: *"For Gamers. By Gamers."*, order: `6`)

### Seed Badges

- `bdg-hotdeal` (Hot Deal, slug: `hotdeal`, color: `rose` / `#e11d48`, ruleType: `system`, priority: `1`, default: `true`, canEdit: `false`, canDelete: `false`)
- `bdg-bestseller` (Bestseller, slug: `bestseller`, color: `amber` / `#d97706`, ruleType: `automatic`, priority: `2`, default: `true`, canEdit: `true`, canDelete: `false`)
- `bdg-toprated` (Top Rated, slug: `toprated`, color: `emerald` / `#059669`, ruleType: `automatic`, priority: `3`, default: `true`, canEdit: `true`, canDelete: `false`)
- `bdg-new` (New Arrival, slug: `new`, color: `sky` / `#0284c7`, ruleType: `manual`, priority: `4`, default: `true`, canEdit: `true`, canDelete: `false`)

---

## 3. Authentication Flow & Headers

For all secured endpoints, provide the JWT token obtained from `POST /api/v1/auth/login` or `POST /api/v1/auth/register` in the HTTP Authorization header:

```http
Authorization: Bearer <your_jwt_token_here>
Content-Type: application/json
```

---

## 4. Standard Response Envelopes & Error Models

The backend utilizes standard structured response envelopes across all modules.

### Standard Resource / Entity Response (`CommonResponse`)
Most catalog, category, brand, and badge endpoints return the `CommonResponse` wrapper:
```json
{
  "status": 200,
  "body": { ... },
  "message": "Operation successful description"
}
```

### Generic Action Confirmation Response (`ApiResponse`)
Returned by account actions (e.g., delete user, password change):
```json
{
  "success": true,
  "message": "User account removed",
  "data": null,
  "timestamp": "2026-09-05T13:45:00"
}
```

### Standard Error Models (`AppExceptionHandler`)

#### 1. Validation Error (`400 Bad Request`)
```json
{
  "status": 400,
  "body": {
    "name": "Product name is required",
    "price": "Price must be greater than 0"
  },
  "message": "Validation failed"
}
```

#### 2. Authentication Failure (`401 Unauthorized`)
```json
{
  "status": 401,
  "body": null,
  "message": "Invalid username or password"
}
```

#### 3. Authorization / Access Denied (`403 Forbidden`)
```json
{
  "status": 403,
  "body": null,
  "message": "Access denied: Admins are not authorized to create Admin or Superadmin accounts"
}
```

#### 4. Resource Not Found (`404 Not Found`)
```json
{
  "status": 404,
  "body": null,
  "message": "Product not found with ID: 999"
}
```

---

## 5. Auth Module Endpoints

### 1. User Login
Authenticates credentials and returns a signed JWT bearer token and user profile object.

- **Method**: `POST`
- **URL**: `/api/v1/auth/login`
- **Access**: `Public (All)`

#### Request Body
```json
{
  "username": "superadmin",
  "password": "admin123"
}
```

#### Response (`200 OK`)
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdXBlcmFkbWluIiwicm9sZSI6IlNVUEVSQURNSU4iLCJleHAiOjE3NzI4MDEzMTB9...",
  "user": {
    "id": 1,
    "username": "superadmin",
    "name": "System Owner & Super Admin",
    "email": "superadmin@etech.com",
    "role": "SUPERADMIN",
    "assignedBranch": null,
    "createdAt": "2026-08-26T00:18:08"
  }
}
```

#### cURL
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}'
```

---

### 2. Customer Registration
Registers a new customer storefront account and immediately signs a JWT token.

- **Method**: `POST`
- **URL**: `/api/v1/auth/register`
- **Access**: `Public (All)`

#### Request Body
```json
{
  "name": "Nimal Perera",
  "username": "nimalp",
  "email": "nimal@gmail.com",
  "password": "password123"
}
```

#### Response (`201 Created`)
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuaW1hbHAiLCJyb2xlIjoiQ1VTVE9NRVIiLCJleHAiOjE3NzI4MDEzMTB9...",
  "user": {
    "id": 5,
    "username": "nimalp",
    "name": "Nimal Perera",
    "email": "nimal@gmail.com",
    "role": "CUSTOMER",
    "assignedBranch": null,
    "createdAt": "2026-08-26T00:20:15"
  }
}
```

#### cURL
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Nimal Perera","username":"nimalp","email":"nimal@gmail.com","password":"password123"}'
```

---

### 3. Current User Session
Retrieves the profile of the currently logged-in user from the active JWT token.

- **Method**: `GET`
- **URL**: `/api/v1/auth/me`
- **Access**: `Authenticated (Any Role)`
- **Headers**: `Authorization: Bearer <token>`

#### Response (`200 OK`)
```json
{
  "id": 1,
  "username": "superadmin",
  "name": "System Owner & Super Admin",
  "email": "superadmin@etech.com",
  "role": "SUPERADMIN",
  "assignedBranch": null,
  "createdAt": "2026-08-26T00:18:08"
}
```

#### cURL
```bash
curl -X GET http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

---

## 6. User Management Module Endpoints

### 4. List Users Directory
Retrieves the user directory with dynamic permissions (`canManage` flag) and optional filtering.
- **Superadmin**: Can see all users across all roles (`canManage: true`).
- **Admin**: Cannot see `SUPERADMIN` (completely hidden); other Admins have `canManage: false`; Staff and Customers have `canManage: true`.

- **Method**: `GET`
- **URL**: `/api/v1/users`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`
- **Optional Query Parameters**:
  - `role`: Filter by role (`SUPERADMIN`, `ADMIN`, `STAFF`, `CUSTOMER`)
  - `branch`: Filter by branch ID (`BR-COL`, `BR-GAL`, `BR-MAT`, `BR-KAN`)
  - `search`: Case-insensitive search matching name, username, or email

#### Response (`200 OK`)
```json
[
  {
    "id": 2,
    "username": "admin",
    "name": "Store Administrator",
    "email": "admin@etech.com",
    "role": "ADMIN",
    "assignedBranch": null,
    "canManage": false,
    "createdAt": "2026-08-26T00:18:09"
  },
  {
    "id": 3,
    "username": "staff_colombo",
    "name": "Colombo Branch Operations",
    "email": "staff.colombo@etech.com",
    "role": "STAFF",
    "assignedBranch": "BR-COL",
    "canManage": true,
    "createdAt": "2026-08-26T00:18:09"
  }
]
```

#### cURL
```bash
curl -X GET "http://localhost:8080/api/v1/users?role=STAFF&branch=BR-COL" \
  -H "Authorization: Bearer <token>"
```

---

### 5. Get User by ID
Fetches a single user record by database ID.
- **Admin**: Cannot view Superadmin accounts (returns `404 Not Found`).

- **Method**: `GET`
- **URL**: `/api/v1/users/{id}`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`

#### Response (`200 OK`)
```json
{
  "id": 3,
  "username": "staff_colombo",
  "name": "Colombo Branch Operations",
  "email": "staff.colombo@etech.com",
  "role": "STAFF",
  "assignedBranch": "BR-COL",
  "canManage": true,
  "createdAt": "2026-08-26T00:18:09"
}
```

---

### 6. Create User Account
Creates a staff, admin, or customer user account with encrypted password and optional branch assignment.
- **Superadmin**: Can create `ADMIN`, `STAFF`, `CUSTOMER`.
- **Admin**: Can only create `STAFF`, `CUSTOMER` (`403 Forbidden` if attempting to create `ADMIN` or `SUPERADMIN`).

- **Method**: `POST`
- **URL**: `/api/v1/users`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`

#### Request Body
```json
{
  "name": "Kamal Silva",
  "username": "kamal_galle",
  "email": "kamal.galle@etech.com",
  "password": "password123",
  "role": "STAFF",
  "assignedBranch": "BR-GAL"
}
```

#### Response (`201 Created`)
```json
{
  "id": 6,
  "username": "kamal_galle",
  "name": "Kamal Silva",
  "email": "kamal.galle@etech.com",
  "role": "STAFF",
  "assignedBranch": "BR-GAL",
  "canManage": true,
  "createdAt": "2026-08-26T00:23:40"
}
```

---

### 7. Update User Details
Updates user information, assigned branch, and optional password override.
- **Superadmin**: Can modify all accounts (cannot downgrade Superadmin role).
- **Admin**: Cannot modify `ADMIN` or `SUPERADMIN` accounts (`403 Forbidden`).

- **Method**: `PUT`
- **URL**: `/api/v1/users/{id}`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`

#### Request Body
```json
{
  "name": "Kamal Silva Updated",
  "username": "kamal_galle",
  "email": "kamal.updated@etech.com",
  "password": "newOptionalPassword123",
  "role": "STAFF",
  "assignedBranch": "BR-GAL"
}
```

#### Response (`200 OK`)
```json
{
  "id": 6,
  "username": "kamal_galle",
  "name": "Kamal Silva Updated",
  "email": "kamal.updated@etech.com",
  "role": "STAFF",
  "assignedBranch": "BR-GAL",
  "canManage": true,
  "createdAt": "2026-08-26T00:23:40"
}
```

---

### 8. Change User Role
Changes a user's role and assigned branch.
- **Superadmin**: Can assign `ADMIN`, `STAFF`, `CUSTOMER`. Superadmin role itself is immutable.
- **Admin**: Can only switch between `CUSTOMER` and `STAFF`.

- **Method**: `PATCH`
- **URL**: `/api/v1/users/{id}/role`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`

#### Request Body
```json
{
  "role": "STAFF",
  "assignedBranch": "BR-COL"
}
```

#### Response (`200 OK`)
```json
{
  "id": 4,
  "username": "kasun",
  "name": "Kasun Perera",
  "email": "kasun.p@gmail.com",
  "role": "STAFF",
  "assignedBranch": "BR-COL",
  "canManage": true,
  "createdAt": "2026-08-26T00:18:09"
}
```

---

### 9. Delete User Account
Removes a user account.
- **Superadmin Account**: Undeletable by anyone (`400 Bad Request`).
- **Admin**: Cannot delete other Admin accounts (`403 Forbidden`).

- **Method**: `DELETE`
- **URL**: `/api/v1/users/{id}`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "User account removed",
  "data": null,
  "timestamp": "2026-09-05T13:45:00"
}
```

---

### 10. Update Self Profile
Updates the currently logged-in user's personal display name, username, and email.

- **Method**: `PUT`
- **URL**: `/api/v1/users/me/profile`
- **Access**: `Authenticated (Any Role)`
- **Headers**: `Authorization: Bearer <token>`

#### Request Body
```json
{
  "name": "Kasun P. Perera",
  "username": "kasun",
  "email": "kasun.new@gmail.com"
}
```

#### Response (`200 OK`)
```json
{
  "id": 4,
  "username": "kasun",
  "name": "Kasun P. Perera",
  "email": "kasun.new@gmail.com",
  "role": "CUSTOMER",
  "assignedBranch": null,
  "createdAt": "2026-08-26T00:18:09"
}
```

---

### 11. Change Self Password
Changes the current user's password after validating the existing password.

- **Method**: `PUT`
- **URL**: `/api/v1/users/me/password`
- **Access**: `Authenticated (Any Role)`
- **Headers**: `Authorization: Bearer <token>`

#### Request Body
```json
{
  "currentPassword": "customer123",
  "newPassword": "newSecurePassword123"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Password changed",
  "data": null,
  "timestamp": "2026-09-05T13:45:00"
}
```

---

## 7. Product Catalog & Inventory Module Endpoints

### 12. Get All Products
Fetches all active and inactive products (excluding soft-deleted products).

- **Method**: `GET`
- **URL**: `/api/v1/products/all`
- **Access**: `Public (All)`

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Products retrieved successfully",
  "body": [
    {
      "id": 1,
      "name": "ROG Strix SCAR 18 (2026)",
      "categoryId": "cat-laptops",
      "brandId": "brd-asus",
      "price": 849999.00,
      "originalPrice": 899999.00,
      "rating": 4.9,
      "reviewsCount": 48,
      "description": "Flagship 18-inch Mini-LED gaming laptop powered by Intel Core Ultra 9 & NVIDIA RTX 4090.",
      "fullDescription": "Dominate Windows 11 gaming with the 2026 ROG Strix SCAR 18...",
      "sku": "ETC-LAP-001",
      "badgeId": "bdg-toprated",
      "warranty": "3-Year Official Warranty",
      "alertEnabled": true,
      "lowStockMargin": 3,
      "specs": {
        "Processor": "Intel Core Ultra 9 185H (24 Cores, up to 5.8GHz)",
        "Graphics": "NVIDIA GeForce RTX 4090 16GB GDDR6 (175W)",
        "Memory": "64GB DDR5 5600MHz Dual-Channel",
        "Storage": "4TB NVMe PCIe 4.0 SSD (2TB x 2 RAID 0)",
        "Display": "18.0\" QHD+ (2560x1600) 240Hz Mini-LED HDR 1100"
      },
      "features": [
        "Conductonaut Extreme Liquid Metal on CPU & GPU",
        "Tri-Fan Cooling with Anti-Dust Technology"
      ],
      "images": [
        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80"
      ],
      "branchStock": {
        "BR-COL": 6,
        "BR-GAL": 3,
        "BR-MAT": 2,
        "BR-KAN": 2
      },
      "totalStock": 13,
      "productStatus": "ACTIVE",
      "createdAt": "2026-08-27T10:00:00",
      "updatedAt": null
    }
  ]
}
```

---

### 13. Filter Products with Pagination
Filters the active product catalog by category, brand, search keyword, price range, and badge with pagination and sorting.

- **Method**: `GET`
- **URL**: `/api/v1/products/filter`
- **Access**: `Public (All)`
- **Query Parameters**:
  - `category` *(optional)*: Category ID or supercategory ID
  - `brand` *(optional)*: Brand ID (e.g., `brd-asus`)
  - `search` *(optional)*: Product name search keyword
  - `minPrice` *(optional)*: Minimum price filter (e.g., `50000`)
  - `maxPrice` *(optional)*: Maximum price filter (e.g., `500000`)
  - `badge` *(optional)*: Badge ID (e.g., `bdg-toprated`)
  - `page` *(optional, default `0`)*: Page number (0-indexed)
  - `size` *(optional, default `20`)*: Page size limit
  - `sortBy` *(optional, default `id`)*: Sort property (`id`, `price`, `rating`, `name`)
  - `sortDir` *(optional, default `asc`)*: Sort direction (`asc`, `desc`)

#### Example Request
`GET http://localhost:8080/api/v1/products/filter?category=cat-laptops&minPrice=500000&page=0&size=10&sortBy=price&sortDir=desc`

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Products retrieved successfully",
  "body": [
    {
      "id": 1,
      "name": "ROG Strix SCAR 18 (2026)",
      "categoryId": "cat-laptops",
      "brandId": "brd-asus",
      "price": 849999.00,
      "originalPrice": 899999.00,
      "rating": 4.9,
      "reviewsCount": 48,
      "sku": "ETC-LAP-001",
      "badgeId": "bdg-toprated",
      "branchStock": {
        "BR-COL": 6,
        "BR-GAL": 3,
        "BR-MAT": 2,
        "BR-KAN": 2
      },
      "totalStock": 13,
      "productStatus": "ACTIVE"
    }
  ]
}
```

---

### 14. Get Product by ID
Retrieves single product details, technical specs, gallery images, and branch inventory breakdown.

- **Method**: `GET`
- **URL**: `/api/v1/products/{id}`
- **Access**: `Public (All)`

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Product retrieved by Id, successfully",
  "body": {
    "id": 1,
    "name": "ROG Strix SCAR 18 (2026)",
    "categoryId": "cat-laptops",
    "brandId": "brd-asus",
    "price": 849999.00,
    "originalPrice": 899999.00,
    "rating": 4.9,
    "reviewsCount": 48,
    "description": "Flagship 18-inch Mini-LED gaming laptop powered by Intel Core Ultra 9 & NVIDIA RTX 4090.",
    "fullDescription": "Dominate Windows 11 gaming with the 2026 ROG Strix SCAR 18...",
    "sku": "ETC-LAP-001",
    "badgeId": "bdg-toprated",
    "warranty": "3-Year Official Warranty",
    "alertEnabled": true,
    "lowStockMargin": 3,
    "specs": {
      "Processor": "Intel Core Ultra 9 185H",
      "Graphics": "NVIDIA GeForce RTX 4090 16GB"
    },
    "features": [
      "Conductonaut Extreme Liquid Metal"
    ],
    "images": [
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80"
    ],
    "branchStock": {
      "BR-COL": 6,
      "BR-GAL": 3,
      "BR-MAT": 2,
      "BR-KAN": 2
    },
    "totalStock": 13,
    "productStatus": "ACTIVE",
    "createdAt": "2026-08-27T10:00:00",
    "updatedAt": null
  }
}
```

---

### 15. Get Product by SKU
Retrieves product details by its unique hardware SKU identifier.

- **Method**: `GET`
- **URL**: `/api/v1/products/sku/{sku}`
- **Access**: `Public (All)`

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Product retrieved by SKU, successfully",
  "body": {
    "id": 1,
    "name": "ROG Strix SCAR 18 (2026)",
    "sku": "ETC-LAP-001",
    "price": 849999.00,
    "totalStock": 13
  }
}
```

---

### 16. Get Products by Status
Retrieves products filtered by enum status (`ACTIVE`, `INACTIVE`, `DELETED`).

- **Method**: `GET`
- **URL**: `/api/v1/products/status`
- **Access**: `Public (All)`
- **Query Parameter**:
  - `status` *(required)*: `ACTIVE`, `INACTIVE`, `DELETED`

#### Example Request
`GET http://localhost:8080/api/v1/products/status?status=ACTIVE`

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Products retrieved by status, successfully",
  "body": [ ... ]
}
```

---

### 17. Create Product
Creates a new product with category/brand associations, specs, features, up to 5 gallery images, and initial branch inventory stock allocations.

- **Method**: `POST`
- **URL**: `/api/v1/products/create`
- **Access**: `SUPERADMIN`, `ADMIN`, `STAFF`
- **Headers**: `Authorization: Bearer <token>`

#### Request Body
```json
{
  "name": "Corsair K70 MAX RGB Magnetic-Mechanical Keyboard",
  "categoryId": "cat-peripherals",
  "brandId": "brd-corsair",
  "price": 68000.00,
  "originalPrice": 75000.00,
  "description": "Magnetic-mechanical gaming keyboard with adjustable MGX switches.",
  "fullDescription": "The CORSAIR K70 MAX RGB Magnetic-Mechanical Gaming Keyboard features...",
  "sku": "ETC-KEY-002",
  "badgeId": "bdg-new",
  "warranty": "2-Year Warranty",
  "alertEnabled": true,
  "lowStockMargin": 5,
  "specs": {
    "Switch Type": "CORSAIR MGX Magnetic Switches",
    "Polling Rate": "Up to 8,000Hz hyper-polling"
  },
  "features": [
    "Adjustable Pre-Travel Distance (0.4mm to 3.6mm)",
    "Rapid Trigger Technology"
  ],
  "images": [
    "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80"
  ],
  "branchStock": {
    "BR-COL": 10,
    "BR-GAL": 5,
    "BR-MAT": 3,
    "BR-KAN": 4
  },
  "productStatus": "ACTIVE"
}
```

#### Response (`201 Created`)
```json
{
  "status": 201,
  "message": "Product created successfully",
  "body": null
}
```

---

### 18. Update Product
Updates full product metadata, pricing, specifications, features, images, and branch inventory allocations.

- **Method**: `PUT`
- **URL**: `/api/v1/products/update/{id}`
- **Access**: `SUPERADMIN`, `ADMIN`, `STAFF`
- **Headers**: `Authorization: Bearer <token>`

#### Request Body
```json
{
  "name": "Corsair K70 MAX RGB (Updated)",
  "categoryId": "cat-peripherals",
  "brandId": "brd-corsair",
  "price": 64999.00,
  "originalPrice": 75000.00,
  "description": "Updated magnetic-mechanical gaming keyboard description.",
  "fullDescription": "Full updated details...",
  "sku": "ETC-KEY-002",
  "badgeId": "bdg-hotdeal",
  "warranty": "2-Year Warranty",
  "alertEnabled": true,
  "lowStockMargin": 5,
  "specs": {
    "Switch Type": "CORSAIR MGX Magnetic Switches"
  },
  "features": [
    "Rapid Trigger Technology"
  ],
  "images": [
    "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80"
  ],
  "branchStock": {
    "BR-COL": 15,
    "BR-GAL": 8,
    "BR-MAT": 5,
    "BR-KAN": 6
  },
  "productStatus": "ACTIVE"
}
```

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Product updated successfully",
  "body": {
    "id": 8,
    "name": "Corsair K70 MAX RGB (Updated)",
    "sku": "ETC-KEY-002",
    "price": 64999.00,
    "totalStock": 34,
    "productStatus": "ACTIVE"
  }
}
```

---

### 19. Update Branch Inventory Stock
Directly updates branch warehouse stock quantities for a specific product.

- **Method**: `PATCH`
- **URL**: `/api/v1/products/update-inventory`
- **Access**: `SUPERADMIN`, `ADMIN`, `STAFF`
- **Headers**: `Authorization: Bearer <token>`

#### Request Body
```json
{
  "productId": 1,
  "branchStock": {
    "BR-COL": 20,
    "BR-GAL": 10,
    "BR-MAT": 5,
    "BR-KAN": 8
  }
}
```

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Branch inventory updated successfully",
  "body": {
    "BR-COL": 20,
    "BR-GAL": 10,
    "BR-MAT": 5,
    "BR-KAN": 8
  }
}
```

---

### 20. Update Product Status
Updates the lifecycle status of a product.

- **Method**: `PATCH`
- **URL**: `/api/v1/products/update-status/{id}`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameter**:
  - `status` *(required)*: `ACTIVE`, `INACTIVE`, `DELETED`

#### Example Request
`PATCH http://localhost:8080/api/v1/products/update-status/1?status=INACTIVE`

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Product status updated successfully",
  "body": null
}
```

---

### 21. Delete Product
Performs a soft delete on the product by transitioning its status to `DELETED`.

- **Method**: `DELETE`
- **URL**: `/api/v1/products/delete/{id}`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Product removed",
  "body": null
}
```

---

## 8. Category Management Module Endpoints

### 22. Create Category
Creates a new storefront category or subcategory.

- **Method**: `POST`
- **URL**: `/api/v1/categories/create`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`

#### Request Body
```json
{
  "id": "cat-audio",
  "superCategoryId": "cat-peripherals",
  "name": "Gaming Audio & Headsets",
  "slug": "audio",
  "icon": "🎧",
  "description": "Spatial sound gaming headsets, DACs, and studio microphones",
  "featured": true,
  "displayOrder": 7,
  "categoryStatus": "ACTIVE"
}
```

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Category created successfully",
  "body": null
}
```

---

### 23. Get All Categories
Retrieves all non-deleted categories ordered by display order.

- **Method**: `GET`
- **URL**: `/api/v1/categories/all`
- **Access**: `Public (All)`

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Categories retrieved successfully",
  "body": [
    {
      "id": "cat-laptops",
      "superCategoryId": null,
      "name": "Laptops & Notebooks",
      "slug": "laptops",
      "icon": "💻",
      "description": "High-performance gaming, ultrabooks, and professional workstations",
      "featured": true,
      "displayOrder": 1,
      "categoryStatus": "ACTIVE",
      "createdAt": "2026-08-26T00:00:00",
      "updatedAt": null
    }
  ]
}
```

---

### 24. Get Category by ID
- **Method**: `GET`
- **URL**: `/api/v1/categories/{id}`
- **Access**: `Public (All)`

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Category retrieved successfully",
  "body": {
    "id": "cat-laptops",
    "superCategoryId": null,
    "name": "Laptops & Notebooks",
    "slug": "laptops",
    "icon": "💻",
    "description": "High-performance gaming, ultrabooks, and professional workstations",
    "featured": true,
    "displayOrder": 1,
    "categoryStatus": "ACTIVE"
  }
}
```

---

### 25. Get Category by Slug
- **Method**: `GET`
- **URL**: `/api/v1/categories/slug/{slug}`
- **Access**: `Public (All)`

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Category retrieved successfully",
  "body": {
    "id": "cat-laptops",
    "slug": "laptops",
    "name": "Laptops & Notebooks"
  }
}
```

---

### 26. Get Category by Name
- **Method**: `GET`
- **URL**: `/api/v1/categories/name/{name}`
- **Access**: `Public (All)`

---

### 27. Filter Categories
Searches non-deleted categories by name or slug keyword.

- **Method**: `GET`
- **URL**: `/api/v1/categories/filter`
- **Access**: `Public (All)`
- **Query Parameter**: `search` (e.g. `laptop`)

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Categories filtered successfully",
  "body": [ ... ]
}
```

---

### 28. Get Categories by Status
- **Method**: `GET`
- **URL**: `/api/v1/categories/status`
- **Access**: `Public (All)`
- **Query Parameter**: `status` (`ACTIVE`, `INACTIVE`, `DELETED`)

---

### 29. Update Category
- **Method**: `PUT`
- **URL**: `/api/v1/categories/update/{id}`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`

#### Request Body
```json
{
  "name": "Laptops & Mobile Workstations",
  "slug": "laptops",
  "icon": "💻",
  "description": "Updated description",
  "featured": true,
  "displayOrder": 1,
  "categoryStatus": "ACTIVE"
}
```

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Category updated successfully",
  "body": null
}
```

---

### 30. Update Category Status
- **Method**: `PATCH`
- **URL**: `/api/v1/categories/update-status/{id}`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameter**: `status` (`ACTIVE`, `INACTIVE`, `DELETED`)

---

### 31. Delete Category (Soft Delete)
Sets category status to `DELETED`.

- **Method**: `DELETE`
- **URL**: `/api/v1/categories/delete/{id}`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Category deleted successfully",
  "body": null
}
```

---

### 32. Permanently Delete Category
Unlinks attached products and subcategories, and permanently removes the category record.

- **Method**: `DELETE`
- **URL**: `/api/v1/categories/perma-delete/{id}`
- **Access**: `SUPERADMIN` (Root owner only)
- **Headers**: `Authorization: Bearer <token>`

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Category permanently deleted successfully",
  "body": null
}
```

---

## 9. Brand Management Module Endpoints

### 33. Create Brand
Registers a new official hardware manufacturer partner brand.

- **Method**: `POST`
- **URL**: `/api/v1/brands/create`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`

#### Request Body
```json
{
  "id": "brd-nzxt",
  "name": "NZXT",
  "slug": "nzxt",
  "logoUrl": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=200&auto=format&fit=crop&q=80",
  "country": "USA",
  "foundedYear": "2004",
  "websiteUrl": "https://nzxt.com",
  "tagline": "Build Extraordinary",
  "description": "PC gaming hardware, cooling, cases, and Kraken AIOs",
  "featured": true,
  "status": "ACTIVE",
  "displayOrder": 7
}
```

#### Response (`201 Created`)
```json
{
  "status": 201,
  "message": "Brand created successfully",
  "body": null
}
```

---

### 34. Get All Brands
Retrieves all partner brands ordered by display order.

- **Method**: `GET`
- **URL**: `/api/v1/brands/all`
- **Access**: `Public (All)`

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Brands retrieved successfully",
  "body": [
    {
      "id": "brd-asus",
      "name": "ASUS",
      "slug": "asus",
      "logoUrl": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200&auto=format&fit=crop&q=80",
      "country": "Taiwan",
      "foundedYear": "1989",
      "websiteUrl": "https://www.asus.com",
      "tagline": "In Search of Incredible",
      "description": "Leading provider of ROG gaming hardware, laptops, motherboards, and displays.",
      "featured": true,
      "status": "ACTIVE",
      "displayOrder": 1,
      "createdAt": "2026-08-26T00:00:00",
      "updatedAt": null
    }
  ]
}
```

---

### 35. Get Featured Brands
Retrieves active brands marked as featured for the storefront brand showcase.

- **Method**: `GET`
- **URL**: `/api/v1/brands/featured`
- **Access**: `Public (All)`

---

### 36. Get Brand by ID
- **Method**: `GET`
- **URL**: `/api/v1/brands/{id}`
- **Access**: `Public (All)`

---

### 37. Get Brand by Slug
- **Method**: `GET`
- **URL**: `/api/v1/brands/slug/{slug}`
- **Access**: `Public (All)`

---

### 38. Get Brand by Name
- **Method**: `GET`
- **URL**: `/api/v1/brands/name/{name}`
- **Access**: `Public (All)`

---

### 39. Filter Brands
- **Method**: `GET`
- **URL**: `/api/v1/brands/filter`
- **Access**: `Public (All)`
- **Query Parameter**: `search` (e.g. `asus`)

---

### 40. Get Brands by Status
- **Method**: `GET`
- **URL**: `/api/v1/brands/status/{status}`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`
- **Path Variable**: `status` (`ACTIVE`, `INACTIVE`, `DELETED`)

---

### 41. Update Brand
- **Method**: `PUT`
- **URL**: `/api/v1/brands/update/{id}`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`

#### Request Body
```json
{
  "name": "ASUS ROG",
  "slug": "asus",
  "logoUrl": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200&auto=format&fit=crop&q=80",
  "country": "Taiwan",
  "tagline": "For Those Who Dare",
  "featured": true,
  "status": "ACTIVE",
  "displayOrder": 1
}
```

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Brand updated successfully",
  "body": null
}
```

---

### 42. Update Brand Status
- **Method**: `PATCH`
- **URL**: `/api/v1/brands/update-status/{id}`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameter**: `status` (`ACTIVE`, `INACTIVE`, `DELETED`)

---

### 43. Delete Brand (Soft Delete)
Sets brand status to `DELETED`.

- **Method**: `DELETE`
- **URL**: `/api/v1/brands/delete/{id}`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Brand deleted successfully",
  "body": null
}
```

---

### 44. Permanently Delete Brand
Unlinks all associated products and permanently deletes the brand record.

- **Method**: `DELETE`
- **URL**: `/api/v1/brands/perma-delete/{id}`
- **Access**: `SUPERADMIN` (Root owner only)
- **Headers**: `Authorization: Bearer <token>`

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Brand permanently deleted successfully",
  "body": null
}
```

---

## 10. Badge & Rules Engine Module Endpoints

### 45. Create Badge
Creates a new promotional, manual, or automated reach badge tag.

- **Method**: `POST`
- **URL**: `/api/v1/badges/create`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`

#### Request Body
```json
{
  "id": "bdg-clearance",
  "name": "Clearance Sale",
  "slug": "clearance",
  "colorKey": "purple",
  "colorHex": "#9333ea",
  "purpose": "Inventory clearance discount",
  "standardDescription": "Final inventory clearance hardware",
  "ruleType": "manual",
  "criteria": "clearance_stock",
  "priority": 5,
  "isSystemDefault": false,
  "canEdit": true,
  "canDelete": true,
  "status": "ACTIVE"
}
```

#### Response (`201 Created`)
```json
{
  "status": 201,
  "message": "Badge created successfully",
  "body": null
}
```

---

### 46. Get All Badges
Retrieves all badges ordered by priority ascending.

- **Method**: `GET`
- **URL**: `/api/v1/badges/all`
- **Access**: `Public (All)`

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Badges retrieved successfully",
  "body": [
    {
      "id": "bdg-hotdeal",
      "name": "Hot Deal",
      "slug": "hotdeal",
      "colorKey": "rose",
      "colorHex": "#e11d48",
      "purpose": "Active promotional discount campaign",
      "standardDescription": "Discounted hardware with active countdown timer",
      "ruleType": "system",
      "criteria": "promo_active",
      "priority": 1,
      "isSystemDefault": true,
      "canEdit": false,
      "canDelete": false,
      "status": "ACTIVE",
      "createdAt": "2026-08-26T00:00:00",
      "updatedAt": null
    }
  ]
}
```

---

### 47. Get Active Badges
Retrieves all badges where status is `ACTIVE`.

- **Method**: `GET`
- **URL**: `/api/v1/badges/active`
- **Access**: `Public (All)`

---

### 48. Get Badge by ID
- **Method**: `GET`
- **URL**: `/api/v1/badges/{id}`
- **Access**: `Public (All)`

---

### 49. Get Badge by Slug
- **Method**: `GET`
- **URL**: `/api/v1/badges/slug/{slug}`
- **Access**: `Public (All)`

---

### 50. Get Badge by Name
- **Method**: `GET`
- **URL**: `/api/v1/badges/name/{name}`
- **Access**: `Public (All)`

---

### 51. Filter Badges
- **Method**: `GET`
- **URL**: `/api/v1/badges/filter`
- **Access**: `Public (All)`
- **Query Parameter**: `search` (e.g. `deal`)

---

### 52. Update Badge
Updates a badge's properties (checks `canEdit` flag; protected system badges reject modifications).

- **Method**: `PUT`
- **URL**: `/api/v1/badges/update/{id}`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Badge updated successfully",
  "body": null
}
```

---

### 53. Update Badge Status
- **Method**: `PATCH`
- **URL**: `/api/v1/badges/update-status/{id}`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameter**: `status` (`ACTIVE`, `INACTIVE`, `DELETED`)

---

### 54. Delete Badge (Soft Delete)
Soft deletes a badge (enforces `canDelete: true`).

- **Method**: `DELETE`
- **URL**: `/api/v1/badges/delete/{id}`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Badge deleted successfully",
  "body": null
}
```

---

### 55. Permanently Delete Badge
Unlinks badge from associated products and permanently removes it (enforces `canDelete: true`).

- **Method**: `DELETE`
- **URL**: `/api/v1/badges/perma-delete/{id}`
- **Access**: `SUPERADMIN` (Root owner only)
- **Headers**: `Authorization: Bearer <token>`

#### Response (`200 OK`)
```json
{
  "status": 200,
  "message": "Badge permanently deleted successfully",
  "body": null
}
```

---

## 11. Role-Based Access Control (RBAC) Matrix

| Endpoint | Method | Public / Guest | CUSTOMER | STAFF | ADMIN | SUPERADMIN |
|---|---|:---:|:---:|:---:|:---:|:---:|
| `/api/v1/auth/login` | `POST` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/auth/register` | `POST` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/auth/me` | `GET` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/users/me/profile` | `PUT` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/users/me/password` | `PUT` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/users` | `GET` | ❌ | ❌ | ❌ | ✅ *(Superadmin hidden)* | ✅ *(Full directory)* |
| `/api/v1/users/{id}` | `GET` | ❌ | ❌ | ❌ | ✅ *(Superadmin returns 404)* | ✅ |
| `/api/v1/users` | `POST` | ❌ | ❌ | ❌ | ✅ *(Staff & Customer only)* | ✅ *(Admin, Staff, Customer)* |
| `/api/v1/users/{id}` | `PUT` | ❌ | ❌ | ❌ | ✅ *(Staff & Customer only)* | ✅ *(All accounts)* |
| `/api/v1/users/{id}/role` | `PATCH` | ❌ | ❌ | ❌ | ✅ *(Customer <-> Staff only)* | ✅ *(Admin, Staff, Customer)* |
| `/api/v1/users/{id}` | `DELETE` | ❌ | ❌ | ❌ | ✅ *(Staff & Customer only)* | ✅ *(All except superadmin)* |
| `/api/v1/products/all` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/products/filter` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/products/{id}` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/products/sku/{sku}` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/products/status` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/products/create` | `POST` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `/api/v1/products/update/{id}` | `PUT` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `/api/v1/products/update-inventory` | `PATCH` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `/api/v1/products/update-status/{id}` | `PATCH` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/api/v1/products/delete/{id}` | `DELETE` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/api/v1/categories/all` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/categories/{id}` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/categories/slug/{slug}` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/categories/name/{name}` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/categories/filter` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/categories/status` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/categories/create` | `POST` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/api/v1/categories/update/{id}` | `PUT` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/api/v1/categories/update-status/{id}` | `PATCH` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/api/v1/categories/delete/{id}` | `DELETE` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/api/v1/categories/perma-delete/{id}` | `DELETE` | ❌ | ❌ | ❌ | ❌ | ✅ *(Superadmin only)* |
| `/api/v1/brands/all` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/brands/featured` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/brands/{id}` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/brands/slug/{slug}` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/brands/name/{name}` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/brands/filter` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/brands/status/{status}` | `GET` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/api/v1/brands/create` | `POST` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/api/v1/brands/update/{id}` | `PUT` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/api/v1/brands/update-status/{id}` | `PATCH` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/api/v1/brands/delete/{id}` | `DELETE` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/api/v1/brands/perma-delete/{id}` | `DELETE` | ❌ | ❌ | ❌ | ❌ | ✅ *(Superadmin only)* |
| `/api/v1/badges/all` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/badges/active` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/badges/{id}` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/badges/slug/{slug}` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/badges/name/{name}` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/badges/filter` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/badges/create` | `POST` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/api/v1/badges/update/{id}` | `PUT` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/api/v1/badges/update-status/{id}` | `PATCH` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/api/v1/badges/delete/{id}` | `DELETE` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/api/v1/badges/perma-delete/{id}` | `DELETE` | ❌ | ❌ | ❌ | ❌ | ✅ *(Superadmin only)* |

---

## 12. Frontend Integration Client Helper

A clean, modular JavaScript service client template for frontend integration:

```javascript
const BASE_URL = 'http://localhost:8080/api/v1';

// Unified HTTP Request Wrapper with JWT Token Injection
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('etech_jwt_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data?.message || (data?.body && typeof data.body === 'object' 
      ? Object.values(data.body).join(', ') 
      : 'An unexpected error occurred');
    throw new Error(errorMessage);
  }

  return data;
}

// 1. Authentication Services
export const authApi = {
  login: async (username, password) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    localStorage.setItem('etech_jwt_token', res.token);
    localStorage.setItem('etech_current_user', JSON.stringify(res.user));
    return res;
  },

  register: async (userData) => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    localStorage.setItem('etech_jwt_token', res.token);
    localStorage.setItem('etech_current_user', JSON.stringify(res.user));
    return res;
  },

  getMe: async () => {
    return await request('/auth/me');
  },

  logout: () => {
    localStorage.removeItem('etech_jwt_token');
    localStorage.removeItem('etech_current_user');
  }
};

// 2. Product Catalog Services
export const productsApi = {
  getAll: async () => {
    const res = await request('/products/all');
    return res.body;
  },

  getFiltered: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/products/filter?${query}`);
    return res.body;
  },

  getById: async (id) => {
    const res = await request(`/products/${id}`);
    return res.body;
  },

  getBySku: async (sku) => {
    const res = await request(`/products/sku/${sku}`);
    return res.body;
  },

  create: async (productData) => {
    return await request('/products/create', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  update: async (id, productData) => {
    const res = await request(`/products/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
    return res.body;
  },

  updateInventory: async (productId, branchStock) => {
    const res = await request('/products/update-inventory', {
      method: 'PATCH',
      body: JSON.stringify({ productId, branchStock })
    });
    return res.body;
  },

  delete: async (id) => {
    return await request(`/products/delete/${id}`, {
      method: 'DELETE'
    });
  }
};

// 3. Category Services
export const categoriesApi = {
  getAll: async () => {
    const res = await request('/categories/all');
    return res.body;
  },

  getById: async (id) => {
    const res = await request(`/categories/${id}`);
    return res.body;
  },

  getBySlug: async (slug) => {
    const res = await request(`/categories/slug/${slug}`);
    return res.body;
  },

  create: async (categoryData) => {
    return await request('/categories/create', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  },

  update: async (id, categoryData) => {
    return await request(`/categories/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  },

  delete: async (id) => {
    return await request(`/categories/delete/${id}`, {
      method: 'DELETE'
    });
  }
};

// 4. Brand Services
export const brandsApi = {
  getAll: async () => {
    const res = await request('/brands/all');
    return res.body;
  },

  getFeatured: async () => {
    const res = await request('/brands/featured');
    return res.body;
  },

  create: async (brandData) => {
    return await request('/brands/create', {
      method: 'POST',
      body: JSON.stringify(brandData)
    });
  },

  update: async (id, brandData) => {
    return await request(`/brands/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(brandData)
    });
  },

  delete: async (id) => {
    return await request(`/brands/delete/${id}`, {
      method: 'DELETE'
    });
  }
};

// 5. Badge Services
export const badgesApi = {
  getAll: async () => {
    const res = await request('/badges/all');
    return res.body;
  },

  getActive: async () => {
    const res = await request('/badges/active');
    return res.body;
  },

  create: async (badgeData) => {
    return await request('/badges/create', {
      method: 'POST',
      body: JSON.stringify(badgeData)
    });
  },

  update: async (id, badgeData) => {
    return await request(`/badges/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(badgeData)
    });
  },

  delete: async (id) => {
    return await request(`/badges/delete/${id}`, {
      method: 'DELETE'
    });
  }
};

// 6. User Management Services
export const usersApi = {
  getUsers: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return await request(`/users?${query}`);
  },

  getUserById: async (id) => {
    return await request(`/users/${id}`);
  },

  createUser: async (userData) => {
    return await request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  updateUser: async (id, userData) => {
    return await request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  changeRole: async (id, roleData) => {
    return await request(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify(roleData)
    });
  },

  deleteUser: async (id) => {
    return await request(`/users/${id}`, {
      method: 'DELETE'
    });
  },

  updateProfile: async (profileData) => {
    return await request('/users/me/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  changePassword: async (passwordData) => {
    return await request('/users/me/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    });
  }
};
```
