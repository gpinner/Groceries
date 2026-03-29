/**
 * Recommendation engine for the grocery add panel.
 *
 * Data shape per tracked product:
 *   { name, category, addCount, lastAdded, firstAdded }
 *
 * Rules:
 *  - Items added THIS session are excluded (still on your list)
 *  - Items added < 3 days ago are suppressed (probably still on your list)
 *  - Sweet spot for "needs replenishing": 7-14 days since last add
 *  - Frequency (how often you buy it) boosts the score on a log scale
 *  - Popular defaults fill any gap up to POOL_SIZE = 30
 *  - Top VISIBLE_SIZE = 10 from the scored pool are returned
 */

// Stamped once when the JS module is first loaded — used to exclude
// anything added during the current browsing session.
export const SESSION_START = Date.now();

const POOL_SIZE    = 30;
const VISIBLE_SIZE = 10;
const MIN_DAYS     = 3; // suppress anything added more recently than this

/**
 * Returns a numeric score or null.
 * null  → exclude from pool entirely (added this session)
 * 0     → in pool but ranked last (too recent to recommend)
 * >0    → ranked by score
 */
function scoreProduct(product, now) {
  const days = (now - product.lastAdded) / 86_400_000;

  // Added during the current session → never recommend (already on list)
  if (product.lastAdded >= SESSION_START) return null;

  // Frequency score: log₂ scale, 0–20 pts (caps at ~20 adds)
  const freq = Math.min(Math.log2(product.addCount + 1), 4) * 5;

  // Recency score: rewards items in the "probably needs replenishing" window
  //   < 3 days  → 0    (too soon)
  //   3–7 days  → 0–8  (ramping up)
  //   7–14 days → 10   (peak — weekly shop sweet spot)
  //  14–30 days → 6–10 (fading — still likely needed)
  //  30–90 days → 4    (monthly items, cleaning supplies, etc.)
  //   > 90 days → 1–4  (slow decay; old habits still worth surfacing)
  let recency;
  if (days < MIN_DAYS) {
    recency = 0;
  } else if (days < 7) {
    recency = ((days - MIN_DAYS) / (7 - MIN_DAYS)) * 8;
  } else if (days < 14) {
    recency = 10;
  } else if (days < 30) {
    recency = 10 - ((days - 14) / 16) * 4; // 10 → 6
  } else if (days < 90) {
    recency = 4;
  } else {
    recency = Math.max(1, 4 - (days - 90) / 120);
  }

  // Very first purchase of an item (addCount === 1 and no repeat history)
  // gets a small extra nudge so it surfaces once before being confirmed habit
  const noveltyBonus = product.addCount === 1 ? 2 : 0;

  return freq + recency + noveltyBonus;
}

/**
 * Build a ranked list of up to VISIBLE_SIZE recommendations.
 *
 * @param {Array} trackedProducts  – user's full product history
 * @param {Array} popularProducts  – global default products (seed data)
 * @returns {Array}                – up to 10 { name, category, isPersonal }
 */
export function getRecommendations(trackedProducts, popularProducts) {
  const now = Date.now();

  // Score personal history, drop current-session items
  const scored = trackedProducts
    .map(p => ({ ...p, score: scoreProduct(p, now), isPersonal: true }))
    .filter(p => p.score !== null)
    .sort((a, b) => b.score - a.score);

  // Build pool up to POOL_SIZE, padding with popular defaults
  const pool   = [...scored];
  const inPool = new Set(pool.map(p => p.name.toLowerCase()));

  for (const p of popularProducts) {
    if (pool.length >= POOL_SIZE) break;
    if (!inPool.has(p.name.toLowerCase())) {
      // Popular defaults get a baseline score of 2 (below any real history)
      pool.push({ ...p, addCount: 0, lastAdded: 0, score: 2, isPersonal: false });
      inPool.add(p.name.toLowerCase());
    }
  }

  return pool.slice(0, VISIBLE_SIZE);
}
