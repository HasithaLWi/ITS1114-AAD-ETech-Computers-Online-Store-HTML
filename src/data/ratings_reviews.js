// ============================================================
//  src/data/ratings_reviews.js — Central Customer Reviews & Ratings Dataset
// ============================================================

export const DEFAULT_REVIEWS = [
  {
    id: 'REV-10001',
    productId: 1,
    userId: 'USR-100001',
    userName: 'System Admin',
    userEmail: 'admin@etech.com',
    rating: 5,
    comment: 'Exceptional build quality and thermal management. The 240Hz Mini-LED display is breathtaking for rendering and competitive gaming. Easily the best hardware in this segment.',
    createdAt: '2026-02-10T10:30:00.000Z',
    updatedAt: '2026-02-10T10:30:00.000Z'
  },
  {
    id: 'REV-10002',
    productId: 1,
    userId: 'USR-100002',
    userName: 'Galle Operations Staff',
    userEmail: 'staff@etech.com',
    rating: 5,
    comment: 'Benchmarked the RTX 4070 Super with Cyberpunk 2077 with full ray tracing at native 1440p. Consistent 110+ FPS with whisper-quiet fans. Highly recommended!',
    createdAt: '2026-02-12T14:15:00.000Z',
    updatedAt: '2026-02-12T14:15:00.000Z'
  },
  {
    id: 'REV-10003',
    productId: 2,
    userId: 'USR-100001',
    userName: 'System Admin',
    userEmail: 'admin@etech.com',
    rating: 5,
    comment: 'Solid performance across multi-threaded applications and gaming. Overclocks nicely on a standard 360mm AIO cooler.',
    createdAt: '2026-02-14T09:00:00.000Z',
    updatedAt: '2026-02-14T09:00:00.000Z'
  },
  {
    id: 'REV-10004',
    productId: 3,
    userId: 'USR-100002',
    userName: 'Galle Operations Staff',
    userEmail: 'staff@etech.com',
    rating: 5,
    comment: 'Flawless XMP 3.0 profile activation on first boot. Latency is ultra tight for DDR5.',
    createdAt: '2026-02-15T11:45:00.000Z',
    updatedAt: '2026-02-15T11:45:00.000Z'
  },
  {
    id: 'REV-10005',
    productId: 4,
    userId: 'USR-100001',
    userName: 'System Admin',
    userEmail: 'admin@etech.com',
    rating: 5,
    comment: 'Blazing fast sequential and random reads. DirectStorage games load in under 2 seconds.',
    createdAt: '2026-02-16T16:20:00.000Z',
    updatedAt: '2026-02-16T16:20:00.000Z'
  },
  {
    id: 'REV-10006',
    productId: 5,
    userId: 'USR-100002',
    userName: 'Galle Operations Staff',
    userEmail: 'staff@etech.com',
    rating: 5,
    comment: 'Impeccable color grading display and keyboard feel. Battery lasts throughout the entire workday.',
    createdAt: '2026-02-17T08:10:00.000Z',
    updatedAt: '2026-02-17T08:10:00.000Z'
  }
];

export const DEFAULT_RATINGS = [
  { productId: 1, userId: 'USR-100001', rating: 5 },
  { productId: 1, userId: 'USR-100002', rating: 5 },
  { productId: 2, userId: 'USR-100001', rating: 5 },
  { productId: 3, userId: 'USR-100002', rating: 5 },
  { productId: 4, userId: 'USR-100001', rating: 5 },
  { productId: 5, userId: 'USR-100002', rating: 5 }
];

export const defaultReviews = DEFAULT_REVIEWS;
export const defaultRatings = DEFAULT_RATINGS;
