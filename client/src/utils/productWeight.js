/** @param {unknown} grams */
export function formatProductWeightGrams(grams) {
  const n = Number(grams);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n >= 1000) {
    const kg = n / 1000;
    const rounded = Math.round(kg * 100) / 100;
    return `${rounded} kg`;
  }
  return `${Math.round(n)} g`;
}
