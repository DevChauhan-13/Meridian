import React from 'react';

interface KpiCardProps {
  strategy: 'MinVar' | 'Markowitz' | 'RiskParity' | string;
  metrics: {
    'Cumulative Return': number;
    CAGR: number;
    Volatility: number;
    Sharpe: number;
    Sortino: number;
    'Max Drawdown': number;
  };
  turnover?: number;
  isBestSharpe?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  strategy,
  metrics,
  turnover,
  isBestSharpe,
}) => {
  const getStrategyColor = (s: string) => {
    switch (s) {
      case 'MinVar':
        return 'var(--color-primary)';
      case 'Markowitz':
        return 'var(--color-ruby)';
      case 'RiskParity':
        return 'var(--color-magenta)';
      default:
        return 'var(--color-ink)';
    }
  };

  const stratColor = getStrategyColor(strategy);
  const cumReturnPct = (metrics['Cumulative Return'] * 100).toFixed(2);
  const sharpeVal = metrics.Sharpe.toFixed(3);
  const sortinoVal = metrics.Sortino.toFixed(3);
  const maxDdPct = (metrics['Max Drawdown'] * 100).toFixed(2);
  const volPct = (metrics.Volatility * 100).toFixed(2);
  const cagrPct = (metrics.CAGR * 100).toFixed(2);

  return (
    <div
      className="card-feature-light"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderTop: `4px solid ${stratColor}`,
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: stratColor,
              }}
            />
            <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-ink)' }}>
              {strategy === 'MinVar'
                ? 'Minimum Variance'
                : strategy === 'Markowitz'
                ? 'Markowitz (Max Sharpe)'
                : strategy === 'RiskParity'
                ? 'Equal Risk Parity'
                : strategy}
            </span>
          </div>
          {isBestSharpe && (
            <span className="pill-tag-soft success" style={{ fontSize: '10px' }}>
              Highest Sharpe
            </span>
          )}
        </div>

        {/* Primary KPI */}
        <div style={{ marginBottom: '24px' }}>
          <div className="caption" style={{ color: 'var(--color-ink-mute)', marginBottom: '4px' }}>
            ANNUALIZED SHARPE RATIO
          </div>
          <div className="display-lg tabular" style={{ color: stratColor, fontWeight: 300 }}>
            {sharpeVal}
          </div>
        </div>

        {/* Metric Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--color-hairline)',
          }}
        >
          <div>
            <div className="caption" style={{ color: 'var(--color-ink-mute)', marginBottom: '2px' }}>
              Cumulative Return
            </div>
            <div
              className="tabular"
              style={{
                fontSize: '17px',
                fontWeight: 500,
                color: metrics['Cumulative Return'] >= 0 ? '#0c7847' : 'var(--color-ruby)',
              }}
            >
              {metrics['Cumulative Return'] >= 0 ? `+${cumReturnPct}%` : `${cumReturnPct}%`}
            </div>
          </div>

          <div>
            <div className="caption" style={{ color: 'var(--color-ink-mute)', marginBottom: '2px' }}>
              Max Drawdown
            </div>
            <div
              className="tabular"
              style={{
                fontSize: '17px',
                fontWeight: 500,
                color: 'var(--color-ruby)',
              }}
            >
              {maxDdPct}%
            </div>
          </div>

          <div>
            <div className="caption" style={{ color: 'var(--color-ink-mute)', marginBottom: '2px' }}>
              Sortino Ratio
            </div>
            <div className="tabular" style={{ fontSize: '15px', color: 'var(--color-ink)' }}>
              {sortinoVal}
            </div>
          </div>

          <div>
            <div className="caption" style={{ color: 'var(--color-ink-mute)', marginBottom: '2px' }}>
              Ann. Volatility
            </div>
            <div className="tabular" style={{ fontSize: '15px', color: 'var(--color-ink)' }}>
              {volPct}%
            </div>
          </div>

          <div>
            <div className="caption" style={{ color: 'var(--color-ink-mute)', marginBottom: '2px' }}>
              CAGR
            </div>
            <div className="tabular" style={{ fontSize: '15px', color: 'var(--color-ink)' }}>
              {cagrPct}%
            </div>
          </div>

          {turnover !== undefined && (
            <div>
              <div className="caption" style={{ color: 'var(--color-ink-mute)', marginBottom: '2px' }}>
                Est. Daily Turnover
              </div>
              <div className="tabular" style={{ fontSize: '15px', color: 'var(--color-ink)' }}>
                {(turnover * 100).toFixed(2)}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
