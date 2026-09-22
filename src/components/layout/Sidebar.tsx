import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Clock, 
  Workflow, 
  Cpu, 
  BarChart3, 
  FileText, 
  Zap, 
  Settings, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../utils';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const orders = useStore((s) => s.orders);
  const inventory = useStore((s) => s.inventory);
  const reservations = useStore((s) => s.reservations);
  const queues = useStore((s) => s.queues);
  const workers = useStore((s) => s.workers);
  const loadTest = useStore((s) => s.loadTest);
  const systemHealth = useStore((s) => s.systemHealth);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;
  const lowStockCount = inventory.filter((i) => i.available <= i.lowStockThreshold).length;
  const activeReservationsCount = reservations.filter((r) => r.status === 'active').length;
  const totalQueueDepth = queues.reduce((sum, q) => sum + q.messages, 0);
  const activeWorkersCount = workers.filter((w) => w.status === 'active' || w.status === 'busy').length;

  const navItems = [
    {
      title: 'Operations',
      items: [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Orders', path: '/orders', icon: ShoppingBag, badge: pendingOrdersCount, badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400' },
        { label: 'Inventory', path: '/inventory', icon: Package, badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined, badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
        { label: 'Reservations', path: '/reservations', icon: Clock, badge: activeReservationsCount, badgeColor: 'bg-sky-500/15 text-sky-600 dark:text-sky-400' },
      ]
    },
    {
      title: 'Infrastructure',
      items: [
        { label: 'Queue Monitor', path: '/queues', icon: Workflow, badge: totalQueueDepth, badgeColor: 'bg-pink-500/15 text-pink-600 dark:text-pink-400' },
        { label: 'Workers', path: '/workers', icon: Cpu, badge: `${activeWorkersCount}/${workers.length}`, badgeColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400' },
        { label: 'Analytics', path: '/analytics', icon: BarChart3 },
        { label: 'Audit Logs', path: '/audit', icon: FileText },
      ]
    },
    {
      title: 'Tools & Client',
      items: [
        { 
          label: 'Load Testing', 
          path: '/loadtest', 
          icon: Zap, 
          badge: loadTest.isRunning ? 'BURST' : undefined, 
          badgeColor: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 animate-pulse font-bold' 
        },
        { label: 'Customer Portal', path: '/portal', icon: User },
        { label: 'Settings', path: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside
      className={cn(
        'sticky top-16 h-[calc(100vh-4rem)] border-r border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between z-30 select-none',
        collapsed ? 'w-18' : 'w-64'
      )}
    >
      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navItems.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                {section.title}
              </div>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative',
                    isActive
                      ? 'bg-indigo-600/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 dark:bg-indigo-400 rounded-r-full" />
                    )}
                    <item.icon className={cn('w-4 h-4 shrink-0 transition-transform group-hover:scale-110', isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400')} />
                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!collapsed && item.badge !== undefined && (
                      <span className={cn('text-[10px] font-mono font-bold px-2 py-0.5 rounded-full', item.badgeColor)}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom Cluster Health Widget & Collapse Button */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
        {!collapsed && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                Cluster Health
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                {systemHealth.overall}
              </span>
            </div>
            <div className="space-y-1 font-mono text-[10px] text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>API Latency</span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{systemHealth.api.latencyMs}ms</span>
              </div>
              <div className="flex justify-between">
                <span>RabbitMQ Ingress</span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{queues[0].throughputIn} msg/s</span>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : (
            <div className="flex items-center gap-2 text-xs font-medium">
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
