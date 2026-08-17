// ============================================================
//  policy-data.js — Store Business Profile & Legal Policies Model
// ============================================================

const POLICIES_STORAGE_KEY = 'etech_policies';
const BUSINESS_INFO_STORAGE_KEY = 'etech_business_info';

export const DEFAULT_BUSINESS_INFO = {
  storeName: "ETech Computers Inc.",
  tagline: "Next-Gen Tech Store & High-Performance Hardware Importer",
  foundedYear: "2021",
  registrationNo: "PV-109842 / Western Province",
  taxId: "VAT-984201948",
  isoCert: "ISO 9001:2015 Quality Certified Hardware Assembly",
  supportEmail: "support@etechcomputers.com",
  hotline: "+94 (11) 234-5678 / 077 123 4567",
  headquarters: "No. 42, Galle Road, Colombo 03, Sri Lanka",
  workingHours: "Monday - Saturday: 8:30 AM - 7:30 PM (Sunday: 10:00 AM - 4:00 PM)",
  stats: {
    customersServed: "15,000+",
    regionalHubs: "4 Regional Hubs (Colombo, Galle, Matara, Kandy)",
    onTimeDelivery: "99.8%",
    avgRating: "4.9 / 5.0"
  },
  mission: "Empower Sri Lankan gamers, creators, software engineers, and enterprise studios with the world's most powerful, 100% genuine hardware at transparent pricing with relentless post-purchase warranty support.",
  story: "Founded by passionate hardware enthusiasts, ETech Computers started as a specialized custom liquid cooling lab. Today, we stand as a premier importer and nationwide distribution network across 4 regional warehouse hubs."
};

