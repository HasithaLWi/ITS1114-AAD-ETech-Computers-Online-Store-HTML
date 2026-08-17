// ============================================================
//  about.js — Dynamic About Us & Business Profile View Generator
// ============================================================
import { getBusinessInfo, getStoredPolicies } from '../../models/policy-data.js';
import { getBranches } from '../../controller/branch_controller.js';

/**
 * Dynamically renders the About Us page into #about-page
 */
export function renderAboutPage() {
  const container = document.getElementById('about-page');
  if (!container) return;

  const business = getBusinessInfo();
  const branches = getBranches();
  const policies = getStoredPolicies();

  container.innerHTML = `
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl space-y-10 pb-12">

      <!-- ── 1. Hero / Corporate Header ──────────────────────── -->
      <div class="relative overflow-hidden bg-gradient-to-br from-[#101722] via-[#0c111b] to-[#080b12] border border-[#202b3a] rounded-2xl p-6 sm:p-10 shadow-2xl">
        <!-- Ambient Glow -->
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/15 blur-[120px] rounded-full pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div class="relative z-10 space-y-4 max-w-3xl">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-blue-600/15 text-blue-400 border border-blue-500/30">
              Corporate Profile & Engineering Standards
            </span>
            <span class="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              ${business.isoCert || 'ISO 9001 Certified'}
            </span>
          </div>

          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Built for Extreme Performance.<br>
            Engineered for <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Enthusiasts.</span>
          </h1>

          <p class="text-sm sm:text-base text-[#a7b3c4] leading-relaxed">
            ${business.story}
          </p>

          <div class="pt-2 flex flex-wrap items-center gap-3">
            <a href="#shop" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              <span>Explore Our Hardware</span>
            </a>
            <a href="#policies" class="px-5 py-2.5 bg-[#141c28] hover:bg-[#192332] text-[#f4f7fb] font-bold text-xs rounded-lg border border-[#202b3a] transition-all flex items-center space-x-2">
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Review Legal Policies</span>
            </a>
          </div>
        </div>
      </div>

      <!-- ── 2. Live Key Statistics Matrix ────────────────────── -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-[#101722] border border-[#202b3a] rounded-xl p-5 text-center shadow-lg relative group hover:border-blue-500/40 transition-colors">
          <span class="text-3xl font-extrabold font-mono text-white block mb-1">${business.stats?.customersServed || '15,000+'}</span>
          <span class="text-xs text-blue-400 font-semibold uppercase tracking-wider block">Satisfied Gamers & Studios</span>
          <span class="text-[10px] text-[#718096] mt-1 block">Nationwide across Sri Lanka</span>
        </div>

        <div class="bg-[#101722] border border-[#202b3a] rounded-xl p-5 text-center shadow-lg relative group hover:border-cyan-500/40 transition-colors">
          <span class="text-3xl font-extrabold font-mono text-cyan-400 block mb-1">${branches.length} Hubs</span>
          <span class="text-xs text-white font-semibold uppercase tracking-wider block">Regional Warehouses</span>
          <span class="text-[10px] text-[#718096] mt-1 block">Colombo • Galle • Matara • Kandy</span>
        </div>

        <div class="bg-[#101722] border border-[#202b3a] rounded-xl p-5 text-center shadow-lg relative group hover:border-emerald-500/40 transition-colors">
          <span class="text-3xl font-extrabold font-mono text-emerald-400 block mb-1">${business.stats?.onTimeDelivery || '99.8%'}</span>
          <span class="text-xs text-white font-semibold uppercase tracking-wider block">Fulfillment SLA</span>
          <span class="text-[10px] text-[#718096] mt-1 block">Secure Fragile-Care Transport</span>
        </div>

        <div class="bg-[#101722] border border-[#202b3a] rounded-xl p-5 text-center shadow-lg relative group hover:border-amber-500/40 transition-colors">
          <span class="text-3xl font-extrabold font-mono text-amber-400 block mb-1">100%</span>
          <span class="text-xs text-white font-semibold uppercase tracking-wider block">Authentic Hardware</span>
          <span class="text-[10px] text-[#718096] mt-1 block">Direct Factory Warranties</span>
        </div>
      </div>

      <!-- ── 3. Corporate Information & Business Details Table ── -->
      <div class="bg-[#101722] border border-[#202b3a] rounded-xl shadow-xl overflow-hidden">
        <div class="p-5 border-b border-[#202b3a] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 class="text-base font-extrabold text-white flex items-center space-x-2">
              <span>🏛️ Registered Business Profile & Corporate Credentials</span>
            </h3>
            <p class="text-xs text-[#718096] mt-0.5">Official registration identifiers, headquarters, customer support hotlines, and compliance verification.</p>
          </div>
          <span class="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Verified Entity
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <tbody class="divide-y divide-[#202b3a]">
              <tr class="hover:bg-[#141c28]/60 transition-colors">
                <td class="py-3 px-5 font-bold text-[#a7b3c4] w-1/3 bg-[#080b12]/50 uppercase text-[10px] tracking-wider">Trading Name & Entity</td>
                <td class="py-3 px-5 text-white font-semibold">${business.storeName} (${business.tagline})</td>
              </tr>
              <tr class="hover:bg-[#141c28]/60 transition-colors">
                <td class="py-3 px-5 font-bold text-[#a7b3c4] bg-[#080b12]/50 uppercase text-[10px] tracking-wider">Business Registration Number</td>
                <td class="py-3 px-5 font-mono text-cyan-400 font-bold">${business.registrationNo}</td>
              </tr>
              <tr class="hover:bg-[#141c28]/60 transition-colors">
                <td class="py-3 px-5 font-bold text-[#a7b3c4] bg-[#080b12]/50 uppercase text-[10px] tracking-wider">Tax Identification Number (TIN / VAT)</td>
                <td class="py-3 px-5 font-mono text-blue-400 font-bold">${business.taxId}</td>
              </tr>
              <tr class="hover:bg-[#141c28]/60 transition-colors">
                <td class="py-3 px-5 font-bold text-[#a7b3c4] bg-[#080b12]/50 uppercase text-[10px] tracking-wider">Quality Management Certification</td>
                <td class="py-3 px-5 text-emerald-400 font-semibold flex items-center space-x-1.5">
                  <svg class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span>${business.isoCert}</span>
                </td>
              </tr>
              <tr class="hover:bg-[#141c28]/60 transition-colors">
                <td class="py-3 px-5 font-bold text-[#a7b3c4] bg-[#080b12]/50 uppercase text-[10px] tracking-wider">National Headquarters</td>
                <td class="py-3 px-5 text-[#f4f7fb]">${business.headquarters}</td>
              </tr>
              <tr class="hover:bg-[#141c28]/60 transition-colors">
                <td class="py-3 px-5 font-bold text-[#a7b3c4] bg-[#080b12]/50 uppercase text-[10px] tracking-wider">Customer Support & Technical Hotline</td>
                <td class="py-3 px-5 text-white font-mono font-bold">${business.hotline}</td>
              </tr>
              <tr class="hover:bg-[#141c28]/60 transition-colors">
                <td class="py-3 px-5 font-bold text-[#a7b3c4] bg-[#080b12]/50 uppercase text-[10px] tracking-wider">Official Inquiries & Support Email</td>
                <td class="py-3 px-5 text-blue-400 font-mono"><a href="mailto:${business.supportEmail}" class="hover:underline">${business.supportEmail}</a></td>
              </tr>
              <tr class="hover:bg-[#141c28]/60 transition-colors">
                <td class="py-3 px-5 font-bold text-[#a7b3c4] bg-[#080b12]/50 uppercase text-[10px] tracking-wider">Store Operating & Dispatch Hours</td>
                <td class="py-3 px-5 text-[#a7b3c4]">${business.workingHours}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── 4. Core Mission & Engineering Values ────────────── -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-[#101722] border border-[#202b3a] rounded-xl p-6 space-y-3 shadow-lg">
          <div class="w-10 h-10 rounded-lg bg-blue-600/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
          </div>
          <h3 class="text-sm font-bold text-white">Direct OEM Importer</h3>
          <p class="text-xs text-[#a7b3c4] leading-relaxed">
            Every GPU, CPU, motherboard, and chassis is sourced directly from certified global distributors with verifiable serial numbers and authentic manufacturer warranty tags.
          </p>
        </div>

        <div class="bg-[#101722] border border-[#202b3a] rounded-xl p-6 space-y-3 shadow-lg">
          <div class="w-10 h-10 rounded-lg bg-cyan-600/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <h3 class="text-sm font-bold text-white">24-Hour Stress Testing</h3>
          <p class="text-xs text-[#a7b3c4] leading-relaxed">
            All custom workstations and gaming rigs undergo comprehensive thermal benchmarking and memory stress testing in our laboratory before customer handover.
          </p>
        </div>

        <div class="bg-[#101722] border border-[#202b3a] rounded-xl p-6 space-y-3 shadow-lg">
          <div class="w-10 h-10 rounded-lg bg-emerald-600/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <h3 class="text-sm font-bold text-white">Regional Warehouse Network</h3>
          <p class="text-xs text-[#a7b3c4] leading-relaxed">
            With 4 warehouse hubs spanning the Western, Southern, and Central provinces, we calculate optimal dispatch routes to minimize delivery transit times.
          </p>
        </div>
      </div>

      <!-- ── 5. Regional Warehouse Locations ─────────────────── -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-white">Regional Warehouses & Collection Points</h2>
            <p class="text-xs text-[#718096]">Visit our regional tech hubs for hardware consultations and order collections.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${branches.map(b => `
            <div class="bg-[#101722] border border-[#202b3a] rounded-xl p-4 space-y-2.5 shadow-lg relative">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  ${b.id}
                </span>
                <span class="text-[10px] font-semibold text-emerald-400 flex items-center space-x-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  <span>Active Hub</span>
                </span>
              </div>
              <h4 class="text-sm font-bold text-white">${b.name}</h4>
              <p class="text-xs text-[#718096] line-clamp-2">${b.address}</p>
              <div class="pt-2 border-t border-[#202b3a] text-[11px] text-[#a7b3c4] space-y-1">
                <p>📞 <span class="font-mono">${b.phone}</span></p>
                <p>✉️ <span class="font-mono">${b.email}</span></p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ── 6. Legal, Compliance & Policy Hub ────────────────── -->
      <div class="bg-[#101722] border border-[#202b3a] rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#202b3a] pb-4">
          <div>
            <h2 class="text-xl font-extrabold text-white flex items-center space-x-2">
              <span>⚖️ Legal Policies & Customer Protection Framework</span>
            </h2>
            <p class="text-xs text-[#718096] mt-1">Our binding commitments regarding data privacy, store terms of service, and 2-year warranty protections.</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <a href="#privacy" class="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#141c28] text-blue-400 hover:text-blue-300 hover:bg-[#192332] border border-[#202b3a] transition-all">
              Privacy Policy
            </a>
            <a href="#terms" class="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#141c28] text-indigo-400 hover:text-indigo-300 hover:bg-[#192332] border border-[#202b3a] transition-all">
              Terms of Service
            </a>
            <a href="#warranty" class="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#141c28] text-emerald-400 hover:text-emerald-300 hover:bg-[#192332] border border-[#202b3a] transition-all">
              Guarantee & Warranty
            </a>
          </div>
        </div>

        <!-- 3 Policy Summary Grid Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <!-- Privacy Policy Card -->
          <div class="bg-[#080b12] border border-[#202b3a] rounded-lg p-5 space-y-3 flex flex-col justify-between hover:border-blue-500/40 transition-colors">
            <div class="space-y-2">
              <div class="flex items-center space-x-2 text-blue-400">
                ${policies.privacy?.icon || ''}
                <h4 class="text-sm font-bold text-white">${policies.privacy?.title || 'Privacy Policy'}</h4>
              </div>
              <p class="text-xs text-[#718096] leading-relaxed">
                ${policies.privacy?.subtitle || 'How we protect and handle your personal data.'}
              </p>
              <div class="text-[11px] text-[#a7b3c4] space-y-1 pt-1">
                <p>• 256-bit SSL encrypted transactions</p>
                <p>• Zero third-party data broker sharing</p>
                <p>• Full customer data deletion rights</p>
              </div>
            </div>
            <a href="#privacy" class="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 pt-2">
              <span>Read Full Privacy Policy</span>
              <span>→</span>
            </a>
          </div>

          <!-- Terms of Service Card -->
          <div class="bg-[#080b12] border border-[#202b3a] rounded-lg p-5 space-y-3 flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
            <div class="space-y-2">
              <div class="flex items-center space-x-2 text-indigo-400">
                ${policies.terms?.icon || ''}
                <h4 class="text-sm font-bold text-white">${policies.terms?.title || 'Terms of Service'}</h4>
              </div>
              <p class="text-xs text-[#718096] leading-relaxed">
                ${policies.terms?.subtitle || 'Store purchasing terms and agreements.'}
              </p>
              <div class="text-[11px] text-[#a7b3c4] space-y-1 pt-1">
                <p>• Transparent pricing & tax clarity</p>
                <p>• Verified secure member accounts</p>
                <p>• Standard 1-2 day order processing</p>
              </div>
            </div>
            <a href="#terms" class="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 pt-2">
              <span>Read Full Terms of Service</span>
              <span>→</span>
            </a>
          </div>

          <!-- Guarantee & Warranty Card -->
          <div class="bg-[#080b12] border border-[#202b3a] rounded-lg p-5 space-y-3 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <div class="space-y-2">
              <div class="flex items-center space-x-2 text-emerald-400">
                ${policies.warranty?.icon || ''}
                <h4 class="text-sm font-bold text-white">${policies.warranty?.title || 'Guarantee & Warranty'}</h4>
              </div>
              <p class="text-xs text-[#718096] leading-relaxed">
                ${policies.warranty?.subtitle || 'Warranty protection and replacement guarantees.'}
              </p>
              <div class="text-[11px] text-[#a7b3c4] space-y-1 pt-1">
                <p>• 30-Day Money-Back Guarantee</p>
                <p>• 2-Year Full Hardware Coverage</p>
                <p>• 3-5 Day Rapid RMA Replacement</p>
              </div>
            </div>
            <a href="#warranty" class="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 pt-2">
              <span>Read Full Warranty Policy</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  `;
}
