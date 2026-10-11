import React, { useState } from 'react';
import { FastForward, CheckCircle2, AlertTriangle, Calendar, Bell } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useFinanceStore } from '../../store/finance-store';
import { formatINR } from '../../lib/financial-engine';

interface DayAdvancerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCycleComplete: () => void;
}

export function DayAdvancerModal({
  isOpen,
  onClose,
  onCycleComplete,
}: DayAdvancerModalProps) {
  const currentDay = useFinanceStore((s) => s.state.currentDay);
  const totalDays = useFinanceStore((s) => s.state.planningDurationDays);
  const subscriptions = useFinanceStore((s) => s.state.subscriptions);
  const commitments = useFinanceStore((s) => s.state.commitments);
  const advanceDay = useFinanceStore((s) => s.advanceDay);

  const [lastAdvanceResult, setLastAdvanceResult] = useState<{
    newDay: number;
    processedEvents: string[];
  } | null>(null);

  const targetDay = currentDay + 1;
  const isFinalDay = targetDay === totalDays;
  const isPastLimit = currentDay >= totalDays;

  // Upcoming charges on target day
  const targetSubs = subscriptions.filter(
    (s) => s.status === 'active' && s.renewalDay === targetDay
  );
  const targetCommitments = commitments.filter(
    (c) => c.status === 'unpaid' && c.dueDay === targetDay
  );

  const handleAdvance = () => {
    if (isPastLimit) {
      onCycleComplete();
      onClose();
      return;
    }

    const res = advanceDay();
    if (res) {
      setLastAdvanceResult(res);
      if (res.newDay >= totalDays) {
        onCycleComplete();
      }
    }
  };

  const handleDone = () => {
    setLastAdvanceResult(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lastAdvanceResult ? `Advanced to Day ${lastAdvanceResult.newDay}!` : `Advance Simulation Day`}
      description={`Progress time forward in your 30-day ₹10,000 survival journey.`}
    >
      {lastAdvanceResult ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-lime-400/10 border border-lime-400/30 text-lime-400 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-100">
                Simulation now on Day {lastAdvanceResult.newDay}
              </h4>
              <p className="text-xs text-slate-300">
                Daily timeline updated. Check your updated Available Balance and Safe Daily Allowance.
              </p>
            </div>
          </div>

          {lastAdvanceResult.processedEvents.length > 0 ? (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Automated Actions Processed:
              </h5>
              <div className="space-y-1.5">
                {lastAdvanceResult.processedEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg bg-charcoal-950 border border-charcoal-800 text-xs text-slate-200"
                  >
                    <Bell className="h-3.5 w-3.5 text-lime-400" />
                    <span>{evt}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No scheduled subscriptions or recurring charges fell on this day.
            </p>
          )}

          <div className="pt-2 flex justify-end">
            <Button variant="primary" onClick={handleDone}>
              Continue Simulation
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-lime-400" />
              <span className="text-xs text-slate-300">Timeline Transition:</span>
            </div>
            <div className="font-mono text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Day {currentDay}</span>
              <span className="text-lime-400">→</span>
              <span className="text-lime-400">Day {targetDay}</span>
            </div>
          </div>

          {/* Scheduled renewals preview */}
          {targetSubs.length > 0 || targetCommitments.length > 0 ? (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Upcoming scheduled events for Day {targetDay}:
              </h5>
              <div className="space-y-1.5">
                {targetSubs.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex justify-between items-center text-xs p-2 rounded bg-charcoal-950 border border-charcoal-800"
                  >
                    <span className="text-slate-300">Auto-Renewal: {sub.name}</span>
                    <span className="font-mono text-red-400">-{formatINR(sub.pricePaise)}</span>
                  </div>
                ))}
                {targetCommitments.map((com) => (
                  <div
                    key={com.id}
                    className="flex justify-between items-center text-xs p-2 rounded bg-charcoal-950 border border-charcoal-800"
                  >
                    <span className="text-slate-300">Bill Due: {com.name}</span>
                    <span className="font-mono text-amber-400">{formatINR(com.amountPaise)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              No automatic bills or subscriptions are scheduled to trigger on Day {targetDay}.
            </p>
          )}

          {isFinalDay && (
            <div className="p-3 rounded-lg bg-lime-400/10 border border-lime-400/30 text-xs text-lime-300 font-medium">
              🎯 Day 30 is the final day of the challenge! Advancing will trigger your survival retrospective.
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2.5">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAdvance}
              disabled={isPastLimit}
            >
              <FastForward className="h-4 w-4 mr-1.5" />
              Advance to Day {targetDay}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
