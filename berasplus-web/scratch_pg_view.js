const { Client } = require('pg');
require('dotenv').config({ path: '/Users/aqsamuflihan/Downloads/BerasPlus POS/berasplus-web/.env.local' });

// We assume process.env.DATABASE_URL exists or we construct it.
// Supabase service keys can be used but for DB queries we need connection string.
// Let's just use the REST api of supabase to query materials.
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: materials, error } = await supabase.from('materials').select('*').limit(5);
  console.log('Materials:', materials);
}
main();
