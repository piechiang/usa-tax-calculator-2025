export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export const formatPercentage = (rate: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(rate || 0);
};

export const formatSSN = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,2})(\d{0,4})$/);
  if (!match) return cleaned;

  let formatted = match[1] || '';
  if (match[2]) formatted += '-' + match[2];
  if (match[3]) formatted += '-' + match[3];

  return formatted;
};
