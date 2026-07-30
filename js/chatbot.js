/**
 * ETech Computers - Nova AI Assistant & Smart Hardware Advisor
 * Full AI Chatbot implementation with product discovery, cart integration, 
 * PC building advice, and store support.
 */

(function () {
  'use strict';

  // AI Assistant State
  const state = {
    isOpen: false,
    soundEnabled: true,
    hasUnread: true,
    isTyping: false,
    history: []
  };

  // Helper to determine relative path prefix for images/assets
  function getPathPrefix() {
    return window.location.pathname.includes('/pages/') ? '../' : './';
  }

  // Web Audio Synth for subtle tech sound effects
  function playSound(type) {
    if (!state.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'open') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'send') {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.08);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'receive') {
        osc.frequency.setValueAtTime(784, now);
        osc.frequency.exponentialRampToValueAtTime(987, now + 0.12);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'cart') {
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      // Audio context might be restricted before user interaction
    }
  }

  // Inject Chatbot UI into document body when DOM is ready
  function initChatbotUI() {
    if (document.getElementById('nova-chatbot-container')) return;

    const container = document.createElement('div');
    container.id = 'nova-chatbot-container';
    container.className = 'fixed z-50 bottom-6 right-6 font-sans';

    container.innerHTML = `
      <!-- Floating Widget Launcher Button -->
      <div id="nova-chat-launcher-wrapper" class="relative group">
        <!-- Pulsing Aura Effect -->
        <div class="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-pulse"></div>
        
        <button id="nova-chat-toggle-btn" class="relative flex items-center justify-center w-14 h-14 bg-slate-900 border border-slate-700/80 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none cursor-pointer">
          <!-- Bot Icon -->
          <svg id="nova-icon-bot" class="w-7 h-7 text-blue-400 group-hover:text-cyan-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h.01M15 9h.01"/>
          </svg>
          <!-- Close Icon (Hidden by default) -->
          <svg id="nova-icon-close" class="w-6 h-6 text-slate-300 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          <!-- Notification Badge -->
          <span id="nova-unread-badge" class="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-slate-900 shadow-md animate-bounce">1</span>
        </button>
      </div>

      <!-- Expandable Chat Panel Window -->
      <div id="nova-chat-modal" class="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[630px] h-[82vh] bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform translate-y-6 opacity-0 pointer-events-none z-50">
        
        <!-- Header -->
        <div class="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div class="flex items-center space-x-3">
            <div class="relative">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="text-sm font-extrabold text-white tracking-tight">Nova AI</h3>
                <span class="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-semibold">Specialist</span>
              </div>
              <p class="text-[11px] text-slate-400">ETech Hardware & Build Assistant</p>
            </div>
          </div>

          <!-- Header Control Buttons -->
          <div class="flex items-center space-x-1">
            <button id="nova-sound-btn" title="Toggle Sound" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
              <svg id="nova-sound-icon-on" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
              <svg id="nova-sound-icon-off" class="w-4 h-4 hidden text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>
            </button>
            <button id="nova-clear-btn" title="Clear Chat" class="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
            <button id="nova-close-modal-btn" title="Minimize" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <!-- Messages Container -->
        <div id="nova-messages-list" class="flex-1 p-4 overflow-y-auto space-y-4 text-xs leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
          <!-- Initial Welcome Message injected via script -->
        </div>

        <!-- Suggestion Chips Bar -->
        <div class="px-3 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center space-x-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-shrink-0" id="nova-chips-bar">
          <button class="nova-chip px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-blue-600/30 hover:border-blue-500/50 border border-slate-700/60 text-slate-200 text-[11px] font-semibold whitespace-nowrap transition-all flex items-center space-x-1 cursor-pointer" data-prompt="Show top gaming laptops">
            <span>💻 Gaming Laptops</span>
          </button>
          <button class="nova-chip px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-blue-600/30 hover:border-blue-500/50 border border-slate-700/60 text-slate-200 text-[11px] font-semibold whitespace-nowrap transition-all flex items-center space-x-1 cursor-pointer" data-prompt="What GPUs are in stock?">
            <span>🎮 GPUs & Components</span>
          </button>
          <button class="nova-chip px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-blue-600/30 hover:border-blue-500/50 border border-slate-700/60 text-slate-200 text-[11px] font-semibold whitespace-nowrap transition-all flex items-center space-x-1 cursor-pointer" data-prompt="Recommend curved OLED monitors">
            <span>🖥️ OLED Monitors</span>
          </button>
          <button class="nova-chip px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-blue-600/30 hover:border-blue-500/50 border border-slate-700/60 text-slate-200 text-[11px] font-semibold whitespace-nowrap transition-all flex items-center space-x-1 cursor-pointer" data-prompt="What is in my shopping cart?">
            <span>🛒 My Cart</span>
          </button>
          <button class="nova-chip px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-blue-600/30 hover:border-blue-500/50 border border-slate-700/60 text-slate-200 text-[11px] font-semibold whitespace-nowrap transition-all flex items-center space-x-1 cursor-pointer" data-prompt="Build a high-end gaming PC">
            <span>⚡ Custom PC Builder</span>
          </button>
        </div>

        <!-- Input Area -->
        <form id="nova-input-form" class="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2 flex-shrink-0">
          <input type="text" id="nova-input-field" placeholder="Ask Nova about laptops, specs, cart..." autocomplete="off" class="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition-colors">
          <button type="submit" id="nova-send-btn" class="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-md transition-all active:scale-95 flex-shrink-0 cursor-pointer">
            <svg class="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </form>

      </div>
    `;

    document.body.appendChild(container);

    setupEventListeners();
    loadSessionHistory();
  }

  // Setup UI Event Handlers
  function setupEventListeners() {
    const toggleBtn = document.getElementById('nova-chat-toggle-btn');
    const closeModalBtn = document.getElementById('nova-close-modal-btn');
    const inputForm = document.getElementById('nova-input-form');
    const clearBtn = document.getElementById('nova-clear-btn');
    const soundBtn = document.getElementById('nova-sound-btn');

    toggleBtn.addEventListener('click', toggleChatWindow);
    closeModalBtn.addEventListener('click', toggleChatWindow);

    clearBtn.addEventListener('click', () => {
      state.history = [];
      sessionStorage.removeItem('nova_chat_history');
      renderWelcomeMessage();
      playSound('send');
    });

    soundBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      document.getElementById('nova-sound-icon-on').classList.toggle('hidden', !state.soundEnabled);
      document.getElementById('nova-sound-icon-off').classList.toggle('hidden', state.soundEnabled);
    });

    inputForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('nova-input-field');
      const query = input.value.trim();
      if (!query || state.isTyping) return;
      input.value = '';
      handleUserSubmit(query);
    });

    // Delegate suggestion chip clicks
    document.getElementById('nova-chips-bar').addEventListener('click', (e) => {
      const chip = e.target.closest('.nova-chip');
      if (chip && !state.isTyping) {
        const prompt = chip.getAttribute('data-prompt');
        handleUserSubmit(prompt);
      }
    });

    // Listen for custom global events
    window.addEventListener('nova-chip-click', (e) => {
      if (e.detail && !state.isTyping) {
        handleUserSubmit(e.detail);
      }
    });

    window.addEventListener('nova-add-to-cart', (e) => {
      const productId = e.detail?.productId;
      if (productId) {
        if (typeof addToCart === 'function') {
          addToCart(productId, 1);
          playSound('cart');
          appendBotMessage(`✅ Added <strong>${getProductTitle(productId)}</strong> to your cart! You can view your cart or proceed to checkout anytime.`);
        }
      }
    });
  }

  function getProductTitle(id) {
    if (typeof products !== 'undefined') {
      const p = products.find(prod => prod.id === parseInt(id));
      if (p) return p.name;
    }
    return 'item';
  }

  function toggleChatWindow() {
    const modal = document.getElementById('nova-chat-modal');
    const iconBot = document.getElementById('nova-icon-bot');
    const iconClose = document.getElementById('nova-icon-close');
    const badge = document.getElementById('nova-unread-badge');

    state.isOpen = !state.isOpen;

    if (state.isOpen) {
      modal.classList.remove('translate-y-6', 'opacity-0', 'pointer-events-none');
      iconBot.classList.add('hidden');
      iconClose.classList.remove('hidden');
      if (badge) badge.classList.add('hidden');
      state.hasUnread = false;
      playSound('open');
      document.getElementById('nova-input-field').focus();
    } else {
      modal.classList.add('translate-y-6', 'opacity-0', 'pointer-events-none');
      iconBot.classList.remove('hidden');
      iconClose.classList.add('hidden');
    }
  }

  // Append user message to UI & history
  function handleUserSubmit(text) {
    appendUserMessage(text);
    playSound('send');
    saveMessageToHistory('user', text);

    showTypingIndicator();

    // Natural processing delay
    setTimeout(() => {
      hideTypingIndicator();
      const botResponse = generateAIResponse(text);
      appendBotMessage(botResponse.html);
      saveMessageToHistory('bot', botResponse.html);
      playSound('receive');
    }, 600 + Math.random() * 400);
  }

  function appendUserMessage(text) {
    const list = document.getElementById('nova-messages-list');
    const msgEl = document.createElement('div');
    msgEl.className = 'flex justify-end';
    msgEl.innerHTML = `
      <div class="max-w-[85%] bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-xs shadow-md space-y-1">
        <p>${escapeHtml(text)}</p>
        <span class="text-[9px] text-blue-200 block text-right">${getCurrentTimeStr()}</span>
      </div>
    `;
    list.appendChild(msgEl);
    scrollToBottom();
  }

  function appendBotMessage(htmlContent) {
    const list = document.getElementById('nova-messages-list');
    const msgEl = document.createElement('div');
    msgEl.className = 'flex items-start space-x-2.5';
    msgEl.innerHTML = `
      <div class="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center flex-shrink-0 shadow-md mt-0.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      </div>
      <div class="max-w-[88%] bg-slate-800/90 border border-slate-700/70 text-slate-100 p-3.5 rounded-2xl rounded-tl-xs shadow-md space-y-2 leading-relaxed">
        ${htmlContent}
        <span class="text-[9px] text-slate-400 block text-left">${getCurrentTimeStr()}</span>
      </div>
    `;
    list.appendChild(msgEl);
    scrollToBottom();
  }

  function showTypingIndicator() {
    state.isTyping = true;
    const list = document.getElementById('nova-messages-list');
    const indicator = document.createElement('div');
    indicator.id = 'nova-typing-indicator';
    indicator.className = 'flex items-start space-x-2.5';
    indicator.innerHTML = `
      <div class="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
        <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
      </div>
      <div class="bg-slate-800/90 border border-slate-700/70 px-4 py-3 rounded-2xl rounded-tl-xs shadow-md flex items-center space-x-1.5">
        <div class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
        <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
        <div class="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
      </div>
    `;
    list.appendChild(indicator);
    scrollToBottom();
  }

  function hideTypingIndicator() {
    state.isTyping = false;
    const indicator = document.getElementById('nova-typing-indicator');
    if (indicator) indicator.remove();
  }

  function scrollToBottom() {
    const list = document.getElementById('nova-messages-list');
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }

  function renderWelcomeMessage() {
    const list = document.getElementById('nova-messages-list');
    list.innerHTML = '';
    appendBotMessage(`
      <p class="font-bold text-white text-xs flex items-center space-x-1.5">
        <span>👋 Welcome to ETech Computers!</span>
      </p>
      <p class="text-slate-300 text-xs">I'm <strong>Nova</strong>, your AI hardware specialist. How can I help you today?</p>
      <div class="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-1.5 text-[11px] text-slate-300">
        <p class="font-semibold text-blue-400 uppercase tracking-wider text-[10px]">What I can do for you:</p>
        <p>• Recommend laptops, GPUs, monitors & peripherals</p>
        <p>• Check specs, compatibility & PSU wattage requirements</p>
        <p>• Inspect your active shopping cart & order details</p>
        <p>• Provide store warranty, shipping & return info</p>
      </div>
    `);
  }

  function saveMessageToHistory(role, content) {
    state.history.push({ role, content, time: getCurrentTimeStr() });
    try {
      sessionStorage.setItem('nova_chat_history', JSON.stringify(state.history));
    } catch (e) {}
  }

  function loadSessionHistory() {
    try {
      const saved = sessionStorage.getItem('nova_chat_history');
      if (saved) {
        state.history = JSON.parse(saved);
        if (state.history.length > 0) {
          const list = document.getElementById('nova-messages-list');
          list.innerHTML = '';
          state.history.forEach(item => {
            if (item.role === 'user') {
              appendUserMessage(item.content);
            } else {
              appendBotMessage(item.content);
            }
          });
          return;
        }
      }
    } catch (e) {}
    renderWelcomeMessage();
  }

  // ================= AI INTENT MATCHING & GENERATOR ENGINE =================
  function generateAIResponse(userText) {
    const query = userText.toLowerCase().trim();
    const allProducts = (typeof products !== 'undefined') ? products : [];

    // 1. Cart Inquiry
    if (query.includes('cart') || query.includes('basket') || query.includes('item in my') || query.includes('total')) {
      return handleCartInquiry();
    }

    // 2. PC Build Advisor / Custom Build
    if (query.includes('build') || query.includes('compatibility') || query.includes('watt') || query.includes('psu requirement') || query.includes('custom pc')) {
      return handlePCBuildAdvice(query, allProducts);
    }

    // 3. Category Queries (Laptops, Monitors, Peripherals, Components, Accessories)
    if (query.includes('laptop') || query.includes('notebook') || query.includes('ultrabook')) {
      return handleCategoryQuery('laptops', allProducts, "Top Performance Laptops & Ultrabooks");
    }
    if (query.includes('monitor') || query.includes('screen') || query.includes('oled') || query.includes('curved') || query.includes('display')) {
      return handleCategoryQuery('monitors', allProducts, "UltraWide & QD-OLED Gaming Monitors");
    }
    if (query.includes('gpu') || query.includes('graphics') || query.includes('rtx') || query.includes('ram') || query.includes('psu') || query.includes('component')) {
      return handleCategoryQuery('components', allProducts, "High-End PC Components & Hardware");
    }
    if (query.includes('keyboard') || query.includes('mouse') || query.includes('headset') || query.includes('peripheral')) {
      return handleCategoryQuery('peripherals', allProducts, "Pro Gaming Peripherals");
    }
    if (query.includes('accessory') || query.includes('dock') || query.includes('stand') || query.includes('webcam')) {
      return handleCategoryQuery('accessories', allProducts, "Essential Tech Accessories");
    }

    // 4. Hot Deals & Bestsellers
    if (query.includes('deal') || query.includes('sale') || query.includes('discount') || query.includes('bestseller') || query.includes('popular') || query.includes('hot')) {
      const deals = allProducts.filter(p => p.badge && p.badge !== "");
      return renderProductRecommendations("🔥 Hot Deals & Bestsellers Available Now:", deals);
    }

    // 5. Cheap / Budget Filter
    if (query.includes('cheap') || query.includes('budget') || query.includes('under') || query.includes('affordable')) {
      let maxBudget = 200;
      const numbers = query.match(/\$?\d+/g);
      if (numbers && numbers.length > 0) {
        maxBudget = parseInt(numbers[0].replace('$', ''));
      }
      const budgetProds = allProducts.filter(p => p.price <= maxBudget);
      if (budgetProds.length > 0) {
        return renderProductRecommendations(`💰 Top Recommended Hardware under $${maxBudget}:`, budgetProds);
      } else {
        const lowest = [...allProducts].sort((a, b) => a.price - b.price).slice(0, 3);
        return renderProductRecommendations(`I couldn't find items strictly under $${maxBudget}, but here are our most affordable top-rated items:`, lowest);
      }
    }

    // 6. Store Customer Support / FAQ
    if (query.includes('ship') || query.includes('delivery') || query.includes('track') || query.includes('arrive')) {
      return {
        html: `
          <p class="font-bold text-white">🚚 Shipping & Delivery Information:</p>
          <p>• <strong>Free Standard Shipping</strong> on all orders over $50 across the country!</p>
          <p>• <strong>Express Delivery:</strong> 1 - 2 business days.</p>
          <p>• <strong>Standard Shipping:</strong> 3 - 5 business days with live tracking.</p>
          <p class="text-blue-400 font-semibold mt-1">Order status updates are available in your Account dashboard.</p>
        `
      };
    }

    if (query.includes('warranty') || query.includes('guarantee') || query.includes('return') || query.includes('refund')) {
      return {
        html: `
          <p class="font-bold text-white">🛡️ Guarantee & Warranty Support:</p>
          <p>• <strong>1-Year Full Store Warranty:</strong> Covers all hardware defects and technical assistance.</p>
          <p>• <strong>Manufacturer Warranty:</strong> Up to 10 years on selected PSUs & GPUs.</p>
          <p>• <strong>30-Day Money-Back Guarantee:</strong> Easy returns for unopened hardware.</p>
        `
      };
    }

    if (query.includes('contact') || query.includes('support') || query.includes('phone') || query.includes('location') || query.includes('store')) {
      return {
        html: `
          <p class="font-bold text-white">📍 ETech Computers Headquarters & Support:</p>
          <p>• <strong>Email Support:</strong> support@etechcomputers.com</p>
          <p>• <strong>Hotline:</strong> +1 (800) 555-ETECH</p>
          <p>• <strong>Hours:</strong> Mon - Sat: 8:00 AM - 8:00 PM EST</p>
        `
      };
    }

    // 7. General Greeting / Identity
    if (query === 'hi' || query === 'hello' || query === 'hey' || query.includes('who are you') || query.includes('help')) {
      return {
        html: `
          <p class="font-bold text-white">Hello! How can I assist you with your tech search today?</p>
          <p>You can ask me to find specific products, compare specs, check your shopping cart, or suggest a custom PC configuration.</p>
        `
      };
    }

    // 8. Keyword Match against product names & descriptions
    const searchMatches = allProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );

    if (searchMatches.length > 0) {
      return renderProductRecommendations(`Here are the matching hardware items I found for "<strong>${escapeHtml(userText)}</strong>":`, searchMatches);
    }

    // 9. Generic Smart Fallback
    return {
      html: `
        <p>I couldn't find exact matches for "<em>${escapeHtml(userText)}</em>", but I can help you find hardware in any of our core categories:</p>
        <div class="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
          <button onclick="window.dispatchEvent(new CustomEvent('nova-chip-click', {detail: 'Show top gaming laptops'}))" class="p-2 bg-slate-900 border border-slate-800 rounded-lg text-left text-blue-400 hover:border-blue-500 font-medium cursor-pointer">💻 Gaming Laptops</button>
          <button onclick="window.dispatchEvent(new CustomEvent('nova-chip-click', {detail: 'What GPUs are in stock?'}))" class="p-2 bg-slate-900 border border-slate-800 rounded-lg text-left text-blue-400 hover:border-blue-500 font-medium cursor-pointer">🎮 RTX GPUs</button>
          <button onclick="window.dispatchEvent(new CustomEvent('nova-chip-click', {detail: 'Recommend curved OLED monitors'}))" class="p-2 bg-slate-900 border border-slate-800 rounded-lg text-left text-blue-400 hover:border-blue-500 font-medium cursor-pointer">🖥️ OLED Monitors</button>
          <button onclick="window.dispatchEvent(new CustomEvent('nova-chip-click', {detail: 'What is in my shopping cart?'}))" class="p-2 bg-slate-900 border border-slate-800 rounded-lg text-left text-blue-400 hover:border-blue-500 font-medium cursor-pointer">🛒 My Cart</button>
        </div>
      `
    };
  }

  // Response Builder Helpers
  function handleCategoryQuery(cat, productsList, title) {
    const items = productsList.filter(p => p.category === cat);
    return renderProductRecommendations(`Here are our featured <strong>${title}</strong>:`, items);
  }

  function handleCartInquiry() {
    let cart = [];
    if (typeof getCart === 'function') {
      cart = getCart();
    } else {
      const saved = localStorage.getItem('etech_cart');
      if (saved) cart = JSON.parse(saved);
    }

    if (cart.length === 0) {
      return {
        html: `
          <div class="space-y-2">
            <p class="font-bold text-white flex items-center space-x-1">
              <span>🛒 Shopping Cart is Empty</span>
            </p>
            <p class="text-slate-300">You haven't added any hardware items to your cart yet.</p>
            <a href="${getPathPrefix()}index.html#shop" class="inline-block px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg transition-colors">Browse Hardware Catalog</a>
          </div>
        `
      };
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const itemsHtml = cart.map(item => `
      <div class="flex items-center justify-between bg-slate-900/90 p-2 rounded-xl border border-slate-800 text-[11px]">
        <div class="flex items-center space-x-2 truncate">
          <img src="${item.image}" alt="${item.name}" class="w-8 h-8 object-cover rounded-md flex-shrink-0 bg-slate-950">
          <div class="truncate">
            <p class="font-bold text-white truncate max-w-[140px]">${item.name}</p>
            <p class="text-[10px] text-slate-400">Qty: ${item.quantity} × $${item.price}</p>
          </div>
        </div>
        <span class="font-black text-blue-400 ml-2">$${(item.price * item.quantity).toLocaleString()}</span>
      </div>
    `).join('');

    return {
      html: `
        <div class="space-y-2.5">
          <div class="flex items-center justify-between border-b border-slate-700/80 pb-2">
            <span class="font-bold text-white">🛒 Your Active Cart (${cart.length} item${cart.length > 1 ? 's' : ''})</span>
            <span class="font-black text-emerald-400 text-sm">$${total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
          <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            ${itemsHtml}
          </div>
          <div class="pt-1 flex space-x-2">
            <a href="${getPathPrefix()}index.html#cart" class="flex-1 text-center py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-[11px] border border-slate-700 transition-colors">View Cart</a>
            <a href="${getPathPrefix()}index.html#checkout" class="flex-1 text-center py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-[11px] shadow-md transition-all">Proceed to Checkout</a>
          </div>
        </div>
      `
    };
  }

  function handlePCBuildAdvice(query, allProducts) {
    const rtx4090 = allProducts.find(p => p.id === 1 || p.name.includes('4090'));
    const rtx4080 = allProducts.find(p => p.id === 7 || p.name.includes('4080'));
    const ram = allProducts.find(p => p.id === 8);
    const psu = allProducts.find(p => p.id === 9);

    return {
      html: `
        <div class="space-y-2.5">
          <p class="font-bold text-white">⚡ Ultimate PC Build & Component Specs Advice:</p>
          <p class="text-slate-300">For enthusiast gaming & workstation builds, here are key recommended pairings:</p>
          
          <div class="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1 text-[11px]">
            <p class="font-semibold text-blue-400">💡 Power & RAM Requirements:</p>
            <p>• <strong>RTX 4090 / 4080 Super GPUs:</strong> Recommend minimum <strong>850W - 1000W ATX 3.0 Modular PSU</strong> for clean transient spike handling.</p>
            <p>• <strong>DDR5 Gaming RAM:</strong> 6000MHz CL30 RAM is the sweet spot for Intel 14th Gen & AMD Ryzen 7000/9000 Series.</p>
          </div>

          <p class="font-semibold text-white text-[11px] uppercase tracking-wider mt-1">Recommended Components In Store:</p>

          ${rtx4080 ? renderSingleMiniCard(rtx4080) : ''}
          ${ram ? renderSingleMiniCard(ram) : ''}
          ${psu ? renderSingleMiniCard(psu) : ''}
        </div>
      `
    };
  }

  function renderProductRecommendations(introText, items) {
    if (!items || items.length === 0) {
      return {
        html: `<p>${introText}</p><p class="text-slate-400">No hardware found matching this criteria.</p>`
      };
    }

    const cardsHtml = items.slice(0, 3).map(product => renderSingleMiniCard(product)).join('');

    return {
      html: `
        <div class="space-y-2.5">
          <p class="font-semibold text-white">${introText}</p>
          <div class="space-y-2">
            ${cardsHtml}
          </div>
          ${items.length > 3 ? `<p class="text-[10px] text-slate-400 text-center">+ ${items.length - 3} more products available in <a href="${getPathPrefix()}index.html#shop" class="text-blue-400 hover:underline font-semibold">Catalog</a></p>` : ''}
        </div>
      `
    };
  }

  function renderSingleMiniCard(product) {
    return `
      <div class="bg-slate-900/95 border border-slate-800 hover:border-slate-700 p-2.5 rounded-2xl flex items-center justify-between space-x-3 transition-colors shadow-sm">
        <img src="${product.image}" alt="${product.name}" class="w-12 h-12 object-cover rounded-xl bg-slate-950 flex-shrink-0">
        <div class="min-w-0 flex-1">
          <div class="flex items-center space-x-1">
            <span class="text-[9px] font-extrabold uppercase text-blue-400">${product.category}</span>
            ${product.badge ? `<span class="bg-blue-600/30 text-blue-300 text-[8px] font-bold px-1.5 py-0.2 rounded">${product.badge}</span>` : ''}
          </div>
          <h4 class="text-xs font-bold text-white truncate">${product.name}</h4>
          <p class="text-xs font-black text-emerald-400">$${product.price} <span class="text-[10px] text-slate-400 line-through font-normal">$${product.originalPrice}</span></p>
        </div>
        <button onclick="window.dispatchEvent(new CustomEvent('nova-add-to-cart', {detail: {productId: ${product.id}}}))" class="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-xl shadow transition-all active:scale-95 flex items-center space-x-1 flex-shrink-0 cursor-pointer">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          <span>Add</span>
        </button>
      </div>
    `;
  }

  // Utilities
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getCurrentTimeStr() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbotUI);
  } else {
    initChatbotUI();
  }

})();
