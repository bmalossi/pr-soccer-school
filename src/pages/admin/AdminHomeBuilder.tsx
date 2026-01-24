import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ExternalLink } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

type SiteJson = Database["public"]["Tables"]["site_content"]["Row"]["draft"];

type HomeSectionType = "hero" | "benefits" | "programs_highlights" | "testimonials";

type HeroContent = {
  tagline?: string;
  heading?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  heroCaptionTitle?: string;
  heroCaptionText?: string;
};

type BenefitItem = { title?: string; text?: string };
type BenefitsContent = { heading?: string; description?: string; items?: BenefitItem[] };

type ProgramItem = {
  title?: string;
  ages?: string;
  description?: string;
  metaLeft?: string;
  linkText?: string;
  linkHref?: string;
};
type ProgramsHighlightsContent = { heading?: string; description?: string; items?: ProgramItem[] };

type TestimonialItem = { quote?: string; author?: string };
type TestimonialsContent = { heading?: string; description?: string; items?: TestimonialItem[] };

type HomeSection = {
  id: string;
  type: HomeSectionType;
  enabled: boolean;
  content: HeroContent | BenefitsContent | ProgramsHighlightsContent | TestimonialsContent;
};

type HomeBuilderDraft = {
  version: 1;
  sections: HomeSection[];
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

const asString = (v: unknown) => (typeof v === "string" ? v : undefined);

const toBool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);

const ensureArray = <T,>(v: unknown, fallback: T[]) => (Array.isArray(v) ? (v as T[]) : fallback);

const defaultDraft = (): HomeBuilderDraft => ({
  version: 1,
  sections: [
    {
      id: "hero",
      type: "hero",
      enabled: true,
      content: {
        tagline: "Brazilian Method. American Opportunity.",
        heading: "Elite Youth Soccer Training for Future Game Changers.",
        description:
          "PR Soccer School combines Brazilian creativity with professional structure to help young players in the U.S. build real skills, confidence, and discipline on and off the field.",
        primaryCtaText: "Book Your Free Trial",
        primaryCtaHref: "#trial-form",
        secondaryCtaText: "View Programs",
        secondaryCtaHref: "/programs",
        heroCaptionTitle: "Real players. Real smiles. Real development.",
        heroCaptionText:
          "Sessions focus on first touch, ball control, decision making, and game intelligence — everything young players need to stand out in tryouts and matches.",
      } satisfies HeroContent,
    },
    {
      id: "benefits",
      type: "benefits",
      enabled: true,
      content: {
        heading: "Why Families Choose PR Soccer",
        description: "More than drills. We build complete players with strong fundamentals, mindset, and respect for the game.",
        items: [
          {
            title: "Professional Brazilian Coaching",
            text: "Sessions led by licensed coaches with experience in Brazilian methodology, adapted to U.S. youth soccer reality.",
          },
          {
            title: "Small Groups, Big Results",
            text: "Limited players per session so every child gets real touches on the ball and specific feedback.",
          },
          {
            title: "Character On and Off the Field",
            text: "We teach discipline, respect, and teamwork so players grow as athletes and as people.",
          },
        ],
      } satisfies BenefitsContent,
    },
    {
      id: "programs_highlights",
      type: "programs_highlights",
      enabled: true,
      content: {
        heading: "Highlighted Programs",
        description:
          "From first touches to competitive preparation, choose the program that matches your player's age and goals.",
        items: [
          {
            title: "Academy Training",
            ages: "Ages 8–14",
            description: "Progressive technical and tactical development in a structured weekly program.",
            metaLeft: "2x per week",
            linkText: "Learn more",
            linkHref: "/programs",
          },
          {
            title: "Clinics & Camps",
            ages: "Ages 6–16",
            description: "High-intensity sessions during breaks and weekends, focused on specific skills like finishing or 1v1.",
            metaLeft: "Seasonal",
            linkText: "View dates",
            linkHref: "/programs",
          },
          {
            title: "Private Training",
            ages: "Ages 8–17",
            description: "1-on-1 or small groups designed around your player's position, level, and competitive goals.",
            metaLeft: "Custom schedule",
            linkText: "Request details",
            linkHref: "/contact",
          },
        ],
      } satisfies ProgramsHighlightsContent,
    },
    {
      id: "testimonials",
      type: "testimonials",
      enabled: true,
      content: {
        heading: "What Parents Are Saying",
        description: "Real feedback from families who trust PR Soccer School with their children's development.",
        items: [
          {
            quote: "Our son not only improved technically, but also gained so much confidence. The coaches truly care.",
            author: "Parent of U12 player",
          },
          {
            quote: "Training is intense but fun. You can see the Brazilian style in the way they encourage creativity.",
            author: "Parent of U14 player",
          },
          {
            quote: "Flexible schedules, great communication, and most importantly, our daughter loves every session.",
            author: "Parent of U10 player",
          },
        ],
      } satisfies TestimonialsContent,
    },
  ],
});

