/**
 * Dual-thumb price range bar. `lo`/`hi` are catalog bounds; `minVal`/`maxVal` are the active filter.
 */
export default function ShopPriceRangeBar({ lo, hi, minVal, maxVal, onRangeChange }) {
  const span = Math.max(1, hi - lo);
  const lowPct = ((minVal - lo) / span) * 100;
  const highPct = ((maxVal - lo) / span) * 100;
  const left = Math.min(lowPct, highPct);
  const width = Math.abs(highPct - lowPct);

  function clamp(n, a, b) {
    return Math.min(Math.max(n, a), b);
  }

  function setLow(raw) {
    let v = Math.round(Number(raw));
    v = clamp(v, lo, hi);
    if (v > maxVal) onRangeChange(maxVal, maxVal);
    else onRangeChange(v, maxVal);
  }

  function setHigh(raw) {
    let v = Math.round(Number(raw));
    v = clamp(v, lo, hi);
    if (v < minVal) onRangeChange(minVal, minVal);
    else onRangeChange(minVal, v);
  }

  return (
    <div className="space-y-3 pt-1">
      <div className="relative mx-0.5 h-9">
        <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-(--brown)/35" />
        <div
          className="pointer-events-none absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-(--gold)/70"
          style={{ left: `${left}%`, width: `${width}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={lo}
          max={hi}
          step={1}
          value={minVal}
          onChange={(e) => setLow(e.target.value)}
          className="shop-range-input absolute inset-x-0 top-0 z-10 h-9 w-full cursor-pointer appearance-none bg-transparent"
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={lo}
          max={hi}
          step={1}
          value={maxVal}
          onChange={(e) => setHigh(e.target.value)}
          className="shop-range-input absolute inset-x-0 top-0 z-20 h-9 w-full cursor-pointer appearance-none bg-transparent"
        />
      </div>
      <div className="flex items-center justify-between gap-2 text-xs tabular-nums text-(--gray-light)">
        <span className="rounded-md border border-(--brown)/40 bg-(--card) px-2 py-1 text-(--cream)">
          {minVal}
        </span>
        <span className="text-(--oat)">—</span>
        <span className="rounded-md border border-(--brown)/40 bg-(--card) px-2 py-1 text-(--cream)">
          {maxVal}
        </span>
      </div>
    </div>
  );
}
