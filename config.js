// ============================================================
// Supabase connection settings.
// Get these from your Supabase project: Settings -> API
//   SUPABASE_URL      -> "Project URL"
//   SUPABASE_ANON_KEY -> "anon public" key (NOT the service_role key)
//
// The anon key is safe to expose in client-side code — that's what
// it's for — as long as your table's Row Level Security policies
// only allow what you intend (see supabase-schema.sql).
// ============================================================

const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY';
