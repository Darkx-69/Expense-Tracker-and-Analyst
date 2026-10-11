import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { TransactionsPage } from '../features/transactions/TransactionsPage';
import { SimulatorPage } from '../features/simulator/SimulatorPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { useFinanceStore } from '../store/finance-store';

// Mock ResizeObserver for Recharts in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('Component Integration Tests', () => {
  beforeEach(() => {
    useFinanceStore.getState().resetDemoData();
  });

  it('renders Dashboard immediately with deterministic demo data and test-ids', () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    // Verify main headings and test-ids exist without requiring any login
    expect(screen.getByText(/Survival Dashboard/i)).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-balance')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-daily-allowance')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-month-end-forecast')).toBeInTheDocument();
    expect(screen.getByTestId('add-expense-button')).toBeInTheDocument();
    expect(screen.getByTestId('add-income-button')).toBeInTheDocument();
    expect(screen.getByTestId('open-simulator-button')).toBeInTheDocument();

    // Verify baseline ₹10,000 challenge context
    expect(screen.getByText(/₹10,000 monthly challenge/i)).toBeInTheDocument();
  });

  it('renders Transactions page, filters, and add buttons', () => {
    render(
      <BrowserRouter>
        <TransactionsPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Transaction History/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search description/i)).toBeInTheDocument();
    expect(screen.getByText(/Export CSV/i)).toBeInTheDocument();
  });

  it('renders Decision Simulator and allows selecting presets', () => {
    render(
      <BrowserRouter>
        <SimulatorPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Decision Simulator/i)).toBeInTheDocument();
    expect(screen.getByText(/Instant Preset Scenarios/i)).toBeInTheDocument();
    expect(screen.getByTestId('apply-decision-button')).toBeInTheDocument();
    expect(screen.getByTestId('reset-scenario-button')).toBeInTheDocument();
  });

  it('renders Settings page with data export and baseline reset controls', () => {
    render(
      <BrowserRouter>
        <SettingsPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Settings & Data Management/i)).toBeInTheDocument();
    expect(screen.getByTestId('export-data-button')).toBeInTheDocument();
    expect(screen.getByTestId('import-data-button')).toBeInTheDocument();
    expect(screen.getByTestId('reset-demo-button')).toBeInTheDocument();
  });
});
