import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xnwrmzkvaxzaamyiqgel.supabase.co';

const supabaseAnonKey = 'sb_publishable_8TAqg9A10VlnqlOJw4-PuQ_zKsk3nbd'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);