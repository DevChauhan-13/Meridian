import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import type { StrategyBacktestResult } from '../api/client';

interface EquityCurveChartProps {
  results: Record<string, StrategyBacktestResult>;
}

export const EquityCurveChart: React.FC<EquityCurveChartProps> = ({ results }) => {
  const strategyNames = Object.keys(results);
  if (strategyNames.length === 0) return null;

  // Use dates from first available result
  const dates = results[strategyNames[0]].dates;

  // Downsample to at most 250 points for smooth performance and crisp rendering
  const step = Math.max(1, Math.floor(dates.length / 250));
  const chartData = [];

  for (let i = 0; i < dates.length; i += step) {
    const row: Record<string, any> = {
      date: dates[i],
    };
    for (const strat of strategyNames) {
      row[strat] = results[strat].wealth[i];
    }
    chartData.push(row);
  }

  // Always include the final day
  if (dates.length > 0 && chartData[chartData.length - 1].date !== dates[dates.length - 1]) {
    const lastRow: Record<string, any> = {
      date: dates[dates.length - 1],
    };
    for (const strat of strategyNames) {
      lastRow[strat] = results[strat].wealth[dates.length - 1];
    }
    chartData.push(lastRow);
  }

  const getStrokeColor = (strat: string) => {
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
            Cumulative Wealth Growth (Normalized to $1.00)
          </h3>
          <p className="caption" style={{ color: 'var(--color-ink-mute)' }}>
            Historical portfolio trajectory under daily rebalancing without leverage.
          </p>
        </div>
      </div>

      <div style={{ width: '100%', height: '340px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="var(--color-ink-mute)"
              fontSize={12}
              tickLine={false}
              tickFormatter={(d: string) => {
                const parts = d.split('-');
                return parts.length >= 2 ? `${parts[1]}/${parts[0].slice(2)}` : d;
              }}
            />
            <YAxis
              stroke="var(--color-ink-mute)"
              fontSize={12}
              tickLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(v: number) => `$${v.toFixed(2)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-canvas)',
                border: '1px solid var(--color-hairline)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-2)',
                fontSize: '13px',
                fontFamily: 'var(--font-family)',
              }}
              formatter={(val: any, name: any) => [
                `$${Number(val).toFixed(3)} (${((Number(val) - 1) * 100).toFixed(1)}%)`,
                name === 'MinVar'
                  ? 'Minimum Variance'
                  : name === 'Markowitz'
                  ? 'Markowitz (Max Sharpe)'
                  : name === 'RiskParity'
                  ? 'Equal Risk Parity'
                  : name,
              ]}
              labelFormatter={(label: any) => `Date: ${label}`}
            />
            <Legend
              wrapperStyle={{ paddingTop: '16px', fontSize: '13px' }}
              formatter={(value: string) => (
                <span style={{ color: 'var(--color-ink)', fontWeight: 500 }}>
                  {value === 'MinVar'
                    ? 'Minimum Variance'
                    : value === 'Markowitz'
                    ? 'Markowitz (Max Sharpe)'
                    : value === 'RiskParity'
                    ? 'Equal Risk Parity'
                    : value}
                </span>
              )}
            />
            {strategyNames.map((strat) => (
              <Line
                key={strat}
                type="monotone"
                dataKey={strat}
                stroke={getStrokeColor(strat)}
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
