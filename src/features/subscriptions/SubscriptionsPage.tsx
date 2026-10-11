import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Repeat,
  PlusCircle,
  Sparkles,
  Ban,
  Pause,
  Play,
  Trash2,
  Calendar,
  AlertCircle,
  TrendingDown,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useFinanceStore } from '../../store/finance-store';
import { formatINR, paiseToRupees, rupeesToPaise } from '../../lib/financial-engine';
import type { Subscription, Category } from '../../types/financial';

export function SubscriptionsPage() {
  const navigate = useNavigate();
  const subscriptions = useFinanceStore((s) => s.state.subscriptions);
  const currentDay = useFinanceStore((s) => s.state.currentDay);
  const addSubscription = useFinanceStore((s) => s.addSubscription);
  const cancelSubscription = useFinanceStore((s) => s.cancelSubscription);
  const pauseSubscription = useFinanceStore((s) => s.pauseSubscription);
  const reactivateSubscription = useFinanceStore((s) => s.reactivateSubscription);
  const deleteSubscription = useFinanceStore((s) => s.deleteSubscription);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [priceRupees, setPriceRupees] = useState('');
  const [renewalDay, setRenewalDay] = useState('15');
  const [category, setCategory] = useState<Category>('Entertainment');
  const [classification, setClassification] = useState<'essential' | 'discretionary'>('discretionary');

  // Metrics
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const totalMonthlyCostPaise = activeSubs.reduce((sum, s) => sum + s.pricePaise, 0);
  const discretionaryCostPaise = activeSubs
    .filter((s) => s.classification === 'discretionary')
    .reduce((sum, s) => sum + s.pricePaise, 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(priceRupees);
    const parsedDay = parseInt(renewalDay, 10);
    if (isNaN(parsedPrice) || parsedPrice <= 0) return;

    addSubscription({
      name: name.trim(),
      pricePaise: rupeesToPaise(parsedPrice),
      billingFrequency: 'monthly',
      renewalDay: parsedDay || 15,
      category,
      classification,
      status: 'active',
    });

    setName('');
    setPriceRupees('');
    setIsAddOpen(false);
  };

  const handleSimulateCancel = (sub: Subscription) => {
    // Navigate to simulator with pre-selected preset for this sub
    navigate(`/simulator?targetSubId=${sub.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">Recurring Subscriptions</h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated monthly drains on your ₹10,000 allowance. Cancelling stops future renewals.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-1.5" />
          Add Subscription
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <span className="text-xs text-slate-400">Monthly Recurring Drain</span>
          <div className="text-2xl font-extrabold font-mono text-slate-100 mt-1">
            {formatINR(totalMonthlyCostPaise)}
            <span className="text-xs font-normal text-slate-400">/mo</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {((totalMonthlyCostPaise / 1000000) * 100).toFixed(1)}% of total ₹10K budget
          </span>
        </Card>

        <Card>
          <span className="text-xs text-slate-400">Annualized Run Rate</span>
          <div className="text-2xl font-extrabold font-mono text-slate-200 mt-1">
            {formatINR(totalMonthlyCostPaise * 12)}
            <span className="text-xs font-normal text-slate-400">/yr</span>
          </div>
          <span className="text-[11px] text-slate-500">12-month projected expenditure</span>
        </Card>

        <Card glow>
          <span className="text-xs text-lime-400 font-semibold flex items-center gap-1">
            <TrendingDown className="h-3.5 w-3.5" /> Potential Monthly Savings
          </span>
          <div className="text-2xl font-extrabold font-mono text-lime-400 mt-1">
            {formatINR(discretionaryCostPaise)}
          </div>
          <span className="text-[11px] text-slate-400">
            Available to unlock by cutting discretionary subs
          </span>
        </Card>
      </div>

      {/* Subscription List */}
      <Card className="divide-y divide-charcoal-800 p-0 overflow-hidden">
        {subscriptions.map((sub) => {
          const isActive = sub.status === 'active';
          const isPaused = sub.status === 'paused';
          const isCancelled = sub.status === 'cancelled';
          const isUpcomingThisMonth = sub.renewalDay >= currentDay;

          return (
            <div
              key={sub.id}
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs transition-colors ${
                isCancelled ? 'opacity-50 bg-charcoal-950/40' : 'hover:bg-charcoal-850/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isCancelled
                      ? 'bg-charcoal-800 text-slate-500'
                      : 'bg-lime-400/10 text-lime-400'
                  }`}
                >
                  <Repeat className="h-4 w-4" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold text-sm ${
                        isCancelled ? 'line-through text-slate-400' : 'text-slate-100'
                      }`}
                    >
                      {sub.name}
                    </span>
                    <Badge
                      variant={isActive ? 'lime' : isPaused ? 'amber' : 'neutral'}
                      size="sm"
                    >
                      {sub.status}
                    </Badge>
                    <Badge variant={sub.classification === 'essential' ? 'blue' : 'purple'} size="sm">
                      {sub.classification}
                    </Badge>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Renewal: Day {sub.renewalDay} of 30</span>
                    <span>•</span>
                    <span>{sub.category}</span>
                    {isActive && isUpcomingThisMonth && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400 font-medium">Renews in {sub.renewalDay - currentDay} days</span>
                      </>
                    )}
                    {isCancelled && sub.cancelledEffectiveDay && (
                      <>
                        <span>•</span>
                        <span className="text-slate-500">Halted from Day {sub.cancelledEffectiveDay}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="text-right mr-2">
                  <span
                    className={`font-mono font-bold text-base block ${
                      isCancelled ? 'line-through text-slate-500' : 'text-slate-100'
                    }`}
                  >
                    {formatINR(sub.pricePaise)}
                    <span className="text-[10px] font-normal text-slate-400">/mo</span>
                  </span>
                </div>

                {isActive && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSimulateCancel(sub)}
                      className="text-xs h-8 text-lime-400 hover:text-lime-300"
                      title="Simulate what happens if you cancel"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1" /> Simulate Cut
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => pauseSubscription(sub.id)}
                      className="text-xs h-8"
                      title="Pause renewals"
                    >
                      <Pause className="h-3 w-3 mr-1" /> Pause
                    </Button>

                    <Button
                      data-testid="cancel-subscription-button"
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        if (window.confirm(`Cancel "${sub.name}"? This stops future renewals from Day ${currentDay}.`)) {
                          cancelSubscription(sub.id);
                        }
                      }}
                      className="text-xs h-8"
                    >
                      <Ban className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                  </>
                )}

                {isPaused && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => reactivateSubscription(sub.id)}
                    className="text-xs h-8"
                  >
                    <Play className="h-3 w-3 mr-1" /> Resume
                  </Button>
                )}

                {isCancelled && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => reactivateSubscription(sub.id)}
                    className="text-xs h-8 text-slate-300"
                  >
                    Reactivate
                  </Button>
                )}

                <button
                  onClick={() => {
                    if (window.confirm(`Remove subscription "${sub.name}" entirely?`)) {
                      deleteSubscription(sub.id);
                    }
                  }}
                  className="p-1 text-slate-500 hover:text-red-400 rounded"
                  title="Delete record"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </Card>

      {/* Add Subscription Modal */}
      {isAddOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddOpen(false)}
          title="Add Subscription"
          description="Track recurring monthly digital or service subscriptions."
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <Input
              label="Service Name"
              placeholder="e.g. Netflix, Gym, Cloud Storage"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Monthly Fee (₹)"
                type="number"
                step="any"
                placeholder="e.g. 199"
                value={priceRupees}
                onChange={(e) => setPriceRupees(e.target.value)}
                required
              />
              <Input
                label="Renewal Day of Month (1-30)"
                type="number"
                min="1"
                max="30"
                value={renewalDay}
                onChange={(e) => setRenewalDay(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                options={[
                  { value: 'Entertainment', label: 'Entertainment' },
                  { value: 'Bills', label: 'Bills & Utilities' },
                  { value: 'Education', label: 'Education & Tech' },
                  { value: 'Food', label: 'Food Delivery Pass' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
              <Select
                label="Classification"
                value={classification}
                onChange={(e) => setClassification(e.target.value as any)}
                options={[
                  { value: 'discretionary', label: 'Discretionary / Luxury' },
                  { value: 'essential', label: 'Essential / Mandatory' },
                ]}
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-charcoal-800">
              <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Add Subscription
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
