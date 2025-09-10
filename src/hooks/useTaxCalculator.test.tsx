import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useTaxCalculator } from './useTaxCalculator';

describe('useTaxCalculator', () => {
  it('initializes taxResult with zeros', () => {
    let result: ReturnType<typeof useTaxCalculator> | undefined;

    function TestComponent() {
      result = useTaxCalculator();
      return null;
    }

    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => {
      root.render(<TestComponent />);
    });

    expect(result?.taxResult.totalTax).toBe(0);
  });
});
