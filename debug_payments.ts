
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPayments() {
    const now = new Date();
    // Hardcode to the month the user is seeing issues with if needed, or use dynamic
    const currentMonthStr = '2025-11';

    console.log(`Checking pool payments for ${currentMonthStr}...`);

    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('type', 'pool')
        .ilike('month_date', `${currentMonthStr}%`);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Found payments:', data);
        console.log('Count:', data.length);
    }
}

checkPayments();
