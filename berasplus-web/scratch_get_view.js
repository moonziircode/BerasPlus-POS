const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '/Users/aqsamuflihan/Downloads/BerasPlus POS/berasplus-web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.rpc('get_view_definition', { view_name: 'inventory_balances_view' });
  if (error) {
    console.error('Error fetching via RPC:', error);
    // fallback, let's fetch one row
    const { data: row, error: rowErr } = await supabase.from('inventory_balances_view').select('*').limit(1);
    console.log('Row sample:', row);
  } else {
    console.log('View definition:', data);
  }
}
main();
