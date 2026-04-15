export const formatPrice = (rawPrice) => {
  const price = parseFloat(rawPrice);
  if (!price && price !== 0) return '0.00';
  
  const parts = price.toFixed(2).split('.');
  const whole = parseInt(parts[0]).toLocaleString('en-IN');
  const fraction = parts[1];
  
  return { whole, fraction, full: `${whole}.${fraction}` };
};

export const priceDisplay = (price) => {
  const p = formatPrice(price);
  return `₹${p.full}`;
};
