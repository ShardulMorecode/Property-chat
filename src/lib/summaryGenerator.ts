import { PropertyResult } from './search';
import { ParsedQuery } from './queryParser';

export function generateSummary(properties: PropertyResult[], filters: ParsedQuery): string {
  if (properties.length === 0) {
    return "I couldn't find any properties matching your criteria. Try adjusting your search filters like budget, location, or BHK configuration.";
  }

  const count = properties.length;
  const city = filters.city || 'Mumbai and Pune';
  const bhk = filters.bhk ? `${filters.bhk} BHK` : 'properties';

  // ✅ Use price_min and price_max instead of price
  const allPrices = properties
    .flatMap(p => [p.price_min, p.price_max])
    .filter(p => typeof p === 'number' && p > 0);

  const avgPrice =
    allPrices.length > 0
      ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length
      : 0;

  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);

  // ✅ Price formatter
  const formatPrice = (price: number): string => {
    if (price >= 100) return `₹${(price / 100).toFixed(2)} Cr`;
    return `₹${price.toFixed(1)} L`;
  };

  // Count by status
  const readyCount = properties.filter(p => p.status === 'READY_TO_MOVE').length;
  const underConstructionCount = properties.filter(p => p.status === 'UNDER_CONSTRUCTION').length;

  // Build summary
  let summary = `I found ${count} ${bhk} ${filters.city ? `in ${city}` : 'across Mumbai and Pune'}`;

  if (allPrices.length > 0) {
    summary += ` with prices ranging from ${formatPrice(minPrice)} to ${formatPrice(maxPrice)}`;
  }

  if (readyCount > 0 && underConstructionCount > 0) {
    summary += `. ${readyCount} are ready to move and ${underConstructionCount} are under construction.`;
  } else if (readyCount > 0) {
    summary += `. All properties are ready to move.`;
  } else if (underConstructionCount > 0) {
    summary += `. All properties are under construction.`;
  }

  // Optional: highlight locality or city
  if (filters.locality) {
    summary += ` Most results are around ${filters.locality}.`;
  }

  return summary.trim();
}
