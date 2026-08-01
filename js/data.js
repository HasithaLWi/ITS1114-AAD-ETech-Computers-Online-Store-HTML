// ETech Computers Product Inventory Dataset

export const products = [
    {
        id: 1,
        name: "Apex Raider Pro RTX 4090 Gaming Laptop",
        category: "laptops",
        price: 2499,
        originalPrice: 2799,
        rating: 4.9,
        reviews: 128,
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
        description: "Intel Core i9-14900HX, 32GB DDR5 RAM, 2TB PCIe Gen4 SSD, NVIDIA RTX 4090 16GB, 16\" QHD+ 240Hz mini-LED Display.",
        fullDescription: "The Apex Raider Pro is engineered for competitive gamers and creative professionals demanding uncompromised Desktop-class performance on the go. Powered by Intel's flagship Core i9 14th Gen processor and NVIDIA GeForce RTX 4090 graphics with 175W Max TGP. Featuring a breathtaking 240Hz Mini-LED display with 100% DCI-P3 color accuracy and liquid metal vapor chamber cooling.",
        inStock: true,
        badge: "Bestseller",
        sku: "ETC-LAP-4090X",
        warranty: "2-Year Comprehensive Hardware & On-Site Support",
        specs: {
            "Processor": "Intel Core i9-14900HX (24 Cores, up to 5.8GHz)",
            "Graphics": "NVIDIA GeForce RTX 4090 16GB GDDR6 (175W TGP)",
            "RAM": "32GB DDR5 5600MHz Dual-Channel",
            "Storage": "2TB M.2 PCIe Gen4 NVMe SSD",
            "Display": "16\" QHD+ (2560x1600) 240Hz Mini-LED 1100-nits",
            "Weight & OS": "2.4 kg | Windows 11 Pro 64-bit"
        },
        features: [
            "Advanced Liquid Metal Vapor Chamber Thermal Cooling System",
            "Per-Key RGB Mechanical Keyboard powered by SteelSeries",
            "Thunderbolt 4, Wi-Fi 7, HDMI 2.1, 2.5Gb Ethernet connectivity",
            "99.9Wh Ultra-High Capacity Battery with 330W Fast Charging"
        ]
    },
    {
        id: 2,
        name: "CyberBlade RGB Mechanical Keyboard",
        category: "peripherals",
        price: 129,
        originalPrice: 159,
        rating: 4.8,
        reviews: 94,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
        description: "Hot-swappable tactile switches, aircraft-grade aluminum frame, per-key RGB backlighting & detachable USB-C braided cable.",
        fullDescription: "Crafted for speed and durability, the CyberBlade Mechanical Keyboard features custom hot-swappable tactile switches, pre-lubed stabilizers, and sound-absorbing foam layers. Housed in a solid CNC anodized aluminum chassis with vibrant dynamic per-key RGB lighting and custom macro programming support.",
        inStock: true,
        badge: "Popular",
        sku: "ETC-KB-CYBER80",
        warranty: "1-Year Advance Replacement Guarantee",
        specs: {
            "Switch Type": "Hot-Swappable Tactile Mechanical Switches (50M Clicks)",
            "Frame": "Aircraft-Grade CNC Anodized Aluminum Top Plate",
            "Keycaps": "Double-Shot PBT Shine-Through Keycaps",
            "Connectivity": "Detachable Braided USB-C / 2.4GHz Wireless",
            "Polling Rate": "1000Hz Ultra-Low Latency Response",
            "Lighting": "Per-Key RGB with 18 Preset Lighting Modes"
        },
        features: [
            "Hot-Swappable PCB compatible with 3-pin & 5-pin MX switches",
            "Dual-Layer Poron dampening foam for acoustic typing sound",
            "Dedicated CNC Aluminum Volume Knob & Media Controls",
            "Onboard memory profiles for custom macros and lighting"
        ]
    },
    {
        id: 3,
        name: "Vortex Ultra 34\" Curved QD-OLED Monitor",
        category: "monitors",
        price: 899,
        originalPrice: 1099,
        rating: 4.9,
        reviews: 67,
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
        description: "3440 x 1440 UltraWide, 175Hz refresh rate, 0.03ms response time, DisplayHDR True Black 400, G-Sync Ultimate.",
        fullDescription: "Experience infinite contrast and breathtaking colors with the Vortex Ultra 34\" Quantum-Dot OLED Curved Monitor. Featuring a 175Hz refresh rate, near-instantaneous 0.03ms response time, and 1800R curvature that wraps around your field of view for total gaming immersion.",
        inStock: true,
        badge: "Hot Deal",
        sku: "ETC-MON-34QDOLED",
        warranty: "3-Year OLED Burn-In Protection & Zero Bright Pixel Guarantee",
        specs: {
            "Screen Size": "34-inch UltraWide 1800R Curved QD-OLED Panel",
            "Resolution": "UWQHD (3440 x 1440) 21:9 Aspect Ratio",
            "Refresh Rate": "175Hz Native via DisplayPort 1.4",
            "Response Time": "0.03ms (GtG) Ultra-Fast",
            "HDR Standard": "VESA DisplayHDR True Black 400 (1000 nits peak)",
            "Sync Tech": "NVIDIA G-SYNC Ultimate & AMD FreeSync Premium Pro"
        },
        features: [
            "Quantum-Dot OLED technology delivering 99.3% DCI-P3 color gamut",
            "Custom Graphene Heatsink fanless cooling system for OLED longevity",
            "Built-in KVM Switch with 90W USB-C Power Delivery",
            "Ergonomic stand with height, tilt, and swivel adjustment"
        ]
    },
    {
        id: 4,
        name: "Precision Elite Wireless Gaming Mouse",
        category: "peripherals",
        price: 79,
        originalPrice: 99,
        rating: 4.7,
        reviews: 210,
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80",
        description: "Ultra-lightweight 58g design, 26,000 DPI Optical Sensor, 90-hour battery life, zero-latency 2.4GHz connection.",
        fullDescription: "Dominate twitch-shooters with the Precision Elite Wireless Gaming Mouse. Weighing just 58 grams without honeycomb holes, it houses a state-of-the-art 26,000 DPI optical sensor with 650 IPS tracking speed and 90-hour battery life.",
        inStock: true,
        badge: "",
        sku: "ETC-MS-PRECELITE",
        warranty: "1-Year Direct Replacement Warranty",
        specs: {
            "Weight": "58g Ultra-Lightweight Solid Shell",
            "Sensor": "Precision 26K Optical Sensor (100 - 26,000 DPI)",
            "Max Speed / Acceleration": "650 IPS / 50G Acceleration",
            "Battery Life": "Up to 90 Hours (USB-C Fast Rechargeable)",
            "Switches": "Optical Micro Switches (90 Million Click Lifetime)",
            "Wireless Tech": "2.4GHz HyperSpeed Wireless & Bluetooth 5.2"
        },
        features: [
            "Pure 100% Virgin Grade PTFE Skates for smooth glide",
            "Zero-latency sub-1ms wireless connection protocol",
            "Onboard memory storing 5 DPI stages and custom polling rates",
            "Includes anti-slip grip tape and braided USB-C charging cable"
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
        badge: "High Demand",
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
        badge: "",
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

// Helper functions for dataset access
export function getProductById(id) {
    return products.find(p => p.id === parseInt(id));
}

export function getFeaturedProducts() {
    return products.filter(p => p.badge !== "");
}

