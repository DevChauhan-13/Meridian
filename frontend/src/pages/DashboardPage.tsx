import React from 'react';
import type {
  OptimizeResponse,
  BacktestResponse,
  RiskReportResponse,
} from '../api/client';
import { KpiCard } from '../components/KpiCard';
import { EquityCurveChart } from '../components/EquityCurveChart';
import { DrawdownChart } from '../components/DrawdownChart';
import { RollingSharpeChart } from '../components/RollingSharpeChart';
import { RiskContribBar } from '../components/RiskContribBar';
import { CorrelationHeatmap } from '../components/CorrelationHeatmap';
import { Award, AlertTriangle, TrendingUp } from 'lucide-react';

interface DashboardPageProps {
  optimizeResult: OptimizeResponse;
  backtestResult: BacktestResponse;
  riskReport: RiskReportResponse | null;
  onModifyUniverse: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  optimizeResult,
  backtestResult,
  riskReport,
  onModifyUniverse,
}) => {
  const strategyNames = Object.keys(backtestResult.results);

  // Find best strategies (as in Notebook Step 6)
  let bestSharpeStrat = '';
  let maxSharpe = -Infinity;
  let bestCumStrat = '';
  let maxCum = -Infinity;
  let lowestDdStrat = '';
  let lowestDd = -Infinity;

  for (const s of strategyNames) {
    const m = backtestResult.results[s].metrics;
    if (m.Sharpe > maxSharpe) {
      maxSharpe = m.Sharpe;
      bestSharpeStrat = s;
    }
    if (m['Cumulative Return'] > maxCum) {
      maxCum = m['Cumulative Return'];
      bestCumStrat = s;
    }
    if (m['Max Drawdown'] > lowestDd) {
      // Drawdown is negative, so closer to 0 is best
      lowestDd = m['Max Drawdown'];
      lowestDdStrat = s;
    }
  }

  const assets = optimizeResult.asset_names;

  return (
    <div className="section-content">
      <div className="container">
        {/* Header with quick stats & modification CTA */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div>
            <div className="pill-tag-soft" style={{ marginBottom: '8px' }}>
              RESULTS & RISK ENGINE
            </div>
            <h1 className="display-lg" style={{ color: 'var(--color-ink)', marginBottom: '8px' }}>
              Portfolio Performance & Risk Synthesis
            </h1>
            <p className="caption" style={{ color: 'var(--color-ink-mute)' }}>
              Universe: <strong style={{ color: 'var(--color-ink)' }}>{assets.length} assets</strong> ({assets.map((a) => a.toUpperCase()).join(', ')})
            </p>
          </div>

          <button onClick={onModifyUniverse} className="button-secondary">
            Modify Universe & Parameters
          </button>
        </div>

        {/* Quant Insight Highlights Banner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div className="card-cream-band" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Award size={18} color="var(--color-primary)" />
              <span className="micro-cap" style={{ color: 'var(--color-ink)' }}>
                OPTIMAL RISK-ADJUSTED
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
              {bestSharpeStrat}
            </div>
            <div className="caption" style={{ color: 'var(--color-ink-secondary)' }}>
              Highest Sharpe Ratio: <strong className="tabular">{maxSharpe.toFixed(3)}</strong>
            </div>
          </div>

          <div className="card-cream-band" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <TrendingUp size={18} color="#0c7847" />
              <span className="micro-cap" style={{ color: 'var(--color-ink)' }}>
                TOP WEALTH GENERATOR
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
              {bestCumStrat}
            </div>
            <div className="caption" style={{ color: 'var(--color-ink-secondary)' }}>
              Total Return: <strong className="tabular">{maxCum >= 0 ? `+${(maxCum * 100).toFixed(1)}%` : `${(maxCum * 100).toFixed(1)}%`}</strong>
            </div>
          </div>

          <div className="card-cream-band" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertTriangle size={18} color="var(--color-ruby)" />
              <span className="micro-cap" style={{ color: 'var(--color-ink)' }}>
                MAX DOWNSIDE RESILIENCE
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
              {lowestDdStrat}
            </div>
            <div className="caption" style={{ color: 'var(--color-ink-secondary)' }}>
              Toughest Drawdown: <strong className="tabular">{(lowestDd * 100).toFixed(1)}%</strong>
            </div>
          </div>
        </div>

        {/* 1. Strategy KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          {strategyNames.map((strat) => (
            <KpiCard
              key={strat}
              strategy={strat}
              metrics={backtestResult.results[strat].metrics}
              turnover={riskReport?.results[strat]?.turnover}
              isBestSharpe={strat === bestSharpeStrat}
            />
          ))}
        </div>

        {/* 2. Equity Curves Chart */}
        <div style={{ marginBottom: '32px' }}>
          <EquityCurveChart results={backtestResult.results} />
        </div>

        {/* 3. Drawdown & Rolling Sharpe Charts */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}
        >
          <DrawdownChart results={backtestResult.results} />
          <RollingSharpeChart results={backtestResult.results} />
        </div>

        {/* 4. Risk Contribution Breakdown & Correlation Heatmap */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          {riskReport && (
            <RiskContribBar reports={riskReport.results} assets={assets} />
          )}
          <CorrelationHeatmap tickers={assets} cov={optimizeResult.cov} />
        </div>

        {/* 5. Asset Allocation Weights Matrix */}
        <div className="card-feature-light" style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 className="heading-sm" style={{ color: 'var(--color-ink)', marginBottom: '4px' }}>
                Optimal Portfolio Weights Allocation Matrix
              </h3>
              <p className="caption" style={{ color: 'var(--color-ink-mute)' }}>
                Mathematically solved asset weights (summing to 100%) under each optimization objective.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="meridian-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Expected Return (μ)</th>
                  {strategyNames.map((s) => (
                    <th key={s} style={{ textAlign: 'right' }}>
                      {s} Weight
                    </th>
                  ))}
                  {strategyNames.map((s) => (
                    <th key={`${s}-rc`} style={{ textAlign: 'right' }}>
                      {s} Risk Contrib
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => {
                  const muVal = optimizeResult.mu[asset] ?? 0;
                  return (
                    <tr key={asset}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                            {asset.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="tabular">
                        <span style={{ color: muVal >= 0 ? '#0c7847' : 'var(--color-ruby)' }}>
                          {muVal >= 0 ? `+${(muVal * 100).toFixed(2)}%` : `${(muVal * 100).toFixed(2)}%`}
                        </span>
                      </td>
                      {strategyNames.map((s) => {
                        const w = optimizeResult.weights[s]?.[asset] ?? 0;
                        const pct = (w * 100).toFixed(1);
                        return (
                          <td key={s} style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              <div
                                style={{
                                  width: '50px',
                                  height: '6px',
                                  backgroundColor: 'var(--color-hairline)',
                                  borderRadius: '3px',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    width: `${Math.min(100, Math.max(0, w * 100))}%`,
                                    height: '100%',
                                    backgroundColor:
                                      s === 'MinVar'
                                        ? 'var(--color-primary)'
                                        : s === 'Markowitz'
                                        ? 'var(--color-ruby)'
                                        : 'var(--color-magenta)',
                                  }}
                                />
                              </div>
                              <span className="tabular" style={{ fontWeight: w > 0.05 ? 600 : 400 }}>
                                {pct}%
                              </span>
                            </div>
                          </td>
                        );
                      })}
                      {strategyNames.map((s) => {
                        const rcItem = riskReport?.results[s]?.risk_contributions.find(
                          (rc) => rc.asset.toLowerCase() === asset.toLowerCase()
                        );
                        const rcPct = rcItem ? (rcItem.risk_contrib_pct * 100).toFixed(1) : '-';
                        return (
                          <td key={`${s}-rc`} className="tabular" style={{ textAlign: 'right' }}>
                            {rcPct}%
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Stress Test Regime Breakdown */}
        {riskReport && (
          <div className="card-feature-light">
            <div style={{ marginBottom: '20px' }}>
              <div className="pill-tag-soft ruby" style={{ marginBottom: '8px' }}>
                VOLATILITY STRESS TEST
              </div>
              <h3 className="heading-sm" style={{ color: 'var(--color-ink)', marginBottom: '4px' }}>
                Regime Analysis: Stressed Volatility (&gt;80th percentile) vs Normal Market
              </h3>
              <p className="caption" style={{ color: 'var(--color-ink-mute)' }}>
                Tests portfolio degradation when market volatility spikes into extreme stress regimes.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {strategyNames.map((s) => {
                const stress = riskReport.results[s]?.stress_test;
                if (!stress) return null;
                return (
                  <div
                    key={s}
                    style={{
                      border: '1px solid var(--color-hairline)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      backgroundColor: 'var(--color-canvas-soft)',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '12px', color: 'var(--color-ink)' }}>
                      {s} Stress Profile
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="caption" style={{ color: 'var(--color-ink-mute)' }}>High-Vol Ann. Volatility:</span>
                        <span className="tabular" style={{ fontWeight: 600, color: 'var(--color-ruby)' }}>
                          {(stress.stressed_period.ann_vol * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="caption" style={{ color: 'var(--color-ink-mute)' }}>Normal Ann. Volatility:</span>
                        <span className="tabular" style={{ fontWeight: 500, color: '#0c7847' }}>
                          {(stress.normal_period.ann_vol * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="caption" style={{ color: 'var(--color-ink-mute)' }}>Stressed Sharpe:</span>
                        <span className="tabular" style={{ fontWeight: 600 }}>
                          {stress.stressed_period.sharpe.toFixed(3)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="caption" style={{ color: 'var(--color-ink-mute)' }}>Normal Sharpe:</span>
                        <span className="tabular" style={{ fontWeight: 600 }}>
                          {stress.normal_period.sharpe.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
