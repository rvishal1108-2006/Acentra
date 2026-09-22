import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from '../components/layout/TopNav';
import { Sidebar } from '../components/layout/Sidebar';
import { CommandPalette } from '../components/command/CommandPalette';
import { OrderTimelineDrawer } from '../features/orders/OrderTimelineDrawer';
import { useRealTimeEngine } from '../hooks/useRealTimeEngine';
import { useBackendSync } from '../hooks/useBackendSync';
import { useStore } from '../store/useStore';
import { cn } from '../utils';

export function DashboardLayout() {
  // Real-time local fallback engine and live Spring Boot STOMP/REST bridge
  useRealTimeEngine();
  useBackendSync();
  const theme = useStore((s) => s.theme);

  return (
    <div className={cn('min-h-screen flex flex-col', theme === 'dark' ? 'bg-mesh-dark' : 'bg-mesh-light')}>
      <TopNav />
      <div className="flex-1 flex w-full">
        <Sidebar />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Interactive Elements */}
      <CommandPalette />
      <OrderTimelineDrawer />
    </div>
  );
}
