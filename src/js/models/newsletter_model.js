// ============================================================
//  src/js/models/newsletter_model.js — Newsletter & Marketing Models
// ============================================================

export const NEWSLETTER_STATUS = Object.freeze({
  SUBSCRIBED: 'SUBSCRIBED',
  UNSUBSCRIBED: 'UNSUBSCRIBED'
});

export const NEWSLETTER_SOURCE = Object.freeze({
  STOREFRONT_BANNER: 'STOREFRONT_BANNER',
  DEALS_PAGE: 'DEALS_PAGE',
  CHECKOUT: 'CHECKOUT',
  MANUAL: 'MANUAL',
  ACCOUNT: 'ACCOUNT'
});

export const LOCAL_STORAGE_NEWSLETTER_SUBSCRIBERS = 'etech_newsletter_subscribers';
export const LOCAL_STORAGE_NEWSLETTER_CAMPAIGNS = 'etech_newsletter_campaigns';

/**
 * Subscriber Data Entity Class
 */
export class Subscriber {
  constructor({
    id = null,
    email = '',
    name = '',
    status = NEWSLETTER_STATUS.SUBSCRIBED,
    source = NEWSLETTER_SOURCE.STOREFRONT_BANNER,
    tags = ['General', 'Hardware Deals'],
    subscribedAt = new Date().toISOString(),
    unsubscribedAt = null,
    lastCampaignSentAt = null,
    ipAddress = '192.168.1.1',
    preferences = { deals: true, newArrivals: true, techGuides: true }
  } = {}) {
    this.id = id || Date.now() + Math.floor(Math.random() * 1000);
    this.email = (email || '').trim().toLowerCase();
    this.name = (name || '').trim();
    this.status = status;
    this.source = source;
    this.tags = Array.isArray(tags) ? tags : ['General'];
    this.subscribedAt = subscribedAt;
    this.unsubscribedAt = unsubscribedAt;
    this.lastCampaignSentAt = lastCampaignSentAt;
    this.ipAddress = ipAddress;
    this.preferences = preferences;
  }
}

/**
 * Email validation regex helper
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim().toLowerCase());
}

/**
 * Default Seed Subscribers
 */
