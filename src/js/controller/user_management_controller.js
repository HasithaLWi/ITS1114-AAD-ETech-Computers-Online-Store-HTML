// ============================================================
//  src/js/controller/user_management_controller.js — Admin User Management Controller
// ============================================================
import { UserApi } from '../api/userApi.js';
import { getCurrentUser } from './login_controller.js';
import { getBranches } from './branch_controller.js';
import { getRoleBadge, extractUniqueRoles } from '../models/user_model.js';

let cachedUsers = [];
let availableRoles = ['CUSTOMER', 'STAFF', 'ADMIN', 'SUPERADMIN'];

/**
 * Fetch authoritative roles from backend or derive dynamically from user list
 */
async function loadAvailableRoles() {
  try {
    const roles = await UserApi.getRoles();
    if (Array.isArray(roles) && roles.length > 0) {
      availableRoles = roles.map(r => typeof r === 'string' ? r : (r.name || r.role || r.id));
      return availableRoles;
    }
  } catch (e) {
    // Graceful fallback: dynamically derive from cached users
  }
  availableRoles = extractUniqueRoles(cachedUsers);
  return availableRoles;
}

/**
 * Generate role <select> option markup dynamically from database roles
 * @param {string} selectedRole
 * @returns {string}
 */
function buildRoleOptionsHtml(selectedRole = '') {
  const roles = availableRoles.length > 0 ? availableRoles : extractUniqueRoles(cachedUsers);
  return roles.map(role => {
    const isSelected = String(role).toUpperCase() === String(selectedRole).toUpperCase();
    return `<option value="${role}" ${isSelected ? 'selected' : ''}>${role}</option>`;
  }).join('');
}

/**
 * Renders the User Directory Table inside Admin Dashboard
 * Fetches directory directly from database via backend API.
 */
export async function renderUsersTab() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  const activeUser = getCurrentUser();
  if (!activeUser) return;

  // Show loading skeleton / indicator
  tbody.innerHTML = `
    <tr>
      <td colspan="6" class="py-8 text-center text-xs text-[#64748b]">
        <div class="inline-flex items-center space-x-2">
          <svg class="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>Loading user directory from server...</span>
        </div>
      </td>
    </tr>
  `;

  try {
    const users = await UserApi.getUsers();
    cachedUsers = users || [];
    await loadAvailableRoles();
    const branches = getBranches();

    if (cachedUsers.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="py-8 text-center text-xs text-[#64748b]">
            No user accounts found in database.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = cachedUsers.map(u => {
      const isSelf = activeUser.id === u.id;
      const formattedDate = u.createdAt 
        ? (isNaN(new Date(u.createdAt).getTime()) ? u.createdAt : new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }))
        : '-';

      // Branch display
      const branchDisplay = u.assignedBranch 
        ? (branches.find(b => b.id === u.assignedBranch)?.name || u.assignedBranch) 
        : '<span class="text-[#94a3b8]">-</span>';

      return `
        <tr class="hover:bg-[#f8fafc] transition-colors">
          <td class="py-3 px-3.5">
            <div class="flex items-center space-x-2.5">
              <div class="w-7 h-7 rounded font-bold text-xs flex items-center justify-center border shadow-sm bg-blue-50 text-blue-600 border-blue-200">
                ${(u.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p class="font-bold text-[#0f172a] text-xs">${u.name || 'Unnamed'}</p>
                <p class="text-[10px] text-blue-600 font-mono">@${u.username || u.id}</p>
              </div>
            </div>
          </td>
          <td class="py-3 px-3.5 font-mono text-[#475569] text-xs">${u.email || '-'}</td>
          <td class="py-3 px-3.5">
            ${getRoleBadge(u.role)}
          </td>
          <td class="py-3 px-3.5 text-xs text-[#475569]">
            ${branchDisplay}
          </td>
          <td class="py-3 px-3.5 text-[#64748b] text-xs">${formattedDate}</td>
          <td class="py-3 px-3.5 text-right">
            <div class="flex items-center justify-end space-x-1.5">
              <button onclick="openUserModal('${u.id}')" class="p-1.5 bg-[#f8fafc] hover:bg-[#f1f5f9] text-blue-600 rounded border border-[#e2e8f0] transition-colors shadow-sm" title="Edit User Details">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <select onchange="changeUserRole('${u.id}', this.value)" class="bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] rounded px-2 py-1 text-xs focus:border-blue-600 cursor-pointer shadow-sm">
                ${buildRoleOptionsHtml(u.role)}
              </select>
              <button onclick="confirmDeleteUser('${u.id}')" ${isSelf ? 'disabled' : ''} title="${isSelf ? 'Cannot delete active account' : 'Delete User Account'}"
                class="p-1.5 ${isSelf ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'} rounded border transition-colors shadow-sm">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 text-center text-xs text-rose-600">
          Failed to load user directory: ${err.message || 'Server connection error.'}
        </td>
      </tr>
    `;
  }
}

/**
 * Change a user's role via Backend API
 * @param {number|string} userId
 * @param {string} newRole
 */
export async function changeUserRole(userId, newRole) {
  try {
    const user = cachedUsers.find(u => String(u.id) === String(userId));
    const assignedBranch = user ? user.assignedBranch : null;
    await UserApi.updateUserRole(userId, { role: newRole, assignedBranch });
    await renderUsersTab();
  } catch (err) {
    alert(err.message || 'Failed to update user role.');
    await renderUsersTab();
  }
}

/**
 * Delete a user account after confirmation
 * @param {number|string} userId
 */
