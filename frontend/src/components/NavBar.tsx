import React from 'react';
import { Layers, Activity, PieChart, GitCompare, ShieldCheck } from 'lucide-react';

interface NavBarProps {
  currentTab: 'builder' | 'dashboard' | 'analyze' | 'compare';
  onSelectTab: (tab: 'builder' | 'dashboard' | 'analyze' | 'compare') => void;
  hasResults: boolean;
}

export const NavBar: React.FC<NavBarProps> = ({ currentTab, onSelectTab, hasResults }) => {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-hairline)',
        padding: '12px 0',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => onSelectTab('builder')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(83, 58, 253, 0.3)',
            }}
          >
            <Activity size={18} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  letterSpacing: '-0.3px',
                  color: 'var(--color-ink)',
                }}
              >
                MERIDIAN
              </span>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                }}
              />
            </div>
            <div
              className="micro-cap"
              style={{ color: 'var(--color-ink-mute)', marginTop: '-2px' }}
            >
              MULTI-ASSET QUANT ENGINE
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => onSelectTab('builder')}
            className="button-secondary"
            style={{
              border: 'none',
              backgroundColor:
                currentTab === 'builder'
                  ? 'var(--color-canvas-soft)'
                  : 'transparent',
              color:
                currentTab === 'builder'
                  ? 'var(--color-primary)'
                  : 'var(--color-ink-secondary)',
              fontWeight: currentTab === 'builder' ? 500 : 400,
              fontSize: '14px',
              padding: '6px 14px',
            }}
          >
            <Layers size={15} />
            Portfolio Builder
          </button>

          <button
            onClick={() => onSelectTab('dashboard')}
            className="button-secondary"
            style={{
              border: 'none',
              backgroundColor:
                currentTab === 'dashboard'
                  ? 'var(--color-canvas-soft)'
                  : 'transparent',
              color:
                currentTab === 'dashboard'
                  ? 'var(--color-primary)'
                  : 'var(--color-ink-secondary)',
              fontWeight: currentTab === 'dashboard' ? 500 : 400,
              fontSize: '14px',
              padding: '6px 14px',
              opacity: hasResults ? 1 : 0.65,
            }}
          >
            <PieChart size={15} />
            Results Dashboard
            {hasResults && (
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#0c7847',
                }}
              />
            )}
          </button>

          <button
            onClick={() => onSelectTab('analyze')}
            className="button-secondary"
            style={{
              border: 'none',
              backgroundColor:
                currentTab === 'analyze'
                  ? 'var(--color-canvas-soft)'
                  : 'transparent',
              color:
                currentTab === 'analyze'
                  ? 'var(--color-primary)'
                  : 'var(--color-ink-secondary)',
              fontWeight: currentTab === 'analyze' ? 500 : 400,
              fontSize: '14px',
              padding: '6px 14px',
            }}
          >
            <ShieldCheck size={15} />
            Analyze Portfolio
          </button>

          <button
            onClick={() => onSelectTab('compare')}
            className="button-secondary"
            style={{
              border: 'none',
              backgroundColor:
                currentTab === 'compare'
                  ? 'var(--color-canvas-soft)'
                  : 'transparent',
              color:
                currentTab === 'compare'
                  ? 'var(--color-primary)'
                  : 'var(--color-ink-secondary)',
              fontWeight: currentTab === 'compare' ? 500 : 400,
              fontSize: '14px',
              padding: '6px 14px',
            }}
          >
            <GitCompare size={15} />
            Compare Universes
          </button>
        </nav>

        {/* Status Pill Tag & CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="pill-tag-soft success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#0c7847',
              }}
            />
            <span>SLSQP Engine Live</span>
          </div>

          <button
            onClick={() => onSelectTab('builder')}
            className="button-primary-pill"
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            Launch Run
          </button>
        </div>
      </div>
    </header>
  );
};
