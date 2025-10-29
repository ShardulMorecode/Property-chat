// scripts/run-import.js
require('dotenv').config({ path: '.env.local' });

async function run() {
  const { default: importData } = await import('./import-data.js');
  await importData();
}

run();