import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useFinanceStore } from '../../store/finance-store';
import { rupeesToPaise } from '../../lib/financial-engine';
import type { Category } from '../../types/financial';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: 'Food', label: 'Food & Dining' },
  { value: 'Transport', label: 'Transport & Commute' },
  { value: 'Groceries', label: 'Groceries & Essentials' },
  { value: 'Education', label: 'Education & Study' },
  { value: 'Bills', label: 'Bills & Utilities' },
  { value: 'Healthcare', label: 'Healthcare & Medicine' },
  { value: 'Entertainment', label: 'Entertainment & Outings' },
  { value: 'Other', label: 'Other / Miscellaneous' },
];

export function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  const currentDay = useFinanceStore((s) => s.state.currentDay);
  const addTransaction = useFinanceStore((s) => s.addTransaction);

  const [description, setDescription] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [isEssential, setIsEssential] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountRupees);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than ₹0');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    addTransaction({
      type: 'expense',
      amountPaise: rupeesToPaise(parsedAmount),
      category,
      date: new Date().toISOString().split('T')[0],
      day: currentDay,
      description: description.trim(),
      isEssential,
    });

    // Reset and close
    setDescription('');
    setAmountRupees('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Expense"
      description={`Record an actual expense on Day ${currentDay} of your ₹10,000 budget.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Amount (₹)"
          type="number"
          step="any"
          placeholder="e.g. 150"
          value={amountRupees}
          onChange={(e) => {
            setAmountRupees(e.target.value);
            setError('');
          }}
          autoFocus
          required
        />

        <Input
          label="Description"
          placeholder="e.g. Canteen lunch, metro token"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setError('');
          }}
          required
        />

        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          options={CATEGORY_OPTIONS}
        />

        <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={isEssential}
            onChange={(e) => setIsEssential(e.target.checked)}
            className="rounded border-charcoal-700 bg-charcoal-950 text-lime-400 focus:ring-lime-400 h-4 w-4"
          />
          <span>Mark as Mandatory / Essential Survival Need</span>
        </label>

        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

        <div className="flex justify-end gap-2.5 pt-3 border-t border-charcoal-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Record Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
}
