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
  ReferenceLine,
} from 'recharts';
import type { StrategyBacktestResult } from '../api/client';

interface RollingSharpeChartProps {
  results: Record<string, StrategyBacktestResult>;
}

export const RollingSharpeChart: React.FC<RollingSharpeChartProps> = ({ results }) => {
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
      row[strat] = results[strat].rolling_sharpe[i];
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
            Rolling 63-Day Sharpe Ratio
          </h3>
          <p className="caption" style={{ color: 'var(--color-ink-mute)' }}>
            Trailing quarterly risk-adjusted performance across changing market regimes.
          </p>
        </div>
      </div>

      <div style={{ width: '100%', height: '280px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" vertical={false} />
            <ReferenceLine y={0} stroke="var(--color-ink-mute)" strokeDasharray="4 4" />
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
              tickFormatter={(v: number) => v.toFixed(1)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-canvas)',
                border: '1px solid var(--color-hairline)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-2)',
                fontSize: '13px',
              }}
              formatter={(val: any) => [Number(val).toFixed(3), 'Sharpe']}
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
              <Line
                key={strat}
                type="monotone"
                dataKey={strat}
                stroke={getStrokeColor(strat)}
                strokeWidth={1.8}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
