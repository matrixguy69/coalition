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
const SUPABASE_URL = 'https://ecidimywacpfcfrbmxfl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjaWRpbXl3YWNwZmNmcmJteGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NDA4NTcsImV4cCI6MjEwMjExNjg1N30.J-zvqXQtjvFFwbRXsMoy0_F9qW4DO73Jrhp1c8nudps';

// Discord invite link shown as a button in the header. Leave the
// placeholder if you don't want a Discord button — clicking it will
// just prompt you to set this instead of opening a broken link.
const DISCORD_INVITE_URL = 'https://discord.gg/GgevXjkUfM';
