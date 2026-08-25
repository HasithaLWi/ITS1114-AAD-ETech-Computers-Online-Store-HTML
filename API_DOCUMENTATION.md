# ETech Computers — Backend API Reference & Testing Guide

> **Base URL**: `http://localhost:8080/api/v1`  
> **Security Protocol**: Stateless JWT Bearer Authentication (`Authorization: Bearer <JWT_TOKEN>`)  
> **Content-Type**: `application/json`

---

## Table of Contents
1. [Default Seed Credentials](#1-default-seed-credentials)
2. [Authentication Flow & Headers](#2-authentication-flow--headers)
3. [Auth Endpoints (`/api/v1/auth`)](#3-auth-endpoints)
   - [1. User Login (`POST /api/v1/auth/login`)](#1-user-login)
   - [2. Customer Registration (`POST /api/v1/auth/register`)](#2-customer-registration)
   - [3. Current User Session (`GET /api/v1/auth/me`)](#3-current-user-session)
4. [User Management Endpoints (`/api/v1/users`)](#4-user-management-endpoints)
   - [4. List Users (`GET /api/v1/users`)](#4-list-users)
   - [5. Get User by ID (`GET /api/v1/users/{id}`)](#5-get-user-by-id)
   - [6. Create User Account (`POST /api/v1/users`)](#6-create-user-account)
   - [7. Update User Details (`PUT /api/v1/users/{id}`)](#7-update-user-details)
   - [8. Change User Role (`PATCH /api/v1/users/{id}/role`)](#8-change-user-role)
   - [9. Delete User Account (`DELETE /api/v1/users/{id}`)](#9-delete-user-account)
   - [10. Update Self Profile (`PUT /api/v1/users/me/profile`)](#10-update-self-profile)
   - [11. Change Self Password (`PUT /api/v1/users/me/password`)](#11-change-self-password)
5. [Role-Based Access Matrix (RBAC)](#5-role-based-access-matrix-rbac)
6. [Standard Error Responses](#6-standard-error-responses)

---

## 1. Default Seed Credentials

Upon startup, the database automatically populates default test accounts:

| Username | Password | Role | Assigned Branch | Description |
|---|---|---|---|---|
| `superadmin` | `admin123` | `SUPERADMIN` | `null` (Global Owner) | Root immutable system owner with full privileges. |
| `admin` | `admin123` | `ADMIN` | `null` (Store Wide) | Store administrator managing staff and customers. |
| `staff_colombo` | `staff123` | `STAFF` | `BR-COL` (Colombo Hub) | Branch staff operations. |
| `kasun` | `customer123` | `CUSTOMER` | `null` | Customer storefront user. |

### Available Seed Branches
- `BR-COL`: Colombo Main Hub
- `BR-GAL`: Galle Tech Hub
- `BR-MAT`: Matara Regional Hub
- `BR-KAN`: Kandy Central Hub

---

## 2. Authentication Flow & Headers

For all secured endpoints, include the JWT token returned from login/register in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token_here>
Content-Type: application/json
```

---

## 3. Auth Endpoints

### 1. User Login
Authenticates any system user (`SUPERADMIN`, `ADMIN`, `STAFF`, `CUSTOMER`) and returns a signed JWT token containing user role and identity claims.

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/v1/auth/login`
- **Access**: `Public`

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
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoic3VwZXJhZG1pbiIsInJvbGUiOiJTVVBFUkFETUlOIiwiZXhwIjoxNzI0NzAxMzEwfQ...",
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

#### cURL Example
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}'
```

---

### 2. Customer Registration
Registers a new customer storefront account and immediately returns a JWT session token.

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/v1/auth/register`
- **Access**: `Public`

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
  "token": "eyJhbGciOiJIUzI1NiJ9...",
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

---

### 3. Current User Session
Retrieves the logged-in user profile from the active JWT token.

- **Method**: `GET`
- **URL**: `http://localhost:8080/api/v1/auth/me`
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

---

## 4. User Management Endpoints

### 4. List Users
Returns system users with optional filtering.
- **Superadmin**: Returns all users across all roles (`canManage: true`).
- **Admin**: Returns other Admins (`canManage: false`), Staff (`canManage: true`), Customers (`canManage: true`). **`SUPERADMIN` is completely hidden**.

- **Method**: `GET`
- **URL**: `http://localhost:8080/api/v1/users`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`
- **Optional Query Parameters**:
  - `role`: Filter by role (`SUPERADMIN`, `ADMIN`, `STAFF`, `CUSTOMER`)
  - `branch`: Filter by branch ID (`BR-COL`, `BR-GAL`, `BR-MAT`, `BR-KAN`)
  - `search`: Search term matching name, username, or email

#### Example Query
`http://localhost:8080/api/v1/users?role=STAFF&branch=BR-COL&search=colombo`

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

---

### 5. Get User by ID
Fetches a single user record by database ID.

- **Method**: `GET`
- **URL**: `http://localhost:8080/api/v1/users/{id}`
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
Creates a new staff, admin, or customer user account.
- **Superadmin**: Can create `ADMIN`, `STAFF`, `CUSTOMER`.
- **Admin**: Can only create `STAFF`, `CUSTOMER`. (Creating `ADMIN` or `SUPERADMIN` yields `403 Forbidden`).

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/v1/users`
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
- **Admin**: Cannot modify `ADMIN` or `SUPERADMIN` accounts (`403 Forbidden`).

- **Method**: `PUT`
- **URL**: `http://localhost:8080/api/v1/users/{id}`
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
- **Superadmin**: Can switch between `ADMIN`, `STAFF`, `CUSTOMER`.
- **Admin**: Can only switch between `CUSTOMER` and `STAFF`. (Promoting to `ADMIN` yields `403 Forbidden`).
- **Superadmin account**: Role is immutable.

- **Method**: `PATCH`
- **URL**: `http://localhost:8080/api/v1/users/{id}/role`
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
Deletes a user account.
- **Superadmin account (`superadmin`)**: Cannot be deleted by anyone (`400 Bad Request`).
- **Admin**: Cannot delete other Admin accounts or Superadmin (`403 Forbidden`).

- **Method**: `DELETE`
- **URL**: `http://localhost:8080/api/v1/users/{id}`
- **Access**: `SUPERADMIN`, `ADMIN`
- **Headers**: `Authorization: Bearer <token>`

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "User account removed"
}
```

---

### 10. Update Self Profile
Updates the currently logged-in user's personal details (name, username, email).

- **Method**: `PUT`
- **URL**: `http://localhost:8080/api/v1/users/me/profile`
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
Changes the current user's password after validating the old password.

- **Method**: `PUT`
- **URL**: `http://localhost:8080/api/v1/users/me/password`
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
  "message": "Password changed"
}
```

---

## 5. Role-Based Access Matrix (RBAC)

| Endpoint | Access Rule | Allowed Roles |
|---|---|---|
| `POST /api/v1/auth/login` | Public | All / Guests |
| `POST /api/v1/auth/register` | Public | All / Guests |
| `GET /api/v1/auth/me` | Authenticated | `SUPERADMIN`, `ADMIN`, `STAFF`, `CUSTOMER` |
| `PUT /api/v1/users/me/profile` | Authenticated | `SUPERADMIN`, `ADMIN`, `STAFF`, `CUSTOMER` |
| `PUT /api/v1/users/me/password` | Authenticated | `SUPERADMIN`, `ADMIN`, `STAFF`, `CUSTOMER` |
| `GET /api/v1/users` | Guarded Directory | `SUPERADMIN`, `ADMIN` |
| `GET /api/v1/users/{id}` | Guarded View | `SUPERADMIN`, `ADMIN` |
| `POST /api/v1/users` | Account Creation | `SUPERADMIN` (Admin, Staff, Customer)<br>`ADMIN` (Staff, Customer only) |
| `PUT /api/v1/users/{id}` | Account Editing | `SUPERADMIN` (All accounts)<br>`ADMIN` (Staff & Customer only) |
| `PATCH /api/v1/users/{id}/role` | Role Assignment | `SUPERADMIN` (Admin, Staff, Customer)<br>`ADMIN` (Staff & Customer only) |
| `DELETE /api/v1/users/{id}` | Account Deletion | `SUPERADMIN` (Admin, Staff, Customer)<br>`ADMIN` (Staff & Customer only)<br>*Superadmin account is undeletable.* |

---

## 6. Standard Error Responses

When an error occurs, the API returns the appropriate HTTP status code with a JSON payload:

### Example: Validation Error (`400 Bad Request`)
```json
{
  "status": 400,
  "body": {
    "email": "Email must be valid",
    "username": "Username must be between 3 and 50 characters"
  },
  "message": "Validation failed"
}
```

### Example: Unauthorized (`401 Unauthorized`)
```json
{
  "status": 401,
  "body": null,
  "message": "Invalid username or password"
}
```

### Example: Forbidden (`403 Forbidden`)
```json
{
  "status": 403,
  "body": null,
  "message": "Admins are not authorized to create Admin or Superadmin accounts"
}
```

### Example: Resource Not Found (`404 Not Found`)
```json
{
  "status": 404,
  "body": null,
  "message": "User not found with id: 999"
}
```

---

## 7. Frontend Integration Snippet (`JavaScript Fetch`)

```javascript
const BASE_URL = 'http://localhost:8080/api/v1';

// 1. Sign In
async function login(username, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error((await res.json()).message);
  const data = await res.json();
  localStorage.setItem('token', data.token);
  return data.user;
}

// 2. Fetch User Directory
async function getUsers() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return await res.json();
}
```
