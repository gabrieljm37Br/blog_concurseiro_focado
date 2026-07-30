import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ovpyjsjvowhhyxvwbedh.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92cHlqc2p2b3doaHl4dndiZWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1Njc0MjUsImV4cCI6MjA5ODE0MzQyNX0.lWNbTOAO0-YhhceT36jxO6TOwoBzPc8IAh0L7PzWmZA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
