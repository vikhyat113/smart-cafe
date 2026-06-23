/**
 * Formats a number as currency using the cafe's configured currency
 * symbol (defaults to ₹ if settings haven't loaded yet).
 */
export function formatCurrency(amount, symbol = '₹') {
  const value = Number(amount) || 0;
  return `${symbol}${value.toFixed(2).replace(/\.00$/, '')}`;
}

export function formatDateTime(dateString) {
  const d = new Date(dateString);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(dateString) {
  const d = new Date(dateString);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
