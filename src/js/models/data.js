// ETech Computers Product Inventory Dataset



export const products = [
    {
        id: 1,
        name: "ASUS GeForce RTX 4070 Super 12GB GDDR6X",
        brand: "ASUS GeForce",
        category: "components",
        price: 259999,
        originalPrice: 289999,
        rating: 4.8,
        reviews: 156,
        image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80",
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
        brand: "Intel Core",
        category: "components",
        price: 179999,
        originalPrice: 199999,
        rating: 4.7,
        reviews: 98,
        image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80",
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
        name: "Zenith Studio Ultrabook M3",
        category: "laptops",
        price: 1399,
        originalPrice: 1499,
        rating: 4.8,
        reviews: 85,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
        description: "Lightweight CNC aluminum chassis, 16GB Unified RAM, 1TB SSD, 14.2\" Liquid Retina display with 18-hour battery.",
        fullDescription: "The Zenith Studio M3 Ultrabook delivers desktop-class creative power in an impossibly thin 1.3kg aluminum chassis. Optimized for video editing, software development, and 3D modeling, it offers up to 18 hours of all-day battery life with a radiant Liquid Retina XDR display.",
        inStock: true,
        badge: "New Arrival",
        sku: "ETC-LAP-ZENITHM3",
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
        name: "Immerse Pro 7.1 Wireless Gaming Headset",
        category: "peripherals",
        price: 149,
        originalPrice: 179,
        rating: 4.6,
        reviews: 142,
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80",
        description: "50mm Neodymium drivers, spatial audio 7.1 surround sound, broadcast-grade noise-canceling mic & memory foam ear cushions.",
        fullDescription: "Gain competitive audio awareness with the Immerse Pro 7.1 Wireless Headset. Engineered with custom-tuned 50mm high-density drivers and THX Spatial 7.1 surround sound, ensuring pin-point accuracy for enemy footsteps and cinematic audio depth.",
        inStock: true,
        badge: "",
        sku: "ETC-HS-IMMERSE71",
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
        name: "NVIDIA GeForce RTX 4080 Super GPU",
        category: "components",
        price: 999,
        originalPrice: 1199,
        rating: 4.9,
        reviews: 310,
        image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80",
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
        name: "Quantum 64GB DDR5 6000MHz RGB RAM Kit",
        category: "components",
        price: 219,
        originalPrice: 249,
        rating: 4.8,
        reviews: 73,
        image: "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80",
        description: "2x32GB Kit, CL30 low latency, Intel XMP 3.0 & AMD EXPO ready, custom heat spreader with ambient light sync.",
        fullDescription: "Push high-speed system memory performance with the Quantum 64GB (2x32GB) DDR5 RAM Kit. Running at 6000MHz with tight CL30 timings, it delivers maximum bandwidth for extreme gaming, heavy multitasking, and workstation workloads.",
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
        name: "SuperNova 1000W 80+ Gold Modular PSU",
        category: "components",
        price: 179,
        originalPrice: 199,
        rating: 4.7,
        reviews: 58,
        image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80",
        description: "ATX 3.0 PCIe 5.0 native support, 100% Japanese capacitors, fluid dynamic bearing ultra-quiet fan, 10-year warranty.",
        fullDescription: "Provide clean, continuous power to high-tier rigs with the SuperNova 1000W Power Supply. Fully modular with native PCIe 5.0 12VHPWR support for RTX 40-series cards, 80 PLUS Gold efficiency certification, and Japanese 105°C capacitors.",
        inStock: true,
        badge: "",
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
        name: "UltraFlex Ergonomic Laptop Stand",
        category: "accessories",
        price: 49,
        originalPrice: 65,
        rating: 4.5,
        reviews: 99,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80",
        description: "Solid anodized aluminum structure, 360-degree rotation, dual heat ventilation silicone pads, foldable design.",
        fullDescription: "Improve posture and cooling efficiency with the UltraFlex Ergonomic Laptop Stand. Crafted from premium anodized aluminum alloy, it features a 360-degree swivel base, infinite height and angle adjustment, and protective non-slip silicone pads.",
        inStock: true,
        badge: "",
        sku: "ETC-ACC-STAND360",
        warranty: "1-Year Replacement Guarantee",
        specs: {
            "Material": "Premium CNC Anodized Aluminum Alloy",
            "Adjustability": "360° Swivel Base | Height 3.5\" to 12\" | Tilt 0° - 180°",
            "Compatibility": "Supports Laptops & MacBooks 10\" to 17.3\"",
            "Max Load": "Supports up to 10 kg (22 lbs) without wobble",
            "Weight": "1.1 kg Sturdy Solid Construction"
        },
        features: [
            "Open-air ventilation cutout preventing laptop thermal throttling",
            "Heavy-duty dual dampening shaft hinges maintaining position",
            "Anti-scratch thick rubber silicone pads protecting laptop chassis",
            "Folds completely flat for easy storage in backpacks"
        ]
    },
    {
        id: 11,
        name: "Thunderbolt 4 Pro Docking Station 12-in-1",
        category: "accessories",
        price: 199,
        originalPrice: 229,
        rating: 4.8,
        reviews: 44,
        image: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=600&q=80",
        description: "Dual 4K@60Hz or single 8K output, 96W Pass-Through Charging, SD/MicroSD card reader, 2.5Gb Ethernet, 4x USB-A.",
        fullDescription: "Transform your laptop into a workstation powerstation with the Thunderbolt 4 Pro 12-in-1 Docking Station. Supporting up to dual 4K @ 60Hz displays or single 8K output, 96W host laptop charging, 40Gbps data transfer, and 2.5Gbps high-speed Ethernet.",
        inStock: true,
        badge: "Top Rated",
        sku: "ETC-ACC-TB4DOCK",
        warranty: "2-Year Hardware Replacement Warranty",
        specs: {
            "Bandwidth": "40Gbps Thunderbolt 4 / USB4 Speed",
            "Display Support": "Dual 4K@60Hz or Single 8K@30Hz Output",
            "Power Delivery": "96W Pass-Through Fast Laptop Charging",
            "Ports": "2x TB4, 2x HDMI 2.1, 4x USB-A 10Gbps, 2.5G LAN, SD/TF, 3.5mm",
            "Ethernet": "2.5 Gigabit RJ45 High-Speed Networking"
        },
        features: [
            "Plug-and-play driverless support for Windows, macOS, and Linux",
            "Aluminum heatsink case ensuring low thermal operating temperature",
            "High-speed SD 4.0 & MicroSD UHS-II card readers (up to 312MB/s)",
            "Includes 0.8m certified Thunderbolt 4 40Gbps cable"
        ]
    },
    {
        id: 12,
        name: "HyperStream 4K USB-C Webcam & Ring Light",
        category: "accessories",
        price: 119,
        originalPrice: 139,
        rating: 4.6,
        reviews: 82,
        image: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=600&q=80",
        description: "4K UHD @ 30fps sensor, auto-HDR, built-in dual omnidirectional microphones, touch control multi-tone fill light.",
        fullDescription: "Broadcast in studio quality with the HyperStream 4K USB-C Webcam. Features a 1/2.8\" Sony STARVIS CMOS sensor capturing crystal-clear 4K video at 30fps with automatic HDR exposure, fast autofocus, dual noise-reducing microphones, and integrated LED ring light.",
        inStock: true,
        badge: "",
        sku: "ETC-ACC-4KCAM",
        warranty: "1-Year Replacement Warranty",
        specs: {
            "Video Resolution": "4K Ultra HD @ 30fps / 1080p @ 60fps",
            "Sensor": "1/2.8\" Sony STARVIS CMOS Low-Light Sensor",
            "Field of View": "Adjustable 65°, 78°, and 90° FOV",
            "Ring Light": "Built-in Touch Controlled LED Ring Light (3 Color Tones)",
            "Microphone": "Dual Omnidirectional Stereo Mics with Noise Suppression",
            "Privacy Cover": "Magnetic Physical Privacy Shutter Included"
        },
        features: [
            "AI-powered facial tracking autofocus & automatic light balance",
            "Universal monitor clip with 1/4\" tripod thread mount",
            "Detachable 2-meter USB-C to USB-A braided cable",
            "Compatible with OBS, Zoom, Teams, Twitch, and YouTube Live",
            "Compatible with OBS, Zoom, Teams, Twitch, and YouTube Live"
        ]
    }
];

