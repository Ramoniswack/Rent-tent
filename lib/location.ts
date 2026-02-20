/**
 * Extract city name from full location string
 * @param location - Full location string (e.g., "Kathmandu Metropolitan City, Bagamati Province, Nepal")
 * @returns City name only (e.g., "Kathmandu")
 */
export function getCityName(location: string): string {
  if (!location) return '';
  
  // Split by comma and get the first part
  const parts = location.split(',');
  if (parts.length === 0) return location;
  
  let cityPart = parts[0].trim();
  
  // Remove common suffixes
  cityPart = cityPart
    .replace(/\s+Metropolitan\s+City$/i, '')
    .replace(/\s+Municipality$/i, '')
    .replace(/\s+Sub-Metropolitan\s+City$/i, '')
    .replace(/\s+City$/i, '')
    .trim();
  
  return cityPart;
}

/**
 * Format location for display - shows city and country
 * @param location - Full location string
 * @returns Formatted location (e.g., "Kathmandu, Nepal")
 */
export function formatLocation(location: string): string {
  if (!location) return '';
  
  const parts = location.split(',').map(p => p.trim());
  
  if (parts.length === 0) return location;
  if (parts.length === 1) return getCityName(parts[0]);
  
  // Get city name (first part)
  const city = getCityName(parts[0]);
  
  // Get country (last part)
  const country = parts[parts.length - 1];
  
  return `${city}, ${country}`;
}
