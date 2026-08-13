import { getBranches, saveBranch, deleteBranch, getBranchById } from './branch_controller.js';

/**
 * ============================================================
 * TAB 4: BRANCH MANAGEMENT (ADMIN ONLY)
 * ============================================================
 */
export function renderBranchesTab() {
  const grid = document.getElementById('branches-list-grid');
  if (!grid) return;

  const branches = getBranches();

  grid.innerHTML = branches.map(b => `
    <div class="bg-[#101722] border border-[#202b3a] rounded-lg p-4 space-y-3.5 hover:border-[#34445a] transition-colors">
      <div class="flex items-center justify-between border-b border-[#202b3a] pb-2.5">
        <div>
          <span class="text-[9px] font-mono text-blue-400 uppercase tracking-widest font-bold">${b.id}</span>
          <h4 class="text-sm font-extrabold text-white">${b.name}</h4>
          <p class="text-[11px] text-[#718096]">${b.city} Hub</p>
        </div>
        <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold ${b.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}">
          ${b.status}
        </span>
      </div>

      <div class="space-y-1 text-xs text-[#a7b3c4]">
        <p>📍 <strong class="text-[#718096]">Address:</strong> ${b.address}</p>
        <p>📞 <strong class="text-[#718096]">Phone:</strong> ${b.phone}</p>
        <p>🚚 <strong class="text-[#718096]">Base Shipping:</strong> Rs. ${b.baseShippingFee} + Rs. ${b.perKmFee}/km</p>
      </div>

      <div class="pt-2 border-t border-[#202b3a] flex items-center justify-end space-x-2">
        <button onclick="editBranch('${b.id}')" class="px-3 py-1.5 bg-[#141c28] hover:bg-[#192332] text-blue-400 rounded-md text-xs font-bold border border-[#202b3a] transition-colors">Edit Branch</button>
        <button onclick="confirmDeleteBranch('${b.id}')" class="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/40 rounded-md text-xs font-bold transition-colors">Delete</button>
      </div>
    </div>
  `).join('');
}

export function confirmDeleteBranch(branchId) {
  if (confirm('Are you sure you want to delete this store branch?')) {
    deleteBranch(branchId);
    renderBranchesTab();
  }
}

export function openBranchModal(branchId = null) {
  const modal = document.getElementById('admin-modal-container');
  const branch = branchId ? getBranchById(branchId) : null;

  modal.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080b12]/80 backdrop-blur-sm">
      <div class="bg-[#101722] border border-[#202b3a] rounded-lg p-6 max-w-md w-full space-y-4 shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#202b3a] pb-3">
          <h3 class="text-base font-extrabold text-white">${branch ? 'Edit Store Branch' : 'Add Store Branch'}</h3>
          <button onclick="closeAdminModal()" class="text-[#718096] hover:text-white">&times;</button>
        </div>

        <form onsubmit="handleSaveBranchSubmit(event, ${branch ? `'${branch.id}'` : 'null'})" class="space-y-3.5 text-xs">
          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">Branch Name *</label>
            <input type="text" id="modal-b-name" required value="${branch ? branch.name : ''}" placeholder="Galle Tech Center" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">City / Region *</label>
              <input type="text" id="modal-b-city" required value="${branch ? branch.city : ''}" placeholder="Galle" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
            </div>
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">Phone Number</label>
              <input type="text" id="modal-b-phone" value="${branch ? branch.phone : ''}" placeholder="+94 91..." class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
            </div>
          </div>

          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">Address</label>
            <input type="text" id="modal-b-address" value="${branch ? branch.address : ''}" placeholder="Main Street, Galle Fort" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">Base Shipping Fee (Rs.)</label>
              <input type="number" id="modal-b-basefee" value="${branch ? branch.baseShippingFee : 300}" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white font-mono focus:border-blue-500">
            </div>
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">Per KM Rate (Rs.)</label>
              <input type="number" id="modal-b-kmfee" value="${branch ? branch.perKmFee : 25}" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white font-mono focus:border-blue-500">
            </div>
          </div>

          <div class="pt-2 flex items-center justify-end space-x-2.5">
            <button type="button" onclick="closeAdminModal()" class="px-4 py-2 bg-[#141c28] hover:bg-[#192332] text-[#a7b3c4] rounded-md font-bold border border-[#202b3a]">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-bold shadow-sm">Save Branch</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function editBranch(branchId) {
  openBranchModal(branchId);
}

export function handleSaveBranchSubmit(e, branchId) {
  e.preventDefault();
  const branchData = {
    id: branchId,
    name: document.getElementById('modal-b-name').value,
    city: document.getElementById('modal-b-city').value,
    phone: document.getElementById('modal-b-phone').value,
    address: document.getElementById('modal-b-address').value,
    baseShippingFee: document.getElementById('modal-b-basefee').value,
    perKmFee: document.getElementById('modal-b-kmfee').value,
    status: 'Active'
  };

  saveBranch(branchData);
  if (window.closeAdminModal) window.closeAdminModal();
  renderBranchesTab();
}