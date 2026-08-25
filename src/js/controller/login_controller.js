// ============================================================
//  src/js/controller/login_controller.js — Authentication & User State Controller
// ============================================================
import { AuthApi, UserApi } from '../api/userApi.js';
import { getToken, setToken, removeToken, CURRENT_USER_STORAGE_KEY } from '../api/apiClient.js';

export { getToken, setToken, removeToken };

/**
 * Retrieve active user session from localStorage
 * @returns {object|null} Sanitized user profile without sensitive credentials
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
 * Stores only safe public profile claims (no passwords or credentials).
 * @param {object} user
 */
export function setCurrentUser(user) {
  if (!user) return;
  const safeUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role || 'CUSTOMER',
    assignedBranch: user.assignedBranch || null,
    canManage: user.canManage ?? false,
    createdAt: user.createdAt || null
  };
  localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(safeUser));
}

/**
 * Check if a valid user session is active
 * @returns {boolean}
 */
export function isLoggedIn() {
  return Boolean(getToken() && getCurrentUser());
}

/**
 * Terminate active user session and purge auth tokens
 */
export function logoutUser() {
  removeToken();
  localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
}

/**
 * Authenticate user with username/email and password via Backend API
 * 
 * @param {string} usernameOrEmail
 * @param {string} password
 * @returns {Promise<{success: boolean, message: string, user?: object}>}
 */
export async function loginUser(usernameOrEmail, password) {
  const cleanIdentifier = (usernameOrEmail || '').trim();

  if (!cleanIdentifier || !password) {
    return { success: false, message: 'Please enter your username and password.' };
  }

  try {
    const data = await AuthApi.login(cleanIdentifier, password);
    setToken(data.token);
    setCurrentUser(data.user);
    return { success: true, message: 'Logged in successfully!', user: data.user };
  } catch (err) {
    return { success: false, message: err.message || 'Invalid credentials. Please check your username and password.' };
  }
}

/**
 * Register a new storefront customer via Backend API
 * 
 * @param {string} name
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, message: string, user?: object}>}
 */
export async function registerUser(name, username, email, password) {
  const cleanName = (name || '').trim();
  const cleanUsername = (username || '').trim().toLowerCase();
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanName || !cleanUsername || !cleanEmail || !password) {
    return { success: false, message: 'Please fill in all required fields.' };
  }

  if (cleanUsername.length < 3) {
    return { success: false, message: 'Username must be at least 3 characters long.' };
  }

  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  try {
    const data = await AuthApi.register({
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      password: password
    });
    setToken(data.token);
    setCurrentUser(data.user);
    return { success: true, message: 'Account created successfully!', user: data.user };
  } catch (err) {
    return { success: false, message: err.message || 'Registration failed. Please check your details and try again.' };
  }
}

/**
 * Synchronize current user profile from backend
 */
export async function refreshCurrentUserSession() {
  if (!isLoggedIn()) return null;
  try {
    const freshUser = await AuthApi.getCurrentUser();
    setCurrentUser(freshUser);
    return freshUser;
  } catch (err) {
    if (err.status === 401) {
      logoutUser();
    }
    return null;
  }
}

/**
 * Update user profile details (Name, Username, Email) via Backend API
 * 
 * @param {number|string} userId
 * @param {object} param1
 * @returns {Promise<{success: boolean, message: string, user?: object}>}
 */
export async function updateUserProfile(userId, { name, username, email }) {
  const cleanName = (name || '').trim();
  const cleanUsername = (username || '').trim().toLowerCase();
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanName || !cleanUsername || !cleanEmail) {
    return { success: false, message: 'All fields (Name, Username, Email) are required.' };
  }

  try {
    const updatedUser = await UserApi.updateSelfProfile({
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail
    });
    setCurrentUser(updatedUser);
    return { success: true, message: 'Profile details updated successfully!', user: updatedUser };
  } catch (err) {
    return { success: false, message: err.message || 'Failed to update profile.' };
  }
}

