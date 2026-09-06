import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-hairline)',
        backgroundColor: 'var(--color-canvas)',
        padding: '48px 0 36px',
        marginTop: '80px',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '32px',
            marginBottom: '40px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontWeight: 600, fontSize: '16px', color: 'var(--color-ink)' }}>MERIDIAN</span>
              <span className="pill-tag-soft">v1.0.0</span>
            </div>
            <p className="caption" style={{ color: 'var(--color-ink-mute)', lineHeight: 1.6 }}>
              Institutional multi-asset portfolio optimization framework. Modern Portfolio Theory (Markowitz),
              Minimum Variance, and Equal Risk Parity via numerical SLSQP optimization.
            </p>
          </div>

          <div>
            <div className="micro-cap" style={{ color: 'var(--color-ink-mute)', marginBottom: '12px' }}>
              MATHEMATICAL MODELS
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li className="caption" style={{ color: 'var(--color-ink-secondary)' }}>Minimum Variance (Risk Minimization)</li>
              <li className="caption" style={{ color: 'var(--color-ink-secondary)' }}>Markowitz Mean-Variance (Max Sharpe)</li>
              <li className="caption" style={{ color: 'var(--color-ink-secondary)' }}>Equal Risk Parity (Marginal Contribution)</li>
              <li className="caption" style={{ color: 'var(--color-ink-secondary)' }}>63-Day Rolling Sharpe & Drawdowns</li>
            </ul>
          </div>

          <div>
            <div className="micro-cap" style={{ color: 'var(--color-ink-mute)', marginBottom: '12px' }}>
              SUPPORTED ASSETS
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li className="caption" style={{ color: 'var(--color-ink-secondary)' }}>Equities: AAPL, AMZN, MSFT, NVDA, META, TSLA, ^NDX</li>
              <li className="caption" style={{ color: 'var(--color-ink-secondary)' }}>Commodities: Gold (GC=F), Silver (SI=F), Crude (CL=F)</li>
              <li className="caption" style={{ color: 'var(--color-ink-secondary)' }}>Crypto: BTC-USD, ETH-USD</li>
            </ul>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--color-hairline)',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div className="caption" style={{ color: 'var(--color-ink-mute)' }}>
            © {new Date().getFullYear()} MERIDIAN Financial Technologies. Inspired by institutional design standards.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span className="caption" style={{ color: 'var(--color-ink-mute)' }}>OpenAPI 3.1</span>
            <span className="caption" style={{ color: 'var(--color-ink-mute)' }}>FastAPI Engine</span>
            <span className="caption" style={{ color: 'var(--color-ink-mute)' }}>SQLite Cached</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
