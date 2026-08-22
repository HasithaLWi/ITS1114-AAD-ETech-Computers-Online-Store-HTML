// ============================================================
//  src/data/policies.js — Central Business Profile & Legal Policies
// ============================================================

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
        heading: "5. Limitation of Liability",
        content: "ETech Computers shall not be liable for any indirect, incidental, or consequential damages resulting from hardware misuse, unauthorized firmware flashing, or electrical surges beyond standard operating parameters."
      }
    ]
  },

  returns: {
    id: "returns",
    title: "Return & Refund Policy",
    subtitle: "7-day return guarantee, replacement procedures, and hassle-free refunds",
    icon: `<svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H4m0 0l5 5m-5-5l5-5"/></svg>`,
    lastUpdated: "August 1, 2026",
    sections: [
      {
        heading: "1. 7-Day Return Eligibility",
        content: "We offer a 7-day hassle-free return window from the date of package delivery. To be eligible for a return:",
        bullets: [
          "The hardware component or peripheral must be unused, sealed in its original anti-static packaging with all manufacturer accessories, manuals, and warranty barcodes intact.",
          "Proof of purchase (ETech Order ID, digital invoice, or registered email) must be presented.",
          "Open-box clearance items and digital software licenses are non-returnable unless defective on arrival."
        ]
      },
      {
        heading: "2. Defective On Arrival (DOA) Claims",
        content: "If your hardware arrives defective or cosmetically damaged in transit, report the issue within 48 hours of delivery. We will arrange express pickup and issue an immediate one-to-one replacement after initial technical inspection."
      },
      {
        heading: "3. Refund Processing",
        content: "Once returned hardware is inspected at our Colombo Technical Center (typically 2-3 business days), refunds are processed via the original payment method:",
        bullets: [
          "Credit/Debit Card Payments: Refund reflects within 3-5 business banking days.",
          "Bank Transfer / COD Orders: Direct transfer to customer's nominated Sri Lankan bank account within 48 hours."
        ]
      },
      {
        heading: "4. Restocking Fees",
        content: "Returns due to change-of-mind with unsealed packaging may be subject to a 10% restocking fee to cover anti-static recertification and testing costs."
      }
    ]
  },

  warranty: {
    id: "warranty",
    title: "Warranty Protection Policy",
    subtitle: "Official manufacturer warranty coverage, RMA support, and repair terms",
    icon: `<svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
    lastUpdated: "August 1, 2026",
    sections: [
      {
        heading: "1. 100% Genuine Authorized Warranty",
        content: "Every product cataloged at ETech Computers is imported through authorized distribution channels and carries genuine manufacturer warranty coverage:",
        bullets: [
          "Graphics Cards (ASUS, MSI, Gigabyte): 3-Year Official Replacement / RMA Warranty.",
          "Processors (Intel, AMD): 3-Year Boxed Processor Warranty.",
          "Solid State Drives & Storage (Samsung, Corsair, Kingston): 5-Year Limited Warranty.",
          "Memory RAM Kits: Lifetime Limited Manufacturer Warranty.",
          "Power Supply Units (80+ Gold/Platinum): 5 to 10-Year Comprehensive Factory Warranty.",
          "Laptops & Notebooks: 2-Year Comprehensive Hardware Warranty with Local Service Support."
        ]
      },
      {
        heading: "2. RMA Claim Process & Turnaround",
        content: "To initiate an RMA (Return Merchandise Authorization) claim, bring the defective component to any of our 4 branch hubs (Colombo, Galle, Matara, Kandy) along with the warranty serial number. Standard diagnostic turnaround is 3 to 7 business days."
      },
      {
        heading: "3. Warranty Exclusions",
        content: "Warranty coverage does NOT apply to:",
        bullets: [
          "Physical component damage, burnt IC traces, liquid spills, or bent CPU socket pins caused by incorrect installation.",
          "Modifications, unauthorized soldering, or custom BIOS flashing outside manufacturer guidelines.",
          "Damage caused by lightning strikes, unstable electrical voltage, or ungrounded wall sockets."
        ]
      }
    ]
  }
};

export const legalPolicies = DEFAULT_LEGAL_POLICIES;
