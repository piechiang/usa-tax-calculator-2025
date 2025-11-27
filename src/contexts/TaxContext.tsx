import React, { createContext, useContext, ReactNode } from 'react';
import { useTaxCalculator } from '../hooks/useTaxCalculator';

export type TaxContextValue = ReturnType<typeof useTaxCalculator>;

const TaxContext = createContext<TaxContextValue | undefined>(undefined);

export const useTaxContext = (): TaxContextValue => {
  const context = useContext(TaxContext);
  if (!context) {
    throw new Error('useTaxContext must be used within TaxProvider');
  }
  return context;
};

interface TaxProviderProps {
  children: ReactNode;
}

export const TaxProvider: React.FC<TaxProviderProps> = ({ children }) => {
  const taxCalculator = useTaxCalculator();

  return (
    <TaxContext.Provider value={taxCalculator}>
      {children}
    </TaxContext.Provider>
  );
};
