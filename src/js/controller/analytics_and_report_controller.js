import { getAllOrders } from './order_management_controller.js';
import { getBranches } from './branch_controller.js';

/**
 * ============================================================
 * TAB 6: FINANCIAL ANALYTICS & REPORTS (ADMIN ONLY)
 * ============================================================
 */
export function renderAnalyticsTab() {
  const list = document.getElementById('analytics-branches-list');
  if (!list) return;

  const orders = getAllOrders();
  const branches = getBranches();

  // Branch Revenue Calculations
  const branchSales = branches.map(b => {
    const branchOrders = orders.filter(o => o.fulfillmentBranchId === b.id || o.fulfillmentBranch === b.name);
    const revenue = branchOrders.reduce((sum, o) => sum + (parseFloat((o.totalAmount || "0").toString().replace(/[^0-9.]/g, '')) || 0), 0);
    return { name: b.name, city: b.city, count: branchOrders.length, revenue };
  });

  const maxRevenue = Math.max(...branchSales.map(bs => bs.revenue), 1000);

  list.innerHTML = branchSales.map(bs => {
    const percentage = Math.round((bs.revenue / maxRevenue) * 100);
    return `
      <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold text-white">${bs.name} (${bs.city})</span>
          <span class="font-mono text-blue-400 font-extrabold">Rs. ${bs.revenue.toLocaleString()} (${bs.count} orders)</span>
        </div>
        <div class="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
          <div class="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }).join('');
}