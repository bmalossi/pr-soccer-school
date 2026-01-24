import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { isAdminHostname } from "@/lib/admin-domain";
import { useAuth } from "@/context/AuthContext";

const schema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

type FormValues = z.infer<typeof schema>;

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [submitting, setSubmitting] = useState(false);

  const hostnameOk = useMemo(() => isAdminHostname(window.location.hostname), []);
  const reason = new URLSearchParams(location.search).get("reason");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (user) navigate("/admin", { replace: true });
  }, [navigate, user]);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;
        navigate("/admin", { replace: true });
      } else {
        const redirectUrl = `${window.location.origin}/admin`;
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (error) throw error;
        toast({
          title: "Conta criada",
          description: "Agora faça login. (A permissão de admin será atribuída separadamente.)",
        });
        setMode("login");
      }
    } catch (e: any) {
      toast({
        title: "Erro",
        description: e?.message ?? "Não foi possível autenticar.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!hostnameOk) {
    return (
      <div className="min-h-[70vh] grid place-items-center bg-background text-foreground">
        <Card className="w-full max-w-md p-6 text-center">
          <h1 className="text-lg font-semibold tracking-tight">Admin indisponível</h1>
          <p className="mt-2 text-sm text-muted-foreground">O admin está habilitado apenas em prsoccerschool.com.</p>
          <Button className="mt-4" variant="outline" asChild>
            <a href="/">Voltar ao site</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] grid place-items-center bg-background text-foreground">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Admin Login</h1>
          <p className="text-sm text-muted-foreground">
            {reason === "idle" ? "Sessão encerrada por inatividade (30 min)." : "Acesso restrito."}
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} {...form.register("password")} />
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>

          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            {mode === "login" ? (
              <button type="button" className="underline-offset-4 hover:underline" onClick={() => setMode("signup")}>
                Criar conta (setup inicial)
              </button>
            ) : (
              <button type="button" className="underline-offset-4 hover:underline" onClick={() => setMode("login")}>
                Já tenho conta
              </button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
