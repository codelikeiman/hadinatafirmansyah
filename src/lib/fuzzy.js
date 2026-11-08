/**
 * Fuzzy subsequence scorer kecil: huruf berurutan & awal kata dapat bonus.
 * return { score, hits } atau null bila tidak cocok.
 */
export function fuzzyScore(needle, text) {
  if (!needle) return { score: 0, hits: [] };
  if (!text) return null;
  const t = text.toLowerCase();
  const direct = t.indexOf(needle);
  if (direct >= 0) {
    return { score: 100 - direct + needle.length * 4, hits: Array.from({ length: needle.length }, (_, i) => direct + i) };
  }
  let qi = 0, score = 0, prev = -2;
  const hits = [];
  for (let i = 0; i < t.length && qi < needle.length; i++) {
    if (t[i] !== needle[qi]) continue;
    const boundary = i === 0 || " /-_.".includes(t[i - 1]);
    score += (i === prev + 1 ? 4 : 1) + (boundary ? 3 : 0);
    hits.push(i);
    prev = i;
    qi++;
  }
  return qi === needle.length ? { score, hits } : null;
}