const DEFAULT_SUBSCRIBERS = [
  {
    id: 1001,
    email: 'kasun.perera@gmail.com',
    name: 'Kasun Perera',
    status: NEWSLETTER_STATUS.SUBSCRIBED,
    source: NEWSLETTER_SOURCE.STOREFRONT_BANNER,
    tags: ['VIP Gamer', 'NVIDIA GPU Alerts'],
    subscribedAt: '2026-08-10T09:15:00.000Z',
    lastCampaignSentAt: '2026-08-25T14:30:00.000Z'
  },
  {
    id: 1002,
    email: 'dinuka.fernando@techlk.com',
    name: 'Dinuka Fernando',
    status: NEWSLETTER_STATUS.SUBSCRIBED,
    source: NEWSLETTER_SOURCE.DEALS_PAGE,
    tags: ['Workstations', 'Intel Core Ultra'],
    subscribedAt: '2026-08-12T11:20:00.000Z',
    lastCampaignSentAt: '2026-08-25T14:30:00.000Z'
  },
  {
    id: 1003,
    email: 'sachith.gamage@yahoo.com',
    name: 'Sachith Gamage',
    status: NEWSLETTER_STATUS.SUBSCRIBED,
    source: NEWSLETTER_SOURCE.CHECKOUT,
    tags: ['Laptops', 'ROG Strix'],
    subscribedAt: '2026-08-15T16:45:00.000Z',
    lastCampaignSentAt: '2026-08-25T14:30:00.000Z'
  },
  {
    id: 1004,
    email: 'nadeesha.jayawardena@outlook.com',
    name: 'Nadeesha Jayawardena',
    status: NEWSLETTER_STATUS.SUBSCRIBED,
    source: NEWSLETTER_SOURCE.STOREFRONT_BANNER,
    tags: ['Mechanical Keyboards', 'Peripherals'],
    subscribedAt: '2026-08-18T10:05:00.000Z',
    lastCampaignSentAt: '2026-08-25T14:30:00.000Z'
  },
  {
    id: 1005,
    email: 'roshan.wickramasinghe@etech.lk',
    name: 'Roshan Wickramasinghe',
    status: NEWSLETTER_STATUS.SUBSCRIBED,
    source: NEWSLETTER_SOURCE.MANUAL,
    tags: ['Corporate Hardware', 'Bulk Orders'],
    subscribedAt: '2026-08-20T14:00:00.000Z',
    lastCampaignSentAt: '2026-08-25T14:30:00.000Z'
  },
  {
    id: 1006,
    email: 'tharindu.alwis@gmail.com',
    name: 'Tharindu Alwis',
    status: NEWSLETTER_STATUS.UNSUBSCRIBED,
    source: NEWSLETTER_SOURCE.STOREFRONT_BANNER,
    tags: ['General'],
    subscribedAt: '2026-07-28T08:30:00.000Z',
    unsubscribedAt: '2026-08-22T12:10:00.000Z',
    lastCampaignSentAt: '2026-08-15T14:30:00.000Z'
  },
  {
    id: 1007,
    email: 'chamari.athapaththu@live.com',
    name: 'Chamari Athapaththu',
    status: NEWSLETTER_STATUS.SUBSCRIBED,
    source: NEWSLETTER_SOURCE.DEALS_PAGE,
    tags: ['Flash Deals', 'Gaming Monitors'],
    subscribedAt: '2026-08-22T17:15:00.000Z',
    lastCampaignSentAt: '2026-08-25T14:30:00.000Z'
  },
  {
    id: 1008,
    email: 'kavinda.silva@coder.lk',
    name: 'Kavinda Silva',
    status: NEWSLETTER_STATUS.SUBSCRIBED,
    source: NEWSLETTER_SOURCE.ACCOUNT,
    tags: ['Custom Workstation', 'DDR5 RAM'],
    subscribedAt: '2026-08-24T13:40:00.000Z',
    lastCampaignSentAt: '2026-08-25T14:30:00.000Z'
  },
  {
    id: 1009,
    email: 'anuradha.jayasinghe@gmail.com',
    name: 'Anuradha Jayasinghe',
    status: NEWSLETTER_STATUS.SUBSCRIBED,
    source: NEWSLETTER_SOURCE.STOREFRONT_BANNER,
    tags: ['Liquid Coolers', 'NZXT Kraken'],
    subscribedAt: '2026-08-26T09:25:00.000Z',
    lastCampaignSentAt: null
  },
  {
    id: 1010,
    email: 'malsha.senanayake@hotmail.com',
    name: 'Malsha Senanayake',
    status: NEWSLETTER_STATUS.SUBSCRIBED,
    source: NEWSLETTER_SOURCE.DEALS_PAGE,
    tags: ['Audio Gear', 'Headsets'],
    subscribedAt: '2026-08-28T15:50:00.000Z',
    lastCampaignSentAt: null
  }
];

/**
 * Default Seed Marketing Campaigns
 */
const DEFAULT_CAMPAIGNS = [
  {
    id: 'camp_20260825_01',
    subject: '🔥 Weekend Flash Deals: Up to 45% OFF RTX 40-Series & Gaming Rigs',
    preheader: 'Exclusive VIP member discounts on cutting-edge hardware valid this weekend only.',
    category: 'FLASH_DEALS',
    targetSegment: 'ALL_ACTIVE',
    sentAt: '2026-08-25T14:30:00.000Z',
    recipientsCount: 9,
    status: 'DELIVERED',
    openRate: 64.2,
    clickRate: 31.8,
    authorName: 'Admin Team'
  },
  {
    id: 'camp_20260815_01',
    subject: '🚀 Intel Core Ultra & DDR5 Titanium Memory Now Available at ETech',
    preheader: 'Upgrade your workstation with next-generation high performance components.',
    category: 'NEW_ARRIVALS',
    targetSegment: 'ALL_ACTIVE',
    sentAt: '2026-08-15T10:00:00.000Z',
    recipientsCount: 7,
    status: 'DELIVERED',
    openRate: 58.4,
    clickRate: 24.1,
    authorName: 'Staff Editor'
  }
];

