require('dotenv').config({ path: '/Users/aqsamuflihan/Downloads/BerasPlus POS/berasplus-web/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: view } = await supabase.from('inventory_balances_view').select('*').limit(1);
  const { data: rm } = await supabase.from('raw_materials').select('id, conversion_factor').limit(1);
  const { data: pkg } = await supabase.from('packaging_materials').select('id').limit(1);
  const { data: sku } = await supabase.from('skus').select('id, weight_kg').limit(1);
  
  console.log('VIEW cols:', view ? Object.keys(view[0] || {}) : 'error');
  console.log('RM data:', rm);
  console.log('PKG data:', pkg);
  console.log('SKU data:', sku);
}
check();
