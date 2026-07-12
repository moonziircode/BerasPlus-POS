require('dotenv').config({ path: '/Users/aqsamuflihan/Downloads/BerasPlus POS/berasplus-web/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: sku } = await supabase.from('skus').select('*').limit(1);
  console.log('SKU cols:', Object.keys(sku[0] || {}));
}
check();
