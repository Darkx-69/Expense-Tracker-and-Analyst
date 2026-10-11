import { FinancialStateSchema } from '../lib/validation/schemas';
import type { FinancialState } from '../types/state';
import type { Transaction } from '../types/financial';
import { paiseToRupees } from '../lib/financial-engine/currency';

export const exportService = {
  /**
   * Triggers a browser download of the full financial state in JSON format.
   */
  exportToJson(state: FinancialState): void {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `broke-but-functional-backup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Validates and imports a JSON backup string using Zod schema.
   */
  importFromJson(jsonContent: string): {
    success: boolean;
    data?: FinancialState;
    error?: string;
  } {
    try {
      if (!jsonContent || jsonContent.trim().length === 0) {
        return { success: false, error: 'Uploaded file is empty.' };
      }
      if (jsonContent.length > 5 * 1024 * 1024) {
        // 5MB safeguard limit
        return { success: false, error: 'File size exceeds maximum 5MB limit.' };
      }

      const parsed = JSON.parse(jsonContent);
      const validation = FinancialStateSchema.safeParse(parsed);

      if (!validation.success) {
        const issues = validation.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .slice(0, 3)
          .join('; ');
        return {
          success: false,
          error: `Invalid backup schema: ${issues}`,
        };
      }

      return { success: true, data: validation.data };
    } catch (err) {
      return {
        success: false,
        error: `Malformed JSON file: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  },

  /**
   * Generates and downloads a CSV export of all transactions.
   */
  exportTransactionsToCsv(transactions: Transaction[]): void {
    const headers = [
      'Transaction ID',
      'Day',
      'Date',
      'Type',
      'Category',
      'Description',
      'Amount (INR)',
      'Is Essential',
      'Reference ID',
    ];

    const escapeCsv = (val: string | number | boolean | undefined) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = transactions.map((tx) => [
      escapeCsv(tx.id),
      escapeCsv(tx.day),
      escapeCsv(tx.date),
      escapeCsv(tx.type),
      escapeCsv(tx.category),
      escapeCsv(tx.description),
      escapeCsv(paiseToRupees(tx.amountPaise).toFixed(2)),
      escapeCsv(tx.isEssential ? 'Yes' : 'No'),
      escapeCsv(tx.referenceId || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `broke-transactions-${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
