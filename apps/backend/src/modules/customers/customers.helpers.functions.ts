
const calculatePercentChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return parseFloat(((current - previous) / previous * 100).toFixed(1));
}

export {
  calculatePercentChange
}
