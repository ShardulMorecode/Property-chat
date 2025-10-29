// scripts/import-data.ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import Papa from 'papaparse';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.error('Please ensure .env.local has:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface ProjectRow {
  id: string;
  projectType: string;
  projectName: string;
  projectCategory: string;
  slug: string;
  status: string;
  projectAge: string;
  reraId: string;
  cityId: string;
  localityId: string;
  subLocalityId: string;
  projectSummary: string;
  possessionDate: string;
}

interface AddressRow {
  id: string;
  projectId: string;
  landmark: string;
  fullAddress: string;
  pincode: string;
}

interface ConfigRow {
  id: string;
  projectId: string;
  propertyCategory: string;
  type: string;
  customBHK: string;
}

interface VariantRow {
  id: string;
  configurationId: string;
  bathrooms: string;
  balcony: string;
  furnishedType: string;
  carpetArea: string;
  price: string;
  aboutProperty: string;
  maintenanceCharges: string;
}

async function parseCSV<T>(filename: string): Promise<T[]> {
  const csvPath = path.join(process.cwd(), 'data', filename);
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ File not found: ${csvPath}`);
    return [];
  }
  
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  
  return new Promise((resolve, reject) => {
    Papa.parse<T>(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error: any) => reject(error)
    });
  });
}

async function importData() {
  try {
    console.log('📊 Starting data import...\n');

    // 1. Import Projects
    console.log('1️⃣ Importing projects...');
    const projectRows = await parseCSV<ProjectRow>('project.csv');
    
    if (projectRows.length === 0) {
      console.error('❌ No project data found!');
      return;
    }

    const projects = projectRows.map(row => ({
      id: row.id,
      project_type: row.projectType,
      project_name: row.projectName,
      project_category: row.projectCategory,
      slug: row.slug,
      status: row.status,
      project_age: parseInt(row.projectAge) || null,
      rera_id: row.reraId ? [row.reraId] : [],
      city_id: row.cityId,
      locality_id: row.localityId,
      sub_locality_id: row.subLocalityId,
      project_summary: row.projectSummary,
      possession_date: row.possessionDate
    }));

    const { error: projectError } = await supabase
      .from('projects')
      .upsert(projects, { onConflict: 'id' });
    
    if (projectError) {
      console.error('❌ Project import error:', projectError);
    } else {
      console.log(`✅ Imported ${projects.length} projects`);
    }

    // 2. Import Addresses
    console.log('\n2️⃣ Importing addresses...');
    const addressRows = await parseCSV<AddressRow>('ProjectAddress.csv');
    const addresses = addressRows.map(row => ({
      id: row.id,
      project_id: row.projectId,
      landmark: row.landmark,
      full_address: row.fullAddress,
      pincode: row.pincode
    }));

    const { error: addressError } = await supabase
      .from('project_addresses')
      .upsert(addresses, { onConflict: 'id' });
    
    if (addressError) {
      console.error('❌ Address import error:', addressError);
    } else {
      console.log(`✅ Imported ${addresses.length} addresses`);
    }

    // 3. Import Configurations
    console.log('\n3️⃣ Importing configurations...');
    const configRows = await parseCSV<ConfigRow>('ProjectConfiguration.csv');
    const configs = configRows.map(row => ({
      id: row.id,
      project_id: row.projectId,
      property_category: row.propertyCategory,
      type: row.type,
      custom_bhk: row.customBHK
    }));

    const { error: configError } = await supabase
      .from('project_configurations')
      .upsert(configs, { onConflict: 'id' });
    
    if (configError) {
      console.error('❌ Config import error:', configError);
    } else {
      console.log(`✅ Imported ${configs.length} configurations`);
    }

    // 4. Import Variants
    console.log('\n4️⃣ Importing variants...');
    const variantRows = await parseCSV<VariantRow>('ProjectConfigurationVariant.csv');
    const variants = variantRows.map(row => ({
      id: row.id,
      configuration_id: row.configurationId,
      bathrooms: parseInt(row.bathrooms) || 0,
      balcony: parseInt(row.balcony) || 0,
      furnished_type: row.furnishedType,
      carpet_area: parseFloat(row.carpetArea) || 0,
      price: parseFloat(row.price) || 0,
      about_property: row.aboutProperty,
      maintenance_charges: row.maintenanceCharges
    }));

    const { error: variantError } = await supabase
      .from('project_variants')
      .upsert(variants, { onConflict: 'id' });
    
    if (variantError) {
      console.error('❌ Variant import error:', variantError);
    } else {
      console.log(`✅ Imported ${variants.length} variants`);
    }

    console.log('\n🎉 Data import complete!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run import
importData();