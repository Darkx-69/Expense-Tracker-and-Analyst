import React, { useState } from 'react';
import {
  CalendarClock,
  PlusCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Check,
  Ban,
  Trash2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useFinanceStore } from '../../store/finance-store';
import { formatINR, paiseToRupees, rupeesToPaise } from '../../lib/financial-engine';
import type { Commitment, Category } from '../../types/financial';

export function CommitmentsPage() {
  const commitments = useFinanceStore((s) => s.state.commitments);
  const currentDay = useFinanceStore((s) => s.state.currentDay);
  const markCommitmentPaid = useFinanceStore((s) => s.markCommitmentPaid);
  const cancelCommitment = useFinanceStore((s) => s.cancelCommitment);
  const deleteCommitment = useFinanceStore((s) => s.deleteCommitment);
  const addCommitment = useFinanceStore((s) => s.addCommitment);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
  const [dueDay, setDueDay] = useState('10');
  const [category, setCategory] = useState<Category>('Bills');
  const [classification, setClassification] = useState<'essential' | 'discretionary'>('essential');
  const [recurrence, setRecurrence] = useState<'one-time' | 'monthly'>('one-time');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(amountRupees);
    const parsedDay = parseInt(dueDay, 10);

    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (isNaN(parsedDay) || parsedDay < 1 || parsedDay > 30) {
      setError('Due Day must be between Day 1 and Day 30');
      return;
    }

    addCommitment({
      name: name.trim(),
      amountPaise: rupeesToPaise(parsedAmt),
      dueDay: parsedDay,
      category,
      classification,
      recurrence,
      status: 'unpaid',
      notes: notes.trim(),
    });

    setName('');
    setAmountRupees('');
    setNotes('');
    setIsAddOpen(false);
  };

  const handlePay = (id: string, billName: string, amountPaise: number) => {
    if (
      window.confirm(
        `Mark "${billName}" as paid (${formatINR(amountPaise)})? This will record an actual expense and deduct from your spendable cash balance.`
      )
    ) {
      markCommitmentPaid(id);
    }
  };

  const handleCancel = (id: string, billName: string) => {
    if (
      window.confirm(
        `Cancel bill "${billName}"? This will remove it from future cash forecast obligations.`
      )
    ) {
      cancelCommitment(id);
    }
  };

  // Group commitments by status
  const unpaid = commitments.filter((c) => c.status === 'unpaid');
  const paid = commitments.filter((c) => c.status === 'paid');
  const cancelled = commitments.filter((c) => c.status === 'cancelled');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">Bills & Commitments</h1>
          <p className="text-xs text-slate-400 mt-1">
            Obligations due this month. Unpaid bills affect your forecast without deducting available cash early.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-1.5" />
          Add Commitment
        </Button>
      </div>

      {/* Unpaid / Upcoming Section */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-amber-400">
              <Clock className="h-4 w-4" /> Pending & Upcoming Bills ({unpaid.length})
            </CardTitle>
            <CardDescription>
              Mandatory and planned outflows. Click "Mark as Paid" when settled.
            </CardDescription>
          </div>
        </CardHeader>

        {unpaid.length > 0 ? (
          <div className="divide-y divide-charcoal-800">
            {unpaid.map((bill) => {
              const isOverdue = bill.dueDay < currentDay;
              const isDueToday = bill.dueDay === currentDay;

              return (
                <div
                  key={bill.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">{bill.name}</span>
                      <Badge
                        variant={bill.classification === 'essential' ? 'red' : 'neutral'}
                        size="sm"
                      >
                        {bill.classification}
                      </Badge>
                      {isOverdue && <Badge variant="red" size="sm">Overdue</Badge>}
                      {isDueToday && <Badge variant="amber" size="sm">Due Today</Badge>}
                    </div>

                    <div className="text-slate-400 flex items-center gap-2">
                      <span>Due: Day {bill.dueDay} of 30</span>
                      <span>•</span>
                      <span>Category: {bill.category}</span>
                      <span>•</span>
                      <span>{bill.recurrence}</span>
                    </div>

                    {bill.notes && <p className="text-[11px] text-slate-500 italic">{bill.notes}</p>}
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right mr-2">
                      <span className="font-mono font-bold text-base text-amber-400 block">
                        {formatINR(bill.amountPaise)}
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handlePay(bill.id, bill.name, bill.amountPaise)}
                      className="text-xs h-8"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" /> Mark Paid
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(bill.id, bill.name)}
                      className="text-xs h-8 text-slate-400 hover:text-red-400"
                    >
                      <Ban className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            <CheckCircle2 className="h-6 w-6 text-lime-400 mx-auto mb-2" />
            No unpaid bills remaining! All commitments have been settled.
          </div>
        )}
      </Card>

      {/* Settled & Cancelled History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Paid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lime-400">
              <CheckCircle2 className="h-4 w-4" /> Paid Bills ({paid.length})
            </CardTitle>
          </CardHeader>
          {paid.length > 0 ? (
            <div className="space-y-2 text-xs">
              {paid.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-lg bg-charcoal-950 border border-charcoal-800 flex justify-between items-center"
                >
                  <div>
                    <span className="font-semibold text-slate-200">{b.name}</span>
                    <span className="block text-[10px] text-slate-400">Settled • {b.category}</span>
                  </div>
                  <span className="font-mono font-bold text-lime-400">
                    {formatINR(b.amountPaise)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic p-4 text-center">No paid bills yet.</p>
          )}
        </Card>

        {/* Cancelled */}
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-400">
              <XCircle className="h-4 w-4" /> Cancelled Obligations ({cancelled.length})
            </CardTitle>
          </CardHeader>
          {cancelled.length > 0 ? (
            <div className="space-y-2 text-xs">
              {cancelled.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-lg bg-charcoal-950 border border-charcoal-800 flex justify-between items-center opacity-70"
                >
                  <div>
                    <span className="font-semibold text-slate-300 line-through">{b.name}</span>
                    <span className="block text-[10px] text-slate-500">Cancelled obligation</span>
                  </div>
                  <span className="font-mono text-slate-400 line-through">
                    {formatINR(b.amountPaise)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic p-4 text-center">No cancelled bills.</p>
          )}
        </Card>
      </div>

      {/* Add Commitment Modal */}
      {isAddOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddOpen(false)}
          title="Add Upcoming Commitment"
          description="Schedule a bill or mandatory obligation due later this month."
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <Input
              label="Commitment Name"
              placeholder="e.g. Wi-Fi bill, Textbook fee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Amount (₹)"
                type="number"
                step="any"
                placeholder="e.g. 600"
                value={amountRupees}
                onChange={(e) => setAmountRupees(e.target.value)}
                required
              />
              <Input
                label="Due Day (1-30)"
                type="number"
                min="1"
                max="30"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                options={[
                  { value: 'Bills', label: 'Bills & Utilities' },
                  { value: 'Education', label: 'Education' },
                  { value: 'Food', label: 'Food' },
                  { value: 'Transport', label: 'Transport' },
                  { value: 'Entertainment', label: 'Entertainment' },
                  { value: 'Healthcare', label: 'Healthcare' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
              <Select
                label="Priority"
                value={classification}
                onChange={(e) => setClassification(e.target.value as any)}
                options={[
                  { value: 'essential', label: 'Essential / Mandatory' },
                  { value: 'discretionary', label: 'Discretionary' },
                ]}
              />
            </div>

            <Input
              label="Optional Notes"
              placeholder="e.g. Split with room-mate"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-charcoal-800">
              <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Add Commitment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
