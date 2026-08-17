// ETech Computers - Authentication & User State Management Module

const USERS_STORAGE_KEY = 'etech_users';
const CURRENT_USER_KEY = 'etech_current_user';

const DEFAULT_USERS = [
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

/**
 * Get all registered users from localStorage (seed defaults if empty)
 */
export function getUsers() {
  const users = localStorage.getItem(USERS_STORAGE_KEY);
  if (!users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  const parsed = JSON.parse(users);
  let updated = false;

  // Migrate existing users to have username if missing
  parsed.forEach((u, index) => {
    if (!u.username) {
      if (u.email && u.email.toLowerCase() === 'admin@etech.com') u.username = 'admin';
      else if (u.email && u.email.toLowerCase() === 'staff@etech.com') u.username = 'staff';
      else if (u.email && u.email.toLowerCase() === 'customer@etech.com') u.username = 'customer';
      else u.username = u.email ? u.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') : `user_${index + 1}`;
      updated = true;
    }
  });

  // Ensure default admin always exists if missing
  if (!parsed.some(u => (u.username && u.username.toLowerCase() === 'admin') || u.email.toLowerCase() === 'admin@etech.com')) {
    parsed.unshift(DEFAULT_USERS[0]);
    updated = true;
  }

  if (updated) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
  }
  return parsed;
}

/**
 * Register a new user (always role CUSTOMER)
 */
export function registerUser(name, username, email, password) {
  const cleanName = (name || '').trim();
  const cleanUsername = (username || '').trim().toLowerCase();
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanName || !cleanUsername || !cleanEmail || !password) {
    return { success: false, message: 'Please fill in all required fields (Name, Username, Email, Password).' };
  }

  if (cleanUsername.length < 3) {
    return { success: false, message: 'Username must be at least 3 characters long.' };
  }

  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  const users = getUsers();
  const existingUsername = users.find(u => u.username && u.username.toLowerCase() === cleanUsername);
  if (existingUsername) {
    return { success: false, message: 'An account with this username already exists. Please choose a different username.' };
  }

  const existingEmail = users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    return { success: false, message: 'An account with this email address already exists. Please log in.' };
  }

  const newUser = {
    id: 'USR-' + Math.floor(100000 + Math.random() * 900000),
    username: cleanUsername,
    name: cleanName,
    email: cleanEmail,
    password: password,
    role: 'CUSTOMER',
    assignedBranch: null,
    createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  // Automatically log in newly registered user
  setCurrentUser(newUser);

  return { success: true, message: 'Account created successfully!', user: newUser };
}

/**
 * Log in user with username (or email) and password
 */
export function loginUser(usernameOrEmail, password) {
  const cleanIdentifier = (usernameOrEmail || '').trim().toLowerCase();

  if (!cleanIdentifier || !password) {
    return { success: false, message: 'Please enter your username and password.' };
  }

  const users = getUsers();
  const user = users.find(u => 
    (u.username && u.username.toLowerCase() === cleanIdentifier) || 
    (u.email && u.email.toLowerCase() === cleanIdentifier)
  );

  if (!user || user.password !== password) {
    return { success: false, message: 'Invalid username or password. Please try again.' };
  }

  setCurrentUser(user);

  return { success: true, message: 'Logged in successfully!', user: user };
}

/**
 * Set active user session
 */
export function setCurrentUser(user) {
  const safeUser = {
    id: user.id,
    username: user.username || (user.email ? user.email.split('@')[0] : 'user'),
    name: user.name,
    email: user.email,
    role: user.role || 'CUSTOMER',
    assignedBranch: user.assignedBranch || null,
    createdAt: user.createdAt
  };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
}

/**
 * Get active user session
 * @returns {object|null}
 */
export function getCurrentUser() {
  const session = localStorage.getItem(CURRENT_USER_KEY);
  return session ? JSON.parse(session) : null;
}

/**
 * Check if user is logged in
 */
export function isLoggedIn() {
  return getCurrentUser() !== null;
}

/**
 * Log out active user session
 */
export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// Order management logic has been migrated to order_management_controller.js

