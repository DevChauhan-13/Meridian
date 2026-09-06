import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import type { StrategyRiskReport } from '../api/client';

interface RiskContribBarProps {
  reports: Record<string, StrategyRiskReport>;
  assets: string[];
}

export const RiskContribBar: React.FC<RiskContribBarProps> = ({ reports, assets }) => {
  const strategyNames = Object.keys(reports);
  if (strategyNames.length === 0 || assets.length === 0) return null;

  // Transform into data array: [{ asset: 'amazon', MinVar: 0.15, Markowitz: 0.35, RiskParity: 0.25 }]
  const chartData = assets.map((asset) => {
    const row: Record<string, any> = {
      asset: asset.toUpperCase(),
    };
    for (const strat of strategyNames) {
      const item = reports[strat].risk_contributions.find(
        (rc) => rc.asset.toLowerCase() === asset.toLowerCase()
      );
      row[strat] = item ? item.risk_contrib_pct * 100 : 0;
    }
    return row;
  });

  const getBarColor = (strat: string) => {
    switch (strat) {
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

  return (
    <div className="card-feature-light">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 className="heading-sm" style={{ color: 'var(--color-ink)', marginBottom: '4px' }}>
            Risk Contribution by Asset (%)
          </h3>
          <p className="caption" style={{ color: 'var(--color-ink-mute)' }}>
            Marginal share of total portfolio volatility contributed by each underlying asset.
            Notice how Equal Risk Parity flattens risk concentration.
          </p>
        </div>
      </div>

      <div style={{ width: '100%', height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" vertical={false} />
            <XAxis
              dataKey="asset"
              stroke="var(--color-ink-mute)"
              fontSize={11}
              tickLine={false}
              interval={0}
              angle={-25}
              textAnchor="end"
            />
            <YAxis
              stroke="var(--color-ink-mute)"
              fontSize={12}
              tickLine={false}
              tickFormatter={(v: number) => `${v.toFixed(0)}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-canvas)',
                border: '1px solid var(--color-hairline)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-2)',
                fontSize: '13px',
              }}
              formatter={(val: any, name: any) => [
                `${Number(val).toFixed(2)}%`,
                name === 'MinVar'
                  ? 'MinVar Risk'
                  : name === 'Markowitz'
                  ? 'Markowitz Risk'
                  : name === 'RiskParity'
                  ? 'Risk Parity Risk'
                  : name,
              ]}
            />
            <Legend
              wrapperStyle={{ paddingTop: '24px', fontSize: '13px' }}
              formatter={(value: string) => (
                <span style={{ color: 'var(--color-ink)', fontWeight: 500 }}>
                  {value}
                </span>
              )}
            />
            {strategyNames.map((strat) => (
              <Bar
                key={strat}
                dataKey={strat}
                fill={getBarColor(strat)}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
