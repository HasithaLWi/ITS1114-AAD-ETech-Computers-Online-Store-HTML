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
    <tr class="hover:bg-[#141c28] transition-colors">
      <td class="py-3 px-3.5">
        <div class="flex items-center space-x-2.5">
          <div class="w-7 h-7 rounded bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
            ${u.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p class="font-bold text-white text-xs">${u.name}</p>
            <p class="text-[10px] text-[#718096] font-mono">${u.id}</p>
          </div>
        </div>
      </td>
      <td class="py-3 px-3.5 font-mono text-[#a7b3c4] text-xs">${u.email}</td>
      <td class="py-3 px-3.5">
        <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${u.role === 'ADMIN' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30' : u.role === 'STAFF' ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30' : 'bg-[#141c28] text-[#a7b3c4] border border-[#202b3a]'}">
          ${u.role || 'CUSTOMER'}
        </span>
      </td>
      <td class="py-3 px-3.5 text-xs text-[#a7b3c4]">
        ${u.assignedBranch ? branches.find(b => b.id === u.assignedBranch)?.name || u.assignedBranch : '<span class="text-[#718096]">-</span>'}
      </td>
      <td class="py-3 px-3.5 text-[#718096] text-xs">${u.createdAt || 'Standard'}</td>
      <td class="py-3 px-3.5 text-right">
        <div class="flex items-center justify-end space-x-1.5">
          <button onclick="openUserModal('${u.id}')" class="p-1.5 bg-[#141c28] hover:bg-[#192332] text-blue-400 rounded border border-[#202b3a] transition-colors" title="Edit User Details">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <select onchange="changeUserRole('${u.id}', this.value)" class="bg-[#080b12] border border-[#202b3a] text-white rounded px-2 py-1 text-xs focus:border-blue-500 cursor-pointer">
            <option value="CUSTOMER" ${u.role === 'CUSTOMER' ? 'selected' : ''}>CUSTOMER</option>
            <option value="STAFF" ${u.role === 'STAFF' ? 'selected' : ''}>STAFF</option>
            <option value="ADMIN" ${u.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
          </select>
          <button onclick="confirmDeleteUser('${u.id}')" class="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/40 rounded transition-colors" title="Delete User">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
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
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080b12]/80 backdrop-blur-sm">
      <div class="bg-[#101722] border border-[#202b3a] rounded-lg p-6 max-w-md w-full space-y-4 shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#202b3a] pb-3">
          <div>
            <h3 class="text-base font-extrabold text-white">${targetUser ? 'Edit User Account' : 'Create Staff / Admin Account'}</h3>
            ${targetUser ? `<span class="text-[10px] text-blue-400 font-mono">${targetUser.id}</span>` : ''}
          </div>
          <button onclick="closeAdminModal()" class="text-[#718096] hover:text-white">&times;</button>
        </div>

        <form onsubmit="handleSaveUserSubmit(event, ${targetUser ? `'${targetUser.id}'` : 'null'})" class="space-y-3.5 text-xs">
          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">Full Name *</label>
            <input type="text" id="modal-u-name" required value="${targetUser ? targetUser.name : ''}" placeholder="Jane Smith" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
          </div>

          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">Email Address *</label>
            <input type="email" id="modal-u-email" required value="${targetUser ? targetUser.email : ''}" placeholder="staff@etech.com" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
          </div>

          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">${targetUser ? 'New Password (Optional)' : 'Password *'}</label>
            <input type="password" id="modal-u-password" ${targetUser ? '' : 'required'} placeholder="${targetUser ? 'Leave blank to keep current password' : '••••••••'}" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">System Role *</label>
              <select id="modal-u-role" required class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
                <option value="CUSTOMER" ${targetUser && targetUser.role === 'CUSTOMER' ? 'selected' : ''}>CUSTOMER</option>
                <option value="STAFF" ${targetUser && targetUser.role === 'STAFF' ? 'selected' : ''}>STAFF</option>
                <option value="ADMIN" ${targetUser && targetUser.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
              </select>
            </div>
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">Assigned Branch</label>
              <select id="modal-u-branch" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
                <option value="">None</option>
                ${branches.map(b => `<option value="${b.id}" ${targetUser && targetUser.assignedBranch === b.id ? 'selected' : ''}>${b.city}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="pt-2 flex items-center justify-end space-x-2.5">
            <button type="button" onclick="closeAdminModal()" class="px-4 py-2 bg-[#141c28] hover:bg-[#192332] text-[#a7b3c4] rounded-md font-bold border border-[#202b3a]">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-bold shadow-sm">${targetUser ? 'Save User Changes' : 'Create Account'}</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function handleSaveUserSubmit(e, userId) {
  e.preventDefault();
  const name = document.getElementById('modal-u-name').value.trim();
  const email = document.getElementById('modal-u-email').value.trim();
  const password = document.getElementById('modal-u-password').value;
  const role = document.getElementById('modal-u-role').value;
  const branch = document.getElementById('modal-u-branch').value;

  const users = getUsers();

  if (userId) {
    // Edit existing
    const user = users.find(u => u.id === userId);
    if (user) {
      user.name = name;
      user.email = email;
      if (password) user.password = password;
      user.role = role;
      user.assignedBranch = branch || null;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      // If updating currently logged in user, refresh active state
      const current = getCurrentUser();
      if (current && current.id === userId) {
        setCurrentUser(user);
      }
    }
  } else {
    // Check if email already exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      alert('A user account with this email address already exists.');
      return;
    }

    const newUser = {
      id: `USR-${Math.floor(100000 + Math.random() * 900000)}`,
      name: name,
      email: email,
      password: password,
      role: role,
      assignedBranch: branch || null,
      createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };

    users.unshift(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  if (window.closeAdminModal) window.closeAdminModal();
  renderUsersTab();
}

export function updateUserRole(userId, newRole) {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return { success: false, message: 'User not found' };

  user.role = newRole;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  return { success: true, message: `User role updated to ${newRole}` };
}

export function deleteUser(userId) {
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    return { success: false, message: 'You cannot delete your own active administrator account.' };
  }

  let users = getUsers();
  users = users.filter(u => u.id !== userId);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  return { success: true, message: 'User account removed.' };
}