/**
 * Change current user password via Backend API
 * 
 * @param {number|string} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function changeUserPassword(userId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    return { success: false, message: 'Please provide both your current password and new password.' };
  }

  if (newPassword.length < 6) {
    return { success: false, message: 'New password must be at least 6 characters long.' };
  }

  try {
    const res = await UserApi.changeSelfPassword({
      currentPassword: currentPassword,
      newPassword: newPassword
    });
    return { success: true, message: res.message || 'Password changed successfully!' };
  } catch (err) {
    return { success: false, message: err.message || 'Failed to change password. Please ensure your current password is correct.' };
  }
}

// ── UI View Helpers & Event Handlers ─────────────────────────

export function switchTab(tab) {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginBtn = document.getElementById('tab-login-btn');
  const signupBtn = document.getElementById('tab-signup-btn');
  const alertBox = document.getElementById('auth-alert');

  if (alertBox) alertBox.classList.add('hidden');

  if (tab === 'login') {
    if (loginForm) loginForm.classList.remove('hidden');
    if (signupForm) signupForm.classList.add('hidden');
    if (loginBtn) loginBtn.className = 'flex-1 py-2.5 text-xs font-bold rounded-lg transition-all text-white bg-blue-600 shadow-sm';
    if (signupBtn) signupBtn.className = 'flex-1 py-2.5 text-xs font-bold rounded-lg transition-all text-[#64748b] hover:text-[#0f172a]';
  } else {
    if (loginForm) loginForm.classList.add('hidden');
    if (signupForm) signupForm.classList.remove('hidden');
    if (signupBtn) signupBtn.className = 'flex-1 py-2.5 text-xs font-bold rounded-lg transition-all text-white bg-blue-600 shadow-sm';
    if (loginBtn) loginBtn.className = 'flex-1 py-2.5 text-xs font-bold rounded-lg transition-all text-[#64748b] hover:text-[#0f172a]';
  }
}

export function togglePasswordVisibility(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.type = field.type === 'password' ? 'text' : 'password';
  }
}

export function showAlert(message, isError = true) {
  const alertBox = document.getElementById('auth-alert');
  const alertText = document.getElementById('auth-alert-text');
  if (!alertBox || !alertText) return;

  alertBox.classList.remove('hidden', 'bg-rose-50', 'border-rose-200', 'text-rose-700', 'bg-emerald-50', 'border-emerald-200', 'text-emerald-700');

  if (isError) {
    alertBox.classList.add('bg-rose-50', 'border-rose-200', 'text-rose-700');
  } else {
    alertBox.classList.add('bg-emerald-50', 'border-emerald-200', 'text-emerald-700');
  }

  alertText.textContent = message;
}

export function getRedirectTarget(user) {
  if (user && (user.role === 'SUPERADMIN' || user.role === 'ADMIN' || user.role === 'STAFF')) {
    return '#admin';
  }

  let redirectParam = null;
  const hash = window.location.hash || '';
  if (hash.includes('?')) {
    const params = new URLSearchParams(hash.split('?')[1]);
    redirectParam = params.get('redirect');
  }
  if (!redirectParam) {
    const urlParams = new URLSearchParams(window.location.search);
    redirectParam = urlParams.get('redirect');
  }

  if (redirectParam) {
    return redirectParam.startsWith('#') ? redirectParam : `#${redirectParam}`;
  }
  return '#home';
}

export async function handleLoginSubmit(e) {
  e.preventDefault();
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  const usernameOrEmail = usernameInput ? usernameInput.value : '';
  const password = passwordInput ? passwordInput.value : '';

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-70', 'cursor-wait');
  }

  const res = await loginUser(usernameOrEmail, password);

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-70', 'cursor-wait');
  }

  if (res.success) {
    showAlert(`Welcome back, ${res.user.name}! Redirecting...`, false);
    setTimeout(() => {
      const target = getRedirectTarget(res.user);
      window.location.hash = target;
    }, 400);
  } else {
    showAlert(res.message, true);
  }
}

export async function handleSignupSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');

  if (password !== confirmPassword) {
    showAlert("Passwords do not match. Please re-enter your password.", true);
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-70', 'cursor-wait');
  }

  const res = await registerUser(name, username, email, password);

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-70', 'cursor-wait');
  }

  if (res.success) {
    showAlert(res.message, false);
    setTimeout(() => {
      const target = getRedirectTarget(res.user);
      window.location.hash = target;
    }, 400);
  } else {
    showAlert(res.message, true);
  }
}

/**
 * Open Profile & Credentials Edit Modal for Logged In User
 */