// ── Login Page Logic (only runs if login-form exists in DOM) ──
document.addEventListener('DOMContentLoaded', () => {
  // Only execute on login page
  if (!document.getElementById('login-form')) return;

  const urlParams = new URLSearchParams(window.location.search);
  const redirectParam = urlParams.get('redirect');
  const tabParam = urlParams.get('tab');

  // Check if already logged in
  if (isLoggedIn()) {
    const user = getCurrentUser();
    window.location.href = getRedirectTarget(user);
    return;
  }

  // Show banner if redirected
  if (redirectParam) {
    const banner = document.getElementById('redirect-banner');
    const bannerText = document.getElementById('redirect-banner-text');
    if (banner && bannerText) {
      banner.classList.remove('hidden');
      if (redirectParam === 'checkout') {
        bannerText.textContent = 'Please log in or create an account to finish your order checkout.';
      } else if (redirectParam === 'account') {
        bannerText.textContent = 'You must sign up or log in first to view your Account & Order history.';
      }
    }
  }

  // Auto switch tab if tab=signup
  if (tabParam === 'signup') {
    switchTab('signup');
  }
});

export function switchTab(tab) {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginBtn = document.getElementById('tab-login-btn');
  const signupBtn = document.getElementById('tab-signup-btn');
  const alertBox = document.getElementById('auth-alert');

  if (alertBox) alertBox.classList.add('hidden');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    loginBtn.className = 'flex-1 py-2.5 text-xs font-bold rounded-lg transition-all text-white bg-blue-600 shadow-md';
    signupBtn.className = 'flex-1 py-2.5 text-xs font-bold rounded-lg transition-all text-slate-400 hover:text-white';
  } else {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    signupBtn.className = 'flex-1 py-2.5 text-xs font-bold rounded-lg transition-all text-white bg-blue-600 shadow-md';
    loginBtn.className = 'flex-1 py-2.5 text-xs font-bold rounded-lg transition-all text-slate-400 hover:text-white';
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

  alertBox.classList.remove('hidden', 'bg-rose-950/80', 'border-rose-800', 'text-rose-300', 'bg-emerald-950/80', 'border-emerald-800', 'text-emerald-300');

  if (isError) {
    alertBox.classList.add('bg-rose-950/80', 'border-rose-800', 'text-rose-300');
  } else {
    alertBox.classList.add('bg-emerald-950/80', 'border-emerald-800', 'text-emerald-300');
  }

  alertText.textContent = message;
}

function getRedirectTarget(user) {
  if (user && (user.role === 'ADMIN' || user.role === 'STAFF')) {
    return '#admin';
  }
  
  // Check hash query first (#login?redirect=...) then fallback to search
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

export function handleLoginSubmit(e) {
  e.preventDefault();
  const usernameInput = document.getElementById('login-username') || document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const usernameOrEmail = usernameInput ? usernameInput.value : '';
  const password = passwordInput ? passwordInput.value : '';

  const res = loginUser(usernameOrEmail, password);
  if (res.success) {
    showAlert(`Welcome back, ${res.user.name} (@${res.user.username})! Redirecting...`, false);
    setTimeout(() => {
      const target = getRedirectTarget(res.user);
      window.location.hash = target;
    }, 600);
  } else {
    showAlert(res.message, true);
  }
}

export function handleSignupSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;

  if (password !== confirmPassword) {
    showAlert("Passwords do not match. Please re-enter your password.", true);
    return;
  }

  const res = registerUser(name, username, email, password);
  if (res.success) {
    showAlert(res.message, false);
    setTimeout(() => {
      const target = getRedirectTarget(res.user);
      window.location.hash = target;
    }, 600);
  } else {
    showAlert(res.message, true);
  }
}

/**
 * Update user profile details (Name, Username, Email)
 */
export function updateUserProfile(userId, { name, username, email }) {
  const cleanName = (name || '').trim();
  const cleanUsername = (username || '').trim().toLowerCase();
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanName || !cleanUsername || !cleanEmail) {
    return { success: false, message: 'All fields (Name, Username, Email) are required.' };
  }

  if (cleanUsername.length < 3) {
    return { success: false, message: 'Username must be at least 3 characters long.' };
  }

  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) {
    return { success: false, message: 'User account not found.' };
  }

  // Check duplicate username
  const duplicateUser = users.find(u => u.id !== userId && u.username && u.username.toLowerCase() === cleanUsername);
  if (duplicateUser) {
    return { success: false, message: 'This username is already taken by another account.' };
  }

  // Check duplicate email
  const duplicateEmail = users.find(u => u.id !== userId && u.email.toLowerCase() === cleanEmail);
  if (duplicateEmail) {
    return { success: false, message: 'This email address is already associated with another account.' };
  }

  user.name = cleanName;
  user.username = cleanUsername;
  user.email = cleanEmail;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUser(user);
  }

  return { success: true, message: 'Profile details updated successfully!', user };
}

