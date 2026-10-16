/* eslint-disable */
// @ts-nocheck
/*
 * Python course progress, kept in this browser only.
 *
 * Cookie `ft_py` (Path=/python, 1 year, SameSite=Lax, Secure on https, < 4 KB):
 *   v=1 & d=<learned lessons, bitmask> & b=<labs tried, bitmask> & l=<lesson>.<step>
 *   & m=<l|n: Interactive or Full notes> & g=<Appendix B ticks, bitmask>
 *   & t=<last visit, YYYYMMDD> & a=<study log: bit i = studied i days before t, 30 days>
 * localStorage `ft_python_brand_v1` keeps the full detail (step reached per lesson,
 * dated study log). Both are merged on load, so either one alone restores progress.
 */
export const LS_KEY = 'ft_python_brand_v1';
const COOKIE = 'ft_py';
const MAX_AGE = 60 * 60 * 24 * 365;
const LOG_DAYS = 30;

const dayKey = d => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
const fromKey = k => new Date(+k.slice(0, 4), +k.slice(4, 6) - 1, +k.slice(6, 8));
const daysBetween = (a, b) => Math.round((fromKey(b) - fromKey(a)) / 864e5);
const addDays = (k, n) => { const d = fromKey(k); d.setDate(d.getDate() + n); return dayKey(d); };

const toMask = nums => nums.reduce((m, n) => m + 2 ** n, 0).toString(36);
const fromMask = s => { const out = []; let m = parseInt(s || '0', 36) || 0; for (let i = 0; m > 0; i++, m = Math.floor(m / 2)) if (m % 2) out.push(i); return out; };

function readCookie(){
  const hit = document.cookie.split('; ').find(c => c.startsWith(COOKIE + '='));
  if (!hit) return null;
  try { return Object.fromEntries(new URLSearchParams(decodeURIComponent(hit.slice(COOKIE.length + 1)))); } catch(e){ return null; }
}
function writeCookie(value, maxAge){
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE}=${encodeURIComponent(value)}; Path=/python; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function createProgress(gapKeys){
  let S = {done:{}, seen:{}, last:null, step:0, mode:'learn', gaps:{}, labs:{}, log:{}};
  let hadLocal = false;
  try { const raw = localStorage.getItem(LS_KEY); if (raw) { S = Object.assign(S, JSON.parse(raw)); hadLocal = true; } } catch(e){}
  for (const k of ['done','seen','gaps','labs','log']) if (!S[k] || typeof S[k] !== 'object') S[k] = {};

  // Merge the cookie in: union of learned, labs, ticks and study days; the cookie's
  // last lesson wins when it is the newer visit.
  const c = readCookie();
  if (c && c.v === '1'){
    fromMask(c.d).forEach(n => S.done[n] = true);
    fromMask(c.b).forEach(n => S.labs[n] = true);
    fromMask(c.g).forEach(i => { if (gapKeys[i]) S.gaps[gapKeys[i]] = true; });
    if (/^\d{8}$/.test(c.t || '')) fromMask(c.a).forEach(i => S.log[addDays(c.t, -i)] = true);
    const [ln, st] = String(c.l || '').split('.').map(Number);
    const lsLast = Object.keys(S.log).sort().pop() || '';
    if (ln && (!S.last || (c.t || '') >= lsLast)) { S.last = ln; S.step = st || 0; S.mode = c.m === 'n' ? 'notes' : 'learn'; }
    if (ln) S.seen[ln] = Math.max(S.seen[ln] || 0, st || 0);
  }

  const save = () => {
    const today = dayKey(new Date());
    // keep the dated log short
    for (const k of Object.keys(S.log)) if (daysBetween(k, today) >= 400) delete S.log[k];
    try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch(e){}
    const nums = o => Object.keys(o).filter(k => o[k]).map(Number).filter(n => n > 0 && n < 53);
    const recent = Object.keys(S.log).map(k => daysBetween(k, today)).filter(i => i >= 0 && i < LOG_DAYS);
    const q = new URLSearchParams({
      v: '1', d: toMask(nums(S.done)), b: toMask(nums(S.labs)),
      l: S.last ? `${S.last}.${S.step || 0}` : '', m: S.mode === 'notes' ? 'n' : 'l',
      g: toMask(gapKeys.map((k, i) => S.gaps[k] ? i : -1).filter(i => i >= 0)),
      t: today, a: toMask(recent),
    });
    writeCookie(q.toString(), MAX_AGE);
  };

  /** Counts today as a study day. */
  const logToday = () => { const k = dayKey(new Date()); if (!S.log[k]) { S.log[k] = true; save(); } };

  const activity = () => {
    const today = dayKey(new Date());
    let streak = 0, k = S.log[today] ? today : addDays(today, -1);
    while (S.log[k]) { streak++; k = addDays(k, -1); }
    const month = today.slice(0, 6);
    return {
      streak,
      monthDays: Object.keys(S.log).filter(d => d.startsWith(month)).length,
      learned: Object.keys(S.done).filter(n => S.done[n]).length,
      labs: Object.keys(S.labs).filter(n => S.labs[n]).length,
    };
  };

  const reset = () => {
    try { localStorage.removeItem(LS_KEY); } catch(e){}
    writeCookie('', 0);
    S = {done:{}, seen:{}, last:null, step:0, mode:'learn', gaps:{}, labs:{}, log:{}};
  };

  // Bring both copies back in step (e.g. the cookie was cleared but storage was not).
  if (hadLocal || c) save();

  return { get S(){ return S; }, save, logToday, activity, reset };
}
