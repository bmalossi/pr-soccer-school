import { ReactNode, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { isAdminHostname } from "@/lib/admin-domain";

type Props = {
  children: ReactNode;
};

export function AdminRoute({ children }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [roleLoading, setRoleLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const hostnameOk = useMemo(() => isAdminHostname(window.location.hostname), []);

  useEffect(() => {
    let cancelled = false;

    async function checkRole() {
      if (!user) {
        setIsAdmin(false);
        setRoleLoading(false);
        return;
      }

      setRoleLoading(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        setIsAdmin(false);
      } else {
        setIsAdmin(Boolean(data));
      }
      setRoleLoading(false);
    }

    checkRole();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!hostnameOk) {
    return <Navigate to="/" replace />;
  }

  if (loading || roleLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center bg-background text-foreground">
        <div className="text-sm text-muted-foreground">Carregando…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] grid place-items-center bg-background text-foreground">
        <div className="mx-auto max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold tracking-tight">Acesso restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua conta está autenticada, mas ainda não tem permissão de admin.
          </p>
          <div className="mt-4 rounded-xl bg-muted/40 p-3 text-left text-xs text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">E-mail:</span> {user.email}
            </div>
            <div className="mt-1 break-all">
              <span className="font-medium text-foreground">User ID:</span> {user.id}
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Se esta é a primeira configuração, crie a conta e me diga o e-mail para eu atribuir o papel de admin.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
