import fs from 'fs';

console.log('🔍 Debugging cleaned data...');

// Check projects
const projects = JSON.parse(fs.readFileSync('./data/cleaned_projects.json', 'utf-8'));
console.log('First project:', JSON.stringify(projects[0], null, 2));
console.log('Project keys:', Object.keys(projects[0]));
console.log('projectId in first project:', projects[0].projectId);

// Check if projectId exists in all projects
const missingProjectIds = projects.filter((p: any) => !p.projectId || p.projectId === 'undefined');
console.log(`Projects with missing projectId: ${missingProjectIds.length}`);

// Check addresses
const addresses = JSON.parse(fs.readFileSync('./data/cleaned_addresses.json', 'utf-8'));
console.log('First address:', JSON.stringify(addresses[0], null, 2));
console.log('Address projectId:', addresses[0].projectId);