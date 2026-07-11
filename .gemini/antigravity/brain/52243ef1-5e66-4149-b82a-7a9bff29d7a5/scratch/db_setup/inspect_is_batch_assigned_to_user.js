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

async function inspectFunc() {
  try {
    await client.connect();
    
    console.log("Checking is_batch_assigned_to_user...");
    const res = await client.query(`
      SELECT pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      LEFT JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = 'is_batch_assigned_to_user';
    `);
    if (res.rows.length > 0) {
      console.log(res.rows[0].definition);
    } else {
      console.log("Function not found!");
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

inspectFunc();
