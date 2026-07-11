const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.hqdazyovserhvgvqczdp',
  password: 'jQNouoxkpkonpOiB',
  ssl: {
    rejectUnauthorized: false
  }
});

async function addProfile() {
  try {
    await client.connect();
    
    const userId = '421cb7bc-0397-48b2-bbe6-6a2cc063a1e5';
    const email = 'mnzmflhn@gmail.com';
    const roleName = 'Owner';
    
    console.log(`Checking if user ${email} exists in public.users...`);
    const resExist = await client.query("SELECT 1 FROM public.users WHERE id = $1", [userId]);
    
    if (resExist.rows.length === 0) {
      await client.query(`
        INSERT INTO public.users (id, full_name, email, role, store_id, created_at, updated_at)
        VALUES ($1, 'Owner Mnz', $2, $3, NULL, NOW(), NOW())
      `, [userId, email, roleName]);
      console.log("- Inserted into public.users");
    } else {
      console.log("- User already exists in public.users");
    }

    console.log("Owner profile setup complete!");
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

addProfile();
