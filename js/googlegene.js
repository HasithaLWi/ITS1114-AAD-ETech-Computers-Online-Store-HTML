import { GoogleGenAI } from "https://esm.run/@google/genai";
import { ET_CONFIG } from "./et-training.js";


const products = [
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
        inStock: true,
        badge: "Bestseller"
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
        inStock: true,
        badge: "Popular"
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
        inStock: true,
        badge: "Hot Deal"
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
        inStock: true,
        badge: ""
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
        inStock: true,
        badge: "New Arrival"
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
        inStock: true,
        badge: ""
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
        inStock: true,
        badge: "High Demand"
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
        inStock: true,
        badge: ""
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
        inStock: true,
        badge: ""
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
        inStock: true,
        badge: ""
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
        inStock: true,
        badge: "Top Rated"
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
        inStock: true,
        badge: ""
    }
];

console.log("Hello Google Gen AI");

const ai = new GoogleGenAI({ apiKey: ET_CONFIG.API_KEY });

const contentsHistory = [];

function buildContext() {
    // Products (dummy data from data.js — swap with API later)
    const productData = (typeof products !== "undefined" && Array.isArray(products)) ? products : [];


    return { productData };
}

const { productData } = buildContext();

const systemPromptText = `${ET_CONFIG.SYSTEM_PROMPT}
═══ LIVE PRODUCT CATALOG (${productData.length} items) ═══
${JSON.stringify(productData, null, 2)}
`;




async function call(input) {
    const interaction = await ai.interactions.create({
        model: ET_CONFIG.MODEL,
        input: {
            type: "text",
            text: input,
        },
        system_instruction: systemPromptText,

        generation_config: {
            temperature: 0.7,
            top_p: 0.9,
            max_output_tokens: 1024
        }
    });
    console.log(interaction.output_text);
    appendMessage(interaction.output_text, "bot");
    inputEl.disabled = false;
    sendBtn.disabled = false;
    inputEl.focus();
}



function appendMessage(text, sender) {
    const chatBox = document.getElementById("chatBox");
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv;
}
const sendBtn = document.getElementById("sendBtn");
const inputEl = document.getElementById("userInput");

sendBtn.addEventListener("click", () => {
    call(inputEl.value.trim());
    appendMessage(inputEl.value.trim(), "user");
    inputEl.value = "";
    inputEl.disabled = true;
    sendBtn.disabled = true;
});




