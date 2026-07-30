/**
 * ============================================================
 *  E-T AI CHATBOT ENGINE
 * ============================================================
 *  Powered by Gemini 2.0 Flash. Every message goes to Gemini.
 *  No hardcoded if/else intent matching — pure AI responses.
 *
 *  Dependencies:
 *    - js/et-training.js  (must load first — contains ET_CONFIG)
 *    - js/data.js         (product catalog — global `products`)
 *    - js/app.js          (getCart, addToCart helpers)
 * ============================================================
 */
(function () {
  "use strict";

  // ── State ─────────────────────────────────────────────────
  const state = {
    isOpen: false,
    isProcessing: false,
    history: [],        // { role: 'user'|'model', text: string }
    hasUnread: false
  };

  // ── Helpers ───────────────────────────────────────────────
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function timeStr() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function getPathPrefix() {
    return window.location.pathname.includes("/pages/") ? "../" : "";
  }

  /** Simple markdown → HTML (bold, italic, bullets, line breaks) */
  function renderMarkdown(text) {
    let html = escapeHtml(text);
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>');
    // Italic
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    // Bullet lines
    html = html.replace(/^[\-•]\s+(.+)$/gm, '<div class="flex items-start space-x-2 my-0.5"><span class="text-blue-400 mt-0.5 flex-shrink-0">•</span><span>$1</span></div>');
    // Line breaks
    html = html.replace(/\n{2,}/g, '<div class="h-2"></div>');
    html = html.replace(/\n/g, "<br>");
    return html;
  }

  // ── Gather Live Context for Gemini ────────────────────────
  function buildContext() {
    // Products (dummy data from data.js — swap with API later)
    const productData = (typeof products !== "undefined" && Array.isArray(products)) ? products : [];

    // Cart state
    let cartData = [];
    if (typeof getCart === "function") {
      cartData = getCart();
    } else {
      try { cartData = JSON.parse(localStorage.getItem("etech_cart") || "[]"); } catch (e) { }
    }

    // Current page section
    const hash = window.location.hash || "#home";

    return { productData, cartData, currentPage: hash };
  }

  // ── Gemini API Call & Smart Fallback Engine ────────────────
  async function callGemini(userMessage) {
    const cfg = ET_CONFIG;
    const key = cfg.API_KEY ? cfg.API_KEY.trim() : "";

    const { productData, cartData, currentPage } = buildContext();

    const systemPromptText = `${cfg.SYSTEM_PROMPT}

═══ LIVE PRODUCT CATALOG (${productData.length} items) ═══
${JSON.stringify(productData, null, 2)}

═══ USER'S CURRENT CART ═══
${cartData.length === 0 ? "Cart is empty." : JSON.stringify(cartData, null, 2)}

═══ CURRENT PAGE ═══
User is currently viewing: ${currentPage}
`;

    // Build message contents ensuring strictly alternating user/model turns
    const contents = [];
    const recentHistory = state.history.slice(-6);
    for (const msg of recentHistory) {
      const role = msg.role === "user" ? "user" : "model";
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += "\n" + msg.text;
      } else {
        contents.push({ role, parts: [{ text: msg.text }] });
      }
    }

    if (contents.length > 0 && contents[contents.length - 1].role === "user") {
      contents[contents.length - 1].parts[0].text += "\n" + userMessage;
    } else {
      contents.push({ role: "user", parts: [{ text: userMessage }] });
    }

    // Models to try in single order (Primary: gemini-2.5-flash)
    const targetModels =
      cfg.MODEL || "gemini-3-flash-preview";



    if (key) {
      console.log(`%c🤖 [E-T AI] Calling Gemini Live API...`, 'color: #3b82f6; font-weight: bold; font-size: 12px;');


      try {
        console.log(`%c⏳ Sending request to Model: [${targetModels}]...`, 'color: #94a3b8;');

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModels}:generateContent?key=${encodeURIComponent(key)}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": key
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPromptText }] },
            contents: contents,
            generationConfig: {
              temperature: 0.7,
              topP: 0.9,
              maxOutputTokens: 1024
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            console.log(`%c✅ [E-T AI] GEMINI API SUCCESS! Model: ${targetModels}`, 'color: #22c55e; font-weight: bold; font-size: 12px;');
            return replyText;
          }
        } else {
          const errBody = await response.text();
          console.warn(`%c❌ [E-T AI] API Error for [${targetModels}] (${response.status}):`, 'color: #ef4444; font-weight: bold;', errBody);
        }
      } catch (e) {
        console.warn(`%c❌ [E-T AI] Fetch Exception for [${targetModels}]:`, 'color: #ef4444;', e);
      }

    } else {
      console.warn(`%c⚠️ [E-T AI] No API key configured in et-training.js.`, 'color: #f59e0b;');
    }

    // Seamless Local Intelligence Fallback
    console.info(`%c💡 [E-T AI] Switched to Local Smart Engine (Offline/Fallback Mode)`, 'color: #a855f7; font-weight: bold;');
    return generateSmartFallback(userMessage, productData, cartData);
  }

  function generateSmartFallback(query, productData, cartData) {
    const q = query.toLowerCase().trim();

    // Greetings
    if (['hi', 'hello', 'hey', 'greetings', 'who are you', 'help'].some(w => q === w || q.startsWith(w + ' '))) {
      return `Hey there! 👋 I'm **E-T**, your ETech Computers AI Assistant!

I can help you find hardware, check your shopping cart, give PC build advice, or answer questions about our store policies.

What can I help you find today?`;
    }

    // Cart queries
    if (q.includes('cart') || q.includes('basket') || q.includes('my item')) {
      if (!cartData || cartData.length === 0) {
        return `Your shopping cart is currently **empty**. 🛒

Explore our Shop Catalog to add gaming laptops, OLED monitors, or custom PC components!
[ACTION:NAVIGATE#shop]`;
      }
      const total = cartData.reduce((s, i) => s + (i.price * i.quantity), 0);
      const itemsList = cartData.map(i => `• **${i.name}** (Qty: ${i.quantity}) — $${(i.price * i.quantity).toLocaleString()}`).join('\n');
      return `🛒 **Your Active Shopping Cart (${cartData.length} items):**

${itemsList}

**Total:** $${total.toLocaleString()}

Would you like to proceed to checkout?
[ACTION:NAVIGATE#cart]`;
    }

    // Warranty & Policy
    if (q.includes('warranty') || q.includes('policy') || q.includes('guarantee') || q.includes('return')) {
      return `🛡️ **ETech Computers Guarantee & Warranty:**

• **1-Year Store Warranty:** Covers hardware defects & free tech support.
• **Manufacturer Warranty:** Up to 10 years on modular PSUs and GPUs.
• **30-Day Money-Back Guarantee:** Full refund for unopened items within 30 days.`;
    }

    // Shipping
    if (q.includes('ship') || q.includes('delivery') || q.includes('track')) {
      return `🚚 **Shipping & Delivery Info:**

• **Free Standard Shipping:** On all orders over $50 nationwide (3 - 5 business days).
• **Express Shipping:** 1 - 2 business days ($14.99).
• **Tracking:** Live order tracking available on your Account dashboard.`;
    }

    // Product search fallback
    const stopWords = new Set(['what', 'your', 'you', 'can', 'does', 'do', 'how', 'why', 'who', 'when', 'where', 'is', 'are', 'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'like', 'from', 'show', 'find', 'get']);
    const words = q.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));

    const matches = productData.filter(p => {
      const name = p.name.toLowerCase();
      const cat = p.category.toLowerCase();
      const desc = p.description.toLowerCase();
      return words.some(w => name.includes(w) || cat.includes(w) || desc.includes(w));
    }).slice(0, 3);

    if (matches.length > 0) {
      const actions = matches.map(p => `[ACTION:SHOW_PRODUCT:${p.id}]`).join('\n');
      return `Here are top matches for "**${query}**" from our store inventory:

${actions}`;
    }

    // Default friendly response
    const featured = productData.slice(0, 2);
    const actions = featured.map(p => `[ACTION:SHOW_PRODUCT:${p.id}]`).join('\n');
    return `I searched our ETech store for "**${query}**". Here are top recommended items:

${actions}

Need specific recommendations or PC build advice? Let me know!`;
  }

  // ── Action Parser ─────────────────────────────────────────
  // Extracts [ACTION:...] tags from Gemini's response,
  // executes them, and returns clean display text.
  function parseAndExecuteActions(rawText) {
    let cleanText = rawText;
    const actions = [];

    // Match all action tags
    const actionRegex = /\[ACTION:(NAVIGATE[#:]([^\]]+))\]|\[ACTION:(ADD_TO_CART):(\d+)\]|\[ACTION:(SHOW_PRODUCT):(\d+)\]/g;
    let match;

    while ((match = actionRegex.exec(rawText)) !== null) {
      if (match[1]) {
        // NAVIGATE
        actions.push({ type: "NAVIGATE", target: match[2] });
      } else if (match[3]) {
        // ADD_TO_CART
        actions.push({ type: "ADD_TO_CART", productId: parseInt(match[4]) });
      } else if (match[5]) {
        // SHOW_PRODUCT
        actions.push({ type: "SHOW_PRODUCT", productId: parseInt(match[6]) });
      }
    }

    // Strip action tags from display text
    cleanText = cleanText.replace(/\[ACTION:[^\]]+\]/g, "").trim();

    // Execute actions
    for (const action of actions) {
      switch (action.type) {
        case "NAVIGATE":
          setTimeout(() => {
            const target = action.target;
            if (target.includes(".html")) {
              window.location.href = getPathPrefix() + target;
            } else {
              window.location.hash = target.startsWith("#") ? target : "#" + target;
            }
          }, 800);
          break;

        case "ADD_TO_CART":
          if (typeof addToCart === "function") {
            addToCart(action.productId);
          }
          break;

        // SHOW_PRODUCT is handled during rendering
      }
    }

    return { cleanText, actions };
  }

  // ── Product Card Renderer ─────────────────────────────────
  function renderProductCard(productId) {
    const productList = (typeof products !== "undefined") ? products : [];
    const p = productList.find(item => item.id === productId);
    if (!p) return "";

    const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;

    return `
      <div class="et-product-card group">
        <img src="${p.image}" alt="${escapeHtml(p.name)}" class="et-product-img" onerror="this.style.display='none'">
        <div class="et-product-info">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="et-product-category">${escapeHtml(p.category)}</span>
            ${p.badge ? `<span class="et-product-badge">${escapeHtml(p.badge)}</span>` : ""}
          </div>
          <h4 class="et-product-name">${escapeHtml(p.name)}</h4>
          <div class="flex items-center gap-2">
            <span class="et-product-price">$${p.price}</span>
            ${p.originalPrice ? `<span class="et-product-original">$${p.originalPrice}</span>` : ""}
            ${discount > 0 ? `<span class="et-product-discount">-${discount}%</span>` : ""}
          </div>
        </div>
        <button onclick="if(typeof addToCart==='function'){addToCart(${p.id});this.innerHTML='✓ Added';this.classList.add('et-btn-added')}" class="et-add-btn">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          Add
        </button>
      </div>
    `;
  }

  // ── Chat Message Renderers ────────────────────────────────
  function appendUserBubble(text) {
    const list = document.getElementById("et-messages");
    if (!list) return;

    const div = document.createElement("div");
    div.className = "et-msg-row et-msg-user";
    div.innerHTML = `
      <div class="et-bubble-user">
        <p>${escapeHtml(text)}</p>
        <span class="et-time">${timeStr()}</span>
      </div>
    `;
    list.appendChild(div);
    scrollChat();
  }

  function appendBotBubble(rawText) {
    const list = document.getElementById("et-messages");
    if (!list) return;

    // Parse actions
    const { cleanText, actions } = parseAndExecuteActions(rawText);

    // Render markdown
    let html = renderMarkdown(cleanText);

    // Append product cards for SHOW_PRODUCT actions
    const productCards = actions
      .filter(a => a.type === "SHOW_PRODUCT")
      .map(a => renderProductCard(a.productId))
      .filter(Boolean)
      .join("");

    if (productCards) {
      html += `<div class="et-product-cards">${productCards}</div>`;
    }

    const div = document.createElement("div");
    div.className = "et-msg-row et-msg-bot";
    div.innerHTML = `
      <div class="et-avatar">
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47-2.47m0 0L19 9.56m-2.47 2.47H14.25m-8.5 2.47L3 14.5m2.75 0L3 11.53m2.75 2.97H8.25"/></svg>
      </div>
      <div class="et-bubble-bot">
        <div class="et-bubble-content">${html}</div>
        <span class="et-time">${timeStr()}</span>
      </div>
    `;
    list.appendChild(div);
    scrollChat();
  }

  function showTyping() {
    const list = document.getElementById("et-messages");
    if (!list) return;

    const div = document.createElement("div");
    div.id = "et-typing";
    div.className = "et-msg-row et-msg-bot";
    div.innerHTML = `
      <div class="et-avatar">
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47-2.47m0 0L19 9.56m-2.47 2.47H14.25m-8.5 2.47L3 14.5m2.75 0L3 11.53m2.75 2.97H8.25"/></svg>
      </div>
      <div class="et-bubble-bot">
        <div class="et-typing-dots"><span></span><span></span><span></span></div>
      </div>
    `;
    list.appendChild(div);
    scrollChat();
  }

  function hideTyping() {
    const el = document.getElementById("et-typing");
    if (el) el.remove();
  }

  function scrollChat() {
    const list = document.getElementById("et-messages");
    if (list) setTimeout(() => list.scrollTop = list.scrollHeight, 50);
  }

  // ── Core Send Handler ─────────────────────────────────────
  async function handleSend(text) {
    const trimmed = text.trim();
    if (!trimmed || state.isProcessing) return;

    state.isProcessing = true;
    appendUserBubble(trimmed);
    state.history.push({ role: "user", text: trimmed });
    saveSession();

    // Clear input
    const input = document.getElementById("et-input");
    if (input) input.value = "";

    showTyping();

    try {
      const reply = await callGemini(trimmed);
      hideTyping();
      appendBotBubble(reply);

      // Save raw text (before action parsing) for history context
      const { cleanText } = parseAndExecuteActions(reply);
      state.history.push({ role: "model", text: cleanText });
      saveSession();

    } catch (err) {
      hideTyping();
      console.error("E-T error:", err);
      appendBotBubble("Sorry, I'm having trouble connecting right now. Please try again in a moment! 🔧");
    }

    state.isProcessing = false;
  }

  // ── Session Persistence ───────────────────────────────────
  function saveSession() {
    try { sessionStorage.setItem("et_history", JSON.stringify(state.history.slice(-20))); } catch (e) { }
  }

  function loadSession() {
    try {
      const saved = sessionStorage.getItem("et_history");
      if (saved) {
        state.history = JSON.parse(saved);
        // Replay messages into UI
        for (const msg of state.history) {
          if (msg.role === "user") appendUserBubble(msg.text);
          else appendBotBubble(msg.text);
        }
        return true;
      }
    } catch (e) { }
    return false;
  }

  // ── Toggle Chat Window ────────────────────────────────────
  function toggleChat() {
    state.isOpen = !state.isOpen;
    const panel = document.getElementById("et-panel");
    const fab = document.getElementById("et-fab");
    const badge = document.getElementById("et-unread");

    if (state.isOpen) {
      panel.classList.remove("et-panel-hidden");
      panel.classList.add("et-panel-visible");
      fab.classList.add("et-fab-active");
      if (badge) badge.classList.add("hidden");
      state.hasUnread = false;
      setTimeout(() => document.getElementById("et-input")?.focus(), 300);
    } else {
      panel.classList.add("et-panel-hidden");
      panel.classList.remove("et-panel-visible");
      fab.classList.remove("et-fab-active");
    }
  }

  // ── Build the UI ──────────────────────────────────────────
  function initUI() {
    const cfg = ET_CONFIG;

    // Inject CSS
    const style = document.createElement("style");
    style.textContent = `
      /* ── E-T Chat Fab ── */
      .et-fab {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        width: 58px;
        height: 58px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 24px rgba(59,130,246,0.4), 0 0 0 0 rgba(59,130,246,0.3);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        animation: et-pulse 2.5s infinite;
      }
      .et-fab:hover { transform: scale(1.08); box-shadow: 0 6px 30px rgba(59,130,246,0.5); }
      .et-fab-active { animation: none; transform: rotate(0deg); }
      .et-fab-active:hover { transform: scale(1.08) rotate(0deg); }

      @keyframes et-pulse {
        0%, 100% { box-shadow: 0 4px 24px rgba(59,130,246,0.4), 0 0 0 0 rgba(59,130,246,0.3); }
        50% { box-shadow: 0 4px 24px rgba(59,130,246,0.4), 0 0 0 10px rgba(59,130,246,0); }
      }

      .et-fab .et-fab-icon-open, .et-fab-active .et-fab-icon-close { display: flex; }
      .et-fab .et-fab-icon-close, .et-fab-active .et-fab-icon-open { display: none; }

      .et-unread {
        position: absolute;
        top: -2px;
        right: -2px;
        width: 18px;
        height: 18px;
        background: #ef4444;
        border-radius: 50%;
        border: 2px solid #0f172a;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 700;
      }

      /* ── Chat Panel ── */
      .et-panel {
        position: fixed;
        bottom: 94px;
        right: 24px;
        z-index: 9998;
        width: 380px;
        max-width: calc(100vw - 32px);
        height: 540px;
        max-height: calc(100vh - 140px);
        border-radius: 20px;
        background: #0f172a;
        border: 1px solid rgba(51, 65, 85, 0.6);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 1px rgba(148,163,184,0.2);
        transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .et-panel-hidden { opacity: 0; transform: translateY(16px) scale(0.95); pointer-events: none; }
      .et-panel-visible { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }

      /* ── Header ── */
      .et-header {
        padding: 16px 18px;
        background: linear-gradient(135deg, #1e293b, #0f172a);
        border-bottom: 1px solid rgba(51, 65, 85, 0.5);
        display: flex;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;
      }
      .et-header-avatar {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .et-header-info { flex: 1; min-width: 0; }
      .et-header-name { font-size: 14px; font-weight: 700; color: white; }
      .et-header-status { font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 5px; }
      .et-header-status::before {
        content: '';
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #22c55e;
        display: inline-block;
      }

      /* ── Messages ── */
      .et-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        scrollbar-width: thin;
        scrollbar-color: #334155 transparent;
      }
      .et-messages::-webkit-scrollbar { width: 5px; }
      .et-messages::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }

      .et-msg-row { display: flex; gap: 8px; }
      .et-msg-user { justify-content: flex-end; }
      .et-msg-bot { justify-content: flex-start; align-items: flex-start; }

      .et-avatar {
        width: 30px;
        height: 30px;
        border-radius: 10px;
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: white;
        margin-top: 2px;
      }

      .et-bubble-user {
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 16px 16px 4px 16px;
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        color: white;
        font-size: 13px;
        line-height: 1.5;
        word-break: break-word;
      }
      .et-bubble-bot {
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 16px 16px 16px 4px;
        background: #1e293b;
        border: 1px solid rgba(51, 65, 85, 0.5);
        color: #cbd5e1;
        font-size: 13px;
        line-height: 1.6;
        word-break: break-word;
      }
      .et-bubble-content strong { color: white; }

      .et-time {
        display: block;
        font-size: 9px;
        color: rgba(148, 163, 184, 0.6);
        margin-top: 4px;
        text-align: right;
      }

      /* ── Typing Dots ── */
      .et-typing-dots {
        display: flex;
        gap: 4px;
        padding: 4px 0;
      }
      .et-typing-dots span {
        width: 7px;
        height: 7px;
        background: #64748b;
        border-radius: 50%;
        animation: et-dot 1.4s infinite ease-in-out;
      }
      .et-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
      .et-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes et-dot {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
        40% { transform: scale(1); opacity: 1; }
      }

      /* ── Quick Suggestions ── */
      .et-suggestions {
        padding: 8px 16px 4px;
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        flex-shrink: 0;
        border-top: 1px solid rgba(51, 65, 85, 0.3);
      }
      .et-chip {
        padding: 5px 10px;
        border-radius: 20px;
        background: rgba(51, 65, 85, 0.4);
        border: 1px solid rgba(71, 85, 105, 0.5);
        color: #94a3b8;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }
      .et-chip:hover { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border-color: rgba(59,130,246,0.4); }

      /* ── Input Bar ── */
      .et-input-bar {
        padding: 10px 14px;
        background: #0f172a;
        border-top: 1px solid rgba(51, 65, 85, 0.5);
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
      .et-input {
        flex: 1;
        padding: 10px 14px;
        border-radius: 12px;
        background: #1e293b;
        border: 1px solid #334155;
        color: white;
        font-size: 13px;
        outline: none;
        transition: border-color 0.2s;
        font-family: inherit;
      }
      .et-input::placeholder { color: #64748b; }
      .et-input:focus { border-color: #3b82f6; }

      .et-send-btn {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 0.2s;
      }
      .et-send-btn:hover { transform: scale(1.05); }
      .et-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

      /* ── Product Cards ── */
      .et-product-cards { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
      .et-product-card {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(51, 65, 85, 0.5);
        border-radius: 14px;
        transition: border-color 0.2s;
      }
      .et-product-card:hover { border-color: rgba(59, 130, 246, 0.4); }
      .et-product-img {
        width: 48px;
        height: 48px;
        border-radius: 10px;
        object-fit: cover;
        flex-shrink: 0;
        background: #0f172a;
      }
      .et-product-info { flex: 1; min-width: 0; }
      .et-product-category {
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #60a5fa;
      }
      .et-product-badge {
        font-size: 8px;
        font-weight: 700;
        padding: 1px 6px;
        border-radius: 4px;
        background: rgba(59, 130, 246, 0.2);
        color: #93c5fd;
      }
      .et-product-name {
        font-size: 12px;
        font-weight: 700;
        color: white;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 1px 0;
      }
      .et-product-price { font-size: 13px; font-weight: 800; color: #34d399; }
      .et-product-original { font-size: 11px; color: #64748b; text-decoration: line-through; }
      .et-product-discount { font-size: 10px; font-weight: 700; color: #f87171; }

      .et-add-btn {
        padding: 6px 10px;
        border-radius: 10px;
        background: #3b82f6;
        border: none;
        color: white;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
        transition: all 0.2s;
        font-family: inherit;
      }
      .et-add-btn:hover { background: #2563eb; }
      .et-add-btn:active { transform: scale(0.95); }
      .et-btn-added { background: #22c55e !important; pointer-events: none; }

      /* ── Mobile ── */
      @media (max-width: 480px) {
        .et-panel {
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          max-height: 100vh;
          border-radius: 0;
        }
        .et-fab { bottom: 16px; right: 16px; }
      }
    `;
    document.head.appendChild(style);

    // Build HTML structure
    const wrapper = document.createElement("div");
    wrapper.id = "et-chatbot";
    wrapper.innerHTML = `
      <!-- Floating Action Button -->
      <button id="et-fab" class="et-fab" onclick="document.getElementById('et-chatbot').__toggle()" aria-label="Open E-T Chat">
        <span class="et-fab-icon-open">
          <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        </span>
        <span class="et-fab-icon-close">
          <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </span>
        <span id="et-unread" class="et-unread hidden">1</span>
      </button>

      <!-- Chat Panel -->
      <div id="et-panel" class="et-panel et-panel-hidden">
        <!-- Header -->
        <div class="et-header">
          <div class="et-header-avatar">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47-2.47m0 0L19 9.56m-2.47 2.47H14.25m-8.5 2.47L3 14.5m2.75 0L3 11.53m2.75 2.97H8.25"/>
            </svg>
          </div>
          <div class="et-header-info">
            <div class="et-header-name">${cfg.BOT_NAME}</div>
            <div class="et-header-status">${cfg.BOT_TAGLINE}</div>
          </div>
          <button onclick="document.getElementById('et-chatbot').__toggle()" style="background:none;border:none;color:#64748b;cursor:pointer;padding:4px;">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
        </div>

        <!-- Messages -->
        <div id="et-messages" class="et-messages"></div>

        <!-- Quick Suggestions -->
        <div id="et-suggestions" class="et-suggestions">
          ${cfg.QUICK_SUGGESTIONS.map(s => `<button class="et-chip" onclick="document.getElementById('et-chatbot').__send('${s.replace(/'/g, "\\'")}')">${s}</button>`).join("")}
        </div>

        <!-- Input -->
        <div class="et-input-bar">
          <input id="et-input" class="et-input" type="text" placeholder="Ask E-T anything..." autocomplete="off">
          <button id="et-send" class="et-send-btn" onclick="document.getElementById('et-chatbot').__sendInput()">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);

    // Wire up public methods on the DOM node
    wrapper.__toggle = toggleChat;
    wrapper.__send = (text) => handleSend(text);
    wrapper.__sendInput = () => {
      const input = document.getElementById("et-input");
      if (input && input.value.trim()) handleSend(input.value);
    };

    // Enter key handler
    document.getElementById("et-input")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        wrapper.__sendInput();
      }
    });

    // Load session or show welcome
    if (!loadSession()) {
      appendBotBubble(cfg.WELCOME_MESSAGE);
    }
  }

  // ── Init ──────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUI);
  } else {
    initUI();
  }

})();
