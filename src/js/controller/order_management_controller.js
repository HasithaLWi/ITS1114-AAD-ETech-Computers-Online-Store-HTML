import { getCurrentUser } from './login_controller.js';

const ORDERS_STORAGE_KEY = 'etech_orders';

/**
 * Get all orders from localStorage
 * @returns {Array}
 */
export function getAllOrders() {
  const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

/**
 * Save order details to order database
 */
export function saveOrder(orderData) {
  const orders = getAllOrders();
  const currentUser = getCurrentUser();

  const sanitizedOrder = {
    orderId: orderData.orderId,
    userId: orderData.userId || (currentUser ? currentUser.id : null),
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    customerName: orderData.customerName,
    email: (orderData.email || '').trim().toLowerCase(),
    phone: orderData.phone || '',
    city: orderData.city || 'Colombo',
    address: orderData.address || '',
    fulfillmentBranch: orderData.fulfillmentBranch || 'Colombo Main Hub',
    fulfillmentBranchId: orderData.fulfillmentBranchId || 'BR-COL',
    distanceKm: orderData.distanceKm || 5,
    items: orderData.items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    })),
    subtotal: orderData.subtotal,
    tax: orderData.tax,
    shipping: orderData.shipping,
    totalAmount: orderData.totalAmount,
    paymentMethod: orderData.paymentMethod === 'card' ? 'Credit / Debit Card' : 'Cash on Delivery',
    status: 'Pending'
  };

  orders.unshift(sanitizedOrder);
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

  return sanitizedOrder;
}

/**
 * Update order status (Pending -> Processing -> Shipped -> Delivered -> Cancelled)
 */
export function updateOrderStatus(orderId, newStatus) {
  const orders = getAllOrders();
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return { success: false, message: 'Order not found.' };

  order.status = newStatus;
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  return { success: true, message: `Order #${orderId} status updated to ${newStatus}` };
}

/**
 * Get order history for a specific user object or email
 * @param {string|object} userOrEmail 
 * @returns {Array}
 */
export function getUserOrders(userOrEmail) {
  if (!userOrEmail) return [];
  const allOrders = getAllOrders();

  if (typeof userOrEmail === 'object') {
    const email = (userOrEmail.email || '').trim().toLowerCase();
    const userId = userOrEmail.id;
    return allOrders.filter(o => {
      const matchEmail = o.email && o.email.trim().toLowerCase() === email;
      const matchId = userId && o.userId === userId;
      return matchEmail || matchId;
    });
  }

  const cleanEmail = userOrEmail.trim().toLowerCase();
  return allOrders.filter(o => o.email && o.email.trim().toLowerCase() === cleanEmail);
}

/**
 * ============================================================
 * TAB 3: ORDER MANAGEMENT (STAFF & ADMIN)
 * ============================================================
 */
export function renderOrdersTab() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  const orders = getAllOrders();

  tbody.innerHTML = orders.map(o => `
    <tr class="hover:bg-[#141c28] transition-colors">
      <td class="py-3 px-3.5">
        <span class="font-mono font-extrabold text-blue-400 text-xs">${o.orderId}</span>
        <p class="text-[10px] text-[#718096]">${o.date}</p>
      </td>
      <td class="py-3 px-3.5">
        <p class="font-bold text-white text-xs">${o.customerName}</p>
        <p class="text-[10px] text-[#718096]">${o.email}</p>
      </td>
      <td class="py-3 px-3.5">
        <p class="font-bold text-[#f4f7fb] text-xs">${o.fulfillmentBranch || 'Colombo Hub'}</p>
        <p class="text-[10px] text-[#718096]">Dest: <strong class="text-white">${o.city}</strong> (${o.distanceKm || 5} km)</p>
      </td>
      <td class="py-3 px-3.5 font-bold text-white font-mono text-xs">
        Rs. ${parseFloat((o.totalAmount || 0).toString().replace(/[^0-9.]/g, '')).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td class="py-3 px-3.5">
        <span class="px-2 py-0.5 rounded text-[9px] font-bold ${getStatusStyle(o.status)}">
          ${o.status || 'Pending'}
        </span>
      </td>
      <td class="py-3 px-3.5 text-right">
        <div class="flex items-center justify-end space-x-2">
          <select onchange="changeOrderStatus('${o.orderId}', this.value)" class="bg-[#080b12] border border-[#202b3a] text-white rounded px-2 py-1 text-xs focus:border-blue-500 cursor-pointer">
            <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
            <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
            <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="6" class="py-8 text-center text-xs text-[#718096]">No orders recorded yet.</td></tr>';
}

export function changeOrderStatus(orderId, newStatus) {
  const res = updateOrderStatus(orderId, newStatus);
  if (res.success) {
    if (document.getElementById('recent-orders-feed')) {
      if (window.initAdminDashboard) window.initAdminDashboard();
    }
    if (document.getElementById('orders-tbody')) {
      renderOrdersTab();
    }
  }
}

// ── Status Pill Styles ──
export function getStatusStyle(status) {
  switch (status) {
    case 'Processing': return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
    case 'Shipped': return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30';
    case 'Delivered': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    case 'Cancelled': return 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
    default: return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
  }
}