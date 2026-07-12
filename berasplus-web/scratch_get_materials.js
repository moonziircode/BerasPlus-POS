require('dotenv').config({ path: '/Users/aqsamuflihan/Downloads/BerasPlus POS/berasplus-web/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: materials, error } = await supabase.from('materials').select('*').limit(2);
  console.log('Materials:', materials);
}
main();
