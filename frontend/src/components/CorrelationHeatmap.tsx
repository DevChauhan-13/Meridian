import React, { useState } from 'react';

interface CorrelationHeatmapProps {
  tickers: string[];
  cov: Record<string, Record<string, number>>;
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ tickers, cov }) => {
  const [hoveredCell, setHoveredCell] = useState<{
    row: string;
    col: string;
    val: number;
  } | null>(null);

  if (!tickers || tickers.length === 0 || !cov) {
    return null;
  }

  // Calculate correlation matrix from covariance
  const getCorrelation = (t1: string, t2: string): number => {
    try {
      const var1 = cov[t1]?.[t1] || 1;
      const var2 = cov[t2]?.[t2] || 1;
      const c12 = cov[t1]?.[t2] ?? cov[t2]?.[t1] ?? 0;
      const denom = Math.sqrt(var1 * var2);
      if (denom === 0) return 0;
      const r = c12 / denom;
      return Math.max(-1, Math.min(1, r));
    } catch {
      return 0;
    }
  };

  const getCellBg = (r: number) => {
    if (r >= 0) {
      // Electric indigo wash
      return `rgba(83, 58, 253, ${Math.pow(r, 0.75) * 0.85})`;
    } else {
      // Ruby red wash
      return `rgba(234, 34, 97, ${Math.pow(Math.abs(r), 0.75) * 0.85})`;
    }
  };

  const getTextColor = (r: number) => {
    return Math.abs(r) > 0.45 ? '#ffffff' : 'var(--color-ink)';
  };

  return (
    <div className="card-feature-light">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 className="heading-sm" style={{ color: 'var(--color-ink)', marginBottom: '4px' }}>
            Pairwise Correlation Matrix
          </h3>
          <p className="caption" style={{ color: 'var(--color-ink-mute)' }}>
            Empirical return correlation derived from annualized covariance matrix.
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                backgroundColor: 'rgba(234, 34, 97, 0.7)',
              }}
            />
            <span className="caption" style={{ color: 'var(--color-ink-mute)' }}>
              -1.0 (Negative)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                backgroundColor: 'rgba(83, 58, 253, 0.7)',
              }}
            />
            <span className="caption" style={{ color: 'var(--color-ink-mute)' }}>
              +1.0 (Positive)
            </span>
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
        <table style={{ borderCollapse: 'collapse', margin: '0 auto', fontSize: '12px' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px 12px' }}></th>
              {tickers.map((t) => (
                <th
                  key={t}
                  className="micro-cap"
                  style={{
                    padding: '8px 12px',
                    color: 'var(--color-ink)',
                    textAlign: 'center',
                    fontWeight: 600,
                  }}
                >
                  {t.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickers.map((rowTicker) => (
              <tr key={rowTicker}>
                <td
                  className="micro-cap"
                  style={{
                    padding: '8px 12px',
                    color: 'var(--color-ink)',
                    textAlign: 'right',
                    fontWeight: 600,
                  }}
                >
                  {rowTicker.toUpperCase()}
                </td>
                {tickers.map((colTicker) => {
                  const r = getCorrelation(rowTicker, colTicker);
                  const isDiag = rowTicker === colTicker;
                  const isHovered =
                    hoveredCell &&
                    hoveredCell.row === rowTicker &&
                    hoveredCell.col === colTicker;

                  return (
                    <td
                      key={colTicker}
                      onMouseEnter={() =>
                        setHoveredCell({ row: rowTicker, col: colTicker, val: r })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{
                        padding: '10px 12px',
                        textAlign: 'center',
                        backgroundColor: isDiag ? 'var(--color-primary)' : getCellBg(r),
                        color: isDiag ? '#ffffff' : getTextColor(r),
                        border: isHovered
                          ? '2px solid var(--color-ink)'
                          : '1px solid var(--color-hairline)',
                        borderRadius: 'var(--radius-xs)',
                        cursor: 'crosshair',
                        transition: 'transform 0.1s ease',
                        transform: isHovered ? 'scale(1.1)' : 'none',
                        zIndex: isHovered ? 10 : 1,
                      }}
                    >
                      <span className="tabular" style={{ fontWeight: isDiag ? 600 : 400 }}>
                        {r.toFixed(2)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hoveredCell && (
        <div
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            backgroundColor: 'var(--color-canvas-soft)',
            borderRadius: 'var(--radius-pill)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span className="caption" style={{ color: 'var(--color-ink-mute)' }}>
            Correlation:
          </span>
          <span style={{ fontWeight: 500, color: 'var(--color-ink)' }}>
            {hoveredCell.row.toUpperCase()} ↔ {hoveredCell.col.toUpperCase()}
          </span>
          <span
            className="tabular"
            style={{
              fontWeight: 600,
              color: hoveredCell.val >= 0 ? 'var(--color-primary)' : 'var(--color-ruby)',
            }}
          >
            {hoveredCell.val >= 0 ? `+${hoveredCell.val.toFixed(4)}` : hoveredCell.val.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
};
