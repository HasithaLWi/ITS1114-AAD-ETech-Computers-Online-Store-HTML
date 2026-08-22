// ============================================================
//  src/data/orders.js — Central Orders & Order History Dataset
// ============================================================

export const DEFAULT_ORDERS = [
  {
    orderId: "ETC-ORD-9021",
    userId: "USR-100003",
    date: "Aug 18, 2026, 02:45 PM",
    customerName: "John Doe",
    email: "customer@etech.com",
    phone: "+94 77 123 4567",
    city: "Colombo",
    address: "74 Marine Drive, Colombo 03",
    fulfillmentBranch: "Colombo Main Hub",
    fulfillmentBranchId: "BR-COL",
    distanceKm: 5,
    items: [
      {
        id: 1,
        name: "ASUS GeForce RTX 4070 Super 12GB GDDR6X",
        price: 244999,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80"
      }
    ],
    subtotal: 244999,
    tax: 0,
    shipping: 500,
    totalAmount: 245499,
    paymentMethod: "Credit / Debit Card",
    status: "Delivered"
  },
  {
    orderId: "ETC-ORD-9022",
    userId: "USR-100003",
    date: "Aug 20, 2026, 11:15 AM",
    customerName: "John Doe",
    email: "customer@etech.com",
    phone: "+94 77 123 4567",
    city: "Galle",
    address: "12 LightHouse Street, Galle",
    fulfillmentBranch: "Galle Tech Center",
    fulfillmentBranchId: "BR-GAL",
    distanceKm: 12,
    items: [
      {
        id: 6,
        name: "Immerse Pro 7.1 Wireless Gaming Headset",
        price: 34999,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: 10,
        name: "UltraFlex Ergonomic Laptop Stand",
        price: 12999,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80"
      }
    ],
    subtotal: 47998,
    tax: 0,
    shipping: 600,
    totalAmount: 48598,
    paymentMethod: "Cash on Delivery",
    status: "Processing"
  }
];
