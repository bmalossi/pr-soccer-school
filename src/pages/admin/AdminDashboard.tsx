import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Json = Database["public"]["Tables"]["site_content"]["Row"]["draft"];

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

  async function publishKey(contentKey: string) {
    setLoading(true);
    try {
      const { data, error: readError } = await supabase
        .from("site_content")
        .select("draft")
        .eq("key", contentKey)
        .maybeSingle();

      if (readError) {
        toast({ title: "Erro", description: readError.message, variant: "destructive" });
        return;
      }

      const draft = (data?.draft ?? {}) as Json;
      const { error: updateError } = await supabase
        .from("site_content")
        .update({ published: draft })
        .eq("key", contentKey);

      if (updateError) {
        toast({ title: "Erro", description: updateError.message, variant: "destructive" });
        return;
      }

      toast({ title: "Publicado", description: `“${contentKey}” publicado com sucesso.` });
    } finally {
      setLoading(false);
    }
  }

  async function publishAll() {
    if (!keys.length) return;
    setLoading(true);
    try {
      for (const k of keys) {
        // eslint-disable-next-line no-await-in-loop
        await publishKey(k);
      }
    } finally {
      setLoading(false);
    }
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
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={seedDefaults} disabled={loading}>
              {loading ? "Criando…" : "Criar conteúdos iniciais"}
            </Button>
            <Button
              variant="secondary"
              onClick={publishAll}
              disabled={loading || !keys.length}
              title={!keys.length ? "Crie conteúdos iniciais primeiro" : ""}
            >
              {loading ? "Publicando…" : "Publicar tudo"}
            </Button>
          </div>
        </div>

        {!!keys.length && (
          <div className="mt-6 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">Ações rápidas</div>
            <div className="flex flex-col gap-2">
              {keys.map((k) => (
                <div key={k} className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm">{k}</div>
                  <Button size="sm" onClick={() => publishKey(k)} disabled={loading}>
                    Publicar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          Próximo passo: adicionar telas de edição para Hero/Coach/Benefits/Services/Testimonials e botão “Publicar”.
        </p>
      </Card>
    </div>
  );
}
