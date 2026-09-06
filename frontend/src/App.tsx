import React, { useState, useEffect } from 'react';
import type {
  AssetItem,
  OptimizeResponse,
  BacktestResponse,
  RiskReportResponse,
} from './api/client';
import { apiClient } from './api/client';
import { NavBar } from './components/NavBar';
import { GradientMesh } from './components/GradientMesh';
import { Footer } from './components/Footer';
import { BuilderPage } from './pages/BuilderPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { ComparePage } from './pages/ComparePage';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'builder' | 'dashboard' | 'analyze' | 'compare'>('builder');
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('2021-01-01');
  const [endDate, setEndDate] = useState<string>('2023-12-31');
  const [transactionCost, setTransactionCost] = useState<number>(0.0005);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');

  const [optimizeResult, setOptimizeResult] = useState<OptimizeResponse | null>(null);
  const [backtestResult, setBacktestResult] = useState<BacktestResponse | null>(null);
  const [riskReport, setRiskReport] = useState<RiskReportResponse | null>(null);

  // Fetch supported assets on initial mount
  useEffect(() => {
    async function loadAssets() {
      try {
        const res = await apiClient.getAssets();
        setAssets(res.assets);
        // Default to all assets (12 assets)
        setSelectedTickers(res.assets.map((a) => a.id));
      } catch (err: any) {
        console.error('Failed to load assets:', err);
      }
    }
    loadAssets();
  }, []);

  const handleToggleTicker = (id: string) => {
    if (selectedTickers.includes(id)) {
      if (selectedTickers.length <= 2) {
        alert('Portfolio must contain at least 2 assets.');
        return;
      }
      setSelectedTickers(selectedTickers.filter((t) => t !== id));
    } else {
      setSelectedTickers([...selectedTickers, id]);
    }
  };

  const handleSelectPreset = (ids: string[]) => {
    setSelectedTickers(ids);
  };

  const handleRunOptimization = async () => {
    if (selectedTickers.length < 2) {
      alert('Please select at least 2 assets.');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Fetching asset price histories...');

    try {
      // 1. Run Optimization
      setLoadingStep('Solving SLSQP objective functions (MinVar, Markowitz, RiskParity)...');
      const optRes = await apiClient.optimize({
        tickers: selectedTickers,
        start_date: startDate,
        end_date: endDate,
        strategies: ['MinVar', 'Markowitz', 'RiskParity'],
      });

      // 2. Run Backtest
      setLoadingStep('Simulating daily fixed-weight rebalancing & drawdowns...');
      const btRes = await apiClient.backtest({
        tickers: selectedTickers,
        start_date: startDate,
        end_date: endDate,
        weights: optRes.weights,
        transaction_cost: transactionCost,
      });

      // 3. Run Risk Report
      setLoadingStep('Computing marginal risk contributions & stress test...');
      const riskRes = await apiClient.riskReport({
        tickers: selectedTickers,
        start_date: startDate,
        end_date: endDate,
        weights: optRes.weights,
      });

      setOptimizeResult(optRes);
      setBacktestResult(btRes);
      setRiskReport(riskRes);

      // Transition to results dashboard
      setCurrentTab('dashboard');
    } catch (err: any) {
      console.error('Optimization run failed:', err);
      alert(`Optimization run failed: ${err.message || 'Check date range and inputs'}`);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Signature Atmospheric Gradient Mesh (upper third) */}
      <GradientMesh />

      {/* Navigation Header */}
      <NavBar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        hasResults={Boolean(optimizeResult && backtestResult)}
      />

      {/* Main View Area */}
      <main style={{ flex: 1 }}>
        {currentTab === 'builder' && (
          <BuilderPage
            assets={assets}
            selectedTickers={selectedTickers}
            onToggleTicker={handleToggleTicker}
            onSelectPreset={handleSelectPreset}
            startDate={startDate}
            endDate={endDate}
            onChangeStartDate={setStartDate}
            onChangeEndDate={setEndDate}
            transactionCost={transactionCost}
            onChangeTransactionCost={setTransactionCost}
            onRunOptimization={handleRunOptimization}
            isLoading={isLoading}
            loadingStep={loadingStep}
          />
        )}

        {currentTab === 'dashboard' && optimizeResult && backtestResult && (
          <DashboardPage
            optimizeResult={optimizeResult}
            backtestResult={backtestResult}
            riskReport={riskReport}
            onModifyUniverse={() => setCurrentTab('builder')}
          />
        )}

        {currentTab === 'dashboard' && (!optimizeResult || !backtestResult) && (
          <div className="section-content">
            <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
              <div className="card-feature-light" style={{ maxWidth: '520px', margin: '0 auto', padding: '40px' }}>
                <h3 className="heading-md" style={{ marginBottom: '12px', color: 'var(--color-ink)' }}>
                  No Active Optimization Run
                </h3>
                <p className="caption" style={{ color: 'var(--color-ink-mute)', marginBottom: '24px' }}>
                  Please configure your asset universe and date parameters in the Portfolio Builder to generate model results.
                </p>
                <button
                  onClick={() => setCurrentTab('builder')}
                  className="button-primary-pill"
                >
                  Go to Portfolio Builder
                </button>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'analyze' && (
          <AnalyzePage
            assets={assets}
            startDate={startDate}
            endDate={endDate}
          />
        )}

        {currentTab === 'compare' && (
          <ComparePage
            assets={assets}
            startDate={startDate}
            endDate={endDate}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
