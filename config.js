// ============================================================
// Site configuration.
// ============================================================

// Get these from your Supabase project: Settings -> API
//   SUPABASE_URL      -> "Project URL"
//   SUPABASE_ANON_KEY -> "anon public" key (NOT the service_role key)
//
// The anon key is safe to expose in client-side code — that's what
// it's for — as long as your table's Row Level Security policies
// only allow what you intend (see supabase-schema.sql).
const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY';

// Discord invite link shown as a button in the header. Leave the
// placeholder if you don't want a Discord button — clicking it will
// just prompt you to set this instead of opening a broken link.
const DISCORD_INVITE_URL = 'https://discord.gg/YOUR-INVITE-CODE';
