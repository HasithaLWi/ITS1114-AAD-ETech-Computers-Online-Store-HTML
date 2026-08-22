// ============================================================
//  src/data/users.js — Central Authentication & Seed User Accounts
// ============================================================

export const DEFAULT_USERS = [
  {
    id: 'USR-100001',
    username: 'admin',
    name: 'System Admin',
    email: 'admin@etech.com',
    password: 'admin123',
    role: 'ADMIN',
    assignedBranch: 'BR-COL',
    createdAt: 'Jan 15, 2026'
  },
  {
    id: 'USR-100002',
    username: 'staff',
    name: 'Galle Operations Staff',
    email: 'staff@etech.com',
    password: 'staff123',
    role: 'STAFF',
    assignedBranch: 'BR-GAL',
    createdAt: 'Feb 01, 2026'
  },
  {
    id: 'USR-100003',
    username: 'customer',
    name: 'John Doe',
    email: 'customer@etech.com',
    password: 'customer123',
    role: 'CUSTOMER',
    assignedBranch: null,
    createdAt: 'Mar 10, 2026'
  }
];
