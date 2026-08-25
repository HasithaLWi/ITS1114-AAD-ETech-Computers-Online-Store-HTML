// ============================================================
//  src/data/users.js — Central User Reference Data
// ============================================================

export const DEFAULT_USERS = [
  {
    id: 1,
    username: 'superadmin',
    name: 'System Owner & Super Admin',
    email: 'superadmin@etech.com',
    role: 'SUPERADMIN',
    assignedBranch: null,
    createdAt: 'Jan 01, 2026'
  },
  {
    id: 2,
    username: 'admin',
    name: 'Store Administrator',
    email: 'admin@etech.com',
    role: 'ADMIN',
    assignedBranch: null,
    createdAt: 'Jan 15, 2026'
  },
  {
    id: 3,
    username: 'staff_colombo',
    name: 'Colombo Branch Operations',
    email: 'staff.colombo@etech.com',
    role: 'STAFF',
    assignedBranch: 'BR-COL',
    createdAt: 'Feb 01, 2026'
  },
  {
    id: 4,
    username: 'kasun',
    name: 'Kasun Perera',
    email: 'kasun.p@gmail.com',
    role: 'CUSTOMER',
    assignedBranch: null,
    createdAt: 'Mar 10, 2026'
  }
];