export const DEFAULT_LEGAL_POLICIES = {
  privacy: {
    id: "privacy",
    title: "Privacy Policy",
    subtitle: "How we collect, protect, and handle your personal data at ETech Computers",
    icon: `<svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
    lastUpdated: "August 1, 2026",
    sections: [
      {
        heading: "1. Information We Collect",
        content: "At ETech Computers, we prioritize customer privacy. When you browse or place an order from our hardware store, we collect minimal necessary details including:",
        bullets: [
          "Account Registration Details: Full name, username, email address, phone number, and password hashes.",
          "Order & Delivery Information: Billing and shipping addresses required for fulfillment of computer rigs and peripherals.",
          "Payment Processing: Transaction data is handled securely via encrypted gateways. We do not store raw credit card numbers or CVV codes.",
          "Technical Diagnostics: Anonymized browser information, IP addresses, and device signatures used strictly for site security."
        ]
      },
      {
        heading: "2. How We Use Your Data",
        content: "We use the information gathered solely to provide a seamless gaming hardware shopping experience:",
        bullets: [
          "Fulfilling and tracking hardware orders, custom PC builds, and component shipments.",
          "Sending real-time order status updates, tracking numbers, and warranty verification documents.",
          "Providing responsive customer support and technical hardware troubleshooting.",
          "Preventing fraudulent transactions and protecting account security."
        ]
      },
      {
        heading: "3. Data Protection & Security Controls",
        content: "We implement industry-standard AES-256 encryption and TLS 1.3 protocol standards across all website data transfers. Your user account data is protected behind secure database firewalls with strict role-based access controls."
      },
      {
        heading: "4. Third-Party Sharing & Cookies",
        content: "ETech Computers does NOT sell, rent, or trade customer personal data to third-party marketing brokers. We only share essential logistics data with verified courier partners strictly to deliver your hardware packages."
      },
      {
        heading: "5. Your Data Rights & Choices",
        content: "You retain full control over your personal information. You can access, update, or request complete deletion of your ETech account and saved order history at any time by contacting support@etechcomputers.com."
      }
    ]
  },

  terms: {
    id: "terms",
    title: "Terms of Service",
    subtitle: "Store terms, conditions, and user agreements for purchasing from ETech Computers",
    icon: `<svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
    lastUpdated: "August 1, 2026",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        content: "By accessing or purchasing hardware from ETech Computers, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our online platform."
      },
      {
        heading: "2. Pricing & Product Specifications",
        content: "We make every effort to display accurate product details, stock availability, and hardware specifications:",
        bullets: [
          "All listed prices are in Sri Lankan Rupees (Rs.) and subject to applicable taxes and shipping fees.",
          "Prices and stock availability for high-demand items (e.g., graphics cards, CPUs, mini-LED monitors) may update without prior notice.",
          "In the event of an obvious typographical error in pricing, ETech Computers reserves the right to cancel unfulfilled orders with a full refund."
        ]
      },
      {
        heading: "3. User Accounts & Security",
        content: "When creating an ETech customer account, you are responsible for maintaining the confidentiality of your username and password credentials. You agree to accept responsibility for all order activities performed under your account."
      },
      {
        heading: "4. Shipping & Delivery Guidelines",
        content: "Orders are processed within 1 to 2 business days. Pre-assembled custom gaming rigs require an additional 2-3 days for rigorous burn-in testing and quality control prior to dispatch."
      },
      {
        heading: "5. Intellectual Property",
        content: "All trademarks, product photos, graphics, brand logos, and code on this site are the intellectual property of ETech Computers Inc. and respective hardware component manufacturer partners."
      }
    ]
  },

  warranty: {
    id: "warranty",
    title: "Guarantee & Warranty",
    subtitle: "Complete hardware warranty protection, returns policy, and replacement guarantees",
    icon: `<svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
    lastUpdated: "August 1, 2026",
    sections: [
      {
        heading: "1. 30-Day Money-Back Guarantee",
        content: "We stand behind the quality of every hardware item we ship. If you are not 100% satisfied with your purchase, you may return unopened or lightly tested items within 30 calendar days for a full refund or exchange."
      },
      {
        heading: "2. ETech Hardware Warranty Coverage",
        content: "All hardware components and pre-built rigs purchased through ETech Computers come with comprehensive warranty coverage:",
        bullets: [
          "Pre-Built Rigs & Laptops: 2-Year Full Hardware & Labor Warranty.",
          "Individual PC Components (GPUs, CPUs, RAM): Standard 3-Year Manufacturer Direct Warranty backed by ETech support.",
          "Peripherals & Accessories: 1-Year Advance Replacement Warranty."
        ]
      },
      {
        heading: "3. What is Covered under Warranty?",
        content: "Our warranty covers manufacturing defects, hardware component failures, factory power supply faults, defective OLED panels, and dead-on-arrival (DOA) units under normal operational use."
      },
      {
        heading: "4. What is Excluded from Coverage?",
        content: "The warranty does NOT cover damage caused by liquid spills, accidental drops, unauthorized disassembly/modification, extreme overclocking overvoltage damage, or physical abuse."
      },
      {
        heading: "5. How to File a Guarantee or Warranty Claim",
        content: "To initiate an RMA (Return Merchandise Authorization) claim:",
        bullets: [
          "Step 1: Access your Account section or email support@etechcomputers.com with your Order ID.",
          "Step 2: Our tech support team will troubleshoot or issue a prepaid shipping label.",
          "Step 3: Once received at our service hub, we repair or dispatch a brand-new replacement unit within 3-5 business days."
        ]
      }
    ]
  }
};

/**
 * Retrieve business info from localStorage (or fallback to defaults)
 */
export function getBusinessInfo() {
  const data = localStorage.getItem(BUSINESS_INFO_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(BUSINESS_INFO_STORAGE_KEY, JSON.stringify(DEFAULT_BUSINESS_INFO));
    return DEFAULT_BUSINESS_INFO;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_BUSINESS_INFO;
  }
}

/**
 * Save business info to localStorage
 */
export function saveBusinessInfo(info) {
  localStorage.setItem(BUSINESS_INFO_STORAGE_KEY, JSON.stringify(info));
  return { success: true, message: 'Business profile updated successfully!' };
}

/**
 * Retrieve all legal policies from localStorage (or fallback to defaults)
 */
export function getStoredPolicies() {
  const data = localStorage.getItem(POLICIES_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(POLICIES_STORAGE_KEY, JSON.stringify(DEFAULT_LEGAL_POLICIES));
    return DEFAULT_LEGAL_POLICIES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_LEGAL_POLICIES;
  }
}

/**
 * Save all policies to localStorage
 */
export function saveStoredPolicies(policies) {
  localStorage.setItem(POLICIES_STORAGE_KEY, JSON.stringify(policies));
}

/**
 * Get specific policy by key ('privacy' | 'terms' | 'warranty')
 */
export function getPolicyData(key) {
  const policies = getStoredPolicies();
  return policies[key] || policies.privacy;
}

/**
 * Update single policy document
 */
export function updatePolicyDocument(key, policyData) {
  const policies = getStoredPolicies();
  policies[key] = {
    ...policies[key],
    ...policyData,
    id: key
  };
  saveStoredPolicies(policies);
  return { success: true, message: `${policyData.title || key} updated successfully!` };
}

export const legalPolicies = DEFAULT_LEGAL_POLICIES;
