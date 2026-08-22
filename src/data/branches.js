// ============================================================
//  src/data/branches.js — Central Branch Hubs & Distance Matrix
// ============================================================

export const DEFAULT_BRANCHES = [
  {
    id: "BR-COL",
    name: "Colombo Main Hub",
    city: "Colombo",
    address: "123 Galle Road, Colombo 03",
    phone: "+94 11 234 5678",
    email: "colombo@etech.com",
    coordinates: { lat: 6.9271, lng: 79.8612 },
    baseShippingFee: 350,
    perKmFee: 30,
    status: "Active"
  },
  {
    id: "BR-GAL",
    name: "Galle Tech Center",
    city: "Galle",
    address: "45 Main Street, Galle Fort",
    phone: "+94 91 345 6789",
    email: "galle@etech.com",
    coordinates: { lat: 6.0535, lng: 80.2210 },
    baseShippingFee: 300,
    perKmFee: 25,
    status: "Active"
  },
  {
    id: "BR-MAT",
    name: "Matara Branch",
    city: "Matara",
    address: "88 Anagarika Dharmapala Mawatha, Matara",
    phone: "+94 41 456 7890",
    email: "matara@etech.com",
    coordinates: { lat: 5.9496, lng: 80.5469 },
    baseShippingFee: 300,
    perKmFee: 25,
    status: "Active"
  },
  {
    id: "BR-KND",
    name: "Kandy Express Hub",
    city: "Kandy",
    address: "12 Dalada Veediya, Kandy",
    phone: "+94 81 567 8901",
    email: "kandy@etech.com",
    coordinates: { lat: 7.2906, lng: 80.6337 },
    baseShippingFee: 400,
    perKmFee: 35,
    status: "Active"
  }
];

export const CITY_DISTANCES = {
  "Colombo": { "Colombo": 5, "Galle": 125, "Matara": 160, "Kandy": 115, "Negombo": 38, "Jaffna": 395, "Kurunegala": 94, "Ratnapura": 101 },
  "Galle": { "Colombo": 125, "Galle": 5, "Matara": 35, "Kandy": 220, "Negombo": 160, "Jaffna": 510, "Kurunegala": 210, "Ratnapura": 130 },
  "Matara": { "Colombo": 160, "Galle": 35, "Matara": 5, "Kandy": 250, "Negombo": 195, "Jaffna": 540, "Kurunegala": 240, "Ratnapura": 150 },
  "Kandy": { "Colombo": 115, "Galle": 220, "Matara": 250, "Kandy": 5, "Negombo": 105, "Jaffna": 310, "Kurunegala": 42, "Ratnapura": 125 }
};
