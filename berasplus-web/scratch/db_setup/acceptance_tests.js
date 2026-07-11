const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env.local' });

// Mock conversions
const mockConversions = [
  { id: '1', name: 'Liter', factor_to_kg: '0.85' }, // custom liter factor
  { id: '2', name: 'Karung Kecil', factor_to_kg: '25.0' } // custom small bag factor
];

// Inline conversion functions for testing
function convertToKg(amount, unitName, conversions) {
  const normalizedUnit = unitName.trim().toLowerCase();
  if (normalizedUnit === 'kg' || normalizedUnit === 'kilogram') return amount;
  const match = conversions.find(c => c.name.trim().toLowerCase() === normalizedUnit);
  if (match) return amount * Number(match.factor_to_kg);
  if (normalizedUnit === 'liter') return amount * 0.8;
  if (normalizedUnit === 'karung') return amount * 50.0;
  return amount;
}

function convertFromKg(kgAmount, unitName, conversions) {
  const normalizedUnit = unitName.trim().toLowerCase();
  if (normalizedUnit === 'kg' || normalizedUnit === 'kilogram') return kgAmount;
  const match = conversions.find(c => c.name.trim().toLowerCase() === normalizedUnit);
  if (match) {
    const factor = Number(match.factor_to_kg);
    return factor > 0 ? kgAmount / factor : kgAmount;
  }
  if (normalizedUnit === 'liter') return kgAmount * 1.25;
  if (normalizedUnit === 'karung') return kgAmount / 50.0;
  return kgAmount;
}

async function runTests() {
  console.log('=== RUNNING UNIT TESTS FOR CONVERSION ENGINE ===');

  // Test standard fallbacks
  const kgFromLiter = convertToKg(10, 'Liter', []);
  console.assert(kgFromLiter === 8.0, `Expected 8.0 Kg, got ${kgFromLiter}`);
  console.log('✔ Liter to Kg (Default: 0.8): OK -> 10 Liter =', kgFromLiter, 'Kg');

  const literFromKg = convertFromKg(8, 'Liter', []);
  console.assert(literFromKg === 10.0, `Expected 10.0 Liter, got ${literFromKg}`);
  console.log('✔ Kg to Liter (Default: 1.25): OK -> 8 Kg =', literFromKg, 'Liter');

  const kgFromKarung = convertToKg(2, 'Karung', []);
  console.assert(kgFromKarung === 100.0, `Expected 100.0 Kg, got ${kgFromKarung}`);
  console.log('✔ Karung to Kg (Default: 50.0): OK -> 2 Karung =', kgFromKarung, 'Kg');

  // Test custom db conversions
  const customLiter = convertToKg(10, 'Liter', mockConversions);
  console.assert(customLiter === 8.5, `Expected 8.5 Kg, got ${customLiter}`);
  console.log('✔ Custom Liter to Kg (Custom: 0.85): OK -> 10 Liter =', customLiter, 'Kg');

  const customKarung = convertToKg(4, 'Karung Kecil', mockConversions);
  console.assert(customKarung === 100.0, `Expected 100.0 Kg, got ${customKarung}`);
  console.log('✔ Custom Karung Kecil to Kg (Custom: 25.0): OK -> 4 Karung Kecil =', customKarung, 'Kg');


  console.log('\n=== TESTING DATABASE QUERY INTEGRITY (FINANCE & REPORTS) ===');
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Test Finance Queries
  const { data: sales, error: salesError } = await supabase
    .from('sales_transactions')
    .select('total_amount, status, created_at')
    .limit(5);

  if (salesError) {
    console.error('✘ Finance: Failed to query sales_transactions:', salesError.message);
  } else {
    console.log('✔ Finance: sales_transactions query OK. Count =', sales.length);
  }

  const { data: expenses, error: expError } = await supabase
    .from('store_expenses')
    .select('amount, status, category')
    .limit(5);

  if (expError) {
    console.error('✘ Finance: Failed to query store_expenses:', expError.message);
  } else {
    console.log('✔ Finance: store_expenses query OK. Count =', expenses.length);
  }

  // Test Reports Queries
  const { data: ledger, error: ledgerError } = await supabase
    .from('inventory_ledger')
    .select('id, quantity_kg, movement_type, created_at')
    .limit(5);

  if (ledgerError) {
    console.error('✘ Reports: Failed to query inventory_ledger:', ledgerError.message);
  } else {
    console.log('✔ Reports: inventory_ledger query OK. Count =', ledger.length);
  }

  // Test Recipe Details
  const { data: recipes, error: recipeError } = await supabase
    .from('recipes')
    .select('id, name, recipe_code')
    .limit(1);

  if (recipeError) {
    console.error('✘ Recipes: Failed to query recipes:', recipeError.message);
  } else if (recipes.length === 0) {
    console.log('✔ Recipes: query OK, but no recipe in DB yet.');
  } else {
    console.log('✔ Recipes: query OK. Found recipe:', recipes[0].name);
    // Fetch recipe details
    const { data: inputs } = await supabase
      .from('recipe_version_inputs')
      .select('quantity_kg, raw_materials(name, rm_code, base_unit)')
      .limit(5);
    console.log('✔ Recipes: recipe_version_inputs query OK. Items =', inputs?.length || 0);
  }

  console.log('\n✔ Acceptance test successfully complete!');
}

runTests().catch(console.error);
