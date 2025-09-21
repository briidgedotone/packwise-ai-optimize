#!/usr/bin/env node

// Simple script to immediately clean failed analyses
// Run with: node cleanup-failed.js

const { ConvexHttpClient } = require('convex/browser');

const CONVEX_URL = process.env.CONVEX_URL || 'https://tidy-caiman-590.convex.dev';

async function cleanupFailedAnalyses() {
  console.log('🧹 Starting immediate cleanup of failed analyses...');
  
  try {
    const client = new ConvexHttpClient(CONVEX_URL);
    
    // Note: This script requires authentication, so it's mainly for reference
    // The actual cleanup should be done through the UI when authenticated
    
    console.log('❌ This script requires authentication.');
    console.log('✅ Please use the Settings > Database tab in the application instead.');
    console.log('');
    console.log('The cleanup will:');
    console.log('- Remove ALL failed analyses immediately (no 7-day wait)');
    console.log('- Auto-run when you visit Settings > Database tab');
    console.log('- Include emergency cleanup option to delete all analyses');
    
  } catch (error) {
    console.error('Failed to cleanup:', error.message);
  }
}

if (require.main === module) {
  cleanupFailedAnalyses();
}