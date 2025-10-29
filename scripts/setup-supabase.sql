-- Drop existing tables if needed
DROP TABLE IF EXISTS project_variants CASCADE;
DROP TABLE IF EXISTS project_configurations CASCADE;
DROP TABLE IF EXISTS project_addresses CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Main projects table
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  project_type TEXT,
  project_name TEXT NOT NULL,
  project_category TEXT,
  slug TEXT,
  status TEXT,
  project_age INTEGER,
  rera_id TEXT[],
  city_id TEXT,
  locality_id TEXT,
  sub_locality_id TEXT,
  project_summary TEXT,
  possession_date TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Project addresses table
CREATE TABLE project_addresses (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  landmark TEXT,
  full_address TEXT,
  pincode TEXT
);

-- Project configurations table (BHK types)
CREATE TABLE project_configurations (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  property_category TEXT,
  type TEXT,
  custom_bhk TEXT
);

-- Project configuration variants (pricing and details)
CREATE TABLE project_variants (
  id TEXT PRIMARY KEY,
  configuration_id TEXT REFERENCES project_configurations(id) ON DELETE CASCADE,
  bathrooms INTEGER,
  balcony INTEGER,
  furnished_type TEXT,
  carpet_area NUMERIC,
  price NUMERIC,
  about_property TEXT,
  maintenance_charges TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_projects_name ON projects(project_name);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_addresses_project ON project_addresses(project_id);
CREATE INDEX idx_configs_project ON project_configurations(project_id);
CREATE INDEX idx_configs_type ON project_configurations(type);
CREATE INDEX idx_variants_config ON project_variants(configuration_id);
CREATE INDEX idx_variants_price ON project_variants(price);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_variants ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON project_addresses FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON project_configurations FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON project_variants FOR SELECT USING (true);