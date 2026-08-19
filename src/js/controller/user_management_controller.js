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
    <tr class="hover:bg-[#f8fafc] transition-colors">
      <td class="py-3 px-3.5">
        <div class="flex items-center space-x-2.5">
          <div class="w-7 h-7 rounded bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center border border-blue-200 shadow-sm">
            ${u.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p class="font-bold text-[#0f172a] text-xs">${u.name}</p>
            <p class="text-[10px] text-blue-600 font-mono">@${u.username || (u.email ? u.email.split('@')[0] : u.id)}</p>
          </div>
        </div>
      </td>
      <td class="py-3 px-3.5 font-mono text-[#475569] text-xs">${u.email}</td>
      <td class="py-3 px-3.5">
        <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${u.role === 'ADMIN' ? 'bg-blue-50 text-blue-700 border border-blue-200' : u.role === 'STAFF' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-[#f8fafc] text-[#475569] border border-[#e2e8f0]'}">
          ${u.role || 'CUSTOMER'}
        </span>
      </td>
      <td class="py-3 px-3.5 text-xs text-[#475569]">
        ${u.assignedBranch ? branches.find(b => b.id === u.assignedBranch)?.name || u.assignedBranch : '<span class="text-[#94a3b8]">-</span>'}
      </td>
      <td class="py-3 px-3.5 text-[#64748b] text-xs">${u.createdAt || 'Standard'}</td>
      <td class="py-3 px-3.5 text-right">
        <div class="flex items-center justify-end space-x-1.5">
          <button onclick="openUserModal('${u.id}')" class="p-1.5 bg-[#f8fafc] hover:bg-[#f1f5f9] text-blue-600 rounded border border-[#e2e8f0] transition-colors shadow-sm" title="Edit User Details">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <select onchange="changeUserRole('${u.id}', this.value)" class="bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] rounded px-2 py-1 text-xs focus:border-blue-600 cursor-pointer shadow-sm">
            <option value="CUSTOMER" ${u.role === 'CUSTOMER' ? 'selected' : ''}>CUSTOMER</option>
            <option value="STAFF" ${u.role === 'STAFF' ? 'selected' : ''}>STAFF</option>
            <option value="ADMIN" ${u.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
          </select>
          <button onclick="confirmDeleteUser('${u.id}')" class="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded transition-colors shadow-sm" title="Delete User">
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
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-xs">
      <div class="bg-white border border-[#e2e8f0] rounded-lg p-6 max-w-md w-full space-y-4 shadow-xl">
        <div class="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
          <div>
            <h3 class="text-base font-extrabold text-[#0f172a]">${targetUser ? 'Edit User Account' : 'Create Staff / Admin Account'}</h3>
            ${targetUser ? `<span class="text-[10px] text-blue-600 font-mono">${targetUser.id} (@${targetUser.username || ''})</span>` : ''}
          </div>
          <button onclick="closeAdminModal()" class="text-[#64748b] hover:text-[#0f172a] text-lg font-bold">&times;</button>
        </div>

        <form onsubmit="handleSaveUserSubmit(event, ${targetUser ? `'${targetUser.id}'` : 'null'})" class="space-y-3.5 text-xs">
          <div>
            <label class="block text-[#475569] font-bold mb-1">Full Name *</label>
            <input type="text" id="modal-u-name" required value="${targetUser ? targetUser.name : ''}" placeholder="Jane Smith" class="w-full px-3 py-2 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] focus:border-blue-600">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[#475569] font-bold mb-1">Username *</label>
              <input type="text" id="modal-u-username" required pattern="[a-zA-Z0-9_.-]+" minlength="3" value="${targetUser ? (targetUser.username || '') : ''}" placeholder="jane_staff" class="w-full px-3 py-2 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] focus:border-blue-600">
            </div>
            <div>
              <label class="block text-[#475569] font-bold mb-1">Email Address *</label>
              <input type="email" id="modal-u-email" required value="${targetUser ? targetUser.email : ''}" placeholder="staff@etech.com" class="w-full px-3 py-2 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] focus:border-blue-600">
            </div>
          </div>

          <div>
            <label class="block text-[#475569] font-bold mb-1">${targetUser ? 'New Password (Optional)' : 'Password *'}</label>
            <input type="password" id="modal-u-password" ${targetUser ? '' : 'required'} minlength="6" placeholder="${targetUser ? 'Leave blank to keep current password' : '•••••••• (min 6 chars)'}" class="w-full px-3 py-2 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] focus:border-blue-600">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[#475569] font-bold mb-1">System Role *</label>
              <select id="modal-u-role" required class="w-full px-3 py-2 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] focus:border-blue-600">
                <option value="CUSTOMER" ${targetUser && targetUser.role === 'CUSTOMER' ? 'selected' : ''}>CUSTOMER</option>
                <option value="STAFF" ${targetUser && targetUser.role === 'STAFF' ? 'selected' : ''}>STAFF</option>
                <option value="ADMIN" ${targetUser && targetUser.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
              </select>
            </div>
            <div>
              <label class="block text-[#475569] font-bold mb-1">Assigned Branch</label>
              <select id="modal-u-branch" class="w-full px-3 py-2 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] focus:border-blue-600">
                <option value="">None</option>
                ${branches.map(b => `<option value="${b.id}" ${targetUser && targetUser.assignedBranch === b.id ? 'selected' : ''}>${b.city}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="pt-2 flex items-center justify-end space-x-2.5">
            <button type="button" onclick="closeAdminModal()" class="px-4 py-2 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#475569] rounded-md font-bold border border-[#e2e8f0]">Cancel</button>
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
  const username = document.getElementById('modal-u-username').value.trim().toLowerCase();
  const email = document.getElementById('modal-u-email').value.trim().toLowerCase();
  const password = document.getElementById('modal-u-password').value;
  const role = document.getElementById('modal-u-role').value;
  const branch = document.getElementById('modal-u-branch').value;

  const users = getUsers();

  if (userId) {
    // Edit existing
    const user = users.find(u => u.id === userId);
    if (user) {
      // Check if username is taken by another user
      const duplicateUsername = users.find(u => u.id !== userId && u.username && u.username.toLowerCase() === username);
      if (duplicateUsername) {
        alert('This username is already taken by another account.');
        return;
      }

      // Check if email is taken by another user
      const duplicateEmail = users.find(u => u.id !== userId && u.email.toLowerCase() === email);
      if (duplicateEmail) {
        alert('This email address is already taken by another account.');
        return;
      }

      user.name = name;
      user.username = username;
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
    // Check if username already exists
    if (users.find(u => u.username && u.username.toLowerCase() === username)) {
      alert('A user account with this username already exists.');
      return;
    }

    // Check if email already exists
    if (users.find(u => u.email.toLowerCase() === email)) {
      alert('A user account with this email address already exists.');
      return;
    }

    const newUser = {
      id: `USR-${Math.floor(100000 + Math.random() * 900000)}`,
      username: username,
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