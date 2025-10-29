import { supabase } from './supabase';
import { SearchFilters, PropertyResult } from '@/types';

export async function searchProperties(filters: SearchFilters): Promise<PropertyResult[]> {
  try {
    // Build complex query with joins
    let query = supabase
      .from('projects')
      .select(`
        id,
        project_name,
        project_type,
        status,
        possession_date,
        project_summary,
        project_addresses!inner(full_address, landmark, pincode),
        project_configurations!inner(
          id,
          type,
          project_variants(
            price,
            carpet_area,
            bathrooms,
            balcony
          )
        )
      `);

    // Apply filters
    if (filters.projectName) {
      query = query.ilike('project_name', `%${filters.projectName}%`);
    }

    if (filters.status) {
      const status = filters.status.toUpperCase().replace(/\s+/g, '_');
      query = query.eq('status', status);
    }

    if (filters.bhk) {
      query = query.ilike('project_configurations.type', `%${filters.bhk}%BHK%`);
    }

    const { data, error } = await query.limit(10);

    if (error) {
      console.error('Search error:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Transform and flatten the data
    const results: PropertyResult[] = [];

    for (const project of data) {
      const addresses = project.project_addresses || [];
      const configs = project.project_configurations || [];

      for (const config of configs) {
        const variants = config.project_variants || [];
        
        if (variants.length === 0) continue;

        // Filter by price if specified
        const filteredVariants = variants.filter((v: any) => {
          const price = v.price / 100000; // Convert to lakhs
          if (filters.minPrice && price < filters.minPrice) return false;
          if (filters.maxPrice && price > filters.maxPrice) return false;
          return true;
        });

        if (filteredVariants.length === 0) continue;

        // Get price range
        const prices = filteredVariants.map((v: any) => v.price);
        const priceMin = Math.min(...prices) / 100000; // Convert to lakhs
        const priceMax = Math.max(...prices) / 100000;

        // Get area range
        const areas = filteredVariants.map((v: any) => v.carpet_area || 0);
        const areaMin = Math.min(...areas);
        const areaMax = Math.max(...areas);

        // Get average bathrooms and balcony
        const avgBathrooms = Math.round(
          filteredVariants.reduce((sum: number, v: any) => sum + (v.bathrooms || 0), 0) / filteredVariants.length
        );
        const avgBalcony = Math.round(
          filteredVariants.reduce((sum: number, v: any) => sum + (v.balcony || 0), 0) / filteredVariants.length
        );

        const address = addresses[0] || {};

        results.push({
          project_id: project.id,
          project_name: project.project_name,
          project_type: project.project_type,
          status: project.status,
          bhk_type: config.type,
          price_min: priceMin,
          price_max: priceMax,
          carpet_area_min: areaMin,
          carpet_area_max: areaMax,
          address: address.full_address || '',
          landmark: address.landmark || '',
          pincode: address.pincode || '',
          bathrooms: avgBathrooms,
          balcony: avgBalcony,
          possession_date: project.possession_date || '',
          project_summary: project.project_summary || ''
        });
      }
    }

    return results.slice(0, 10); // Limit to 10 results
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}