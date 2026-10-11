import { INITIAL_DEMO_STATE } from '../data/initial-data';
import { FinancialStateSchema } from '../lib/validation/schemas';
import type { FinancialState } from '../types/state';

const STORAGE_KEY = 'broke_functional_finance_state_v1';

export const persistenceService = {
  /**
   * Loads state from localStorage with Zod validation.
   * Gracefully falls back to deterministic demo data if not found or corrupted.
   */
  loadState(): FinancialState {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return INITIAL_DEMO_STATE;
      }

      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // No stored data yet: initialize with demo baseline
        this.saveState(INITIAL_DEMO_STATE);
        return INITIAL_DEMO_STATE;
      }

      const parsed = JSON.parse(raw);
      const validation = FinancialStateSchema.safeParse(parsed);

      if (validation.success) {
        return validation.data;
      } else {
        console.warn(
          'Corrupted or incompatible localStorage state detected. Reverting to deterministic demo baseline.',
          validation.error
        );
        this.saveState(INITIAL_DEMO_STATE);
        return INITIAL_DEMO_STATE;
      }
    } catch (err) {
      console.error('Failed to read from localStorage:', err);
      return INITIAL_DEMO_STATE;
    }
  },

  /**
   * Persists state to localStorage with quota protection.
   */
  saveState(state: FinancialState): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const serialized = JSON.stringify(state);
      window.localStorage.setItem(STORAGE_KEY, serialized);
      return true;
    } catch (err) {
      console.error('Failed to write state to localStorage (Quota exceeded?):', err);
      return false;
    }
  },

  /**
   * Restores original known demo baseline.
   */
  resetToDemo(): FinancialState {
    const freshCopy: FinancialState = JSON.parse(JSON.stringify(INITIAL_DEMO_STATE));
    this.saveState(freshCopy);
    return freshCopy;
  },

  /**
   * Clears storage.
   */
  clearStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.error('Error clearing storage:', err);
    }
  },
};