/**
 * Change user security credentials (Password)
 */
export function changeUserPassword(userId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    return { success: false, message: 'Please provide both your current password and new password.' };
  }

  if (newPassword.length < 6) {
    return { success: false, message: 'New password must be at least 6 characters long.' };
  }

  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) {
    return { success: false, message: 'User account not found.' };
  }

  if (user.password !== currentPassword) {
    return { success: false, message: 'Incorrect current password. Please try again.' };
  }

  user.password = newPassword;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  return { success: true, message: 'Password changed successfully!' };
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
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080b12]/85 backdrop-blur-sm">
      <div class="bg-[#101722] border border-[#202b3a] rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-[#202b3a] pb-3">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 font-extrabold flex items-center justify-center border border-blue-500/30">
              ${user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 class="text-base font-extrabold text-white">Edit Profile & Credentials</h3>
              <p class="text-[11px] text-[#718096]">Account: <span class="font-mono text-blue-400">@${user.username || user.id}</span> (${user.role || 'CUSTOMER'})</p>
            </div>
          </div>
          <button onclick="closeEditProfileModal()" class="text-[#718096] hover:text-white text-xl font-bold">&times;</button>
        </div>

        <!-- Tabs: Profile Details vs Change Password -->
        <div class="flex items-center bg-[#080b12] p-1 rounded-lg border border-[#202b3a]">
          <button type="button" id="modal-tab-details-btn" onclick="switchProfileModalTab('details')" class="flex-1 py-2 text-xs font-bold rounded-md transition-all text-white bg-blue-600 shadow-sm">
            Profile Details
          </button>
          <button type="button" id="modal-tab-security-btn" onclick="switchProfileModalTab('security')" class="flex-1 py-2 text-xs font-bold rounded-md transition-all text-[#a7b3c4] hover:text-white">
            Change Password
          </button>
        </div>

        <!-- Alert Notification Box in Modal -->
        <div id="modal-profile-alert" class="hidden p-3 rounded-md text-xs font-semibold"></div>

        <!-- TAB 1: Profile Details Form -->
        <form id="modal-profile-details-form" onsubmit="handleSaveProfileDetailsSubmit(event, '${user.id}')" class="space-y-4 text-xs">
          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">Full Name *</label>
            <input type="text" id="modal-edit-name" required value="${user.name || ''}" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
          </div>

          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">Username (@handle) *</label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-[#718096] font-mono">@</span>
              <input type="text" id="modal-edit-username" required pattern="[a-zA-Z0-9_.-]+" minlength="3" value="${user.username || ''}" class="w-full pl-7 pr-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500 font-mono">
            </div>
            <p class="text-[10px] text-[#718096] mt-1">Used for signing in and displaying account identity.</p>
          </div>

          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">Email Address *</label>
            <input type="email" id="modal-edit-email" required value="${user.email || ''}" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
          </div>

          <div class="pt-3 border-t border-[#202b3a] flex items-center justify-end space-x-2.5">
            <button type="button" onclick="closeEditProfileModal()" class="px-4 py-2 bg-[#141c28] hover:bg-[#192332] text-[#a7b3c4] rounded-md font-bold border border-[#202b3a]">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-bold shadow-sm flex items-center space-x-1.5">
              <span>Save Profile</span>
            </button>
          </div>
        </form>

        <!-- TAB 2: Change Password & Security Form -->
        <form id="modal-profile-security-form" onsubmit="handleChangePasswordSubmit(event, '${user.id}')" class="hidden space-y-4 text-xs">
          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">Current Password *</label>
            <div class="relative">
              <input type="password" id="modal-pwd-current" required placeholder="Enter current password" class="w-full pl-3 pr-10 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
              <button type="button" onclick="toggleModalPasswordVisibility('modal-pwd-current')" class="absolute right-3 top-2.5 text-[#718096] hover:text-white">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">New Password (min 6 characters) *</label>
            <div class="relative">
              <input type="password" id="modal-pwd-new" required minlength="6" placeholder="••••••••" class="w-full pl-3 pr-10 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
              <button type="button" onclick="toggleModalPasswordVisibility('modal-pwd-new')" class="absolute right-3 top-2.5 text-[#718096] hover:text-white">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">Confirm New Password *</label>
            <div class="relative">
              <input type="password" id="modal-pwd-confirm" required minlength="6" placeholder="••••••••" class="w-full pl-3 pr-10 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
              <button type="button" onclick="toggleModalPasswordVisibility('modal-pwd-confirm')" class="absolute right-3 top-2.5 text-[#718096] hover:text-white">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
            </div>
          </div>

          <div class="pt-3 border-t border-[#202b3a] flex items-center justify-end space-x-2.5">
            <button type="button" onclick="closeEditProfileModal()" class="px-4 py-2 bg-[#141c28] hover:bg-[#192332] text-[#a7b3c4] rounded-md font-bold border border-[#202b3a]">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold shadow-sm flex items-center space-x-1.5">
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
    if (securityBtn) securityBtn.className = 'flex-1 py-2 text-xs font-bold rounded-md transition-all text-[#a7b3c4] hover:text-white';
  } else {
    if (detailsForm) detailsForm.classList.add('hidden');
    if (securityForm) securityForm.classList.remove('hidden');
    if (securityBtn) securityBtn.className = 'flex-1 py-2 text-xs font-bold rounded-md transition-all text-white bg-blue-600 shadow-sm';
    if (detailsBtn) detailsBtn.className = 'flex-1 py-2 text-xs font-bold rounded-md transition-all text-[#a7b3c4] hover:text-white';
  }
}

