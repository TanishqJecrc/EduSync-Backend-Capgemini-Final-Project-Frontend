// Helper to format ISO date strings for display
export function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString + "Z");
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Helper to check date differences
export function areDatesDifferent(createdOnStr, updatedOnStr) {
  if (!updatedOnStr) return false;
  const created = new Date(createdOnStr);
  const updated = new Date(updatedOnStr);
  return created.getTime() !== updated.getTime();
}
