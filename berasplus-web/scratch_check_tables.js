require('dotenv').config({ path: '/Users/aqsamuflihan/Downloads/BerasPlus POS/berasplus-web/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: rm } = await supabase.from('raw_materials').select('*').limit(1);
  const { data: pkg } = await supabase.from('packaging').select('*').limit(1);
  const { data: sku } = await supabase.from('skus').select('*').limit(1);
  const { data: view } = await supabase.from('inventory_balances_view').select('*').limit(1);
  
  console.log('RM cols:', Object.keys(rm[0] || {}));
  console.log('PKG cols:', Object.keys(pkg[0] || {}));
  console.log('SKU cols:', Object.keys(sku[0] || {}));
  console.log('VIEW cols:', Object.keys(view[0] || {}));
}
check();
