import { supabase } from './supabase';
import { SearchFilters } from '@/types'; // keep only SearchFilters

// ✅ Define PropertyResult locally (not imported from '@/types')
export interface PropertyResult {
  project_id: string;
  project_name: string;
  project_type?: string;
  status?: string;
  bhk_type?: string;
  price_min: number;
  price_max: number;
  carpet_area_min?: number;
  carpet_area_max?: number;
  address?: string;
  landmark?: string;
  pincode?: string;
  project_summary?: string;
  slug?: string;
}

// ✅ Main search function
export async function searchProperties(filters: SearchFilters): Promise<PropertyResult[]> {
  console.log("🔍 Searching with filters:", filters);
  if (Object.keys(filters).length === 0) return [];

  let query = supabase
    .from("projects")
    .select(`
      id,
      project_name,
      project_type,
      project_category,
      slug,
      status,
      city_id,
      locality_id,
      project_summary,
      project_addresses(full_address, landmark, pincode),
      project_configurations(
        id,
        type,
        project_variants(price, carpet_area, bathrooms, balcony)
      )
    `);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.projectName) query = query.ilike("project_name", `%${filters.projectName}%`);

  const { data, error } = await query.limit(200);
  if (error) {
    console.error("❌ Supabase query error:", error);
    return [];
  }

  if (!data?.length) return [];

  const results: PropertyResult[] = [];
  const seen = new Set<string>();

  for (const project of data) {
    const configs = Array.isArray(project.project_configurations)
      ? project.project_configurations
      : project.project_configurations
      ? [project.project_configurations]
      : [];

    for (const config of configs) {
      if (!config) continue;

      // Filter by BHK
      if (filters.bhk) {
        const configType = (config.type || "").toLowerCase();
        const bhk = filters.bhk.toLowerCase();
        if (!configType.includes(`${bhk}bhk`) && !configType.includes(`${bhk} bhk`)) {
          continue;
        }
      }

      const variants = Array.isArray(config.project_variants)
        ? config.project_variants
        : config.project_variants
        ? [config.project_variants]
        : [];

      if (!variants.length) continue;

      const filteredVariants = variants.filter((v: any) => {
        if (!v || !v.price) return false;
        const priceInLakhs = v.price / 100000;
        if (filters.minPrice && priceInLakhs < filters.minPrice) return false;
        if (filters.maxPrice && priceInLakhs > filters.maxPrice) return false;
        return true;
      });

      if (!filteredVariants.length) continue;

      const uniqueKey = `${project.id}-${config.id}`;
      if (seen.has(uniqueKey)) continue;
      seen.add(uniqueKey);

      const prices = filteredVariants.map((v: any) => v.price / 100000);
      const areas = filteredVariants
        .map((v: any) => parseFloat(v.carpet_area) || 0)
        .filter(a => a > 0);

      const addressObj = Array.isArray(project.project_addresses)
        ? (project.project_addresses[0] as any)
        : (project.project_addresses as any) || { full_address: "", landmark: "" };

      results.push({
        project_id: uniqueKey,
        project_name: project.project_name,
        project_type: project.project_type,
        status: project.status,
        bhk_type: config.type,
        price_min: Math.min(...prices),
        price_max: Math.max(...prices),
        carpet_area_min: areas.length ? Math.min(...areas) : 0,
        carpet_area_max: areas.length ? Math.max(...areas) : 0,
        address: addressObj.full_address || "",
        landmark: addressObj.landmark || "",
        pincode: addressObj.pincode || "",
        project_summary: project.project_summary || "",
        slug: project.slug || "",
      });
    }
  }

  console.log(`📊 After filtering: ${results.length} unique properties`);
  results.sort((a, b) => a.price_min - b.price_min);
  return results.slice(0, 10);
}
