import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Search, 
  Building2, 
  DollarSign, 
  ArrowUpRight,
  TrendingDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { formatCurrency, formatNumber } from '../utils';
import { toast } from 'sonner';

export function InventoryPage() {
  const inventory = useStore((s) => s.inventory);
  const restockInventory = useStore((s) => s.restockInventory);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState<string>(inventory[0]?.sku || '');
  const [restockAmount, setRestockAmount] = useState<number>(100);

  const totalSKUs = inventory.length;
  const totalAvailable = inventory.reduce((sum, i) => sum + i.available, 0);
  const totalReserved = inventory.reduce((sum, i) => sum + i.reserved, 0);
  const lowStockCount = inventory.filter((i) => i.available <= i.lowStockThreshold).length;

  const categories = ['all', ...Array.from(new Set(inventory.map((i) => i.category)))];

  const filteredItems = inventory.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.warehouse.toLowerCase().includes(q)
    );
  });

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSku || restockAmount <= 0) return;
    restockInventory(selectedSku, restockAmount);
    toast.success(`Successfully restocked ${restockAmount} units of ${selectedSku}`);
    setRestockModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Real-Time Inventory Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Distributed multi-warehouse stock positions, live reservation holds, and automatic reorder telemetry.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setRestockModalOpen(true)}
        >
          Replenish Stock
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total SKUs Tracked</span>
            <Package className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {totalSKUs}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">4 Global Distribution Centers</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Available Stock</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {formatNumber(totalAvailable)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Uncommitted physical units</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Reservation Holds</span>
            <Building2 className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-1">
            {formatNumber(totalReserved)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Enqueued order allocations</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Low Stock Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {lowStockCount}
          </div>
          <div className="text-[11px] text-amber-500/80 mt-1 font-medium">Below safe reorder point</div>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:max-w-md">
          <Input
            placeholder="Search SKU, product title, or warehouse location..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const isLowStock = item.available <= item.lowStockThreshold;
          const percentage = Math.round((item.available / item.totalStock) * 100);

          return (
            <Card
              key={item.id}
              className={`relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all ${
                isLowStock ? 'ring-1 ring-amber-500/40' : ''
              }`}
            >
              {/* Top Image & Badge */}
              <div className="relative h-40 -mx-5 -mt-5 mb-4 overflow-hidden bg-slate-950">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur border border-white/20 text-white">
                    {item.sku}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/80 backdrop-blur text-white font-medium">
                    {item.category}
                  </span>
                </div>

                {isLowStock && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-slate-950 text-[10px] font-bold animate-pulse shadow-lg">
                    <AlertTriangle className="w-3 h-3" />
                    <span>LOW STOCK</span>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <span className="text-xs font-mono font-bold">{formatCurrency(item.unitPrice)}</span>
                  <span className="text-[10px] text-slate-300 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {item.warehouse}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                {item.name}
              </h3>

              {/* Stock Numbers Breakdown */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-slate-800/80 my-3 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Total Stock</div>
                  <div className="font-mono text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {item.totalStock}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-sky-500 font-medium">Reserved</div>
                  <div className="font-mono text-sm font-bold text-sky-500 mt-0.5">
                    {item.reserved}
                  </div>
                </div>
                <div>
                  <div className={`text-[10px] font-medium ${isLowStock ? 'text-amber-500' : 'text-emerald-500'}`}>
                    Available
                  </div>
                  <div className={`font-mono text-sm font-bold mt-0.5 ${isLowStock ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {item.available}
                  </div>
                </div>
              </div>

              {/* Progress Bar (Green / Yellow / Red) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Available Ratio</span>
                  <span>{percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      percentage <= 25 ? 'bg-rose-500' : percentage <= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Threshold: {item.lowStockThreshold} units
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedSku(item.sku);
                    setRestockModalOpen(true);
                  }}
                >
                  Restock SKU
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Restock Modal */}
      <Modal
        isOpen={restockModalOpen}
        onClose={() => setRestockModalOpen(false)}
        title="Replenish Warehouse Stock"
        description="Inject immediate inventory into the active warehouse pool."
      >
        <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Product SKU
            </label>
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              {inventory.map((i) => (
                <option key={i.id} value={i.sku}>
                  {i.sku} — {i.name} ({i.available} in stock)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Units to Add
            </label>
            <Input
              type="number"
              min={1}
              max={5000}
              value={restockAmount}
              onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="ghost" size="sm" type="button" onClick={() => setRestockModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Confirm Replenishment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
