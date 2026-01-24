import { useEffect, useMemo, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const IDLE_MINUTES = 30;

export default function AdminLayout() {
  const navigate = useNavigate();
  const timeoutRef = useRef<number | null>(null);

  const idleMs = useMemo(() => IDLE_MINUTES * 60 * 1000, []);

  useEffect(() => {
    const reset = () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/admin/login?reason=idle", { replace: true });
      }, idleMs);
    };

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "wheel",
    ];

    reset();
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      events.forEach((ev) => window.removeEventListener(ev, reset));
    };
  }, [idleMs, navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Admin</div>
              <div className="text-xs text-muted-foreground">PR Soccer School</div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  );
}
