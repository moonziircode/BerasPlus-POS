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

async function inspectCols() {
  try {
    await client.connect();
    
    console.log("Querying columns of sales_transactions...");
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'sales_transactions';
    `);
    console.log(res.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

inspectCols();
