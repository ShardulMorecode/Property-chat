import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Types
interface SearchFilters {
  city?: string;
  locality?: string;
  bhk?: string;
  minPrice?: number; // in Lakhs
  maxPrice?: number; // in Lakhs
  status?: string;
  projectName?: string;
}

/* -------------------------
   Helpers: text normalization + slug parsing
   ------------------------- */
function normalizeText(s: any) {
  return (s || "").toString().toLowerCase().replace(/\s+/g, " ").trim();
}

// Extract top 2-3 amenities/keywords from text (simple heuristic)
function extractAmenities(text: string | undefined): string[] {
  if (!text) return [];
  const amenityKeywords = [
    "clubhouse", "swimming pool", "gym", "park", "parking", "lift", "power backup",
    "play area", "security", "garden", "sports", "soccer", "badminton", "cafeteria",
    "community hall", "jogging track", "creche", "school", "metro", "mall", "hospital"
  ];
  const lc = text.toLowerCase();
  const found: string[] = [];
  for (const k of amenityKeywords) {
    if (lc.includes(k) && !found.includes(k)) found.push(k);
    if (found.length >= 3) break;
  }
  return found;
}

function formatPriceLakhs(priceInLakhs: number): string {
  if (priceInLakhs >= 100) {
    const cr = (priceInLakhs / 100);
    return `₹${cr.toFixed(2)} Cr`;
  } else {
    return `₹${priceInLakhs.toFixed(1)} L`;
  }
}


/**
 * Parse slug into components using heuristic rules.
 * Typical slug examples:
 *  - luxury-ashwini-ashoknagar-chembur-mumbai-675058
 *  - pristine02-modelcolony-shivajinagar-pune-428955
 *
 * Heuristic:
 *  - split by '-'
 *  - if last token is 6-digit number => pincode
 *  - second-last => city
 *  - third-last => locality
 *  - fourth-last => area (optional)
 *  - rest (left side) => apartment/name/descriptor
 */
function parseSlugComponents(slugRaw: string | null | undefined) {
  const slug = (slugRaw || "").toString().trim();
  if (!slug) return null;

  const tokens = slug.split("-").map((t) => t.trim()).filter(Boolean);
  if (tokens.length === 0) return null;

  const comp: {
    full?: string;
    tokens?: string[];
    apartment?: string;
    area?: string;
    locality?: string;
    city?: string;
    pincode?: string;
  } = { full: slug, tokens };

  // detect pincode (6-digit numeric)
  let pincode: string | undefined;
  if (tokens.length >= 1 && /^\d{6}$/.test(tokens[tokens.length - 1])) {
    pincode = tokens[tokens.length - 1];
    comp.pincode = pincode;
  }

  // city (second-last if pincode present, else last)
  const cityIdx = comp.pincode ? tokens.length - 2 : tokens.length - 1;
  if (cityIdx >= 0) comp.city = tokens[cityIdx];

  // locality (third-last if pincode present, else second-last)
  const localityIdx = comp.pincode ? tokens.length - 3 : tokens.length - 2;
  if (localityIdx >= 0) comp.locality = tokens[localityIdx];

  // area (fourth-last if present)
  const areaIdx = comp.pincode ? tokens.length - 4 : tokens.length - 3;
  if (areaIdx >= 0) comp.area = tokens[areaIdx];

  // apartment/name: everything before areaIdx (or earlier tokens)
  const apartmentEndIdx = areaIdx >= 0 ? areaIdx - 1 : localityIdx - 1;
  if (apartmentEndIdx >= 0) {
    comp.apartment = tokens.slice(0, apartmentEndIdx + 1).join(" ");
  } else {
    // fallback: take first token(s) as name
    comp.apartment = tokens.slice(0, Math.max(1, tokens.length - 3)).join(" ") || tokens[0];
  }

  // normalize strings
  for (const k of ["apartment", "area", "locality", "city", "pincode"] as const) {
    if (comp[k]) comp[k] = comp[k]!.toString().toLowerCase();
  }

  return comp;
}

/* -------------------------
   Local NLP Parser (improved)
   ------------------------- */
function extractLocalityFromPhrase(phrase: string): string | undefined {
  if (!phrase) return undefined;
  let loc = phrase.replace(/\b(pune|mumbai)\b/gi, "").trim();
  loc = loc.replace(/^[,.\s]+|[,.\s]+$/g, "");
  loc = loc.replace(/\s{2,}/g, " ");
  return loc || undefined;
}

