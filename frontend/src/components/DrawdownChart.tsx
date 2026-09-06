import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import type { StrategyBacktestResult } from '../api/client';

interface DrawdownChartProps {
  results: Record<string, StrategyBacktestResult>;
}

export const DrawdownChart: React.FC<DrawdownChartProps> = ({ results }) => {
  const strategyNames = Object.keys(results);
  if (strategyNames.length === 0) return null;

  const dates = results[strategyNames[0]].dates;
  const step = Math.max(1, Math.floor(dates.length / 250));
  const chartData = [];

  for (let i = 0; i < dates.length; i += step) {
    const row: Record<string, any> = {
      date: dates[i],
    };
    for (const strat of strategyNames) {
      row[strat] = results[strat].drawdown[i] * 100; // in %
    }
    chartData.push(row);
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
            Historical Drawdown Profile (%)
          </h3>
          <p className="caption" style={{ color: 'var(--color-ink-mute)' }}>
            Peak-to-trough decline over time. Lower negative valleys represent higher downside risk.
          </p>
        </div>
      </div>

      <div style={{ width: '100%', height: '280px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                  ? 'MinVar'
                  : name === 'Markowitz'
                  ? 'Markowitz'
                  : name === 'RiskParity'
                  ? 'Risk Parity'
                  : name,
              ]}
              labelFormatter={(label: any) => `Date: ${label}`}
            />
            <Legend
              wrapperStyle={{ paddingTop: '12px', fontSize: '13px' }}
              formatter={(value: string) => (
                <span style={{ color: 'var(--color-ink)', fontWeight: 500 }}>
                  {value}
                </span>
              )}
            />
            {strategyNames.map((strat) => (
              <Area
                key={strat}
                type="monotone"
                dataKey={strat}
                stroke={getStrokeColor(strat)}
                fill={getStrokeColor(strat)}
                fillOpacity={0.12}
                strokeWidth={1.8}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
