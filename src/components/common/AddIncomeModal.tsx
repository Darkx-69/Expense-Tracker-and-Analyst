import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useFinanceStore } from '../../store/finance-store';
import { rupeesToPaise } from '../../lib/financial-engine';

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddIncomeModal({ isOpen, onClose }: AddIncomeModalProps) {
  const currentDay = useFinanceStore((s) => s.state.currentDay);
  const addTransaction = useFinanceStore((s) => s.addTransaction);

  const [description, setDescription] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
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
      type: 'income',
      amountPaise: rupeesToPaise(parsedAmount),
      category: 'Income',
      date: new Date().toISOString().split('T')[0],
      day: currentDay,
      description: description.trim(),
    });

    setDescription('');
    setAmountRupees('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Realized Income"
      description={`Record extra funds received (freelance, stipend, refund) on Day ${currentDay}.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Amount Received (₹)"
          type="number"
          step="any"
          placeholder="e.g. 500"
          value={amountRupees}
          onChange={(e) => {
            setAmountRupees(e.target.value);
            setError('');
          }}
          autoFocus
          required
        />

        <Input
          label="Source / Description"
          placeholder="e.g. Freelance tutoring, bill split refund"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setError('');
          }}
          required
        />

        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

        <div className="flex justify-end gap-2.5 pt-3 border-t border-charcoal-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Record Income
          </Button>
        </div>
      </form>
    </Modal>
  );
}