function parseFiltersLocally(query: string): SearchFilters {
  const raw = query || "";
  const q = raw.toLowerCase();
  const cleaned: SearchFilters = {};

  // City (explicit)
  if (/\bpune\b/i.test(q)) cleaned.city = "Pune";
  else if (/\bmumbai\b/i.test(q)) cleaned.city = "Mumbai";

  // Status keywords
  if (/\bready to move\b|\bready\b|\breadymove\b/i.test(q)) cleaned.status = "READY_TO_MOVE";
  else if (/\bunder construction\b|\bunder-construction\b|\buc\b/i.test(q)) cleaned.status = "UNDER_CONSTRUCTION";

  // BHK
  const bhkMatch = q.match(/\b([1-4])\s*[-]?\s*bhk\b/i) || q.match(/\b([1-4])\s*br\b/i);
  if (bhkMatch) cleaned.bhk = bhkMatch[1];

  // Locality patterns: "in/near/around <locality>" or "<locality> region/area"
  const nearInRegex = /\b(?:in|near|around|at|around the)\s+([a-z0-9\s\-\&\,']{2,80})(?=[\.\,\;]|$)/i;
  const nearMatch = raw.match(nearInRegex);
  if (nearMatch) {
    const extracted = extractLocalityFromPhrase(nearMatch[1]);
    if (extracted) cleaned.locality = extracted;
  } else {
    const regionMatch = raw.match(/\b([a-z0-9\-'\s]{2,60})\s+(?:region|area|zone|sector)\b/i);
    if (regionMatch) cleaned.locality = extractLocalityFromPhrase(regionMatch[1]);
  }
    // Project name extraction (optional) — captures "project <name>" or quoted names
  const projectNameMatch1 = raw.match(/\bproject\s+([a-z0-9\-\&\s']{2,80})(?=[\.\,]|$)/i);
  const projectNameMatch2 = raw.match(/["'“](.+?)["'”]/); // quoted phrase
  if (projectNameMatch1) {
    cleaned.projectName = projectNameMatch1[1].trim();
  } else if (projectNameMatch2) {
    cleaned.projectName = projectNameMatch2[1].trim();
  }


  // fallback single-word locality tokens from a short common list
  if (!cleaned.locality) {
    const commonLocalities = ["baner", "wakad", "kothrud", "hadapsar", "hinjewadi", "chembur", "mulund", "andheri", "bandra", "powai", "pimple", "mundhwa"];
    for (const loc of commonLocalities) {
      if (new RegExp(`\\b${loc}\\b`, "i").test(raw)) {
        cleaned.locality = loc;
        break;
      }
    }
  }

  // Price extraction (support Cr / L)
  const pricePairs: { amount: number; unit: "Cr" | "L" }[] = [];
  const priceRegexGlobal = /(\d+(?:\.\d+)?)\s*(cr|crore|crs|l|lakhs?|lakh|lac|lakhs)/ig;
  let m: RegExpExecArray | null;
  while ((m = priceRegexGlobal.exec(raw))) {
    const rawNum = parseFloat(m[1]);
    const rawUnit = (m[2] || "").toLowerCase();
    if (!isNaN(rawNum)) {
      if (rawUnit.startsWith("c")) pricePairs.push({ amount: rawNum, unit: "Cr" });
      else pricePairs.push({ amount: rawNum, unit: "L" });
    }
  }

  if (pricePairs.length > 0) {
    const conv = pricePairs.map(p => p.unit === "Cr" ? p.amount * 100 : p.amount);
    const underMatch = /\bunder\b|\bbelow\b|\bless than\b/i.test(raw);
    const betweenMatch = /\bbetween\b/i.test(raw) || /\bto\b/.test(raw);
    if (betweenMatch && conv.length >= 2) {
      cleaned.minPrice = Math.min(conv[0], conv[1]);
      cleaned.maxPrice = Math.max(conv[0], conv[1]);
    } else if (underMatch) {
      cleaned.maxPrice = Math.min(...conv);
    } else {
      cleaned.maxPrice = Math.min(...conv);
    }
  } else {
    const compactMatch = raw.match(/(\d+(?:\.\d+)?)(cr|l)\b/i);
    if (compactMatch) {
      const n = parseFloat(compactMatch[1]);
      const unit = compactMatch[2].toLowerCase();
      if (!isNaN(n)) cleaned.maxPrice = unit === "cr" ? n * 100 : n;
    }
  }

  // Normalize
  if (cleaned.minPrice && cleaned.maxPrice && cleaned.minPrice > cleaned.maxPrice) {
    const tmp = cleaned.minPrice;
    cleaned.minPrice = cleaned.maxPrice;
    cleaned.maxPrice = tmp;
  }

  return cleaned;
}

/* -------------------------
   Locality matching helper (uses slug parsing)
   ------------------------- */
function matchesLocality(localityRaw: string | undefined, project: any): boolean {
  if (!localityRaw) return true;
  const locality = normalizeText(localityRaw);
  if (!locality) return true;

  // fields to check (normalized)
  const address = normalizeText(Array.isArray(project.project_addresses) ? (project.project_addresses[0] as any)?.full_address : (project.project_addresses as any)?.full_address) || "";
  const landmark = normalizeText(Array.isArray(project.project_addresses) ? (project.project_addresses[0] as any)?.landmark : (project.project_addresses as any)?.landmark) || "";
  const projectName = normalizeText(project?.project_name || "");
  const summary = normalizeText(project?.project_summary || "");
  const slugRaw = project?.slug || "";
  const slugComp = parseSlugComponents(slugRaw);

  // direct substring matches
  if (address.includes(locality) || landmark.includes(locality) || projectName.includes(locality) || summary.includes(locality)) return true;

  // Check slug components (apartment, area, locality, city, pincode)
  if (slugComp) {
    if (slugComp.apartment && slugComp.apartment.includes(locality)) return true;
    if (slugComp.area && slugComp.area.includes(locality)) return true;
    if (slugComp.locality && slugComp.locality.includes(locality)) return true;
    if (slugComp.city && slugComp.city.includes(locality)) return true;
    if (slugComp.pincode && slugComp.pincode.includes(locality)) return true;
  }

  // Token match: require at least one token match (you can raise threshold)
  const tokens = locality.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;

  let tokenMatches = 0;
  const hay = (address + " " + landmark + " " + projectName + " " + summary + " " + (slugComp?.apartment || "") + " " + (slugComp?.area || "") + " " + (slugComp?.locality || "") + " " + (slugComp?.city || "")).toLowerCase();

  for (const t of tokens) {
    if (!t) continue;
    if (hay.includes(t)) tokenMatches++;
  }

  return tokenMatches > 0; // change to >= Math.ceil(tokens.length * 0.5) for stricter match
}

/* -------------------------
   Extract filters (local only)
   ------------------------- */
async function extractFiltersFromQuery(query: string): Promise<SearchFilters> {
  const filters = parseFiltersLocally(query);
  console.log("🎯 Extracted filters (Local):", filters);
  return filters;
}

/* -------------------------
   Supabase search logic (uses matchesLocality)
   ------------------------- */
async function searchProperties(filters: SearchFilters) {
  try {
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

    const results: any[] = [];
    const seen = new Set<string>();

    for (const project of data) {
      // locality check
      if (filters.locality && !matchesLocality(filters.locality, project)) continue;

      // city check (check slug.city, address or project fields)
      if (filters.city) {
        const projCitySlug = parseSlugComponents(project?.slug || "")?.city || "";
        const addr = normalizeText(Array.isArray(project.project_addresses) ? (project.project_addresses[0] as any)?.full_address : (project.project_addresses as any)?.full_address) || "";
        const pname = normalizeText(project?.project_name || "");
        const psummary = normalizeText(project?.project_summary || "");

        const cityMatch = projCitySlug.includes(filters.city.toLowerCase()) || addr.includes(filters.city.toLowerCase()) || pname.includes(filters.city.toLowerCase()) || psummary.includes(filters.city.toLowerCase());
        if (!cityMatch) continue;
      }

      const configs = Array.isArray(project.project_configurations)
        ? project.project_configurations
        : project.project_configurations
        ? [project.project_configurations]
        : [];

      for (const config of configs) {
        if (!config) continue;

        // Filter by BHK if specified
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

        // Filter variants by price
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

        const addressObj = Array.isArray(project.project_addresses) ? (project.project_addresses[0] as any) : (project.project_addresses as any) || { full_address: "", landmark: "" };

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
  } catch (error) {
    console.error("❌ Search error:", error);
    return [];
  }
}


/* -------------------------
   Summary generation (Local only)
   ------------------------- */
async function generateSummary(properties: any[], filters: SearchFilters): Promise<string> {
  if (properties.length === 0) return generateNoResultsSummary(filters);

  const priceMin = Math.min(...properties.map((p) => p.price_min));
  const priceMax = Math.max(...properties.map((p) => p.price_max));
  const bhkSet = Array.from(new Set(properties.map((p) => p.bhk_type))).slice(0, 3).join(", ");
  const sampleLoc = properties[0]?.landmark || properties[0]?.address?.split(",")[0] || filters.locality || filters.city || "";

  return `Found ${properties.length} properties${filters.city ? " in " + filters.city : ""}${sampleLoc ? " around " + sampleLoc : ""}. Price range ₹${priceMin.toFixed(1)}L - ₹${priceMax.toFixed(1)}L. BHK types available: ${bhkSet}.`;
}

function generateNoResultsSummary(filters: SearchFilters): string {
  const parts: string[] = [];
  if (filters.bhk) parts.push(`${filters.bhk}BHK`);
  if (filters.status) parts.push(filters.status === "READY_TO_MOVE" ? "ready to move" : "under construction");
  if (filters.maxPrice) parts.push(`under ₹${filters.maxPrice}L`);
  if (filters.city) parts.push(`in ${filters.city}`);
  if (filters.locality) parts.push(`in ${filters.locality}`);
  const searchCriteria = parts.join(" ") || "your criteria";
  return `No properties found matching ${searchCriteria}. Try adjusting filters.`;
}

/* -------------------------
   Main API Handler
   ------------------------- */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    console.log("🔵 New query:", message);

    const filters = await extractFiltersFromQuery(message);
    const properties = await searchProperties(filters);
    const summary = await generateSummary(properties, filters);

    return NextResponse.json({
      message: summary,
      properties,
      filters,
    });
  } catch (error) {
    console.error("❌ Chat API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Sorry, I encountered an error.",
        properties: [],
      },
      { status: 500 }
    );
  }
}
