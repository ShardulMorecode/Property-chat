import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractFiltersFromQuery(query: string): Promise<any> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
Extract search filters from this real estate query in India.

User Query: "${query}"

Return ONLY a JSON object:
{
  "bhk": "extract number only (1, 2, 3, 4) or null",
  "minPrice": "price in lakhs (L) or null",
  "maxPrice": "price in lakhs (L) or null",
  "status": "READY_TO_MOVE or UNDER_CONSTRUCTION or null",
  "city": "Mumbai or Pune or null",
  "locality": "area name or null",
  "projectName": "project name if mentioned or null"
}

Examples:
- "3BHK in Pune under 1.2 Cr" → {"bhk":"3","maxPrice":120,"city":"Pune"}
- "Ready to move 2BHK in Chembur" → {"bhk":"2","status":"READY_TO_MOVE","locality":"Chembur"}
- "Flats under 50 lakhs" → {"maxPrice":50}
- "Projects in Mumbai 80L to 1Cr" → {"city":"Mumbai","minPrice":80,"maxPrice":100}

Note: 1 Crore (Cr) = 100 Lakhs (L)

Return ONLY JSON, no explanation.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Clean up null values
      Object.keys(parsed).forEach(key => {
        if (parsed[key] === null || parsed[key] === 'null') {
          delete parsed[key];
        }
      });
      return parsed;
    }
    return {};
  } catch (error) {
    console.error('Filter extraction error:', error);
    return {};
  }
}

export async function generateSummary(properties: any[], filters: any): Promise<string> {
  if (properties.length === 0) {
    return generateNoResultsSummary(filters);
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const propertyData = properties.slice(0, 5).map(p => ({
    name: p.project_name,
    bhk: p.bhk_type,
    price: `₹${p.price_min}-${p.price_max}L`,
    area: `${p.carpet_area_min}-${p.carpet_area_max} sq ft`,
    status: p.status,
    location: p.landmark || p.address.split(',')[0]
  }));

  const prompt = `
Generate a helpful 2-3 sentence summary for these property search results.

Filters Used: ${JSON.stringify(filters)}
Found: ${properties.length} properties
Sample Properties: ${JSON.stringify(propertyData, null, 2)}

Guidelines:
- Be natural and conversational
- Mention key locations/areas
- Mention price range in Lakhs
- Mention BHK types available
- Keep under 3 sentences
- Sound helpful and professional

Generate summary:
`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Summary generation error:', error);
    return `Found ${properties.length} properties matching your search. Prices range from ₹${Math.min(...properties.map(p => p.price_min))}L to ₹${Math.max(...properties.map(p => p.price_max))}L.`;
  }
}

function generateNoResultsSummary(filters: any): string {
  const parts = [];
  
  if (filters.bhk) parts.push(`${filters.bhk}BHK`);
  if (filters.status) parts.push(filters.status.replace('_', ' ').toLowerCase());
  if (filters.maxPrice) parts.push(`under ₹${filters.maxPrice}L`);
  if (filters.city) parts.push(`in ${filters.city}`);
  if (filters.locality) parts.push(`in ${filters.locality}`);
  
  const searchCriteria = parts.join(' ') || 'your criteria';
  
  return `No properties found for ${searchCriteria}. Try adjusting your budget, location, or BHK requirements to see more options.`;
}