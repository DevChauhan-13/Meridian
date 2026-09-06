import React, { useState } from 'react';
import type { AssetItem } from '../api/client';
import { Calendar, Sliders, CheckCircle2, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface BuilderPageProps {
  assets: AssetItem[];
  selectedTickers: string[];
  onToggleTicker: (id: string) => void;
  onSelectPreset: (ids: string[]) => void;
  startDate: string;
  endDate: string;
  onChangeStartDate: (date: string) => void;
  onChangeEndDate: (date: string) => void;
  transactionCost: number;
  onChangeTransactionCost: (bps: number) => void;
  onRunOptimization: () => void;
  isLoading: boolean;
  loadingStep: string;
}

export const BuilderPage: React.FC<BuilderPageProps> = ({
  assets,
  selectedTickers,
  onToggleTicker,
  onSelectPreset,
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
  transactionCost,
  onChangeTransactionCost,
  onRunOptimization,
  isLoading,
  loadingStep,
}) => {
  const [selectedAssetClass, setSelectedAssetClass] = useState<string>('all');

  const equities = assets.filter((a) => a.asset_class === 'equities');
  const commodities = assets.filter((a) => a.asset_class === 'commodities');
  const crypto = assets.filter((a) => a.asset_class === 'crypto');

  const filteredAssets =
    selectedAssetClass === 'all'
      ? assets
      : assets.filter((a) => a.asset_class === selectedAssetClass);

  const presets = [
    {
      name: '12-Asset Multi-Asset Universe',
      desc: 'All equities, commodities, and crypto (Notebook primary)',
      tickers: assets.map((a) => a.id),
    },
    {
      name: '10-Asset Traditional & Commodities',
      desc: 'Equities and precious/energy commodities without crypto',
      tickers: assets.filter((a) => a.asset_class !== 'crypto').map((a) => a.id),
    },
    {
      name: 'US Tech Equities',
      desc: 'Mega-cap technology & Nasdaq 100 benchmark',
      tickers: ['apple', 'amazon', 'microsoft', 'nvidia', 'meta', 'tesla', 'nasdaq'],
    },
    {
      name: 'Inflation Hedge (Commodities & Gold)',
      desc: 'Gold, Silver, and Crude Oil futures',
      tickers: ['gold', 'silver', 'crude'],
    },
  ];

  return (
    <div>
      {/* Hero Header floating above gradient mesh */}
      <section className="section-hero">
        <div className="container">
          <div style={{ maxWidth: '780px', marginBottom: '40px' }}>
            <div
              className="pill-tag-soft"
              style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={13} color="var(--color-primary)" />
              <span className="micro-cap">PORTFOLIO OPTIMIZATION & BACKTESTING</span>
            </div>

            <h1 className="display-xxl" style={{ color: 'var(--color-ink)', marginBottom: '18px' }}>
              Optimize multi-asset risk. In milliseconds.
            </h1>

            <p className="body-lg" style={{ color: 'var(--color-ink-secondary)', lineHeight: 1.6 }}>
              Deploy modern quantitative algorithms across equities, commodities, and digital assets.
              Derive mathematically optimal allocations via Minimum Variance, Markowitz Max-Sharpe, and Equal Risk Parity.
            </p>
          </div>

          {/* Preset Buttons */}
          <div style={{ marginBottom: '24px' }}>
            <div className="micro-cap" style={{ color: 'var(--color-ink-mute)', marginBottom: '10px' }}>
              QUICK UNIVERSE PRESETS
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => onSelectPreset(preset.tickers)}
                  className="button-secondary"
                  style={{
                    fontSize: '13px',
                    padding: '6px 14px',
                    backgroundColor:
                      selectedTickers.length === preset.tickers.length &&
                      preset.tickers.every((t) => selectedTickers.includes(t))
                        ? 'var(--color-primary-bg-subdued)'
                        : 'var(--color-canvas)',
                    borderColor:
                      selectedTickers.length === preset.tickers.length &&
                      preset.tickers.every((t) => selectedTickers.includes(t))
                        ? 'var(--color-primary)'
                        : 'var(--color-hairline)',
                    color:
                      selectedTickers.length === preset.tickers.length &&
                      preset.tickers.every((t) => selectedTickers.includes(t))
                        ? 'var(--color-primary-deep)'
                        : 'var(--color-ink)',
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Builder Configuration Card */}
          <div className="card-feature-light" style={{ padding: '32px' }}>
            {/* Asset Selection Header & Filter Tabs */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '24px',
                paddingBottom: '20px',
                borderBottom: '1px solid var(--color-hairline)',
              }}
            >
              <div>
                <h2 className="heading-md" style={{ color: 'var(--color-ink)', marginBottom: '4px' }}>
                  Select Asset Universe
                </h2>
                <div className="caption" style={{ color: 'var(--color-ink-mute)' }}>
                  Selected: <span className="tabular" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{selectedTickers.length}</span> of{' '}
                  <span className="tabular">{assets.length}</span> assets (minimum 2 required)
                </div>
              </div>

              {/* Asset Class Filter */}
              <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--color-canvas-soft)', padding: '3px', borderRadius: 'var(--radius-pill)' }}>
                {[
                  { id: 'all', label: 'All Classes' },
                  { id: 'equities', label: `Equities (${equities.length})` },
                  { id: 'commodities', label: `Commodities (${commodities.length})` },
                  { id: 'crypto', label: `Crypto (${crypto.length})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedAssetClass(tab.id)}
                    style={{
                      border: 'none',
                      backgroundColor: selectedAssetClass === tab.id ? '#ffffff' : 'transparent',
                      color: selectedAssetClass === tab.id ? 'var(--color-primary)' : 'var(--color-ink-mute)',
                      fontWeight: selectedAssetClass === tab.id ? 500 : 400,
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      boxShadow: selectedAssetClass === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Asset Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '12px',
                marginBottom: '32px',
              }}
            >
              {filteredAssets.map((asset) => {
                const isChecked = selectedTickers.includes(asset.id);
                return (
                  <div
                    key={asset.id}
                    onClick={() => onToggleTicker(asset.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${isChecked ? 'var(--color-primary)' : 'var(--color-hairline)'}`,
                      backgroundColor: isChecked ? 'rgba(83, 58, 253, 0.03)' : 'var(--color-canvas)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: `1.5px solid ${isChecked ? 'var(--color-primary)' : 'var(--color-hairline-input)'}`,
                          backgroundColor: isChecked ? 'var(--color-primary)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isChecked && <CheckCircle2 size={13} color="#ffffff" strokeWidth={3} />}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-ink)' }}>
                            {asset.id.toUpperCase()}
                          </span>
                          <span
                            className="micro-cap"
                            style={{
                              color:
                                asset.asset_class === 'crypto'
                                  ? 'var(--color-magenta)'
                                  : asset.asset_class === 'commodities'
                                  ? 'var(--color-lemon)'
                                  : 'var(--color-primary-soft)',
                            }}
                          >
                            {asset.ticker}
                          </span>
                        </div>
                        <div className="caption" style={{ color: 'var(--color-ink-mute)', fontSize: '12px' }}>
                          {asset.name}
                        </div>
                      </div>
                    </div>

                    <span
                      className="pill-tag-soft"
                      style={{
                        fontSize: '10px',
                        textTransform: 'capitalize',
                        backgroundColor:
                          asset.asset_class === 'crypto'
                            ? '#faeafd'
                            : asset.asset_class === 'commodities'
                            ? '#fef5e7'
                            : '#e8e7fe',
                        color:
                          asset.asset_class === 'crypto'
                            ? '#b019a2'
                            : asset.asset_class === 'commodities'
                            ? '#9b6829'
                            : 'var(--color-primary-deep)',
                      }}
                    >
                      {asset.asset_class}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Backtest Parameters Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                paddingTop: '24px',
                borderTop: '1px solid var(--color-hairline)',
                marginBottom: '32px',
              }}
            >
              <div>
                <label className="caption" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--color-ink)' }}>
                  <Calendar size={14} color="var(--color-primary)" />
                  Backtest Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onChangeStartDate(e.target.value)}
                  className="text-input tabular"
                />
              </div>

              <div>
                <label className="caption" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--color-ink)' }}>
                  <Calendar size={14} color="var(--color-primary)" />
                  Backtest End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onChangeEndDate(e.target.value)}
                  className="text-input tabular"
                />
              </div>

              <div>
                <label className="caption" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--color-ink)' }}>
                  <Sliders size={14} color="var(--color-primary)" />
                  Rebalancing Slippage / Cost
                </label>
                <select
                  value={transactionCost}
                  onChange={(e) => onChangeTransactionCost(Number(e.target.value))}
                  className="text-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value={0}>0 bps (Frictionless / Theoretical)</option>
                  <option value={0.0005}>5 bps (Institutional execution)</option>
                  <option value={0.001}>10 bps (Conservative retail)</option>
                  <option value={0.0025}>25 bps (High slippage stress)</option>
                </select>
              </div>
            </div>

            {/* Launch Button & Status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="pill-tag-soft">3 Optimization Models</span>
                <span className="caption" style={{ color: 'var(--color-ink-mute)' }}>
                  MinVar + Markowitz (Max Sharpe) + Equal Risk Parity
                </span>
              </div>

              <button
                disabled={selectedTickers.length < 2 || isLoading}
                onClick={onRunOptimization}
                className="button-primary-pill"
                style={{ padding: '12px 28px', fontSize: '16px' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="spin-icon" />
                    <span>{loadingStep || 'Processing Optimization...'}</span>
                  </>
                ) : (
                  <>
                    <span>Run Optimization & Backtest</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
