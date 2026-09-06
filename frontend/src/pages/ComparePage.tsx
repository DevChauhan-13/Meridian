import React, { useState } from 'react';
import type { AssetItem, CompareResponse } from '../api/client';
import { apiClient } from '../api/client';
import { EquityCurveChart } from '../components/EquityCurveChart';
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

interface ComparePageProps {
  assets: AssetItem[];
  startDate: string;
  endDate: string;
}

export const ComparePage: React.FC<ComparePageProps> = ({ assets, startDate, endDate }) => {
  const [universeA, setUniverseA] = useState<string[]>([
    'apple',
    'amazon',
    'microsoft',
    'nvidia',
    'meta',
    'tesla',
    'nasdaq',
    'gold',
    'silver',
    'crude',
  ]);

  const [universeB, setUniverseB] = useState<string[]>([
    'apple',
    'amazon',
    'microsoft',
    'nvidia',
    'meta',
    'tesla',
    'nasdaq',
    'gold',
    'silver',
    'crude',
    'btc',
    'eth',
  ]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResponse | null>(null);

  const toggleUniverseA = (id: string) => {
    if (universeA.includes(id)) {
      if (universeA.length <= 2) return;
      setUniverseA(universeA.filter((x) => x !== id));
    } else {
      setUniverseA([...universeA, id]);
    }
  };

  const toggleUniverseB = (id: string) => {
    if (universeB.includes(id)) {
      if (universeB.length <= 2) return;
      setUniverseB(universeB.filter((x) => x !== id));
    } else {
      setUniverseB([...universeB, id]);
    }
  };

  const handleRunComparison = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.compare({
        universe_a: universeA,
        universe_b: universeB,
        start_date: startDate,
        end_date: endDate,
        strategies: ['MinVar', 'Markowitz', 'RiskParity'],
      });
      setCompareResult(res);
    } catch (err: any) {
      setError(err.message || 'Comparison failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="section-content">
      <div className="container">
        <div style={{ maxWidth: '800px', marginBottom: '32px' }}>
          <div className="pill-tag-soft" style={{ marginBottom: '8px' }}>
            SIDE-BY-SIDE UNIVERSE COMPARISON
          </div>
          <h1 className="display-lg" style={{ color: 'var(--color-ink)', marginBottom: '8px' }}>
            Compare Cross-Asset Universes
          </h1>
          <p className="caption" style={{ color: 'var(--color-ink-mute)' }}>
            Investigate the marginal diversification efficiency and drawdown impact of expanding the asset
            universe (e.g. Traditional 10-Asset vs 12-Asset Multi-Asset with Digital Assets).
          </p>
        </div>

        {/* Universes Configuration Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}
        >
          {/* Universe A Card */}
          <div className="card-feature-light">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span className="pill-tag-soft">Universe A (Baseline)</span>
                <h3 className="heading-sm" style={{ color: 'var(--color-ink)', marginTop: '4px' }}>
                  Traditional & Commodities ({universeA.length} assets)
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '180px', overflowY: 'auto', padding: '4px' }}>
              {assets.map((a) => {
                const isSelected = universeA.includes(a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleUniverseA(a.id)}
                    style={{
                      border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-hairline)'}`,
                      backgroundColor: isSelected ? 'var(--color-primary-bg-subdued)' : 'transparent',
                      color: isSelected ? 'var(--color-primary-deep)' : 'var(--color-ink-mute)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isSelected && <CheckCircle2 size={12} />}
                    {a.id.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Universe B Card */}
          <div className="card-feature-light">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span className="pill-tag-soft magenta">Universe B (Expanded)</span>
                <h3 className="heading-sm" style={{ color: 'var(--color-ink)', marginTop: '4px' }}>
                  Multi-Asset Universe ({universeB.length} assets)
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '180px', overflowY: 'auto', padding: '4px' }}>
              {assets.map((a) => {
                const isSelected = universeB.includes(a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleUniverseB(a.id)}
                    style={{
                      border: `1px solid ${isSelected ? 'var(--color-magenta)' : 'var(--color-hairline)'}`,
                      backgroundColor: isSelected ? '#faeafd' : 'transparent',
                      color: isSelected ? '#b019a2' : 'var(--color-ink-mute)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isSelected && <CheckCircle2 size={12} />}
                    {a.id.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <button
            disabled={isLoading}
            onClick={handleRunComparison}
            className="button-primary-pill"
            style={{ padding: '12px 32px', fontSize: '15px' }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Running Comparative Optimizations...</span>
              </>
            ) : (
              <>
                <span>Compare Universes Side-by-Side</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#fde8ef',
              color: 'var(--color-ruby)',
              fontSize: '13px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        {/* Comparison Results */}
        {compareResult && (
          <div>
            {/* Comparison Metrics Table */}
            <div className="card-feature-light" style={{ marginBottom: '32px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 className="heading-sm" style={{ color: 'var(--color-ink)', marginBottom: '4px' }}>
                  Empirical Metric Comparison & Delta Analysis
                </h3>
                <p className="caption" style={{ color: 'var(--color-ink-mute)' }}>
                  Detailed comparison across models. Green deltas indicate Universe B outperforming Universe A.
                </p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="meridian-table">
                  <thead>
                    <tr>
                      <th>Strategy</th>
                      <th>Metric</th>
                      <th style={{ textAlign: 'right' }}>Universe A</th>
                      <th style={{ textAlign: 'right' }}>Universe B</th>
                      <th style={{ textAlign: 'right' }}>Delta (B - A)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareResult.summary_comparison.map((row, idx) => {
                      const isPct =
                        row.metric.includes('Return') ||
                        row.metric.includes('Drawdown') ||
                        row.metric.includes('Volatility') ||
                        row.metric.includes('CAGR');

                      const formatVal = (v: number) =>
                        isPct ? `${(v * 100).toFixed(2)}%` : v.toFixed(3);

                      const isPositiveDelta =
                        row.metric.includes('Drawdown')
                          ? row.delta > 0 // less negative drawdown is better
                          : row.metric.includes('Volatility')
                          ? row.delta < 0 // lower volatility is better
                          : row.delta > 0;

                      return (
                        <tr key={idx}>
                          <td>
                            <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                              {row.strategy}
                            </span>
                          </td>
                          <td className="caption" style={{ color: 'var(--color-ink-secondary)' }}>
                            {row.metric}
                          </td>
                          <td className="tabular" style={{ textAlign: 'right' }}>
                            {formatVal(row.universe_a)}
                          </td>
                          <td className="tabular" style={{ textAlign: 'right' }}>
                            {formatVal(row.universe_b)}
                          </td>
                          <td className="tabular" style={{ textAlign: 'right' }}>
                            <span
                              style={{
                                fontWeight: 600,
                                color: isPositiveDelta ? '#0c7847' : 'var(--color-ruby)',
                              }}
                            >
                              {row.delta > 0 ? `+${formatVal(row.delta)}` : formatVal(row.delta)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Side-by-side Equity Curves */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
                gap: '24px',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--color-ink)' }}>
                  Universe A Growth Curves
                </div>
                <EquityCurveChart results={compareResult.universe_a.backtest.results} />
              </div>

              <div>
                <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--color-ink)' }}>
                  Universe B Growth Curves
                </div>
                <EquityCurveChart results={compareResult.universe_b.backtest.results} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