export function openEditProfileModal() {
  const user = getCurrentUser();
  if (!user) {
    alert('Please log in first to manage your profile.');
    window.location.hash = '#login?redirect=account';
    return;
  }

  let modalContainer = document.getElementById('user-profile-modal-container');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'user-profile-modal-container';
    document.body.appendChild(modalContainer);
  }

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-xs">
      <div class="bg-white border border-[#e2e8f0] rounded-xl p-6 max-w-lg w-full shadow-xl space-y-5 animate-in fade-in zoom-in duration-200">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center border border-blue-200 shadow-sm">
              ${(user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 class="text-base font-extrabold text-[#0f172a]">Edit Profile & Credentials</h3>
              <p class="text-[11px] text-[#64748b]">Account: <span class="font-mono text-blue-600">@${user.username || user.id}</span> (${user.role || 'CUSTOMER'})</p>
            </div>
          </div>
          <button onclick="closeEditProfileModal()" class="text-[#64748b] hover:text-[#0f172a] text-xl font-bold">&times;</button>
        </div>

        <!-- Tabs: Profile Details vs Change Password -->
        <div class="flex items-center bg-[#f8fafc] p-1 rounded-lg border border-[#e2e8f0]">
          <button type="button" id="modal-tab-details-btn" onclick="switchProfileModalTab('details')" class="flex-1 py-2 text-xs font-bold rounded-md transition-all text-white bg-blue-600 shadow-sm">
            Profile Details
          </button>
          <button type="button" id="modal-tab-security-btn" onclick="switchProfileModalTab('security')" class="flex-1 py-2 text-xs font-bold rounded-md transition-all text-[#64748b] hover:text-[#0f172a]">
            Change Password
          </button>
        </div>

        <!-- Alert Notification Box in Modal -->
        <div id="modal-profile-alert" class="hidden p-3 rounded-md text-xs font-semibold"></div>

        <!-- TAB 1: Profile Details Form -->
        <form id="modal-profile-details-form" onsubmit="handleSaveProfileDetailsSubmit(event, '${user.id}')" class="space-y-4 text-xs">
          <div>
            <label class="block text-[#475569] font-bold mb-1">Full Name *</label>
            <input type="text" id="modal-edit-name" required value="${user.name || ''}" class="w-full px-3 py-2 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] focus:border-blue-600">
          </div>

          <div>
            <label class="block text-[#475569] font-bold mb-1">Username (@handle) *</label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-[#64748b] font-mono">@</span>
              <input type="text" id="modal-edit-username" required pattern="[a-zA-Z0-9_.-]+" minlength="3" value="${user.username || ''}" class="w-full pl-7 pr-3 py-2 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] focus:border-blue-600 font-mono">
            </div>
            <p class="text-[10px] text-[#64748b] mt-1">Used for signing in and displaying account identity.</p>
          </div>

          <div>
            <label class="block text-[#475569] font-bold mb-1">Email Address *</label>
            <input type="email" id="modal-edit-email" required value="${user.email || ''}" class="w-full px-3 py-2 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] focus:border-blue-600">
          </div>

          <div class="pt-3 border-t border-[#e2e8f0] flex items-center justify-end space-x-2.5">
            <button type="button" onclick="closeEditProfileModal()" class="px-4 py-2 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#475569] rounded-md font-bold border border-[#e2e8f0]">Cancel</button>
            <button type="submit" id="modal-save-profile-btn" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-bold shadow-sm flex items-center space-x-1.5">
              <span>Save Profile</span>
            </button>
          </div>
        </form>

        <!-- TAB 2: Change Password & Security Form -->
        <form id="modal-profile-security-form" onsubmit="handleChangePasswordSubmit(event, '${user.id}')" class="hidden space-y-4 text-xs">
          <div>
            <label class="block text-[#475569] font-bold mb-1">Current Password *</label>
            <div class="relative">
              <input type="password" id="modal-pwd-current" required placeholder="Enter current password" class="w-full pl-3 pr-10 py-2 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] focus:border-blue-600">
              <button type="button" onclick="toggleModalPasswordVisibility('modal-pwd-current')" class="absolute right-3 top-2.5 text-[#64748b] hover:text-[#0f172a]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-[#475569] font-bold mb-1">New Password (min 6 characters) *</label>
            <div class="relative">
              <input type="password" id="modal-pwd-new" required minlength="6" placeholder="••••••••" class="w-full pl-3 pr-10 py-2 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] focus:border-blue-600">
              <button type="button" onclick="toggleModalPasswordVisibility('modal-pwd-new')" class="absolute right-3 top-2.5 text-[#64748b] hover:text-[#0f172a]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-[#475569] font-bold mb-1">Confirm New Password *</label>
            <div class="relative">
              <input type="password" id="modal-pwd-confirm" required minlength="6" placeholder="••••••••" class="w-full pl-3 pr-10 py-2 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] focus:border-blue-600">
              <button type="button" onclick="toggleModalPasswordVisibility('modal-pwd-confirm')" class="absolute right-3 top-2.5 text-[#64748b] hover:text-[#0f172a]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
            </div>
          </div>

          <div class="pt-3 border-t border-[#e2e8f0] flex items-center justify-end space-x-2.5">
            <button type="button" onclick="closeEditProfileModal()" class="px-4 py-2 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#475569] rounded-md font-bold border border-[#e2e8f0]">Cancel</button>
            <button type="submit" id="modal-save-password-btn" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold shadow-sm flex items-center space-x-1.5">
              <span>Update Password</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  `;
}

export function closeEditProfileModal() {
  const container = document.getElementById('user-profile-modal-container');
  if (container) container.innerHTML = '';
}

export function switchProfileModalTab(tab) {
  const detailsForm = document.getElementById('modal-profile-details-form');
  const securityForm = document.getElementById('modal-profile-security-form');
  const detailsBtn = document.getElementById('modal-tab-details-btn');
  const securityBtn = document.getElementById('modal-tab-security-btn');
  const alertBox = document.getElementById('modal-profile-alert');

  if (alertBox) alertBox.classList.add('hidden');

  if (tab === 'details') {
    if (detailsForm) detailsForm.classList.remove('hidden');
    if (securityForm) securityForm.classList.add('hidden');
    if (detailsBtn) detailsBtn.className = 'flex-1 py-2 text-xs font-bold rounded-md transition-all text-white bg-blue-600 shadow-sm';
    if (securityBtn) securityBtn.className = 'flex-1 py-2 text-xs font-bold rounded-md transition-all text-[#64748b] hover:text-[#0f172a]';
  } else {
    if (detailsForm) detailsForm.classList.add('hidden');
    if (securityForm) securityForm.classList.remove('hidden');
    if (securityBtn) securityBtn.className = 'flex-1 py-2 text-xs font-bold rounded-md transition-all text-white bg-blue-600 shadow-sm';
    if (detailsBtn) detailsBtn.className = 'flex-1 py-2 text-xs font-bold rounded-md transition-all text-[#64748b] hover:text-[#0f172a]';
  }
}

export function toggleModalPasswordVisibility(fieldId) {
  const input = document.getElementById(fieldId);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

export async function handleSaveProfileDetailsSubmit(e, userId) {
  e.preventDefault();
  const name = document.getElementById('modal-edit-name').value;
  const username = document.getElementById('modal-edit-username').value;
  const email = document.getElementById('modal-edit-email').value;
  const alertBox = document.getElementById('modal-profile-alert');
  const submitBtn = document.getElementById('modal-save-profile-btn');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-70', 'cursor-wait');
  }

  const res = await updateUserProfile(userId, { name, username, email });

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-70', 'cursor-wait');
  }

  if (res.success) {
    if (alertBox) {
      alertBox.className = 'p-3 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200';
      alertBox.textContent = res.message;
      alertBox.classList.remove('hidden');
    }
    setTimeout(() => {
      closeEditProfileModal();
      if (window.updateHeaderAuthUI) window.updateHeaderAuthUI();
      // Re-render Account page elements if active
      const nameEl = document.getElementById('account-user-name');
      const handleEl = document.getElementById('account-user-handle');
      const usernameEl = document.getElementById('account-user-username');
      const emailEl = document.getElementById('account-user-email');
      const avatarEl = document.getElementById('account-avatar');

      if (nameEl) nameEl.textContent = res.user.name;
      if (handleEl) handleEl.textContent = `@${res.user.username}`;
      if (usernameEl) usernameEl.textContent = `@${res.user.username}`;
      if (emailEl) emailEl.textContent = res.user.email;
      if (avatarEl) avatarEl.textContent = res.user.name.charAt(0).toUpperCase();
    }, 500);
  } else {
    if (alertBox) {
      alertBox.className = 'p-3 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200';
      alertBox.textContent = res.message;
      alertBox.classList.remove('hidden');
    }
  }
}

export async function handleChangePasswordSubmit(e, userId) {
  e.preventDefault();
  const currentPassword = document.getElementById('modal-pwd-current').value;
  const newPassword = document.getElementById('modal-pwd-new').value;
  const confirmPassword = document.getElementById('modal-pwd-confirm').value;
  const alertBox = document.getElementById('modal-profile-alert');
  const submitBtn = document.getElementById('modal-save-password-btn');

  if (newPassword !== confirmPassword) {
    if (alertBox) {
      alertBox.className = 'p-3 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200';
      alertBox.textContent = 'New passwords do not match. Please re-enter.';
      alertBox.classList.remove('hidden');
    }
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-70', 'cursor-wait');
  }

  const res = await changeUserPassword(userId, currentPassword, newPassword);

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-70', 'cursor-wait');
  }

  if (res.success) {
    if (alertBox) {
      alertBox.className = 'p-3 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200';
      alertBox.textContent = res.message;
      alertBox.classList.remove('hidden');
    }
    setTimeout(() => {
      closeEditProfileModal();
    }, 600);
  } else {
    if (alertBox) {
      alertBox.className = 'p-3 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200';
      alertBox.textContent = res.message;
      alertBox.classList.remove('hidden');
    }
  }
}
