// ============================================================
//  src/js/models/user_model.js — User Entity & Dynamic Session Model
// ============================================================
import { getToken, setToken, removeToken } from '../api/apiClient.js';

export const CURRENT_USER_STORAGE_KEY = 'etech_current_user';

/**
 * Generic User Model Entity
 */
export class User {
    constructor(userData = {}) {
        Object.assign(this, userData);
        this.createdAt = this.createdAt || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
}

// ── Storage & Session Manipulation Logic ─────────────────────

/**
 * Retrieve active user session from localStorage
 */
export function getCurrentUser() {
    try {
        const session = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
        return session ? JSON.parse(session) : null;
    } catch (e) {
        return null;
    }
}

/**
 * Set active user session in localStorage
 */
export function setCurrentUser(user) {
    if (!user) return null;
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    return user;
}

/**
 * Remove active user session from localStorage
 */
export function removeCurrentUser() {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
}

/**
 * Check if a valid authenticated user session is active
 */
export function isLoggedIn() {
    return Boolean(getToken() && getCurrentUser());
}

/**
 * Terminate active user session and purge auth tokens
 */
export function logoutUser() {
    removeToken();
    removeCurrentUser();
}

// ── Dynamic Role & UI Formatting Utilities ──────────────────

/**
 * Dynamic role badge formatter that automatically adapts to any role returned by the database
 * @param {string} role
 * @returns {string} HTML markup for badge
 */
export function getRoleBadge(role) {
    const rawRole = (role || 'CUSTOMER').toUpperCase();
    
    if (rawRole.includes('SUPER') || rawRole.includes('OWNER')) {
        return `<span class="px-2 py-0.5 rounded text-[9px] font-mono font-extrabold uppercase bg-purple-50 text-purple-700 border border-purple-200 shadow-xs">${rawRole}</span>`;
    }
    if (rawRole.includes('ADMIN')) {
        return `<span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">${rawRole}</span>`;
    }
    if (rawRole.includes('STAFF') || rawRole.includes('EMPLOYEE') || rawRole.includes('MANAGER')) {
        return `<span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-sky-50 text-sky-700 border border-sky-200 shadow-xs">${rawRole}</span>`;
    }
    return `<span class="px-2 py-0.5 rounded text-[9px] font-mono font-medium uppercase bg-[#f8fafc] text-[#475569] border border-[#e2e8f0]">${rawRole}</span>`;
}

/**
 * Extract distinct roles dynamically from user list
 * @param {Array<object>} users
 * @returns {Array<string>}
 */
export function extractUniqueRoles(users = []) {
    const roleSet = new Set(['CUSTOMER', 'STAFF', 'ADMIN', 'SUPERADMIN']);
    if (Array.isArray(users)) {
        users.forEach(u => {
            if (u && u.role) roleSet.add(u.role.toUpperCase());
        });
    }
    return Array.from(roleSet);
}
