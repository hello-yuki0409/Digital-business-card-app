import { createClient } from "@supabase/supabase-js";

// .envファイルから環境変数を取得
const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY as string;

// Supabaseクライアントを作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
