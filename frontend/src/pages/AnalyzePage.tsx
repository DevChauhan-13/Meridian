import React, { useState } from 'react';
import type { AssetItem, BacktestResponse, RiskReportResponse } from '../api/client';
import { apiClient } from '../api/client';
import { KpiCard } from '../components/KpiCard';
import { EquityCurveChart } from '../components/EquityCurveChart';
import { DrawdownChart } from '../components/DrawdownChart';
import { RiskContribBar } from '../components/RiskContribBar';
import { Trash2, ArrowRight, Loader2, Equal, Percent } from 'lucide-react';

interface AnalyzePageProps {
  assets: AssetItem[];
  startDate: string;
  endDate: string;
}

export const AnalyzePage: React.FC<AnalyzePageProps> = ({ assets, startDate, endDate }) => {
  const [selectedHoldings, setSelectedHoldings] = useState<Array<{ id: string; weight: number }>>([
    { id: 'apple', weight: 25 },
    { id: 'microsoft', weight: 25 },
    { id: 'gold', weight: 30 },
    { id: 'btc', weight: 20 },
  ]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [backtestResult, setBacktestResult] = useState<BacktestResponse | null>(null);
  const [riskReport, setRiskReport] = useState<RiskReportResponse | null>(null);

  const totalWeight = selectedHoldings.reduce((sum, h) => sum + (Number(h.weight) || 0), 0);
  const is100 = Math.abs(totalWeight - 100) < 0.01;

  const handleWeightChange = (id: string, val: number) => {
    setSelectedHoldings(
      selectedHoldings.map((h) => (h.id === id ? { ...h, weight: val } : h))
    );
  };

  const handleAddAsset = (assetId: string) => {
    if (selectedHoldings.some((h) => h.id === assetId)) return;
    setSelectedHoldings([...selectedHoldings, { id: assetId, weight: 0 }]);
  };

  const handleRemoveAsset = (id: string) => {
    if (selectedHoldings.length <= 2) {
      alert('Portfolio must contain at least 2 assets.');
      return;
    }
    setSelectedHoldings(selectedHoldings.filter((h) => h.id !== id));
  };

  const handleEqualWeight = () => {
    const eq = Number((100 / selectedHoldings.length).toFixed(2));
    const remainder = Number((100 - eq * (selectedHoldings.length - 1)).toFixed(2));
    setSelectedHoldings(
      selectedHoldings.map((h, i) => ({
        ...h,
        weight: i === 0 ? remainder : eq,
      }))
    );
  };

  const handleNormalize = () => {
    if (totalWeight <= 0) return;
    setSelectedHoldings(
      selectedHoldings.map((h) => ({
        ...h,
        weight: Number(((h.weight / totalWeight) * 100).toFixed(2)),
      }))
    );
  };

  const handleRunAnalysis = async () => {
    if (selectedHoldings.length < 2) {
      setError('At least 2 assets are required.');
      return;
    }
    if (!is100) {
      setError('Weights must sum to 100%. Click "Normalize" to adjust automatically.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tickers = selectedHoldings.map((h) => h.id);
      const weightDict: Record<string, number> = {};
      selectedHoldings.forEach((h) => {
        weightDict[h.id] = h.weight / 100;
      });

      const [btRes, riskRes] = await Promise.all([
        apiClient.backtest({
          tickers,
          start_date: startDate,
          end_date: endDate,
          weights: { 'Custom Portfolio': weightDict },
          transaction_cost: 0.0005,
        }),
        apiClient.riskReport({
          tickers,
          start_date: startDate,
          end_date: endDate,
          weights: { 'Custom Portfolio': weightDict },
        }),
      ]);

      setBacktestResult(btRes);
      setRiskReport(riskRes);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  const availableToAdd = assets.filter(
    (a) => !selectedHoldings.some((h) => h.id === a.id)
  );

  return (
    <div className="section-content">
      <div className="container">
        <div style={{ maxWidth: '800px', marginBottom: '32px' }}>
          <div className="pill-tag-soft" style={{ marginBottom: '8px' }}>
            CUSTOM ALLOCATION ANALYZER
          </div>
          <h1 className="display-lg" style={{ color: 'var(--color-ink)', marginBottom: '8px' }}>
            Stress-Test Your Own Portfolio Weights
          </h1>
          <p className="caption" style={{ color: 'var(--color-ink-mute)' }}>
            Input your actual or prospective asset weight distribution. Run identical institutional
            backtest simulation, drawdown analysis, and marginal risk contribution decomposition.
          </p>
        </div>

        {/* Input Card */}
        <div className="card-feature-light" style={{ padding: '32px', marginBottom: '32px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--color-hairline)',
            }}
          >
            <div>
              <h2 className="heading-sm" style={{ color: 'var(--color-ink)' }}>
                Portfolio Holdings & Weight Allocation
              </h2>
              <div className="caption" style={{ color: 'var(--color-ink-mute)' }}>
                Current Total Weight:{' '}
                <span
                  className="tabular"
                  style={{
                    fontWeight: 700,
                    color: is100 ? '#0c7847' : 'var(--color-ruby)',
                  }}
                >
                  {totalWeight.toFixed(2)}%
                </span>{' '}
                {is100 ? '(Balanced)' : `(Delta: ${(100 - totalWeight).toFixed(2)}%)`}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleEqualWeight}
                className="button-secondary"
                style={{ fontSize: '12px', padding: '5px 12px' }}
              >
                <Equal size={13} />
                Equal Weight
              </button>
              <button
                onClick={handleNormalize}
                className="button-secondary"
                style={{ fontSize: '12px', padding: '5px 12px' }}
              >
                <Percent size={13} />
                Normalize to 100%
              </button>
            </div>
          </div>

          {/* Holdings Input Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {selectedHoldings.map((h) => {
              const meta = assets.find((a) => a.id === h.id);
              return (
                <div
                  key={h.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-hairline)',
                    backgroundColor: 'var(--color-canvas-soft)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '180px' }}>
                    <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-ink)' }}>
                      {h.id.toUpperCase()}
                    </span>
                    <span className="caption" style={{ color: 'var(--color-ink-mute)' }}>
                      {meta?.name}
                    </span>
                  </div>

                  {/* Weight Slider and Number Input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '400px' }}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={h.weight}
                      onChange={(e) => handleWeightChange(h.id, Number(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--color-primary)' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '90px' }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={h.weight}
                        onChange={(e) => handleWeightChange(h.id, Number(e.target.value))}
                        className="text-input tabular"
                        style={{ textAlign: 'right', padding: '4px 8px' }}
                      />
                      <span className="caption" style={{ color: 'var(--color-ink-mute)' }}>
                        %
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveAsset(h.id)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--color-ink-mute)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                    title="Remove asset"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Asset Selector */}
          {availableToAdd.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <span className="caption" style={{ color: 'var(--color-ink-mute)' }}>
                Add asset to portfolio:
              </span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddAsset(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="text-input"
                style={{ width: '220px', cursor: 'pointer' }}
                defaultValue=""
              >
                <option value="" disabled>
                  Select asset...
                </option>
                {availableToAdd.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id.toUpperCase()} ({a.name})
                  </option>
                ))}
              </select>
            </div>
          )}

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

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              disabled={isLoading}
              onClick={handleRunAnalysis}
              className="button-primary-pill"
              style={{ padding: '12px 28px', fontSize: '15px' }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="spin-icon" />
                  <span>Evaluating Backtest & Risk Profile...</span>
                </>
              ) : (
                <>
                  <span>Analyze Portfolio</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results for Custom Portfolio */}
        {backtestResult && (
          <div>
            <h2 className="heading-md" style={{ color: 'var(--color-ink)', marginBottom: '20px' }}>
              Custom Portfolio Analytics & Risk Breakdown
            </h2>

            <div style={{ marginBottom: '28px' }}>
              <KpiCard
                strategy="Custom Portfolio"
                metrics={backtestResult.results['Custom Portfolio'].metrics}
                turnover={riskReport?.results['Custom Portfolio']?.turnover}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <EquityCurveChart results={backtestResult.results} />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
                gap: '24px',
                marginBottom: '32px',
              }}
            >
              <DrawdownChart results={backtestResult.results} />
              {riskReport && (
                <RiskContribBar
                  reports={riskReport.results}
                  assets={selectedHoldings.map((h) => h.id)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
