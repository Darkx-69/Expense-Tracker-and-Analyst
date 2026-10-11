import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { DayAdvancerModal } from '../common/DayAdvancerModal';
import { MonthEndModal } from '../common/MonthEndModal';

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDayAdvancerOpen, setIsDayAdvancerOpen] = useState(false);
  const [isMonthEndOpen, setIsMonthEndOpen] = useState(false);

  return (
    <div className="flex h-screen bg-charcoal-950 text-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onAdvanceDayClick={() => setIsDayAdvancerOpen(true)}
        />

        {/* Scrollable Page Outlet */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 pb-24 md:pb-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation & Drawer */}
      <MobileNav
        isMenuOpen={isMobileMenuOpen}
        onCloseMenu={() => setIsMobileMenuOpen(false)}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Interactive Global Modals */}
      <DayAdvancerModal
        isOpen={isDayAdvancerOpen}
        onClose={() => setIsDayAdvancerOpen(false)}
        onCycleComplete={() => setIsMonthEndOpen(true)}
      />

      <MonthEndModal
        isOpen={isMonthEndOpen}
        onClose={() => setIsMonthEndOpen(false)}
      />
    </div>
  );
}
