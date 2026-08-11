const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('gigs')
    .select(`
      *,
      posted_by_user:User!posted_by (
        id,
        full_name,
        company_name,
        avatar_url,
        image,
        college
      )
    `, { count: 'exact' })
    .limit(1);
    
  console.log("Error:", error);
  console.log("Data length:", data ? data.length : 0);
}
test();
