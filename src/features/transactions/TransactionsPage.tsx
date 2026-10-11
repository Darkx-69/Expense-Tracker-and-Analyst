import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit2,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Download,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { AddExpenseModal } from '../../components/common/AddExpenseModal';
import { AddIncomeModal } from '../../components/common/AddIncomeModal';
import { useFinanceStore } from '../../store/finance-store';
import { exportService } from '../../services/export';
import { formatINR, paiseToRupees, rupeesToPaise } from '../../lib/financial-engine';
import type { Transaction, Category, TransactionType } from '../../types/financial';

export function TransactionsPage() {
  const transactions = useFinanceStore((s) => s.state.transactions);
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);
  const updateTransaction = useFinanceStore((s) => s.updateTransaction);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Edit form state
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState<Category>('Food');

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditDesc(tx.description);
    setEditAmount(paiseToRupees(tx.amountPaise).toString());
    setEditCategory(tx.category);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    const parsedAmt = parseFloat(editAmount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) return;

    updateTransaction(editingTx.id, {
      description: editDesc.trim(),
      amountPaise: rupeesToPaise(parsedAmt),
      category: editCategory,
    });

    setEditingTx(null);
  };

  const handleDelete = (id: string, desc: string) => {
    if (window.confirm(`Delete transaction "${desc}"? This will recompute your financial balance.`)) {
      deleteTransaction(id);
    }
  };

  // Filter & Sort
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const matchesSearch =
          tx.description.toLowerCase().includes(search.toLowerCase()) ||
          tx.category.toLowerCase().includes(search.toLowerCase());
        const matchesCategory =
          selectedCategory === 'ALL' || tx.category === selectedCategory;
        const matchesType = selectedType === 'ALL' || tx.type === selectedType;

        return matchesSearch && matchesCategory && matchesType;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          const res = b.day - a.day;
          return sortOrder === 'desc' ? res : -res;
        } else {
          const res = b.amountPaise - a.amountPaise;
          return sortOrder === 'desc' ? res : -res;
        }
      });
  }, [transactions, search, selectedCategory, selectedType, sortField, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">Transaction History</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track and audit every rupee in your 30-day challenge. {transactions.length} total records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportService.exportTransactionsToCsv(transactions)}
            title="Download CSV report"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>

          <Button
            data-testid="add-expense-button"
            variant="secondary"
            size="sm"
            onClick={() => setIsAddExpenseOpen(true)}
          >
            <PlusCircle className="h-4 w-4 mr-1.5 text-red-400" />
            Add Expense
          </Button>

          <Button
            data-testid="add-income-button"
            variant="primary"
            size="sm"
            onClick={() => setIsAddIncomeOpen(true)}
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            Add Income
          </Button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-charcoal-950 border border-charcoal-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-lime-400"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-charcoal-950 border border-charcoal-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-lime-400"
          >
            <option value="ALL">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
            <option value="savings_transfer">Savings Transfers</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-charcoal-950 border border-charcoal-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-lime-400"
          >
            <option value="ALL">All Categories</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Groceries">Groceries</option>
            <option value="Education">Education</option>
            <option value="Bills">Bills</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Savings">Savings</option>
            <option value="Income">Income</option>
          </select>

          {/* Sort Switcher */}
          <button
            onClick={() => {
              if (sortField === 'date') {
                if (sortOrder === 'desc') setSortOrder('asc');
                else setSortField('amount');
              } else {
                if (sortOrder === 'desc') setSortOrder('asc');
                else {
                  setSortField('date');
                  setSortOrder('desc');
                }
              }
            }}
            className="flex items-center justify-between px-3 py-2 bg-charcoal-950 border border-charcoal-800 rounded-lg text-xs text-slate-300 hover:border-slate-600"
          >
            <span className="flex items-center gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5 text-lime-400" />
              Sort: {sortField === 'date' ? 'Day' : 'Amount'} ({sortOrder.toUpperCase()})
            </span>
          </button>
        </div>
      </Card>

      {/* Transaction List */}
      <Card className="p-0 overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-charcoal-800/80">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isSavings = tx.type === 'savings_transfer';

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 hover:bg-charcoal-850/60 transition-colors group text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isIncome
                          ? 'bg-lime-400/15 text-lime-400'
                          : isSavings
                          ? 'bg-blue-400/15 text-blue-400'
                          : 'bg-red-400/15 text-red-400'
                      }`}
                    >
                      {isIncome ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : isSavings ? (
                        <PiggyBank className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100 text-sm">
                          {tx.description}
                        </span>
                        {tx.isEssential && (
                          <Badge variant="amber" size="sm">
                            Essential
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>Day {tx.day} ({tx.date})</span>
                        <span>•</span>
                        <span className="text-slate-300">{tx.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span
                        className={`font-mono font-bold text-sm block ${
                          isIncome
                            ? 'text-lime-400'
                            : isSavings
                            ? 'text-blue-400'
                            : 'text-slate-100'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{formatINR(tx.amountPaise)}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">
                        {tx.type.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(tx)}
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-charcoal-700"
                        title="Edit transaction"
                        aria-label="Edit transaction"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id, tx.description)}
                        className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-charcoal-700"
                        title="Delete transaction"
                        aria-label="Delete transaction"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <Filter className="h-8 w-8 mx-auto text-slate-600" />
            <p>No transactions match your search or filter criteria.</p>
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      {editingTx && (
        <Modal
          isOpen={true}
          onClose={() => setEditingTx(null)}
          title="Edit Transaction"
          description={`Update details for ${editingTx.description}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Input
              label="Description"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              required
            />
            <Input
              label="Amount (₹)"
              type="number"
              step="any"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              required
            />
            <Select
              label="Category"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value as Category)}
              options={[
                { value: 'Food', label: 'Food' },
                { value: 'Transport', label: 'Transport' },
                { value: 'Groceries', label: 'Groceries' },
                { value: 'Education', label: 'Education' },
                { value: 'Bills', label: 'Bills' },
                { value: 'Healthcare', label: 'Healthcare' },
                { value: 'Entertainment', label: 'Entertainment' },
                { value: 'Savings', label: 'Savings' },
                { value: 'Income', label: 'Income' },
                { value: 'Other', label: 'Other' },
              ]}
            />
            <div className="flex justify-end gap-2.5 pt-3 border-t border-charcoal-800">
              <Button type="button" variant="ghost" onClick={() => setEditingTx(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Quick Add Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
      />
      <AddIncomeModal
        isOpen={isAddIncomeOpen}
        onClose={() => setIsAddIncomeOpen(false)}
      />
    </div>
  );
}
