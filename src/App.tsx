import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { TransactionsPage } from './features/transactions/TransactionsPage';
import { BudgetPage } from './features/budget/BudgetPage';
import { CommitmentsPage } from './features/commitments/CommitmentsPage';
import { GoalsPage } from './features/goals/GoalsPage';
import { SubscriptionsPage } from './features/subscriptions/SubscriptionsPage';
import { SimulatorPage } from './features/simulator/SimulatorPage';
import { ForecastPage } from './features/forecast/ForecastPage';
import { InsightsPage } from './features/insights/InsightsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { NotFoundPage } from './features/not-found/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="commitments" element={<CommitmentsPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="simulator" element={<SimulatorPage />} />
          <Route path="forecast" element={<ForecastPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
