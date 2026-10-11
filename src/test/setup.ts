import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// Global ResizeObserver mock
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ResponsiveContainer for clean testing in JSDOM
vi.mock('recharts', async () => {
  const actual: any = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { style: { width: 500, height: 300 } }, children),
  };
});
