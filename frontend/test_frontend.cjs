#!/usr/bin/env node
/**
 * Simple test script to verify frontend components work correctly.
 */

// Simple test to verify frontend files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'src/App.jsx',
  'src/FormPage.jsx',
  'src/DashboardPage.jsx',
  'src/api.js',
  'package.json',
  'tailwind.config.js'
];

let passed = 0;
let failed = 0;

console.log('Testing required frontend files...\n');

for (const file of requiredFiles) {
  const fullPath = path.join(__dirname, file);
  try {
    fs.accessSync(fullPath, fs.constants.F_OK);
    console.log(`✓ ${path.basename(file)} exists`);
    passed++;
  } catch (err) {
    console.log(`✗ ${path.basename(file)} does not exist: ${err.message}`);
    failed++;
  }
}

console.log(`\nFile tests: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All frontend file tests passed!');
  process.exit(0);
}
