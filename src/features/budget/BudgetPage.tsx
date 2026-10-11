import React, { useState } from 'react';
import { PieChart, AlertCircle, CheckCircle, RefreshCw, Sliders, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useFinanceStore } from '../../store/finance-store';
import { formatINR, paiseToRupees, rupeesToPaise } from '../../lib/financial-engine';
import type { Category } from '../../types/financial';

export function BudgetPage() {
  const state = useFinanceStore((s) => s.state);
  const updateBudgetAllocation = useFinanceStore((s) => s.updateBudgetAllocation);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newAllocRupees, setNewAllocRupees] = useState('');

  const totalAllocatedPaise = state.budgetAllocations.reduce(
    (sum, b) => sum + b.allocatedPaise,
    0
  );
  const budgetVariancePaise = state.startingBudgetPaise - totalAllocatedPaise;

  const handleOpenEdit = (cat: Category, currentPaise: number) => {
    setEditingCategory(cat);
    setNewAllocRupees(paiseToRupees(currentPaise).toString());
  };

  const handleSaveAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const val = parseFloat(newAllocRupees);
    if (isNaN(val) || val < 0) return;

    updateBudgetAllocation(editingCategory, rupeesToPaise(val));
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">Category Budgets</h1>
          <p className="text-xs text-slate-400 mt-1">
            Distribute your ₹10,000 monthly ceiling across essential and lifestyle categories.
          </p>
        </div>

        {/* Budget Integrity Badge */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 text-xs flex items-center gap-2">
            <span className="text-slate-400">Total Allocated:</span>
            <span className="font-mono font-bold text-slate-100">
              {formatINR(totalAllocatedPaise)}
            </span>
            <span className="text-slate-500">/ {formatINR(state.startingBudgetPaise)}</span>
          </div>

          {budgetVariancePaise === 0 ? (
            <Badge variant="lime" size="md" className="flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" /> Balanced 100%
            </Badge>
          ) : budgetVariancePaise > 0 ? (
            <Badge variant="blue" size="md">
              {formatINR(budgetVariancePaise)} Unallocated
            </Badge>
          ) : (
            <Badge variant="red" size="md" className="flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5" /> Overallocated by {formatINR(Math.abs(budgetVariancePaise))}
            </Badge>
          )}
        </div>
      </div>

      {/* Advisory Notice */}
      <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 text-xs text-slate-400 flex items-start gap-3">
        <Sliders className="h-5 w-5 text-lime-400 flex-shrink-0 mt-0.5" />
        <p leading-relaxed>
          <strong className="text-slate-200">Financial Integrity Rule:</strong> Changing category budget allocations does not create fake expenses or change your actual cash balance. It establishes target spending boundaries to measure discipline and compute your Financial Health Score.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.budgetAllocations.map((alloc) => {
          const actualSpentPaise = state.transactions
            .filter((tx) => tx.category === alloc.category && tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amountPaise, 0);

          const remainingPaise = alloc.allocatedPaise - actualSpentPaise;
          const usagePct =
            alloc.allocatedPaise > 0
              ? Math.round((actualSpentPaise / alloc.allocatedPaise) * 100)
              : 0;
          const isOver = actualSpentPaise > alloc.allocatedPaise;

          return (
            <Card key={alloc.category} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{alloc.category}</h3>
                  <span className="text-[11px] text-slate-400">
                    Allocated: <strong className="font-mono text-slate-200">{formatINR(alloc.allocatedPaise)}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={isOver ? 'red' : usagePct > 80 ? 'amber' : 'lime'} size="sm">
                    {isOver ? 'Over Budget' : `${usagePct}% Used`}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(alloc.category, alloc.allocatedPaise)}
                    className="h-7 text-xs px-2 text-slate-400 hover:text-white"
                  >
                    Adjust
                  </Button>
                </div>
              </div>

              {/* Progress bar */}
              <ProgressBar
                value={usagePct}
                max={100}
                color={isOver ? 'red' : usagePct > 80 ? 'amber' : 'lime'}
              />

              {/* Spent & Remaining Row */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-charcoal-800/60">
                <span className="text-slate-400">
                  Spent: <strong className="font-mono text-slate-200">{formatINR(actualSpentPaise)}</strong>
                </span>
                <span className={isOver ? 'text-red-400 font-bold' : 'text-slate-300'}>
                  {isOver
                    ? `Over by ${formatINR(Math.abs(remainingPaise))}`
                    : `Remaining: ${formatINR(remainingPaise)}`}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Reallocation Edit Modal */}
      {editingCategory && (
        <Modal
          isOpen={true}
          onClose={() => setEditingCategory(null)}
          title={`Adjust Budget for ${editingCategory}`}
          description="Allocate monthly funds to this category without changing cash in hand."
        >
          <form onSubmit={handleSaveAllocation} className="space-y-4">
            <Input
              label="New Allocation Amount (₹)"
              type="number"
              step="any"
              min="0"
              value={newAllocRupees}
              onChange={(e) => setNewAllocRupees(e.target.value)}
              required
              autoFocus
            />

            <p className="text-xs text-slate-400">
              Allocating more here may cause your total budget allocations to exceed ₹10,000 unless you reduce another category.
            </p>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-charcoal-800">
              <Button type="button" variant="ghost" onClick={() => setEditingCategory(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Update Allocation
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
