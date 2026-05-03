// Map a CEFR level (e.g. "Intermediate (B1)" or "B1") to its band ("B1/B2").
// Used wherever a Gemini prompt needs to target the right vocabulary range.
export function levelBandFor(userLevel) {
  const base = (userLevel || 'B1').split(' ')[0];
  const map = {
    A1: 'A1/A2', A2: 'A1/A2',
    B1: 'B1/B2', B2: 'B1/B2',
    C1: 'C1/C2', C2: 'C1/C2',
  };
  return map[base] || 'B1/B2';
}
