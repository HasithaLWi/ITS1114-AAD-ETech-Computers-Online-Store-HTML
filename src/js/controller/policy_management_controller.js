// ============================================================
//  policy_management_controller.js — Admin Store Profile & Policies
// ============================================================
import { getBusinessInfo, saveBusinessInfo, getStoredPolicies, saveStoredPolicies, updatePolicyDocument, DEFAULT_BUSINESS_INFO, DEFAULT_LEGAL_POLICIES } from '../models/policy-data.js';

/**
 * Renders the Store Profile & Policies Management Tab inside the Admin Dashboard
 */
export function renderPoliciesTab() {
  const panel = document.getElementById('tab-panel-policies');
  if (!panel) return;

  const business = getBusinessInfo();
  const policies = getStoredPolicies();

  panel.innerHTML = `
    <div class="space-y-6 max-w-7xl mx-auto pb-10">

      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101722] border border-[#202b3a] rounded-lg p-5 shadow-lg">
        <div>
          <div class="flex items-center space-x-2 mb-1">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">Administration & Legal Governance</span>
          </div>
          <h2 class="text-xl font-extrabold text-white">Store Profile & Legal Policies Management</h2>
          <p class="text-xs text-[#718096] mt-0.5">Manage public company profile details, customer hotlines, ISO credentials, and legal compliance policies.</p>
        </div>

        <div class="flex items-center space-x-2.5">
          <a href="#about" target="_blank" class="px-4 py-2 bg-[#141c28] hover:bg-[#192332] text-[#a7b3c4] hover:text-white rounded-md font-bold text-xs border border-[#202b3a] transition-all flex items-center space-x-1.5">
            <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            <span>View Live About Us Page</span>
          </a>
        </div>
      </div>

      <!-- ── SECTION 1: Business Profile Information Table ──────────── -->
      <div class="bg-[#101722] border border-[#202b3a] rounded-lg shadow-lg overflow-hidden">
        <div class="p-4 sm:p-5 border-b border-[#202b3a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c111b]">
          <div>
            <h3 class="text-base font-extrabold text-white flex items-center space-x-2">
              <span>🏢 Corporate Business Profile & Operations Matrix</span>
            </h3>
            <p class="text-xs text-[#718096] mt-0.5">These values are displayed on the live About Us page, customer invoices, and support footers.</p>
          </div>
          <button onclick="openBusinessInfoModal()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-bold text-xs shadow-sm flex items-center space-x-1.5 flex-shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            <span>Edit Business Profile</span>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <tbody class="divide-y divide-[#202b3a]">
              <tr class="hover:bg-[#141c28]/60 transition-colors">
                <td class="py-3 px-4 font-bold text-[#718096] w-1/4 uppercase text-[10px] tracking-wider bg-[#080b12]/60">Store Trade Name</td>
                <td class="py-3 px-4 text-white font-semibold">${business.storeName}</td>
                <td class="py-3 px-4 font-bold text-[#718096] w-1/4 uppercase text-[10px] tracking-wider bg-[#080b12]/60">Business Reg No</td>
                <td class="py-3 px-4 text-cyan-400 font-mono font-bold">${business.registrationNo}</td>
              </tr>
              <tr class="hover:bg-[#141c28]/60 transition-colors">
                <td class="py-3 px-4 font-bold text-[#718096] uppercase text-[10px] tracking-wider bg-[#080b12]/60">Tagline</td>
                <td class="py-3 px-4 text-[#a7b3c4]">${business.tagline}</td>
                <td class="py-3 px-4 font-bold text-[#718096] uppercase text-[10px] tracking-wider bg-[#080b12]/60">Tax ID / VAT</td>
                <td class="py-3 px-4 text-blue-400 font-mono font-bold">${business.taxId}</td>
              </tr>
              <tr class="hover:bg-[#141c28]/60 transition-colors">
                <td class="py-3 px-4 font-bold text-[#718096] uppercase text-[10px] tracking-wider bg-[#080b12]/60">Support Hotline</td>
                <td class="py-3 px-4 text-white font-mono">${business.hotline}</td>
                <td class="py-3 px-4 font-bold text-[#718096] uppercase text-[10px] tracking-wider bg-[#080b12]/60">Support Email</td>
                <td class="py-3 px-4 text-blue-400 font-mono">${business.supportEmail}</td>
              </tr>
              <tr class="hover:bg-[#141c28]/60 transition-colors">
                <td class="py-3 px-4 font-bold text-[#718096] uppercase text-[10px] tracking-wider bg-[#080b12]/60">Headquarters Address</td>
                <td class="py-3 px-4 text-white">${business.headquarters}</td>
                <td class="py-3 px-4 font-bold text-[#718096] uppercase text-[10px] tracking-wider bg-[#080b12]/60">ISO Certification</td>
                <td class="py-3 px-4 text-emerald-400 font-semibold">${business.isoCert}</td>
              </tr>
              <tr class="hover:bg-[#141c28]/60 transition-colors">
                <td class="py-3 px-4 font-bold text-[#718096] uppercase text-[10px] tracking-wider bg-[#080b12]/60">Operating Hours</td>
                <td class="py-3 px-4 text-[#a7b3c4]" colspan="3">${business.workingHours}</td>
              </tr>
              <tr class="hover:bg-[#141c28]/60 transition-colors">
                <td class="py-3 px-4 font-bold text-[#718096] uppercase text-[10px] tracking-wider bg-[#080b12]/60">Mission Statement</td>
                <td class="py-3 px-4 text-[#a7b3c4] leading-relaxed" colspan="3">${business.mission}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── SECTION 2: Legal Policies Management Table ────────────── -->
      <div class="bg-[#101722] border border-[#202b3a] rounded-lg shadow-lg overflow-hidden space-y-4">
        <div class="p-4 sm:p-5 border-b border-[#202b3a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c111b]">
          <div>
            <h3 class="text-base font-extrabold text-white flex items-center space-x-2">
              <span>⚖️ Legal Policies & Customer Protection Documents</span>
            </h3>
            <p class="text-xs text-[#718096] mt-0.5">Manage policy document titles, revision dates, and individual legal clause sections.</p>
          </div>
          <button onclick="confirmResetPolicies()" class="px-3.5 py-1.5 bg-[#141c28] hover:bg-[#192332] text-[#718096] hover:text-white rounded-md text-xs font-semibold border border-[#202b3a] transition-all">
            Restore Defaults
          </button>
        </div>

        <div class="overflow-x-auto p-4 pt-0">
          <table class="w-full text-left text-xs border border-[#202b3a] rounded-md overflow-hidden">
            <thead class="bg-[#080b12] uppercase font-bold text-[10px] tracking-wider text-[#718096] border-b border-[#202b3a]">
              <tr>
                <th class="py-3 px-4">Policy Document</th>
                <th class="py-3 px-4">Route Slug</th>
                <th class="py-3 px-4 text-center">Sections / Clauses</th>
                <th class="py-3 px-4">Last Updated</th>
                <th class="py-3 px-4 text-center">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#202b3a]">
              ${Object.keys(policies).map(key => {
                const p = policies[key];
                return `
                  <tr class="hover:bg-[#141c28] transition-colors">
                    <td class="py-3.5 px-4">
                      <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 rounded bg-[#080b12] border border-[#202b3a] flex items-center justify-center">
                          ${p.icon || '📄'}
                        </div>
                        <div>
                          <p class="font-bold text-white text-xs">${p.title}</p>
                          <p class="text-[10px] text-[#718096] line-clamp-1">${p.subtitle || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td class="py-3.5 px-4 font-mono text-blue-400 font-bold text-xs">#${key}</td>
                    <td class="py-3.5 px-4 text-center">
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#080b12] text-[#a7b3c4] border border-[#202b3a]">
                        ${(p.sections || []).length} Clauses
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-[#a7b3c4] text-xs font-mono">${p.lastUpdated || 'Current'}</td>
                    <td class="py-3.5 px-4 text-center">
                      <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Active
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <div class="flex items-center justify-end space-x-2">
                        <a href="#${key}" target="_blank" class="p-1.5 bg-[#141c28] hover:bg-[#192332] text-[#a7b3c4] hover:text-white rounded border border-[#202b3a] transition-colors" title="Preview Live Document">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        </a>
                        <button onclick="openPolicyEditorModal('${key}')" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold shadow-sm transition-colors flex items-center space-x-1">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          <span>Edit Clauses</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

/**
 * Open Business Profile Editing Modal
 */
export function openBusinessInfoModal() {
  const modal = document.getElementById('admin-modal-container');
  if (!modal) return;

  const business = getBusinessInfo();

  modal.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080b12]/80 backdrop-blur-sm">
      <div class="bg-[#101722] border border-[#202b3a] rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#202b3a] pb-3">
          <div>
            <h3 class="text-base font-extrabold text-white">Edit Corporate Business Profile</h3>
            <p class="text-[11px] text-[#718096]">Update business credentials, contacts, and public mission statement.</p>
          </div>
          <button onclick="closeAdminModal()" class="text-[#718096] hover:text-white text-lg">&times;</button>
        </div>

        <form onsubmit="handleSaveBusinessInfoSubmit(event)" class="space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">Store Name *</label>
              <input type="text" id="biz-store-name" required value="${business.storeName || ''}" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
            </div>
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">Store Tagline *</label>
              <input type="text" id="biz-tagline" required value="${business.tagline || ''}" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">Business Registration No *</label>
              <input type="text" id="biz-reg-no" required value="${business.registrationNo || ''}" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
            </div>
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">Tax ID / VAT *</label>
              <input type="text" id="biz-tax-id" required value="${business.taxId || ''}" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">Support Hotline *</label>
              <input type="text" id="biz-hotline" required value="${business.hotline || ''}" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
            </div>
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">Official Support Email *</label>
              <input type="email" id="biz-email" required value="${business.supportEmail || ''}" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
            </div>
          </div>

          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">National Headquarters Address *</label>
            <input type="text" id="biz-hq" required value="${business.headquarters || ''}" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">ISO Certification Tag *</label>
              <input type="text" id="biz-iso" required value="${business.isoCert || ''}" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
            </div>
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">Operating Hours *</label>
              <input type="text" id="biz-hours" required value="${business.workingHours || ''}" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
            </div>
          </div>

          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">Mission Statement *</label>
            <textarea id="biz-mission" rows="2" required class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">${business.mission || ''}</textarea>
          </div>

          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">Company Story *</label>
            <textarea id="biz-story" rows="3" required class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">${business.story || ''}</textarea>
          </div>

          <div class="pt-3 border-t border-[#202b3a] flex items-center justify-end space-x-2.5">
            <button type="button" onclick="closeAdminModal()" class="px-4 py-2 bg-[#141c28] hover:bg-[#192332] text-[#a7b3c4] rounded-md font-bold border border-[#202b3a]">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-bold shadow-sm">Save Profile Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

/**
 * Handle Business Profile Form Submit
 */
export function handleSaveBusinessInfoSubmit(e) {
  e.preventDefault();
  const current = getBusinessInfo();

  const updated = {
    ...current,
    storeName: document.getElementById('biz-store-name').value.trim(),
    tagline: document.getElementById('biz-tagline').value.trim(),
    registrationNo: document.getElementById('biz-reg-no').value.trim(),
    taxId: document.getElementById('biz-tax-id').value.trim(),
    hotline: document.getElementById('biz-hotline').value.trim(),
    supportEmail: document.getElementById('biz-email').value.trim(),
    headquarters: document.getElementById('biz-hq').value.trim(),
    isoCert: document.getElementById('biz-iso').value.trim(),
    workingHours: document.getElementById('biz-hours').value.trim(),
    mission: document.getElementById('biz-mission').value.trim(),
    story: document.getElementById('biz-story').value.trim()
  };

  saveBusinessInfo(updated);
  if (window.closeAdminModal) window.closeAdminModal();
  renderPoliciesTab();
  alert('Corporate Business Profile updated successfully!');
}

/**
 * Open Legal Policy Document Editor Modal
 */
let editingPolicySections = [];

export function openPolicyEditorModal(policyKey) {
  const modal = document.getElementById('admin-modal-container');
  if (!modal) return;

  const policies = getStoredPolicies();
  const policy = policies[policyKey] || DEFAULT_LEGAL_POLICIES[policyKey];
  if (!policy) return;

  editingPolicySections = JSON.parse(JSON.stringify(policy.sections || []));

  renderPolicyModalContent(policyKey, policy);
}

function renderPolicyModalContent(policyKey, policy) {
  const modal = document.getElementById('admin-modal-container');
  if (!modal) return;

  modal.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080b12]/80 backdrop-blur-sm">
      <div class="bg-[#101722] border border-[#202b3a] rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#202b3a] pb-3">
          <div>
            <h3 class="text-base font-extrabold text-white">Edit Policy Document: ${policy.title}</h3>
            <span class="text-[10px] text-blue-400 font-mono">Route: #${policyKey}</span>
          </div>
          <button onclick="closeAdminModal()" class="text-[#718096] hover:text-white text-lg">&times;</button>
        </div>

        <form onsubmit="handleSavePolicySubmit(event, '${policyKey}')" class="space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">Document Title *</label>
              <input type="text" id="edit-pol-title" required value="${policy.title || ''}" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
            </div>
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">Last Updated Date Tag *</label>
              <input type="text" id="edit-pol-date" required value="${policy.lastUpdated || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
            </div>
          </div>

          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">Subtitle / Purpose *</label>
            <input type="text" id="edit-pol-subtitle" required value="${policy.subtitle || ''}" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
          </div>

          <!-- Document Clauses List -->
          <div class="space-y-3 pt-2">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-white uppercase tracking-wider">Document Clauses & Sections (${editingPolicySections.length})</h4>
              <button type="button" onclick="addClauseSection('${policyKey}')" class="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-xs font-bold border border-blue-500/30 flex items-center space-x-1">
                <span>+ Add Clause</span>
              </button>
            </div>

            <div id="policy-clauses-container" class="space-y-3">
              ${editingPolicySections.map((sec, idx) => `
                <div class="bg-[#080b12] border border-[#202b3a] rounded-lg p-3.5 space-y-2 relative">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-mono font-bold text-blue-400 uppercase">Clause #${idx + 1}</span>
                    <button type="button" onclick="removeClauseSection(${idx}, '${policyKey}')" class="text-rose-400 hover:text-rose-300 text-xs font-bold">Remove</button>
                  </div>
                  <input type="text" id="clause-heading-${idx}" value="${sec.heading || ''}" placeholder="Clause Heading (e.g. 1. Information We Collect)" class="w-full px-2.5 py-1.5 rounded bg-[#101722] border border-[#202b3a] text-white text-xs focus:border-blue-500 font-semibold">
                  <textarea id="clause-content-${idx}" rows="2" placeholder="Clause description..." class="w-full px-2.5 py-1.5 rounded bg-[#101722] border border-[#202b3a] text-[#a7b3c4] text-xs focus:border-blue-500">${sec.content || ''}</textarea>
                  <input type="text" id="clause-bullets-${idx}" value="${(sec.bullets || []).join(' | ')}" placeholder="Bullet items separated by | (pipe)" class="w-full px-2.5 py-1.5 rounded bg-[#101722] border border-[#202b3a] text-[#718096] text-xs focus:border-blue-500">
                </div>
              `).join('')}
            </div>
          </div>

          <div class="pt-3 border-t border-[#202b3a] flex items-center justify-end space-x-2.5">
            <button type="button" onclick="closeAdminModal()" class="px-4 py-2 bg-[#141c28] hover:bg-[#192332] text-[#a7b3c4] rounded-md font-bold border border-[#202b3a]">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-bold shadow-sm">Save Policy Document</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function addClauseSection(policyKey) {
  syncCurrentModalClauses();
  editingPolicySections.push({
    heading: `${editingPolicySections.length + 1}. New Clause Heading`,
    content: "Detailed description of legal clause...",
    bullets: []
  });
  const policies = getStoredPolicies();
  renderPolicyModalContent(policyKey, policies[policyKey] || DEFAULT_LEGAL_POLICIES[policyKey]);
}

export function removeClauseSection(idx, policyKey) {
  syncCurrentModalClauses();
  editingPolicySections.splice(idx, 1);
  const policies = getStoredPolicies();
  renderPolicyModalContent(policyKey, policies[policyKey] || DEFAULT_LEGAL_POLICIES[policyKey]);
}

function syncCurrentModalClauses() {
  editingPolicySections.forEach((sec, idx) => {
    const headEl = document.getElementById(`clause-heading-${idx}`);
    const contEl = document.getElementById(`clause-content-${idx}`);
    const bullEl = document.getElementById(`clause-bullets-${idx}`);
    if (headEl) sec.heading = headEl.value;
    if (contEl) sec.content = contEl.value;
    if (bullEl) {
      const val = bullEl.value.trim();
      sec.bullets = val ? val.split('|').map(s => s.trim()).filter(Boolean) : [];
    }
  });
}

export function handleSavePolicySubmit(e, policyKey) {
  e.preventDefault();
  syncCurrentModalClauses();

  const title = document.getElementById('edit-pol-title').value.trim();
  const subtitle = document.getElementById('edit-pol-subtitle').value.trim();
  const lastUpdated = document.getElementById('edit-pol-date').value.trim();

  const updatedPolicy = {
    title,
    subtitle,
    lastUpdated,
    sections: editingPolicySections
  };

  updatePolicyDocument(policyKey, updatedPolicy);
  if (window.closeAdminModal) window.closeAdminModal();
  renderPoliciesTab();
  alert(`${title} document saved successfully!`);
}

export function confirmResetPolicies() {
  if (confirm('Are you sure you want to restore all legal policies to factory default?')) {
    saveStoredPolicies(DEFAULT_LEGAL_POLICIES);
    saveBusinessInfo(DEFAULT_BUSINESS_INFO);
    renderPoliciesTab();
    alert('Policies and Business Profile restored to default.');
  }
}
