// ============================================================
//  src/data/products.js — Central Hardware Products Dataset
// ============================================================

export const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "ASUS GeForce RTX 4070 Super 12GB GDDR6X",
    brand: "ASUS",
    category: "components",
    price: 259999,
    originalPrice: 289999,
    rating: 4.8,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80"
    ],
    description: "12GB GDDR6X, DLSS 3.5 AI Frame Generation, 3rd Gen Ray Tracing Cores & Axial-tech Fan Thermal System.",
    fullDescription: "Built for insane 1440p and 4K gaming performance. The ASUS GeForce RTX 4070 Super 12GB GDDR6X features military-grade capacitors, dual ball fan bearings, and auto-extreme automated manufacturing for rock-solid stability.",
    inStock: true,
    badge: "Best Seller",
    sku: "ETC-GPU-4070S",
    warranty: "3-Year Official Manufacturer Warranty",
    specs: {
      "CUDA Cores": "7168 CUDA Cores",
      "VRAM": "12GB GDDR6X (192-bit)",
      "Boost Clock": "2505 MHz (OC Mode: 2535 MHz)",
      "Power Connectors": "1x 16-pin (12VHPWR)",
      "Recommended PSU": "750W Gold Certified"
    },
    features: [
      "NVIDIA DLSS 3.5 & Reflex Low Latency Technology",
      "Auto-Extreme Precision Automated Manufacturing Process",
      "Dual Ball Fan Bearings lasting up to 2x longer",
      "Protective Backplate with Wide Vented Air Flow Design"
    ]
  },
  {
    id: 2,
    name: "Intel Core i7-14700K",
    brand: "Intel",
    category: "components",
    price: 179999,
    originalPrice: 199999,
    rating: 4.7,
    reviews: 98,
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80"
    ],
    description: "20 Cores (8 P-cores + 12 E-cores), 28 Threads, up to 5.6 GHz Max Turbo Frequency, PCIe 5.0 & DDR5 Support.",
    fullDescription: "Power through intensive gaming and heavy creator workloads with Intel Core i7-14700K. Featuring 20 cores, 28 threads, 33MB Intel Smart Cache, and support for LGA1700 motherboards.",
    inStock: true,
    badge: "Best Seller",
    sku: "ETC-CPU-14700K",
    warranty: "3-Year Official Intel Warranty",
    specs: {
      "Cores / Threads": "20 Cores (8P + 12E) / 28 Threads",
      "Max Frequency": "5.6 GHz Intel Turbo Boost Max 3.0",
      "Cache": "33MB Intel Smart Cache",
      "Socket": "LGA1700 (Intel 600 & 700 Series Chipsets)"
    },
    features: [
      "Intel Application Optimization (APO) for enhanced gaming FPS",
      "PCIe 5.0 & DDR5 5600MHz Memory Support",
      "Unlocked multiplier for extreme enthusiast overclocking"
    ]
  },
  {
    id: 3,
    name: "Corsair Vengeance 16GB (2x8GB) DDR5 6000MHz",
    brand: "Corsair",
    category: "components",
    price: 28999,
    originalPrice: 34999,
    rating: 4.9,
    reviews: 203,
    image: "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80"
    ],
    description: "16GB (2x8GB) DDR5-6000MHz, Intel XMP 3.0 compatible, solid aluminum heat spreader for low operating temperatures.",
    fullDescription: "CORSAIR VENGEANCE DDR5 delivers higher frequencies and greater capacities of DDR5 technology in a high-quality, compact module that suits your high-performance system build.",
    inStock: true,
    badge: "Best Seller",
    sku: "ETC-RAM-CORSDDR5",
    warranty: "Lifetime Limited Warranty",
    specs: {
      "Capacity": "16GB (2 x 8GB Modules)",
      "Speed": "DDR5-6000MHz",
      "Tested Latency": "CL36-36-36-76",
      "Voltage": "1.35V"
    },
    features: [
      "Onboard voltage regulation for easier overclocking",
      "Custom Intel XMP 3.0 profiles",
      "Solid aluminum heatspreader"
    ]
  },
  {
    id: 4,
    name: "Samsung 990 PRO 1TB NVMe SSD",
    brand: "Samsung",
    category: "components",
    price: 42999,
    originalPrice: 48999,
    rating: 4.8,
    reviews: 178,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80"
    ],
    description: "PCIe 4.0 NVMe M.2 SSD, up to 7450 MB/s Sequential Read and 6900 MB/s Sequential Write speeds.",
    fullDescription: "Reach max performance of PCIe 4.0. Experience longer-lasting, opponent-blasting speed. The in-house controller's smart heat control delivers supreme power efficiency while maintaining ferocious speed and performance.",
    inStock: true,
    badge: "Best Seller",
    sku: "ETC-SSD-990PRO1T",
    warranty: "5-Year Limited Warranty",
    specs: {
      "Capacity": "1TB M.2 2280 NVMe SSD",
      "Interface": "PCIe Gen 4.0 x4, NVMe 2.0",
      "Seq Read": "Up to 7,450 MB/s",
      "Seq Write": "Up to 6,900 MB/s"
    },
    features: [
      "Samsung Pascal in-house controller",
      "Nickel-coated controller and heat spreader label",
      "Samsung Magician Software management support"
    ]
  },
  {
    id: 5,
    name: "Apple MacBook Pro 14 M3",
    brand: "Apple",
    category: "laptops",
    price: 349999,
    originalPrice: 389999,
    rating: 4.8,
    reviews: 85,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80"
    ],
    description: "Lightweight CNC aluminum chassis, 16GB Unified RAM, 1TB SSD, 14.2\" Liquid Retina display with 18-hour battery.",
    fullDescription: "The Apple MacBook Pro 14 M3 delivers desktop-class creative power in an impossibly thin 1.3kg aluminum chassis. Optimized for video editing, software development, and 3D modeling, it offers up to 18 hours of all-day battery life with a radiant Liquid Retina XDR display.",
    inStock: true,
    badge: "New Arrival",
    sku: "ETC-LAP-MACM3",
    warranty: "2-Year Hardware Warranty with Global Support",
    specs: {
      "Processor": "Next-Gen 12-Core M3 Architecture (18-Core GPU)",
      "RAM": "16GB High-Speed Unified Memory",
      "Storage": "1TB Superfast PCIe NVMe SSD",
      "Display": "14.2\" Liquid Retina (3024x1964) 120Hz ProMotion",
      "Battery": "18-Hour Battery Life | MagSafe Fast Charging",
      "Weight": "1.38 kg Ultra-Portable Form Factor"
    },
    features: [
      "ProMotion 120Hz adaptive refresh rate for butter-smooth scrolling",
      "Six-speaker sound system with force-cancelling woofers",
      "Studio-quality 1080p FaceTime HD camera with beamforming mics",
      "Thunderbolt 4 ports, HDMI, SDXC card reader & 3.5mm jack"
    ]
  },
  {
    id: 6,
    name: "Razer BlackShark V2 Pro Wireless Gaming Headset",
    brand: "Razer",
    category: "peripherals",
    price: 34999,
    originalPrice: 42999,
    rating: 4.6,
    reviews: 142,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80"
    ],
    description: "50mm Neodymium drivers, spatial audio 7.1 surround sound, broadcast-grade noise-canceling mic & memory foam ear cushions.",
    fullDescription: "Gain competitive audio awareness with the Razer BlackShark V2 Pro Wireless Headset. Engineered with custom-tuned 50mm high-density drivers and THX Spatial 7.1 surround sound, ensuring pin-point accuracy for enemy footsteps and cinematic audio depth.",
    inStock: true,
    badge: "Top Rated",
    sku: "ETC-HS-RAZERBS",
    warranty: "1-Year Hardware Protection Guarantee",
    specs: {
      "Audio Drivers": "50mm Custom Neodymium High-Density Drivers",
      "Frequency Response": "12 Hz – 28,000 Hz",
      "Surround Sound": "THX Spatial 7.1 Channel Surround Audio",
      "Microphone": "Detachable Broadcast-Grade Noise-Canceling Mic",
      "Battery": "Up to 38 Hours continuous playback",
      "Weight": "275g Lightweight Ergonomic Design"
    },
    features: [
      "Cooling-gel infused memory foam ear cushions for zero fatigue",
      "Simultaneous 2.4GHz ultra-low latency & Bluetooth dual-wireless",
      "Intuitive on-ear cup volume balance and mic mute wheel",
      "Cross-platform compatibility (PC, PS5, Switch, Mobile)"
    ]
  },
  {
    id: 7,
    name: "NVIDIA GeForce RTX 4080 Super Founders Edition",
    brand: "NVIDIA",
    category: "components",
    price: 389999,
    originalPrice: 429999,
    rating: 4.9,
    reviews: 310,
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80"
    ],
    description: "16GB GDDR6X, DLSS 3.5 AI upscaling, 3rd Gen Ray Tracing cores, triple-fan axial tech cooling system.",
    fullDescription: "Supercharge your PC with the NVIDIA GeForce RTX 4080 Super. Built on the ultra-efficient Ada Lovelace architecture, it brings ultra-high frame rates in 4K resolution with DLSS 3.5 AI Frame Generation and full ray tracing rendering power.",
    inStock: true,
    badge: "New Arrival",
    sku: "ETC-GPU-4080S",
    warranty: "3-Year Manufacturer Warranty & Technical RMA Support",
    specs: {
      "CUDA Cores": "10,240 CUDA Cores (Boost Clock 2550 MHz)",
      "VRAM": "16GB GDDR6X (256-bit Memory Bus)",
      "Ray Tracing / Tensor": "3rd Gen RT Cores / 4th Gen Tensor Cores",
      "Power Requirement": "750W PSU Recommended (16-pin 12VHPWR)",
      "Outputs": "3x DisplayPort 1.4a, 1x HDMI 2.1a",
      "Cooling": "Triple-Fan Axial Tech Vapor Chamber System"
    },
    features: [
      "NVIDIA DLSS 3.5 Ray Reconstruction for ultra-realistic graphics",
      "Dual BIOS switch for Quiet mode vs Performance OC mode",
      "Reinforced metal diecast exoskeleton structure preventing GPU sag",
      "AV1 Hardware Encoding support for seamless 4K livestreaming"
    ]
  },
  {
    id: 8,
    name: "Corsair Dominator Titanium 64GB DDR5 6000MHz RGB",
    brand: "Corsair",
    category: "components",
    price: 49999,
    originalPrice: 59999,
    rating: 4.8,
    reviews: 73,
    image: "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80"
    ],
    description: "2x32GB Kit, CL30 low latency, Intel XMP 3.0 & AMD EXPO ready, custom heat spreader with ambient light sync.",
    fullDescription: "Push high-speed system memory performance with the Corsair Dominator Titanium 64GB (2x32GB) DDR5 RAM Kit. Running at 6000MHz with tight CL30 timings, it delivers maximum bandwidth for extreme gaming, heavy multitasking, and workstation workloads.",
    inStock: true,
    badge: "New Arrival",
    sku: "ETC-RAM-64GDDR5",
    warranty: "Lifetime Limited Manufacturer Warranty",
    specs: {
      "Capacity": "64GB Kit (2 x 32GB Modules)",
      "Speed": "DDR5-6000MHz (PC5-48000)",
      "Tested Latency": "CL30-36-36-76 at 1.35V",
      "Profile Support": "Intel XMP 3.0 & AMD EXPO Ready",
      "Heatspreader": "Solid Aluminum Anodized Matte Black",
      "RGB Sync": "Compatible with ASUS Aura, MSI Mystic, Gigabyte RGB"
    },
    features: [
      "On-Die ECC (Error Correction Code) for maximum data stability",
      "Custom 10-layer PCB for clean high-frequency signal delivery",
      "Hand-screened memory ICs ensuring headroom for overclocking",
      "Ultra-low profile design ensuring clearance with large CPU air coolers"
    ]
  },
  {
    id: 9,
    name: "MSI MAG A1000GL 1000W 80+ Gold Modular PSU",
    brand: "MSI",
    category: "components",
    price: 44999,
    originalPrice: 52999,
    rating: 4.7,
    reviews: 58,
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80"
    ],
    description: "ATX 3.0 PCIe 5.0 native support, 100% Japanese capacitors, fluid dynamic bearing ultra-quiet fan, 10-year warranty.",
    fullDescription: "Provide clean, continuous power to high-tier rigs with the MSI MAG 1000W Power Supply. Fully modular with native PCIe 5.0 12VHPWR support for RTX 40-series cards, 80 PLUS Gold efficiency certification, and Japanese 105°C capacitors.",
    inStock: true,
    badge: "Top Rated",
    sku: "ETC-PSU-1000GOLD",
    warranty: "10-Year Comprehensive Factory Warranty",
    specs: {
      "Wattage": "1000 Watts Continuous Power Output",
      "Efficiency": "80 PLUS Gold Certified (up to 92% Efficiency)",
      "Standard": "ATX 3.0 & PCIe 5.0 Ready (Native 16-pin cable included)",
      "Capacitors": "100% High-Grade Japanese 105°C Capacitors",
      "Fan": "135mm Fluid Dynamic Bearing (FDB) Silent Fan",
      "Protections": "OVP, UVP, OCP, OPP, SCP, OTP Full Industrial Guard"
    },
    features: [
      "Zero RPM Fan Mode for silent operation at low-to-medium loads",
      "Fully modular flat black cables for effortless cable management",
      "Single +12V rail delivering maximum stability to high-power GPUs",
      "Compact 150mm length chassis fitting virtually all ATX PC cases"
    ]
  },
  {
    id: 10,
    name: "Logitech MX Master 3S Wireless Performance Mouse",
    brand: "Logitech G",
    category: "peripherals",
    price: 32999,
    originalPrice: 38999,
    rating: 4.9,
    reviews: 215,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80"
    ],
    description: "8K DPI any-surface tracking, quiet clicks, MagSpeed electromagnetic scrolling, USB-C rechargeable 70-day battery.",
    fullDescription: "Master your workflow with the Logitech MX Master 3S. Engineered with an 8000 DPI Darkfield optical sensor that tracks on glass, ultra-quiet mechanical switches with 90% less click noise, and the lightning-fast MagSpeed electromagnetic scroll wheel.",
    inStock: true,
    badge: "Best Seller",
    sku: "ETC-MOU-MXM3S",
    warranty: "2-Year Official Logitech Warranty",
    specs: {
      "Sensor": "Darkfield High Precision Optical (200 - 8000 DPI)",
      "Buttons": "7 Custom Programmable Buttons + Gesture Button",
      "Scroll Wheel": "MagSpeed Electromagnetic SmartShift Wheel",
      "Connectivity": "Logi Bolt USB Receiver & Bluetooth Low Energy (3 Devices)",
      "Battery": "500 mAh Li-Po Battery (Up to 70 days per full charge)",
      "Weight": "141g Ergonomic Palm-Grip Design"
    },
    features: [
      "Quiet Click technology eliminating 90% of audible click sound",
      "Flow cross-computer control to transfer text and files across systems",
      "App-specific customizations in Logi Options+ software",
      "1-minute quick charge provides up to 3 hours of use"
    ]
  },
  {
    id: 11,
    name: "HyperX QuadCast S USB RGB Condenser Microphone",
    brand: "HyperX",
    category: "peripherals",
    price: 45999,
    originalPrice: 54999,
    rating: 4.8,
    reviews: 164,
    image: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=600&q=80"
    ],
    description: "Dynamic RGB lighting, anti-vibration shock mount, tap-to-mute sensor with LED indicator, 4 selectable polar patterns.",
    fullDescription: "Deliver studio-grade commentary and podcast recordings with the HyperX QuadCast S. Equipped with a built-in anti-vibration shock mount to suppress rumbles, internal pop filter, tap-to-mute sensor with LED status indicator, and dynamic multi-zone RGB lighting customizable via HyperX NGENUITY.",
    inStock: true,
    badge: "Top Rated",
    sku: "ETC-MIC-QUADCASTS",
    warranty: "2-Year Manufacturer Replacement Warranty",
    specs: {
      "Polar Patterns": "Stereo, Omnidirectional, Cardioid, Bidirectional",
      "Sample / Bit Rate": "48kHz / 16-bit Broadcast Fidelity",
      "Capsule": "Three 14mm Electret Condenser Capsules",
      "Frequency Response": "20Hz – 20kHz",
      "Lighting": "Dynamic Two-Zone Custom RGB Lighting",
      "Mounting": "Built-in Anti-Vibration Shock Mount + 3/8\" & 5/8\" Adapter"
    },
    features: [
      "Tap-to-Mute sensor with clear LED status indicator",
      "Four selectable polar patterns optimizing for any recording scenario",
      "Convenient gain control dial at the base for instant sensitivity adjustment",
      "Multi-device & chat program certified (Discord, TeamSpeak, PC, PS5, Mac)"
    ]
  },
  {
    id: 12,
    name: "Logitech Brio 4K Ultra HD Pro Webcam",
    brand: "Logitech G",
    category: "accessories",
    price: 38999,
    originalPrice: 46999,
    rating: 4.7,
    reviews: 118,
    image: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=600&q=80"
    ],
    description: "4K Ultra HD @ 30fps / 1080p @ 60fps, RightLight 3 HDR auto light correction, dual noise-canceling mics & Windows Hello IR.",
    fullDescription: "Stream and present at maximum visual clarity with the Logitech Brio 4K. Features RightLight 3 with HDR to automatically look your best in low light or harsh backlighting, Windows Hello facial recognition infrared sensor, and dual omnidirectional noise-canceling microphones.",
    inStock: true,
    badge: "Popular",
    sku: "ETC-ACC-BRIO4K",
    warranty: "3-Year Limited Hardware Warranty",
    specs: {
      "Video Resolution": "4K Ultra HD @ 30fps / 1080p @ 60fps / 720p @ 90fps",
      "Sensor": "13-Megapixel Ultra-Clear Optics with 5x Digital HD Zoom",
      "Field of View": "Customizable 65°, 78°, and 90° Diagonal FOV",
      "HDR": "RightLight 3 with High Dynamic Range (HDR) Exposure Balance",
      "Security": "Infrared Sensor for Windows Hello Facial Recognition",
      "Microphone": "Dual Integrated Omnidirectional Microphones with Noise Cancellation"
    },
    features: [
      "Smooth 60fps recording at 1080p for ultra-fluid gaming streams",
      "Detachable privacy shade to protect your lens and privacy",
      "Multiple mounting options including monitor clip and 1/4\" tripod mount",
      "Certified for Microsoft Teams, Zoom, Google Meet, and OBS Studio"
    ]
  }
];

