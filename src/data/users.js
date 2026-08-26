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
    name: 'Global Store Administrator',
    email: 'admin@etech.com',
    role: 'ADMIN',
    assignedBranch: null,
    createdAt: 'Jan 15, 2026'
  },
  {
    id: 3,
    username: 'admin_galle',
    name: 'Galle Branch Administrator',
    email: 'admin.galle@etech.com',
    role: 'ADMIN',
    assignedBranch: 'BR-GAL',
    createdAt: 'Jan 20, 2026'
  },
  {
    id: 4,
    username: 'staff_colombo',
    name: 'Colombo Hub Staff',
    email: 'staff.colombo@etech.com',
    role: 'STAFF',
    assignedBranch: 'BR-COL',
    createdAt: 'Feb 01, 2026'
  },
  {
    id: 5,
    username: 'staff_galle',
    name: 'Galle Hub Staff',
    email: 'staff.galle@etech.com',
    role: 'STAFF',
    assignedBranch: 'BR-GAL',
    createdAt: 'Feb 05, 2026'
  },
  {
    id: 6,
    username: 'staff_matara',
    name: 'Matara Hub Staff',
    email: 'staff.matara@etech.com',
    role: 'STAFF',
    assignedBranch: 'BR-MAT',
    createdAt: 'Feb 10, 2026'
  },
  {
    id: 7,
    username: 'kasun',
    name: 'Kasun Perera',
    email: 'kasun.p@gmail.com',
    role: 'CUSTOMER',
    assignedBranch: null,
    createdAt: 'Mar 10, 2026'
  }
];
