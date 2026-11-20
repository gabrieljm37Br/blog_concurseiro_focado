import type { User } from "@supabase/supabase-js";

/**
 * Verifica se o usuário autenticado via Supabase Auth possui privilégios de administrador.
 *
 * IMPORTANTE:
 * - Confia apenas em `app_metadata.role === "admin"` (assinado no JWT pelo servidor e
 *   imutável pelo cliente via `supabase.auth.updateUser`), nunca em `user_metadata` nem
 *   em dados do `localStorage`.
 * - Opcionalmente aceita `NEXT_PUBLIC_ADMIN_EMAIL` apenas quando o e-mail da sessão real
 *   do Supabase estiver confirmado (`email_confirmed_at`).
 */
export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;

  if (user.app_metadata?.role === "admin") {
    return true;
  }

  const configuredAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();
  if (
    configuredAdminEmail &&
    user.email?.trim().toLowerCase() === configuredAdminEmail &&
    Boolean(user.email_confirmed_at)
  ) {
    return true;
  }

  return false;
}
