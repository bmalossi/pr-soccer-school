import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";

type SiteContentRow = Database["public"]["Tables"]["site_content"]["Row"];
type SiteJson = Database["public"]["Tables"]["site_content"]["Row"]["draft"];

const safeStringify = (value: unknown) => {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return "{}";
  }
};

const parseJson = (raw: string): { ok: true; value: SiteJson } | { ok: false; error: string } => {
  try {
    const value = JSON.parse(raw) as SiteJson;
    return { ok: true, value };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "JSON inválido" };
  }
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<SiteContentRow[]>([]);
  const [draftTextByKey, setDraftTextByKey] = useState<Record<string, string>>({});
  const [dirtyKeys, setDirtyKeys] = useState<Record<string, boolean>>({});
  const keys = useMemo(() => rows.map((r) => r.key).sort(), [rows]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from("site_content")
        .select("id,key,draft,published,created_at,updated_at")
        .order("key");
      if (cancelled) return;
      if (error) return;

      const nextRows = (data ?? []) as SiteContentRow[];
      setRows(nextRows);
      setDraftTextByKey((prev) => {
        const next = { ...prev };
        for (const r of nextRows) {
          if (next[r.key] === undefined) next[r.key] = safeStringify(r.draft);
        }
        return next;
      });
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

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("site_content")
      .upsert(defaults.map((d) => ({ ...d, updated_at: now })), { onConflict: "key" });
    setLoading(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Pronto", description: "Conteúdos iniciais criados." });

    const { data } = await supabase
      .from("site_content")
      .select("id,key,draft,published,created_at,updated_at")
      .order("key");
    setRows((data ?? []) as SiteContentRow[]);
  }

  function setDraftText(key: string, next: string) {
    setDraftTextByKey((prev) => ({ ...prev, [key]: next }));
    setDirtyKeys((prev) => ({ ...prev, [key]: true }));
  }

  async function saveDrafts(keysToSave: string[]) {
    if (!keysToSave.length) return;
    const now = new Date().toISOString();

    const payload: { key: string; draft: SiteJson; updated_at: string }[] = [];
    for (const k of keysToSave) {
      const parsed = parseJson(draftTextByKey[k] ?? "{}");
      if (parsed.ok === false) {
        toast({ title: "Erro", description: `“${k}”: ${parsed.error}`, variant: "destructive" });
        return;
      }
      payload.push({ key: k, draft: parsed.value, updated_at: now });
    }

    const { error } = await supabase.from("site_content").upsert(payload, { onConflict: "key" });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }

    setDirtyKeys((prev) => {
      const next = { ...prev };
      keysToSave.forEach((k) => delete next[k]);
      return next;
    });
    toast({ title: "Salvo", description: "Rascunhos atualizados." });

    const { data } = await supabase
      .from("site_content")
      .select("id,key,draft,published,created_at,updated_at")
      .order("key");
    setRows((data ?? []) as SiteContentRow[]);
  }

  async function publishAll() {
    if (!keys.length) return;
    setLoading(true);
    try {
      // garante que o publicado reflita o rascunho atual do editor
      await saveDrafts(keys.filter((k) => dirtyKeys[k]));

      const now = new Date().toISOString();
      const updates: { key: string; published: SiteJson; updated_at: string }[] = [];

      for (const k of keys) {
        const parsed = parseJson(draftTextByKey[k] ?? "{}");
        if (parsed.ok === false) {
          toast({ title: "Erro", description: `“${k}”: ${parsed.error}`, variant: "destructive" });
          return;
        }
        updates.push({ key: k, published: parsed.value, updated_at: now });
      }

      const results = await Promise.all(
        updates.map((u) =>
          supabase
            .from("site_content")
            .update({ published: u.published, updated_at: u.updated_at })
            .eq("key", u.key),
        ),
      );

      const firstError = results.map((r) => r.error).find(Boolean);
      if (firstError) {
        toast({ title: "Erro", description: firstError.message, variant: "destructive" });
        return;
      }

      toast({ title: "Publicado", description: "Tudo foi publicado com sucesso." });

      const { data } = await supabase
        .from("site_content")
        .select("id,key,draft,published,created_at,updated_at")
        .order("key");
      setRows((data ?? []) as SiteContentRow[]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Editor de conteúdo (rascunho/publicado) + publicar tudo.
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
              variant="outline"
              onClick={() => saveDrafts(keys.filter((k) => dirtyKeys[k]))}
              disabled={loading || !keys.some((k) => dirtyKeys[k])}
              title={!keys.some((k) => dirtyKeys[k]) ? "Sem alterações de rascunho" : ""}
            >
              {loading ? "Aguarde…" : "Salvar rascunhos"}
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
          <div className="mt-6 space-y-3">
            <div className="text-xs font-semibold text-muted-foreground">Editar rascunho (JSON)</div>
            <Accordion type="multiple" className="w-full">
              {keys.map((k) => {
                const row = rows.find((r) => r.key === k);
                const updatedAt = row?.updated_at ? new Date(row.updated_at).toLocaleString() : "-";
                return (
                  <AccordionItem key={k} value={k} className="rounded-md border px-3">
                    <AccordionTrigger className="py-3">
                      <div className="flex w-full flex-col gap-1 text-left">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium">{k}</span>
                          {dirtyKeys[k] ? (
                            <span className="text-xs text-muted-foreground">alterado</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">ok</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">Atualizado em: {updatedAt}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <Textarea
                        value={draftTextByKey[k] ?? "{}"}
                        onChange={(e) => setDraftText(k, e.target.value)}
                        className="min-h-[240px] font-mono text-xs"
                        spellCheck={false}
                      />
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        )}
      </Card>
    </div>
  );
}
