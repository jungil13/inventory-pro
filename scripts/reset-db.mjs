import { createClient } from '@supabase/supabase-js';


const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase URL or Key");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function resetDb() {
  console.log("Starting DB reset...");
  
  const tablesToClear = [
    'audit_logs',
    'stock_movements',
    'inventory',
    'products',
    'suppliers',
    'categories'
  ];

  for (const table of tablesToClear) {
    console.log(`Clearing ${table}...`);
    // Delete all records where id is not null (effectively all records)
    let error;
    if (table === 'inventory') {
      const result = await supabase.from(table).delete().neq('product_id', '00000000-0000-0000-0000-000000000000');
      error = result.error;
    } else {
      const result = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      error = result.error;
    }
    if (error) {
      console.error(`Error clearing ${table}:`, error.message);
    } else {
      console.log(`Cleared ${table}`);
    }
  }
  
  console.log("DB reset complete.");
}

resetDb();
