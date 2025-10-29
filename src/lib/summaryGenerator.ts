import { PropertyResult } from './search';
import { ParsedQuery } from './queryParser';

export function generateSummary(properties: PropertyResult[], filters: ParsedQuery): string {
  if (properties.length === 0) {
    return "I couldn't find any properties matching your criteria. Try adjusting your search filters like budget, location, or BHK configuration.";
  }

  const count = properties.length;
  const city = filters.city || 'Mumbai and Pune';
  const bhk = filters.bhk ? `${filters.bhk} BHK` : 'properties';
  
  // Calculate price statistics
  const prices = properties.filter(p => p.price).map(p => p.price!);
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  
  // Format price ranges
  const formatPrice = (price: number): string => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    return `₹${(price / 100000).toFixed(1)} L`;
  };

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Count by status
  const readyCount = properties.filter(p => p.status === 'READY_TO_MOVE').length;
  const underConstructionCount = properties.filter(p => p.status === 'UNDER_CONSTRUCTION').length;

  // Count by furnishing
  const furnishedCount = properties.filter(p => p.furnished_type === 'FURNISHED').length;
  const semiFurnishedCount = properties.filter(p => p.furnished_type === 'SEMI_FURNISHED').length;

  // Build summary
  let summary = `I found ${count} ${bhk} ${filters.city ? `in ${city}` : 'across Mumbai and Pune'}`;

  if (prices.length > 0) {
    summary += ` with prices ranging from ${formatPrice(minPrice)} to ${formatPrice(maxPrice)}`;
  }

  if (readyCount > 0 && underConstructionCount > 0) {
    summary += `. ${readyCount} are ready to move and ${underConstructionCount} are under construction.`;
  } else if (readyCount > 0) {
    summary += `. All properties are ready to move.`;
  } else if (underConstructionCount > 0) {
    summary += `. All properties are under construction.`;
  }

  // Add furnishing info if relevant
  if (filters.furnishing) {
    const furnishingType = filters.furnishing.toLowerCase();
    summary += ` All properties are ${furnishingType}.`;
  } else if (furnishedCount > 0 || semiFurnishedCount > 0) {
    if (furnishedCount > semiFurnishedCount) {
      summary += ` Most properties come furnished.`;
    } else if (semiFurnishedCount > furnishedCount) {
      summary += ` Most properties are semi-furnished.`;
    }
  }

  return summary;
}