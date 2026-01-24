import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase.from("site_content").select("key").order("key");
      if (cancelled) return;
      if (error) return;
      setKeys((data ?? []).map((r) => r.key));
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function seedDefaults() {
    setLoading(true);
    const defaults = [
      { key: "site_settings", draft: { site_title: "PR Soccer School" }, published: {} },
      { key: "home_hero", draft: { headline: "Elite Youth Soccer Training" }, published: {} },
    ];

    const { error } = await supabase.from("site_content").upsert(defaults, { onConflict: "key" });
    setLoading(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Pronto", description: "Conteúdos iniciais criados." });
    setKeys((prev) => Array.from(new Set([...prev, ...defaults.map((d) => d.key)])).sort());
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          MVP do admin: autenticação + controle de acesso + base de conteúdo (rascunho/publicado).
        </p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold">Conteúdo</div>
            <div className="text-sm text-muted-foreground">
              Itens existentes: {keys.length ? keys.join(", ") : "(nenhum ainda)"}
            </div>
          </div>
          <Button onClick={seedDefaults} disabled={loading}>
            {loading ? "Criando…" : "Criar conteúdos iniciais"}
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Próximo passo: adicionar telas de edição para Hero/Coach/Benefits/Services/Testimonials e botão “Publicar”.
        </p>
      </Card>
    </div>
  );
}