export async function confirmDeleteUser(userId) {
  const activeUser = getCurrentUser();
  if (activeUser && String(activeUser.id) === String(userId)) {
    alert('Cannot delete currently active logged in account.');
    return;
  }

  if (confirm('Are you sure you want to delete this user account?')) {
    try {
      const res = await UserApi.deleteUser(userId);
      alert(res.message || 'User account removed successfully.');
      await renderUsersTab();
    } catch (err) {
      alert(err.message || 'Failed to delete user account.');
    }
  }
}

/**
 * Open Modal to Add or Edit User Account
 * @param {number|string|null} userId
 */
export async function openUserModal(userId = null) {
  const activeUser = getCurrentUser();
  if (!activeUser) {
    alert('Access Denied: Please log in to manage users.');
    return;
  }

  const modal = document.getElementById('admin-modal-container');
  if (!modal) return;

  const branches = getBranches();
  let targetUser = userId ? cachedUsers.find(u => String(u.id) === String(userId)) : null;

  if (userId && !targetUser) {
    try {
      targetUser = await UserApi.getUserById(userId);
    } catch (e) {
      alert('Could not fetch user details.');
      return;
    }
  }

  const modalTitle = targetUser ? 'Edit User Account' : 'Create User Account';
  const roleOptionsHtml = buildRoleOptionsHtml(targetUser ? targetUser.role : 'CUSTOMER');

  modal.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-xs">
      <div class="bg-white border border-[#e2e8f0] rounded-lg p-6 max-w-md w-full space-y-4 shadow-xl">
        <div class="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
          <div>
            <h3 class="text-base font-extrabold text-[#0f172a]">${modalTitle}</h3>
            ${targetUser ? `<span class="text-[10px] text-blue-600 font-mono">ID: ${targetUser.id} (@${targetUser.username || ''})</span>` : ''}
          </div>
          <button onclick="closeAdminModal()" class="text-[#64748b] hover:text-[#0f172a] text-lg font-bold">&times;</button>
        </div>

        <form id="admin-user-form" onsubmit="handleSaveUserSubmit(event, ${targetUser ? `'${targetUser.id}'` : 'null'})" class="space-y-3.5 text-xs">
          <div>
            <label class="block text-[#475569] font-bold mb-1">Full Name *</label>
            <input type="text" id="modal-u-name" required value="${targetUser ? (targetUser.name || '') : ''}" placeholder="Jane Smith" class="w-full px-3 py-2 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] focus:border-blue-600">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[#475569] font-bold mb-1">Username *</label>
              <input type="text" id="modal-u-username" required value="${targetUser ? (targetUser.username || '') : ''}" placeholder="jane_staff" class="w-full px-3 py-2 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] focus:border-blue-600">
            </div>
            <div>
              <label class="block text-[#475569] font-bold mb-1">Email Address *</label>
              <input type="email" id="modal-u-email" required value="${targetUser ? (targetUser.email || '') : ''}" placeholder="staff@etech.com" class="w-full px-3 py-2 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] focus:border-blue-600">
            </div>
          </div>

          <div>
            <label class="block text-[#475569] font-bold mb-1">${targetUser ? 'New Password (Optional)' : 'Password *'}</label>
            <input type="password" id="modal-u-password" ${targetUser ? '' : 'required'} placeholder="${targetUser ? 'Leave blank to keep current password' : '••••••••'}" class="w-full px-3 py-2 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] focus:border-blue-600">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[#475569] font-bold mb-1">System Role *</label>
              <select id="modal-u-role" required class="w-full px-3 py-2 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] focus:border-blue-600">
                ${roleOptionsHtml}
              </select>
            </div>
            <div>
              <label class="block text-[#475569] font-bold mb-1">Assigned Branch</label>
              <select id="modal-u-branch" class="w-full px-3 py-2 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] focus:border-blue-600">
                <option value="">None (Headquarters / Remote)</option>
                ${branches.map(b => `<option value="${b.id}" ${targetUser && targetUser.assignedBranch === b.id ? 'selected' : ''}>${b.city}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="pt-2 flex items-center justify-end space-x-2.5">
            <button type="button" onclick="closeAdminModal()" class="px-4 py-2 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#475569] rounded-md font-bold border border-[#e2e8f0]">Cancel</button>
            <button type="submit" id="modal-user-submit-btn" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-bold shadow-sm">${targetUser ? 'Save User Changes' : 'Create Account'}</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

/**
 * Handle Add/Edit User Form Submission via Backend API
 * @param {Event} e
 * @param {number|string|null} userId
 */
export async function handleSaveUserSubmit(e, userId) {
  e.preventDefault();
  const name = document.getElementById('modal-u-name').value.trim();
  const username = document.getElementById('modal-u-username').value.trim();
  const email = document.getElementById('modal-u-email').value.trim();
  const password = document.getElementById('modal-u-password').value;
  const roleEl = document.getElementById('modal-u-role');
  const role = roleEl ? roleEl.value : 'CUSTOMER';
  const branchEl = document.getElementById('modal-u-branch');
  const branch = branchEl ? (branchEl.value || null) : null;
  const submitBtn = document.getElementById('modal-user-submit-btn');

  if (!name || !username || !email || (!userId && !password)) {
    alert('Please fill in all required fields.');
    return;
  }

  const payload = {
    name,
    username,
    email,
    role,
    assignedBranch: branch
  };

  if (password) {
    payload.password = password;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-70', 'cursor-wait');
  }

  try {
    if (userId) {
      await UserApi.updateUser(userId, payload);
      alert('User details updated successfully!');
    } else {
      await UserApi.createUser(payload);
      alert('User account created successfully!');
    }

    if (window.closeAdminModal) window.closeAdminModal();
    await renderUsersTab();
  } catch (err) {
    alert(err.message || 'Failed to save user account.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-70', 'cursor-wait');
    }
  }
}