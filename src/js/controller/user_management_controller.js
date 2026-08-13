import { getUsers, getCurrentUser, setCurrentUser } from './login_controller.js';
import { getBranches } from './branch_controller.js';

const USERS_STORAGE_KEY = 'etech_users';

/**
 * ============================================================
 * TAB 5: USER MANAGEMENT (ADMIN ONLY)
 * ============================================================
 */
export function renderUsersTab() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  const users = getUsers();
  const branches = getBranches();

  tbody.innerHTML = users.map(u => `
    <tr class="hover:bg-slate-800/40 transition-colors">
      <td class="py-3.5 px-4">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
            ${u.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p class="font-bold text-white">${u.name}</p>
            <p class="text-[10px] text-slate-500 font-mono">${u.id}</p>
          </div>
        </div>
      </td>
      <td class="py-3.5 px-4 font-mono text-slate-300">${u.email}</td>
      <td class="py-3.5 px-4">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : u.role === 'STAFF' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-slate-800 text-slate-300'}">
          ${u.role || 'CUSTOMER'}
        </span>
      </td>
      <td class="py-3.5 px-4">
        ${u.assignedBranch ? branches.find(b => b.id === u.assignedBranch)?.name || u.assignedBranch : '<span class="text-slate-500">-</span>'}
      </td>
      <td class="py-3.5 px-4 text-slate-400">${u.createdAt || 'Standard'}</td>
      <td class="py-3.5 px-4 text-right">
        <div class="flex items-center justify-end space-x-2">
          <button onclick="openUserModal('${u.id}')" class="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors" title="Edit User Details">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <select onchange="changeUserRole('${u.id}', this.value)" class="bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:border-blue-500">
            <option value="CUSTOMER" ${u.role === 'CUSTOMER' ? 'selected' : ''}>CUSTOMER</option>
            <option value="STAFF" ${u.role === 'STAFF' ? 'selected' : ''}>STAFF</option>
            <option value="ADMIN" ${u.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
          </select>
          <button onclick="confirmDeleteUser('${u.id}')" class="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg transition-colors" title="Delete User">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

export function changeUserRole(userId, newRole) {
  const res = updateUserRole(userId, newRole);
  if (res.success) {
    renderUsersTab();
  } else {
    alert(res.message);
  }
}

export function confirmDeleteUser(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    const res = deleteUser(userId);
    if (res.success) {
      renderUsersTab();
    } else {
      alert(res.message);
    }
  }
}

export function openUserModal(userId = null) {
  const modal = document.getElementById('admin-modal-container');
  const branches = getBranches();
  const users = getUsers();
  const targetUser = userId ? users.find(u => u.id === userId) : null;

  modal.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 class="text-lg font-extrabold text-white">${targetUser ? 'Edit User Account' : 'Create Staff / Admin Account'}</h3>
            ${targetUser ? `<span class="text-[10px] text-blue-400 font-mono">${targetUser.id}</span>` : ''}
          </div>
          <button onclick="closeAdminModal()" class="text-slate-400 hover:text-white">&times;</button>
        </div>

        <form onsubmit="handleSaveUserSubmit(event, ${targetUser ? `'${targetUser.id}'` : 'null'})" class="space-y-4 text-xs">
          <div>
            <label class="block text-slate-300 font-bold mb-1">Full Name *</label>
            <input type="text" id="modal-u-name" required value="${targetUser ? targetUser.name : ''}" placeholder="Jane Smith" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500">
          </div>

          <div>
            <label class="block text-slate-300 font-bold mb-1">Email Address *</label>
            <input type="email" id="modal-u-email" required value="${targetUser ? targetUser.email : ''}" placeholder="staff@etech.com" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500">
          </div>

          <div>
            <label class="block text-slate-300 font-bold mb-1">${targetUser ? 'New Password (Optional)' : 'Password *'}</label>
            <input type="password" id="modal-u-password" ${targetUser ? '' : 'required'} placeholder="${targetUser ? 'Leave blank to keep current password' : '••••••••'}" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-300 font-bold mb-1">System Role *</label>
              <select id="modal-u-role" required class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500">
                <option value="CUSTOMER" ${targetUser && targetUser.role === 'CUSTOMER' ? 'selected' : ''}>CUSTOMER</option>
                <option value="STAFF" ${targetUser && targetUser.role === 'STAFF' ? 'selected' : ''}>STAFF</option>
                <option value="ADMIN" ${targetUser && targetUser.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-300 font-bold mb-1">Assigned Branch</label>
              <select id="modal-u-branch" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500">
                <option value="">None</option>
                ${branches.map(b => `<option value="${b.id}" ${targetUser && targetUser.assignedBranch === b.id ? 'selected' : ''}>${b.city}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="pt-2 flex items-center justify-end space-x-3">
            <button type="button" onclick="closeAdminModal()" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30">${targetUser ? 'Save User Changes' : 'Create Account'}</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function handleSaveUserSubmit(e, userId) {
  e.preventDefault();
  const userData = {
    id: userId,
    name: document.getElementById('modal-u-name').value,
    email: document.getElementById('modal-u-email').value,
    password: document.getElementById('modal-u-password').value,
    role: document.getElementById('modal-u-role').value,
    assignedBranch: document.getElementById('modal-u-branch').value
  };

  const res = userId ? updateUser(userData) : addUserByAdmin(userData);
  if (res.success) {
    if (window.closeAdminModal) window.closeAdminModal();
    renderUsersTab();
  } else {
    alert(res.message);
  }
}

/**
 * ============================================================
 * ADMIN DATA MANIPULATION FUNCTIONS (MIGRATED FROM login_controller.js)
 * ============================================================
 */

export function addUserByAdmin(userData) {
  const users = getUsers();
  const cleanEmail = userData.email.trim().toLowerCase();

  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: 'Email address already exists.' };
  }

  const newUser = {
    id: 'USR-' + Math.floor(100000 + Math.random() * 900000),
    name: userData.name.trim(),
    email: cleanEmail,
    password: userData.password || 'etech123',
    role: userData.role || 'STAFF',
    assignedBranch: userData.assignedBranch || null,
    createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  return { success: true, message: `User ${newUser.name} created successfully!`, user: newUser };
}

export function updateUserRole(userId, newRole, assignedBranch = null) {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return { success: false, message: 'User not found.' };

  user.role = newRole;
  user.assignedBranch = assignedBranch;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  return { success: true, message: `Role updated to ${newRole}` };
}

export function updateUser(userData) {
  const users = getUsers();
  const user = users.find(u => u.id === userData.id);
  if (!user) return { success: false, message: 'User not found.' };

  const cleanEmail = userData.email.trim().toLowerCase();
  const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail && u.id !== userData.id);
  if (existingUser) {
    return { success: false, message: 'Another user with this email address already exists.' };
  }

  user.name = userData.name.trim();
  user.email = cleanEmail;
  user.role = userData.role || user.role;
  user.assignedBranch = userData.assignedBranch !== undefined ? userData.assignedBranch : user.assignedBranch;

  if (userData.password && userData.password.trim().length > 0) {
    if (userData.password.trim().length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }
    user.password = userData.password.trim();
  }

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  // If current active session is being updated, update session state too
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === user.id) {
    setCurrentUser(user);
  }

  return { success: true, message: `User ${user.name} updated successfully!`, user };
}

export function deleteUser(userId) {
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    return { success: false, message: 'You cannot delete your own active admin account.' };
  }

  let users = getUsers();
  users = users.filter(u => u.id !== userId);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  return { success: true, message: 'User removed successfully.' };
}