export const DEFAULT_BRANCH_ALLOCATION = {
  1: { "BR-COL": 12, "BR-GAL": 5, "BR-MAT": 3, "BR-KND": 8 },
  2: { "BR-COL": 25, "BR-GAL": 14, "BR-MAT": 8, "BR-KND": 10 },
  3: { "BR-COL": 8, "BR-GAL": 3, "BR-MAT": 2, "BR-KND": 4 },
  4: { "BR-COL": 30, "BR-GAL": 18, "BR-MAT": 12, "BR-KND": 15 },
  5: { "BR-COL": 10, "BR-GAL": 4, "BR-MAT": 2, "BR-KND": 5 },
  6: { "BR-COL": 20, "BR-GAL": 9, "BR-MAT": 6, "BR-KND": 11 },
  7: { "BR-COL": 7, "BR-GAL": 2, "BR-MAT": 1, "BR-KND": 3 },
  8: { "BR-COL": 15, "BR-GAL": 8, "BR-MAT": 5, "BR-KND": 9 },
  9: { "BR-COL": 18, "BR-GAL": 10, "BR-MAT": 7, "BR-KND": 12 },
  10: { "BR-COL": 40, "BR-GAL": 22, "BR-MAT": 15, "BR-KND": 20 },
  11: { "BR-COL": 14, "BR-GAL": 6, "BR-MAT": 4, "BR-KND": 8 },
  12: { "BR-COL": 22, "BR-GAL": 11, "BR-MAT": 7, "BR-KND": 13 }
};

export const products = DEFAULT_PRODUCTS;