/**
 * Retrieve all subscribers from localStorage with fallback to default seed
 */
export function getNewsletterSubscribers() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_NEWSLETTER_SUBSCRIBERS);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_NEWSLETTER_SUBSCRIBERS, JSON.stringify(DEFAULT_SUBSCRIBERS));
      return DEFAULT_SUBSCRIBERS.map(s => new Subscriber(s));
    }
    const parsed = JSON.parse(raw);
    return parsed.map(s => new Subscriber(s));
  } catch (err) {
    console.error('[NewsletterModel] Error reading subscribers:', err);
    return DEFAULT_SUBSCRIBERS.map(s => new Subscriber(s));
  }
}

/**
 * Save subscribers to localStorage
 */
export function saveNewsletterSubscribers(subscribers) {
  try {
    localStorage.setItem(LOCAL_STORAGE_NEWSLETTER_SUBSCRIBERS, JSON.stringify(subscribers));
    return true;
  } catch (err) {
    console.error('[NewsletterModel] Error saving subscribers:', err);
    return false;
  }
}

/**
 * Retrieve all campaign broadcasts
 */
export function getNewsletterCampaigns() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_NEWSLETTER_CAMPAIGNS);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_NEWSLETTER_CAMPAIGNS, JSON.stringify(DEFAULT_CAMPAIGNS));
      return DEFAULT_CAMPAIGNS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('[NewsletterModel] Error reading campaigns:', err);
    return DEFAULT_CAMPAIGNS;
  }
}

/**
 * Save campaigns to localStorage
 */
export function saveNewsletterCampaigns(campaigns) {
  try {
    localStorage.setItem(LOCAL_STORAGE_NEWSLETTER_CAMPAIGNS, JSON.stringify(campaigns));
    return true;
  } catch (err) {
    console.error('[NewsletterModel] Error saving campaigns:', err);
    return false;
  }
}

/**
 * Calculate comprehensive analytics and KPI metrics
 */
export function getNewsletterAnalytics() {
  const subscribers = getNewsletterSubscribers();
  const campaigns = getNewsletterCampaigns();

  const totalSubscribers = subscribers.length;
  const activeSubscribers = subscribers.filter(s => s.status === NEWSLETTER_STATUS.SUBSCRIBED).length;
  const unsubscribedCount = subscribers.filter(s => s.status === NEWSLETTER_STATUS.UNSUBSCRIBED).length;

  const totalCampaigns = campaigns.length;
  const totalEmailsDelivered = campaigns.reduce((sum, c) => sum + (c.recipientsCount || 0), 0);
  const avgOpenRate = campaigns.length > 0 
    ? (campaigns.reduce((sum, c) => sum + (c.openRate || 0), 0) / campaigns.length).toFixed(1)
    : '0.0';

  const sourceCounts = {
    [NEWSLETTER_SOURCE.STOREFRONT_BANNER]: 0,
    [NEWSLETTER_SOURCE.DEALS_PAGE]: 0,
    [NEWSLETTER_SOURCE.CHECKOUT]: 0,
    [NEWSLETTER_SOURCE.ACCOUNT]: 0,
    [NEWSLETTER_SOURCE.MANUAL]: 0
  };

  subscribers.forEach(s => {
    if (sourceCounts[s.source] !== undefined) {
      sourceCounts[s.source]++;
    }
  });

  return {
    totalSubscribers,
    activeSubscribers,
    unsubscribedCount,
    activeRate: totalSubscribers > 0 ? ((activeSubscribers / totalSubscribers) * 100).toFixed(1) : '0.0',
    totalCampaigns,
    totalEmailsDelivered,
    avgOpenRate,
    sourceCounts
  };
}
