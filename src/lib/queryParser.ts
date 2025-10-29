export interface ParsedQuery {
  bhk?: number;
  city?: string;
  maxPrice?: number;
  minPrice?: number;
  localities?: string[];
  status?: 'READY_TO_MOVE' | 'UNDER_CONSTRUCTION';
  furnishing?: 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';
  propertyType?: 'RESIDENTIAL' | 'COMMERCIAL' | 'BOTH';
}

export function parseQuery(userQuery: string): ParsedQuery {
  const parsed: ParsedQuery = {};
  const query = userQuery.toLowerCase();

  // Extract BHK
  const bhkMatch = query.match(/(\d)(?:\s?bhk|bedroom|bed)/i);
  if (bhkMatch) {
    parsed.bhk = parseInt(bhkMatch[1]);
  }

  // Extract City
  if (query.includes('pune')) {
    parsed.city = 'Pune';
  } else if (query.includes('mumbai')) {
    parsed.city = 'Mumbai';
  }

  // Extract Budget
  const budgetMatch = query.match(/(?:under|below|less than|upto)\s*[₹]?\s*(\d+(?:\.\d+)?)\s*(lakh|lac|cr|crore)/i);
  if (budgetMatch) {
    const amount = parseFloat(budgetMatch[1]);
    const unit = budgetMatch[2].toLowerCase();
    
    if (unit === 'lakh' || unit === 'lac') {
      parsed.maxPrice = amount * 100000; // Convert to rupees
    } else if (unit === 'cr' || unit === 'crore') {
      parsed.maxPrice = amount * 10000000; // Convert to rupees
    }
  }

  // Extract exact budget (e.g., "1.2 cr", "50 lakh")
  const exactBudgetMatch = query.match(/[₹]?\s*(\d+(?:\.\d+)?)\s*(lakh|lac|cr|crore)/i);
  if (exactBudgetMatch && !budgetMatch) {
    const amount = parseFloat(exactBudgetMatch[1]);
    const unit = exactBudgetMatch[2].toLowerCase();
    
    if (unit === 'lakh' || unit === 'lac') {
      parsed.maxPrice = amount * 100000;
      parsed.minPrice = amount * 100000 * 0.7; // 30% lower bound
    } else if (unit === 'cr' || unit === 'crore') {
      parsed.maxPrice = amount * 10000000;
      parsed.minPrice = amount * 10000000 * 0.7; // 30% lower bound
    }
  }

  // Extract Status
  if (query.includes('ready') || query.includes('move-in') || query.includes('rtm')) {
    parsed.status = 'READY_TO_MOVE';
  } else if (query.includes('under construction') || query.includes('ongoing')) {
    parsed.status = 'UNDER_CONSTRUCTION';
  }

  // Extract Furnishing
  if (query.includes('furnished')) {
    parsed.furnishing = 'FURNISHED';
  } else if (query.includes('semi furnished') || query.includes('semi-furnished')) {
    parsed.furnishing = 'SEMI_FURNISHED';
  } else if (query.includes('unfurnished')) {
    parsed.furnishing = 'UNFURNISHED';
  }

  // Extract Property Type
  if (query.includes('commercial') || query.includes('office') || query.includes('shop')) {
    parsed.propertyType = 'COMMERCIAL';
  } else if (query.includes('residential') || query.includes('flat') || query.includes('apartment')) {
    parsed.propertyType = 'RESIDENTIAL';
  }

  console.log('🔍 Parsed Query:', parsed);
  return parsed;
}