// Add default branch stock allocations to products if not present
const DEFAULT_BRANCH_ALLOCATION = {
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

const PRODUCTS_STORAGE_KEY = 'etech_products';

/**
 * Get all stored products from localStorage (or seed default)
 */
export function getStoredProducts() {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    let list = [];
    if (!raw) {
        // Hydrate default products with branch stock
        list = products.map(p => {
            const stockMap = DEFAULT_BRANCH_ALLOCATION[p.id] || { "BR-COL": 10, "BR-GAL": 5, "BR-MAT": 3, "BR-KND": 4 };
            const totalStock = Object.values(stockMap).reduce((a, b) => a + b, 0);
            return {
                ...p,
                branchStock: stockMap,
                totalStock: totalStock,
                inStock: totalStock > 0,
                discount: p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
                alertEnabled: p.alertEnabled !== undefined ? p.alertEnabled : true,
                lowStockMargin: p.lowStockMargin !== undefined ? parseInt(p.lowStockMargin) : 5
            };
        });
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(list));
    } else {
        try {
            list = JSON.parse(raw);
        } catch (e) {
            list = products;
        }
    }

    // Always ensure items 0, 1, 2, 3 have updated metadata matching reference design
    [0, 1, 2, 3].forEach(i => {
        if (products[i] && list[i]) {
            list[i].name = products[i].name;
            list[i].category = products[i].category;
            list[i].price = products[i].price;
            list[i].originalPrice = products[i].originalPrice;
            list[i].rating = products[i].rating;
            list[i].reviews = products[i].reviews;
            list[i].badge = products[i].badge;
            list[i].image = products[i].image;
        }
    });

    // Ensure all items have alertEnabled and lowStockMargin properties
    return list.map(p => ({
        ...p,
        alertEnabled: p.alertEnabled !== undefined ? p.alertEnabled : true,
        lowStockMargin: p.lowStockMargin !== undefined ? parseInt(p.lowStockMargin) : 5
    }));
}

