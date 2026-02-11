import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/**
 * 🔐 SICUREZZA: Chiavi pubbliche su GitHub Pages
 * 
 * ⚠️ IMPORTANTE: Queste chiavi SONO pubbliche e VISIBILI su GitHub.
 * Questo è SAFE perché:
 * 
 * 1. La ANON_KEY è progettata per essere pubblica (client-side)
 * 2. La sicurezza viene da Row Level Security (RLS) di Supabase
 * 3. RLS blocca l'accesso ai dati anche con chiave pubblica
 * 4. Un utente non può leggere i dati di un altro utente
 * 5. Un utente non può modificare dati non suoi
 * 
 * Se le chiavi venissero compromesse:
 * - Senza RLS: PROBLEMA! Accesso a tutti i dati
 * - Con RLS: Non c'è problema! I dati rimangono protetti
 * 
 * Per configurare RLS correttamente, vedi: SUPABASE_RLS_SETUP.md
 * 
 * 📚 Documentazione ufficiale:
 * https://supabase.com/docs/guides/auth/row-level-security
 */

const SUPABASE_URL = "https://zeuigdzpwltgqwkyhgse.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpldWlnZHpwd2x0Z3F3a3loZ3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjQ3NjAsImV4cCI6MjA4NjMwMDc2MH0.P1SQjSJ-DoQnN0Fb9DwwyB5Q7u0usgeyJ69CXfenHqc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // remember-me ON di default
  }
});
