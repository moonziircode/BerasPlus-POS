const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://hqdazyovserhvgvqczdp.supabase.co'
const supabaseKey = 'sb_publishable_LB-mgtD4SVhpnFX5lcUpMQ_icmXh46Q'

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(2)

  if (error) {
    console.error('Error fetching users:', error)
  } else {
    console.log('Sample Users Data:')
    console.log(JSON.stringify(data, null, 2))
    if (data && data.length > 0) {
      console.log('Columns detected:', Object.keys(data[0]))
    }
  }
}

check()