/**
 * Save full products array to localStorage
 */
export function saveStoredProducts(productsList) {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(productsList));
}

/**
 * Get product by ID from stored products
 */
export function getProductById(id) {
    const all = getStoredProducts();
    return all.find(p => p.id === parseInt(id));
}

/**
 * Get featured products (Best Sellers)
 */
export function getFeaturedProducts() {
    const all = getStoredProducts();
    const bestSellers = all.filter(p => p.badge && p.badge.trim().toLowerCase() === "best seller");
    if (bestSellers.length > 0) {
        return bestSellers;
    }
    return all.slice(0, 4);
}

/**
 * Get new arrival products (filtered by badge matching "New Arrival")
 */
export function getNewArrivalProducts() {
    const all = getStoredProducts();
    const arrivals = all.filter(p => p.badge && p.badge.trim().toLowerCase() === "new arrival");
    if (arrivals.length > 0) {
        return arrivals;
    }
    // Fallback: Return any products with non-empty badge or default to top 4 products
    const featured = all.filter(p => p.badge && p.badge !== "");
    return featured.length > 0 ? featured : all.slice(0, 4);
}

/**
 * Save or update a product
 */
export function saveProduct(productData) {
    const all = getStoredProducts();
    const index = all.findIndex(p => p.id === parseInt(productData.id));

    // Filter and sanitize images array (max 5 images)
    let imagesArr = Array.isArray(productData.images) ? productData.images.filter(img => img && typeof img === 'string' && img.trim() !== '') : [];
    if (imagesArr.length === 0 && productData.image) {
        imagesArr = [productData.image];
    }
    if (imagesArr.length > 5) {
        imagesArr = imagesArr.slice(0, 5);
    }

    const mainImg = imagesArr.length > 0 ? imagesArr[0] : (productData.image || "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80");

    const branchStock = productData.branchStock || { "BR-COL": 10, "BR-GAL": 5, "BR-MAT": 3, "BR-KND": 5 };
    const totalStock = Object.values(branchStock).reduce((sum, v) => sum + parseInt(v || 0), 0);

    const formattedProduct = {
        id: productData.id ? parseInt(productData.id) : (all.length > 0 ? Math.max(...all.map(p => p.id)) + 1 : 1),
        name: productData.name,
        category: productData.category,
        price: parseFloat(productData.price),
        originalPrice: parseFloat(productData.originalPrice || productData.price),
        rating: parseFloat(productData.rating || 4.8),
        reviews: parseInt(productData.reviews || 10),
        image: mainImg,
        images: imagesArr.length > 0 ? imagesArr : [mainImg],
        description: productData.description || "",
        fullDescription: productData.fullDescription || productData.description || "",
        sku: productData.sku || `ETC-${(productData.category || 'GEN').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        badge: productData.badge || "",
        warranty: productData.warranty || "1-Year Warranty",
        specs: productData.specs || { "Category": productData.category },
        features: productData.features || ["High Performance Tech Hardware"],
        branchStock: branchStock,
        totalStock: totalStock,
        inStock: totalStock > 0,
        alertEnabled: productData.alertEnabled !== undefined ? productData.alertEnabled : (index > -1 && all[index].alertEnabled !== undefined ? all[index].alertEnabled : true),
        lowStockMargin: productData.lowStockMargin !== undefined ? parseInt(productData.lowStockMargin) : (index > -1 && all[index].lowStockMargin !== undefined ? all[index].lowStockMargin : 5)
    };

    if (index > -1) {
        all[index] = formattedProduct;
    } else {
        all.push(formattedProduct);
    }

    saveStoredProducts(all);
    return formattedProduct;
}

/**
 * Delete product by ID
 */
export function deleteProduct(id) {
    let all = getStoredProducts();
    all = all.filter(p => p.id !== parseInt(id));
    saveStoredProducts(all);
    return true;
}

/**
 * Deduct stock from a specific branch when an order is placed
 */
export function deductBranchStock(productId, branchId, quantity) {
    const all = getStoredProducts();
    const product = all.find(p => p.id === parseInt(productId));
    if (product && product.branchStock) {
        const current = product.branchStock[branchId] || 0;
        product.branchStock[branchId] = Math.max(0, current - quantity);
        product.totalStock = Object.values(product.branchStock).reduce((a, b) => a + b, 0);
        product.inStock = product.totalStock > 0;
        saveStoredProducts(all);
    }
}

/**
 * Update stock alert configuration for a specific product
 */
export function updateProductStockSettings(productId, { alertEnabled, lowStockMargin }) {
    const all = getStoredProducts();
    const product = all.find(p => p.id === parseInt(productId));
    if (product) {
        if (alertEnabled !== undefined) product.alertEnabled = Boolean(alertEnabled);
        if (lowStockMargin !== undefined) product.lowStockMargin = Math.max(1, parseInt(lowStockMargin) || 5);
        saveStoredProducts(all);
        return product;
    }
    return null;
}

/**
 * Adjust stock quantity directly for a branch warehouse
 */
export function quickAdjustStock(productId, branchId, quantityOrDelta, isAbsolute = false) {
    const all = getStoredProducts();
    const product = all.find(p => p.id === parseInt(productId));
    if (product) {
        if (!product.branchStock) product.branchStock = { "BR-COL": 0, "BR-GAL": 0, "BR-MAT": 0, "BR-KND": 0 };
        const current = parseInt(product.branchStock[branchId] || 0);
        if (isAbsolute) {
            product.branchStock[branchId] = Math.max(0, parseInt(quantityOrDelta) || 0);
        } else {
            product.branchStock[branchId] = Math.max(0, current + parseInt(quantityOrDelta || 0));
        }
        product.totalStock = Object.values(product.branchStock).reduce((a, b) => a + parseInt(b || 0), 0);
        product.inStock = product.totalStock > 0;
        saveStoredProducts(all);
        return product;
    }
    return null;
}

/**
 * Transfer stock from one branch warehouse to another
 */
export function transferBranchStock(productId, fromBranchId, toBranchId, transferQty) {
    const all = getStoredProducts();
    const product = all.find(p => p.id === parseInt(productId));
    const qty = parseInt(transferQty) || 0;
    if (product && qty > 0 && fromBranchId !== toBranchId) {
        if (!product.branchStock) product.branchStock = { "BR-COL": 0, "BR-GAL": 0, "BR-MAT": 0, "BR-KND": 0 };
        const sourceStock = parseInt(product.branchStock[fromBranchId] || 0);
        const actualTransfer = Math.min(sourceStock, qty);
        product.branchStock[fromBranchId] = Math.max(0, sourceStock - actualTransfer);
        product.branchStock[toBranchId] = (parseInt(product.branchStock[toBranchId] || 0)) + actualTransfer;
        product.totalStock = Object.values(product.branchStock).reduce((a, b) => a + parseInt(b || 0), 0);
        product.inStock = product.totalStock > 0;
        saveStoredProducts(all);
        return { success: true, transferred: actualTransfer, product };
    }
    return { success: false, message: 'Invalid transfer parameters.' };
}