const coerceDraft = (value: unknown): HomeBuilderDraft => {
  if (!isRecord(value)) return defaultDraft();
  const sectionsRaw = ensureArray<unknown>(value.sections, []);
  const sections: HomeSection[] = sectionsRaw
    .map((s): HomeSection | null => {
      if (!isRecord(s)) return null;
      const type = asString(s.type) as HomeSectionType | undefined;
      const id = asString(s.id) ?? type;
      const enabled = toBool(s.enabled, true);
      const content = isRecord(s.content) ? (s.content as any) : {};
      if (!type || !id) return null;
      return { id, type, enabled, content };
    })
    .filter(Boolean) as HomeSection[];

  if (!sections.length) return defaultDraft();
  return { version: 1, sections };
};

function SortableShell({
  id,
  title,
  enabled,
  onEnabledChange,
  children,
}: {
  id: string;
  title: string;
  enabled: boolean;
  onEnabledChange: (next: boolean) => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as const;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={
        "p-4 " +
        (isDragging ? "ring-2 ring-ring" : "")
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 text-foreground shadow-sm hover:bg-muted"
            aria-label="Arrastar seção"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div>
            <div className="text-sm font-semibold">{title}</div>
            <div className="text-xs text-muted-foreground">ID: {id}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Ativa</span>
          <Switch checked={enabled} onCheckedChange={onEnabledChange} />
        </div>
      </div>
      <Separator className="my-4" />
      {children}
    </Card>
  );
}

export default function AdminHomeBuilder() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<HomeBuilderDraft>(() => defaultDraft());
  const [dirty, setDirty] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const sectionIds = useMemo(() => draft.sections.map((s) => s.id), [draft.sections]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_content")
        .select("draft")
        .eq("key", "home_builder")
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      setDraft(coerceDraft(data?.draft));
      setDirty(false);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateSection(id: string, patch: Partial<HomeSection>) {
    setDraft((prev) => {
      const next = {
        ...prev,
        sections: prev.sections.map((s) => (s.id === id ? ({ ...s, ...patch } as HomeSection) : s)),
      };
      return next;
    });
    setDirty(true);
  }

  function updateSectionContent<T extends HomeSection["content"]>(id: string, patch: Partial<T>) {
    setDraft((prev) => {
      const nextSections = prev.sections.map((s) => {
        if (s.id !== id) return s;
        return { ...s, content: { ...(s.content as any), ...(patch as any) } };
      });
      return { ...prev, sections: nextSections };
    });
    setDirty(true);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setDraft((prev) => {
      const oldIndex = prev.sections.findIndex((s) => s.id === active.id);
      const newIndex = prev.sections.findIndex((s) => s.id === over.id);
      return { ...prev, sections: arrayMove(prev.sections, oldIndex, newIndex) };
    });
    setDirty(true);
  }

  async function saveDraft() {
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const payload: { key: string; draft: SiteJson; updated_at: string } = {
        key: "home_builder",
        draft: draft as unknown as SiteJson,
        updated_at: now,
      };

      const { error } = await supabase.from("site_content").upsert([payload], { onConflict: "key" });
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Salvo", description: "Rascunho da Home atualizado." });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    setSaving(true);
    try {
      // garante que o draft no banco esteja igual ao editor
      await saveDraft();

      const now = new Date().toISOString();
      const { error } = await supabase
        .from("site_content")
        .update({ published: (draft as unknown as SiteJson), updated_at: now })
        .eq("key", "home_builder");

      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Publicado", description: "Home publicada com sucesso." });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <div className="text-sm text-muted-foreground">Carregando editor…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Home Builder</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Arraste para reordenar. Use “Ativa” para ligar/desligar seções. (Estrutura controlada)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin">Voltar</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir preview
            </a>
          </Button>
          <Button onClick={saveDraft} disabled={saving || !dirty}>
            {saving ? "Aguarde…" : "Salvar rascunho"}
          </Button>
          <Button variant="secondary" onClick={publish} disabled={saving}>
            {saving ? "Publicando…" : "Publicar"}
          </Button>
        </div>
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {draft.sections.map((section) => {
              if (section.type === "hero") {
                const c = section.content as HeroContent;
                return (
                  <SortableShell
                    key={section.id}
                    id={section.id}
                    title="Hero"
                    enabled={section.enabled}
                    onEnabledChange={(next) => updateSection(section.id, { enabled: next })}
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Tagline</Label>
                        <Input value={c.tagline ?? ""} onChange={(e) => updateSectionContent<HeroContent>(section.id, { tagline: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Título (H1)</Label>
                        <Input value={c.heading ?? ""} onChange={(e) => updateSectionContent<HeroContent>(section.id, { heading: e.target.value })} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Descrição</Label>
                        <Textarea value={c.description ?? ""} onChange={(e) => updateSectionContent<HeroContent>(section.id, { description: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>CTA principal (texto)</Label>
                        <Input value={c.primaryCtaText ?? ""} onChange={(e) => updateSectionContent<HeroContent>(section.id, { primaryCtaText: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>CTA principal (link)</Label>
                        <Input value={c.primaryCtaHref ?? ""} onChange={(e) => updateSectionContent<HeroContent>(section.id, { primaryCtaHref: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>CTA secundário (texto)</Label>
                        <Input value={c.secondaryCtaText ?? ""} onChange={(e) => updateSectionContent<HeroContent>(section.id, { secondaryCtaText: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>CTA secundário (link)</Label>
                        <Input value={c.secondaryCtaHref ?? ""} onChange={(e) => updateSectionContent<HeroContent>(section.id, { secondaryCtaHref: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Legenda (título)</Label>
                        <Input value={c.heroCaptionTitle ?? ""} onChange={(e) => updateSectionContent<HeroContent>(section.id, { heroCaptionTitle: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Legenda (texto)</Label>
                        <Textarea value={c.heroCaptionText ?? ""} onChange={(e) => updateSectionContent<HeroContent>(section.id, { heroCaptionText: e.target.value })} />
                      </div>
                    </div>
                  </SortableShell>
                );
              }

              if (section.type === "benefits") {
                const c = section.content as BenefitsContent;
                const items = (c.items ?? []).slice(0, 3);
                while (items.length < 3) items.push({});
                return (
                  <SortableShell
                    key={section.id}
                    id={section.id}
                    title="Benefits"
                    enabled={section.enabled}
                    onEnabledChange={(next) => updateSection(section.id, { enabled: next })}
                  >
                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Título</Label>
                          <Input value={c.heading ?? ""} onChange={(e) => updateSectionContent<BenefitsContent>(section.id, { heading: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Subtítulo</Label>
                          <Input value={c.description ?? ""} onChange={(e) => updateSectionContent<BenefitsContent>(section.id, { description: e.target.value })} />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        {items.map((it, idx) => (
                          <Card key={idx} className="p-4">
                            <div className="space-y-2">
                              <Label>Card {idx + 1} — Título</Label>
                              <Input
                                value={it.title ?? ""}
                                onChange={(e) => {
                                  const next = items.map((x) => ({ ...x }));
                                  next[idx].title = e.target.value;
                                  updateSectionContent<BenefitsContent>(section.id, { items: next });
                                }}
                              />
                            </div>
                            <div className="mt-3 space-y-2">
                              <Label>Card {idx + 1} — Texto</Label>
                              <Textarea
                                value={it.text ?? ""}
                                onChange={(e) => {
                                  const next = items.map((x) => ({ ...x }));
                                  next[idx].text = e.target.value;
                                  updateSectionContent<BenefitsContent>(section.id, { items: next });
                                }}
                              />
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </SortableShell>
                );
              }

              if (section.type === "programs_highlights") {
                const c = section.content as ProgramsHighlightsContent;
                const items = (c.items ?? []).slice(0, 3);
                while (items.length < 3) items.push({});
                return (
                  <SortableShell
                    key={section.id}
                    id={section.id}
                    title="Programs highlights"
                    enabled={section.enabled}
                    onEnabledChange={(next) => updateSection(section.id, { enabled: next })}
                  >
                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Título</Label>
                          <Input value={c.heading ?? ""} onChange={(e) => updateSectionContent<ProgramsHighlightsContent>(section.id, { heading: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Subtítulo</Label>
                          <Input value={c.description ?? ""} onChange={(e) => updateSectionContent<ProgramsHighlightsContent>(section.id, { description: e.target.value })} />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        {items.map((it, idx) => (
                          <Card key={idx} className="p-4">
                            <div className="space-y-2">
                              <Label>Card {idx + 1} — Título</Label>
                              <Input
                                value={it.title ?? ""}
                                onChange={(e) => {
                                  const next = items.map((x) => ({ ...x }));
                                  next[idx].title = e.target.value;
                                  updateSectionContent<ProgramsHighlightsContent>(section.id, { items: next });
                                }}
                              />
                            </div>
                            <div className="mt-3 space-y-2">
                              <Label>Idade/Label</Label>
                              <Input
                                value={it.ages ?? ""}
                                onChange={(e) => {
                                  const next = items.map((x) => ({ ...x }));
                                  next[idx].ages = e.target.value;
                                  updateSectionContent<ProgramsHighlightsContent>(section.id, { items: next });
                                }}
                              />
                            </div>
                            <div className="mt-3 space-y-2">
                              <Label>Descrição</Label>
                              <Textarea
                                value={it.description ?? ""}
                                onChange={(e) => {
                                  const next = items.map((x) => ({ ...x }));
                                  next[idx].description = e.target.value;
                                  updateSectionContent<ProgramsHighlightsContent>(section.id, { items: next });
                                }}
                              />
                            </div>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Meta (esquerda)</Label>
                                <Input
                                  value={it.metaLeft ?? ""}
                                  onChange={(e) => {
                                    const next = items.map((x) => ({ ...x }));
                                    next[idx].metaLeft = e.target.value;
                                    updateSectionContent<ProgramsHighlightsContent>(section.id, { items: next });
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Link (texto)</Label>
                                <Input
                                  value={it.linkText ?? ""}
                                  onChange={(e) => {
                                    const next = items.map((x) => ({ ...x }));
                                    next[idx].linkText = e.target.value;
                                    updateSectionContent<ProgramsHighlightsContent>(section.id, { items: next });
                                  }}
                                />
                              </div>
                            </div>
                            <div className="mt-3 space-y-2">
                              <Label>Link (href)</Label>
                              <Input
                                value={it.linkHref ?? ""}
                                onChange={(e) => {
                                  const next = items.map((x) => ({ ...x }));
                                  next[idx].linkHref = e.target.value;
                                  updateSectionContent<ProgramsHighlightsContent>(section.id, { items: next });
                                }}
                              />
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </SortableShell>
                );
              }

              // testimonials
              const c = section.content as TestimonialsContent;
              const items = (c.items ?? []).slice(0, 3);
              while (items.length < 3) items.push({});
              return (
                <SortableShell
                  key={section.id}
                  id={section.id}
                  title="Testimonials"
                  enabled={section.enabled}
                  onEnabledChange={(next) => updateSection(section.id, { enabled: next })}
                >
                  <div className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Título</Label>
                        <Input value={c.heading ?? ""} onChange={(e) => updateSectionContent<TestimonialsContent>(section.id, { heading: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Subtítulo</Label>
                        <Input value={c.description ?? ""} onChange={(e) => updateSectionContent<TestimonialsContent>(section.id, { description: e.target.value })} />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      {items.map((it, idx) => (
                        <Card key={idx} className="p-4">
                          <div className="space-y-2">
                            <Label>Depoimento {idx + 1} — Frase</Label>
                            <Textarea
                              value={it.quote ?? ""}
                              onChange={(e) => {
                                const next = items.map((x) => ({ ...x }));
                                next[idx].quote = e.target.value;
                                updateSectionContent<TestimonialsContent>(section.id, { items: next });
                              }}
                            />
                          </div>
                          <div className="mt-3 space-y-2">
                            <Label>Autor</Label>
                            <Input
                              value={it.author ?? ""}
                              onChange={(e) => {
                                const next = items.map((x) => ({ ...x }));
                                next[idx].author = e.target.value;
                                updateSectionContent<TestimonialsContent>(section.id, { items: next });
                              }}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </SortableShell>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <Card className="p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Dica: depois de publicar, recarregue a Home para ver o resultado.
          </div>
          <Button variant="outline" asChild>
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir Home
            </a>
          </Button>
        </div>
      </Card>
    </div>
  );
}