export function toggleModalPasswordVisibility(fieldId) {
  const input = document.getElementById(fieldId);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

export function handleSaveProfileDetailsSubmit(e, userId) {
  e.preventDefault();
  const name = document.getElementById('modal-edit-name').value;
  const username = document.getElementById('modal-edit-username').value;
  const email = document.getElementById('modal-edit-email').value;

  const res = updateUserProfile(userId, { name, username, email });
  const alertBox = document.getElementById('modal-profile-alert');

  if (res.success) {
    if (alertBox) {
      alertBox.className = 'p-3 rounded-md text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
      alertBox.textContent = res.message;
      alertBox.classList.remove('hidden');
    }
    setTimeout(() => {
      closeEditProfileModal();
      if (window.updateHeaderAuthUI) window.updateHeaderAuthUI();
      // Re-render Account page elements if on Account view
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
      alert('Profile details updated successfully!');
    }, 500);
  } else {
    if (alertBox) {
      alertBox.className = 'p-3 rounded-md text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30';
      alertBox.textContent = res.message;
      alertBox.classList.remove('hidden');
    }
  }
}

export function handleChangePasswordSubmit(e, userId) {
  e.preventDefault();
  const currentPassword = document.getElementById('modal-pwd-current').value;
  const newPassword = document.getElementById('modal-pwd-new').value;
  const confirmPassword = document.getElementById('modal-pwd-confirm').value;
  const alertBox = document.getElementById('modal-profile-alert');

  if (newPassword !== confirmPassword) {
    if (alertBox) {
      alertBox.className = 'p-3 rounded-md text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30';
      alertBox.textContent = 'New passwords do not match. Please re-enter.';
      alertBox.classList.remove('hidden');
    }
    return;
  }

  const res = changeUserPassword(userId, currentPassword, newPassword);

  if (res.success) {
    if (alertBox) {
      alertBox.className = 'p-3 rounded-md text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
      alertBox.textContent = res.message;
      alertBox.classList.remove('hidden');
    }
    setTimeout(() => {
      closeEditProfileModal();
      alert(res.message);
    }, 600);
  } else {
    if (alertBox) {
      alertBox.className = 'p-3 rounded-md text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30';
      alertBox.textContent = res.message;
      alertBox.classList.remove('hidden');
    }
  }
}


