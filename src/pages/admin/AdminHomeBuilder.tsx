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
import { GripVertical, ExternalLink, Plus, Copy, Trash2 } from "lucide-react";

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

type HomeSectionType =
  | "hero"
  | "benefits"
  | "programs_highlights"
  | "testimonials"
  | "trial_form"
  | "gallery"
  | "faq"
  | "cta_final";

type Toggleable = { id: string; enabled: boolean };

type HeroCta = Toggleable & {
  label?: string;
  href?: string;
  variant?: "default" | "outline";
};

type HeroContent = {
  tagline?: string;
  heading?: string;
  description?: string;
  // legado (mantido por compatibilidade)
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  // novo (granular)
  ctas?: HeroCta[];
  heroCaptionTitle?: string;
  heroCaptionText?: string;
};

type BenefitItem = Toggleable & { title?: string; text?: string };
type BenefitsContent = { heading?: string; description?: string; items?: BenefitItem[] };

type ProgramItem = Toggleable & {
  title?: string;
  ages?: string;
  description?: string;
  metaLeft?: string;
  linkText?: string;
  linkHref?: string;
};
type ProgramsHighlightsContent = { heading?: string; description?: string; items?: ProgramItem[] };

type TestimonialItem = Toggleable & { quote?: string; author?: string };
type TestimonialsContent = { heading?: string; description?: string; items?: TestimonialItem[] };

type TrialFormContent = {
  heading?: string;
  description?: string;
  cardTitle?: string;
  cardDescription?: string;
};

type GalleryItem = Toggleable & { src?: string; alt?: string };
type GalleryContent = { heading?: string; description?: string; items?: GalleryItem[] };

type FaqItem = Toggleable & { question?: string; answer?: string };
type FaqContent = { heading?: string; description?: string; items?: FaqItem[] };

type FinalCtaContent = { heading?: string; description?: string; ctas?: HeroCta[] };

type HomeSection = {
  id: string;
  type: HomeSectionType;
  enabled: boolean;
  content:
  | HeroContent
  | BenefitsContent
  | ProgramsHighlightsContent
  | TestimonialsContent
  | TrialFormContent
  | GalleryContent
  | FaqContent
  | FinalCtaContent;
};

type HomeBuilderDraft = {
  version: 1;
  sections: HomeSection[];
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

const asString = (v: unknown) => (typeof v === "string" ? v : undefined);

const toBool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);

const ensureArray = <T,>(v: unknown, fallback: T[]) => (Array.isArray(v) ? (v as T[]) : fallback);

const makeId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
};

const ensureToggleableArray = <T extends Toggleable>(
  items: (T | Partial<T>)[] | undefined,
  factory: () => T,
) => {
  const arr = (items ?? []).map((it) => {
    const id = typeof (it as any).id === "string" && (it as any).id ? (it as any).id : makeId();
    const enabled = typeof (it as any).enabled === "boolean" ? (it as any).enabled : true;
    return { ...(factory() as any), ...(it as any), id, enabled } as T;
  });
  return arr;
};

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
        ctas: [
          {
            id: "cta_primary",
            enabled: true,
            label: "Contact Us",
            href: "#trial-form",
            variant: "default",
          },
          {
            id: "cta_secondary",
            enabled: true,
            label: "View Programs",
            href: "/programs",
            variant: "outline",
          },
        ],
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
            id: "benefit_1",
            enabled: true,
            title: "Professional Brazilian Coaching",
            text: "Sessions led by licensed coaches with experience in Brazilian methodology, adapted to U.S. youth soccer reality.",
          },
          {
            id: "benefit_2",
            enabled: true,
            title: "Small Groups, Big Results",
            text: "Limited players per session so every child gets real touches on the ball and specific feedback.",
          },
          {
            id: "benefit_3",
            enabled: true,
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
            id: "program_1",
            enabled: true,
            title: "Energy Boost Break",
            ages: "All ages",
            description: "We offer snacks and plenty of hydration during the practice break.",
            metaLeft: "2x per week",
            linkText: "Learn more",
            linkHref: "/programs",
          },
          {
            id: "program_2",
            enabled: true,
            title: "Where Energy Meets Fun",
            ages: "All ages",
            description: "High-energy, fun-filled practices that keep our mini champions happy and engaged.",
            metaLeft: "Schedule now",
            linkText: "View dates",
            linkHref: "/programs",
          },
          {
            id: "program_3",
            enabled: true,
            title: "Private Training",
            ages: "All ages",
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
            id: "testimonial_1",
            enabled: true,
            quote: "We love the practices! Our kids come home excited and talking about what they learned. Our 4-year-old son loves every practice.",
            author: "Parent of U6 player",
          },
          {
            id: "testimonial_2",
            enabled: true,
            quote: "Is amazing to see her having fun while improving her soccer skills. Our 5-year-old daughter loves every practice, and we really appreciate the care and attention from the coaches.",
            author: "Parent of U8 player",
          },
          {
            id: "testimonial_3",
            enabled: true,
            quote: "The coach’s dedication and care make all the difference. Our 3-year-old son has so much fun and learns a lot at every practice! Thank you, Coach Patrick, for your dedication and love for what you do!",
            author: "Parent of U4 player",
          },
        ],
      } satisfies TestimonialsContent,
    },
    {
      id: "trial_form",
      type: "trial_form",
      enabled: true,
      content: {
        heading: "Ready to See Your Player Train the Brazilian Way?",
        description:
          "Book now session and let your child experience the difference in intensity, attention, and joy for the game.",
        cardTitle: "Quick Request",
        cardDescription:
          "Share a few details and we'll contact you with available dates and the best program for your player.",
      } satisfies TrialFormContent,
    },
    {
      id: "gallery",
      type: "gallery",
      enabled: true,
      content: {
        heading: "Gallery",
        description: "A few moments from our training sessions.",
        items: [
          { id: "gallery_1", enabled: true, src: "", alt: "Kids training with a soccer ball" },
          { id: "gallery_2", enabled: true, src: "", alt: "Youth soccer training moment" },
          { id: "gallery_3", enabled: true, src: "", alt: "Young players smiling after training" },
        ],
      } satisfies GalleryContent,
    },
    {
      id: "faq",
      type: "faq",
      enabled: true,
      content: {
        heading: "FAQ",
        description: "Quick answers to common questions.",
        items: [
          {
            id: "faq_1",
            enabled: true,
            question: "Do we need previous experience?",
            answer: "No — we group players by level and focus on individual development.",
          },
          {
            id: "faq_2",
            enabled: true,
            question: "Where do sessions happen?",
            answer: "We share the location and schedule after your request, based on your area and program.",
          },
        ],
      } satisfies FaqContent,
    },
    {
      id: "cta_final",
      type: "cta_final",
      enabled: true,
      content: {
        heading: "Let’s get your player on the field.",
        description: "Send a quick request and we’ll reply with the best next step.",
        ctas: [
          { id: "final_cta_1", enabled: true, label: "Book Now", href: "#trial-form", variant: "default" },
          { id: "final_cta_2", enabled: true, label: "View Programs", href: "/programs", variant: "outline" },
        ],
      } satisfies FinalCtaContent,
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

      // normaliza arrays toggleáveis (mantém compatibilidade com drafts antigos)
      if (type === "hero") {
        const hero = (content ?? {}) as HeroContent;
        const legacyPrimaryText = asString((hero as any).primaryCtaText) ?? "Book Now";
        const legacyPrimaryHref = asString((hero as any).primaryCtaHref) ?? "#trial-form";
        const legacySecondaryText = asString((hero as any).secondaryCtaText) ?? "View Programs";
        const legacySecondaryHref = asString((hero as any).secondaryCtaHref) ?? "/programs";

        const maybeCtas = Array.isArray((hero as any).ctas) ? ((hero as any).ctas as any[]) : undefined;
        const ctas = ensureToggleableArray<HeroCta>(
          maybeCtas,
          () => ({ id: makeId(), enabled: true, label: "", href: "", variant: "default" }),
        );
        if (!ctas.length) {
          ctas.push(
            { id: "cta_primary", enabled: true, label: legacyPrimaryText, href: legacyPrimaryHref, variant: "default" },
            { id: "cta_secondary", enabled: true, label: legacySecondaryText, href: legacySecondaryHref, variant: "outline" },
          );
        }
        (content as any).ctas = ctas;
      }

      if (type === "benefits") {
        const b = (content ?? {}) as BenefitsContent;
        (content as any).items = ensureToggleableArray<BenefitItem>(
          Array.isArray((b as any).items) ? ((b as any).items as any[]) : undefined,
          () => ({ id: makeId(), enabled: true, title: "", text: "" }),
        );
      }

      if (type === "programs_highlights") {
        const p = (content ?? {}) as ProgramsHighlightsContent;
        (content as any).items = ensureToggleableArray<ProgramItem>(
          Array.isArray((p as any).items) ? ((p as any).items as any[]) : undefined,
          () => ({ id: makeId(), enabled: true, title: "", ages: "", description: "", metaLeft: "", linkText: "", linkHref: "" }),
        );
      }

      if (type === "testimonials") {
        const t = (content ?? {}) as TestimonialsContent;
        (content as any).items = ensureToggleableArray<TestimonialItem>(
          Array.isArray((t as any).items) ? ((t as any).items as any[]) : undefined,
          () => ({ id: makeId(), enabled: true, quote: "", author: "" }),
        );
      }

      if (type === "gallery") {
        const g = (content ?? {}) as GalleryContent;
        (content as any).items = ensureToggleableArray<GalleryItem>(
          Array.isArray((g as any).items) ? ((g as any).items as any[]) : undefined,
          () => ({ id: makeId(), enabled: true, src: "", alt: "" }),
        );
      }

      if (type === "faq") {
        const f = (content ?? {}) as FaqContent;
        (content as any).items = ensureToggleableArray<FaqItem>(
          Array.isArray((f as any).items) ? ((f as any).items as any[]) : undefined,
          () => ({ id: makeId(), enabled: true, question: "", answer: "" }),
        );
      }

      if (type === "cta_final") {
        const fc = (content ?? {}) as FinalCtaContent;
        (content as any).ctas = ensureToggleableArray<HeroCta>(
          Array.isArray((fc as any).ctas) ? ((fc as any).ctas as any[]) : undefined,
          () => ({ id: makeId(), enabled: true, label: "", href: "", variant: "default" }),
        );
      }

      return { id, type, enabled, content };
    })
    .filter(Boolean) as HomeSection[];

  if (!sections.length) return defaultDraft();
  // garante presença das seções controladas (caso o draft antigo não tenha)
  const required: Array<{ id: string; type: HomeSectionType; content: any }> = [
    { id: "trial_form", type: "trial_form", content: defaultDraft().sections.find((s) => s.id === "trial_form")!.content },
    { id: "gallery", type: "gallery", content: defaultDraft().sections.find((s) => s.id === "gallery")!.content },
    { id: "faq", type: "faq", content: defaultDraft().sections.find((s) => s.id === "faq")!.content },
    { id: "cta_final", type: "cta_final", content: defaultDraft().sections.find((s) => s.id === "cta_final")!.content },
  ];
  const existingIds = new Set(sections.map((s) => s.id));
  const withRequired = [...sections];
  for (const r of required) {
    if (!existingIds.has(r.id)) {
      withRequired.push({ id: r.id, type: r.type, enabled: true, content: r.content } as HomeSection);
    }
  }
  return { version: 1, sections: withRequired };
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

  function setListItem<T extends { id: string }>(
    sectionId: string,
    key: "items" | "ctas",
    itemId: string,
    patch: Partial<T>,
  ) {
    setDraft((prev) => {
      const nextSections = prev.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const content = { ...(s.content as any) };
        const list = Array.isArray(content[key]) ? [...content[key]] : [];
        content[key] = list.map((it: any) => (it?.id === itemId ? { ...it, ...(patch as any) } : it));
        return { ...s, content };
      });
      return { ...prev, sections: nextSections };
    });
    setDirty(true);
  }

  function addListItem<T>(sectionId: string, key: "items" | "ctas", newItem: T) {
    setDraft((prev) => {
      const nextSections = prev.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const content = { ...(s.content as any) };
        const list = Array.isArray(content[key]) ? [...content[key]] : [];
        content[key] = [...list, newItem];
        return { ...s, content };
      });
      return { ...prev, sections: nextSections };
    });
    setDirty(true);
  }

  function removeListItem(sectionId: string, key: "items" | "ctas", itemId: string) {
    setDraft((prev) => {
      const nextSections = prev.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const content = { ...(s.content as any) };
        const list = Array.isArray(content[key]) ? [...content[key]] : [];
        content[key] = list.filter((it: any) => it?.id !== itemId);
        return { ...s, content };
      });
      return { ...prev, sections: nextSections };
    });
    setDirty(true);
  }

  function duplicateListItem<T extends { id: string }>(sectionId: string, key: "items" | "ctas", itemId: string) {
    setDraft((prev) => {
      const nextSections = prev.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const content = { ...(s.content as any) };
        const list = Array.isArray(content[key]) ? [...content[key]] : [];
        const idx = list.findIndex((it: any) => it?.id === itemId);
        if (idx === -1) return s;
        const clone = { ...list[idx], id: makeId() } as T;
        content[key] = [...list.slice(0, idx + 1), clone, ...list.slice(idx + 1)];
        return { ...s, content };
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
                const ctas = ensureToggleableArray<HeroCta>(c.ctas, () => ({ id: makeId(), enabled: true, label: "", href: "", variant: "default" }));
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
                        <div className="flex items-center justify-between gap-3">
                          <Label>CTAs</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              addListItem<HeroCta>(section.id, "ctas", {
                                id: makeId(),
                                enabled: true,
                                label: "New button",
                                href: "#",
                                variant: "default",
                              })
                            }
                          >
                            <Plus className="h-4 w-4" />
                            Adicionar CTA
                          </Button>
                        </div>
                      </div>

                      <div className="md:col-span-2 grid gap-3">
                        {ctas.map((cta, idx) => (
                          <Card key={cta.id} className="p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                              <div>
                                <div className="text-sm font-semibold">Botão {idx + 1}</div>
                                <div className="text-xs text-muted-foreground">ID: {cta.id}</div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Ativo</span>
                                  <Switch
                                    checked={cta.enabled}
                                    onCheckedChange={(next) =>
                                      setListItem<HeroCta>(section.id, "ctas", cta.id, { enabled: next })
                                    }
                                  />
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={() => duplicateListItem(section.id, "ctas", cta.id)}>
                                  <Copy className="h-4 w-4" />
                                  Duplicar
                                </Button>
                                <Button type="button" variant="destructive" size="sm" onClick={() => removeListItem(section.id, "ctas", cta.id)}>
                                  <Trash2 className="h-4 w-4" />
                                  Excluir
                                </Button>
                              </div>
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-3">
                              <div className="space-y-2">
                                <Label>Texto</Label>
                                <Input
                                  value={cta.label ?? ""}
                                  onChange={(e) => setListItem<HeroCta>(section.id, "ctas", cta.id, { label: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label>Link (href)</Label>
                                <Input
                                  value={cta.href ?? ""}
                                  onChange={(e) => setListItem<HeroCta>(section.id, "ctas", cta.id, { href: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Estilo</Label>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant={cta.variant === "outline" ? "outline" : "default"}
                                    size="sm"
                                    onClick={() => setListItem<HeroCta>(section.id, "ctas", cta.id, { variant: "default" })}
                                  >
                                    Primário
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={cta.variant === "outline" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setListItem<HeroCta>(section.id, "ctas", cta.id, { variant: "outline" })}
                                  >
                                    Outline
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
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
                const items = ensureToggleableArray<BenefitItem>(c.items, () => ({ id: makeId(), enabled: true, title: "", text: "" }));
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

                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold">Cards</div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            addListItem<BenefitItem>(section.id, "items", {
                              id: makeId(),
                              enabled: true,
                              title: "New benefit",
                              text: "",
                            })
                          }
                        >
                          <Plus className="h-4 w-4" />
                          Adicionar card
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        {items.map((it, idx) => (
                          <Card key={it.id} className="p-4">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-semibold">Card {idx + 1}</div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Ativo</span>
                                <Switch checked={it.enabled} onCheckedChange={(next) => setListItem<BenefitItem>(section.id, "items", it.id, { enabled: next })} />
                              </div>
                            </div>

                            <div className="mt-3 space-y-2">
                              <Label>Título</Label>
                              <Input value={it.title ?? ""} onChange={(e) => setListItem<BenefitItem>(section.id, "items", it.id, { title: e.target.value })} />
                            </div>
                            <div className="mt-3 space-y-2">
                              <Label>Texto</Label>
                              <Textarea value={it.text ?? ""} onChange={(e) => setListItem<BenefitItem>(section.id, "items", it.id, { text: e.target.value })} />
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button type="button" variant="outline" size="sm" onClick={() => duplicateListItem(section.id, "items", it.id)}>
                                <Copy className="h-4 w-4" />
                                Duplicar
                              </Button>
                              <Button type="button" variant="destructive" size="sm" onClick={() => removeListItem(section.id, "items", it.id)}>
                                <Trash2 className="h-4 w-4" />
                                Excluir
                              </Button>
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
                const items = ensureToggleableArray<ProgramItem>(c.items, () => ({ id: makeId(), enabled: true, title: "", ages: "", description: "", metaLeft: "", linkText: "", linkHref: "" }));
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

                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold">Cards</div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            addListItem<ProgramItem>(section.id, "items", {
                              id: makeId(),
                              enabled: true,
                              title: "New program",
                              ages: "",
                              description: "",
                              metaLeft: "",
                              linkText: "Learn more",
                              linkHref: "/programs",
                            })
                          }
                        >
                          <Plus className="h-4 w-4" />
                          Adicionar card
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        {items.map((it, idx) => (
                          <Card key={it.id} className="p-4">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-semibold">Card {idx + 1}</div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Ativo</span>
                                <Switch checked={it.enabled} onCheckedChange={(next) => setListItem<ProgramItem>(section.id, "items", it.id, { enabled: next })} />
                              </div>
                            </div>

                            <div className="mt-3 space-y-2">
                              <Label>Título</Label>
                              <Input value={it.title ?? ""} onChange={(e) => setListItem<ProgramItem>(section.id, "items", it.id, { title: e.target.value })} />
                            </div>
                            <div className="mt-3 space-y-2">
                              <Label>Idade/Label</Label>
                              <Input value={it.ages ?? ""} onChange={(e) => setListItem<ProgramItem>(section.id, "items", it.id, { ages: e.target.value })} />
                            </div>
                            <div className="mt-3 space-y-2">
                              <Label>Descrição</Label>
                              <Textarea value={it.description ?? ""} onChange={(e) => setListItem<ProgramItem>(section.id, "items", it.id, { description: e.target.value })} />
                            </div>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Meta (esquerda)</Label>
                                <Input value={it.metaLeft ?? ""} onChange={(e) => setListItem<ProgramItem>(section.id, "items", it.id, { metaLeft: e.target.value })} />
                              </div>
                              <div className="space-y-2">
                                <Label>Link (texto)</Label>
                                <Input value={it.linkText ?? ""} onChange={(e) => setListItem<ProgramItem>(section.id, "items", it.id, { linkText: e.target.value })} />
                              </div>
                            </div>
                            <div className="mt-3 space-y-2">
                              <Label>Link (href)</Label>
                              <Input value={it.linkHref ?? ""} onChange={(e) => setListItem<ProgramItem>(section.id, "items", it.id, { linkHref: e.target.value })} />
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button type="button" variant="outline" size="sm" onClick={() => duplicateListItem(section.id, "items", it.id)}>
                                <Copy className="h-4 w-4" />
                                Duplicar
                              </Button>
                              <Button type="button" variant="destructive" size="sm" onClick={() => removeListItem(section.id, "items", it.id)}>
                                <Trash2 className="h-4 w-4" />
                                Excluir
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </SortableShell>
                );
              }

              if (section.type === "trial_form") {
                const c = section.content as TrialFormContent;
                return (
                  <SortableShell
                    key={section.id}
                    id={section.id}
                    title="Formulário (Home)"
                    enabled={section.enabled}
                    onEnabledChange={(next) => updateSection(section.id, { enabled: next })}
                  >
                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Título</Label>
                          <Input
                            value={c.heading ?? ""}
                            onChange={(e) => updateSectionContent<TrialFormContent>(section.id, { heading: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Subtítulo</Label>
                          <Input
                            value={c.description ?? ""}
                            onChange={(e) => updateSectionContent<TrialFormContent>(section.id, { description: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Título do card</Label>
                          <Input
                            value={c.cardTitle ?? ""}
                            onChange={(e) => updateSectionContent<TrialFormContent>(section.id, { cardTitle: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Texto do card</Label>
                          <Input
                            value={c.cardDescription ?? ""}
                            onChange={(e) => updateSectionContent<TrialFormContent>(section.id, { cardDescription: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        Obs.: este bloco usa o mesmo formulário já existente no site (não altera campos).
                      </div>
                    </div>
                  </SortableShell>
                );
              }

              if (section.type === "gallery") {
                const c = section.content as GalleryContent;
                const items = ensureToggleableArray<GalleryItem>(c.items, () => ({ id: makeId(), enabled: true, src: "", alt: "" }));
                return (
                  <SortableShell
                    key={section.id}
                    id={section.id}
                    title="Galeria/Imagens"
                    enabled={section.enabled}
                    onEnabledChange={(next) => updateSection(section.id, { enabled: next })}
                  >
                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Título</Label>
                          <Input value={c.heading ?? ""} onChange={(e) => updateSectionContent<GalleryContent>(section.id, { heading: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Subtítulo</Label>
                          <Input
                            value={c.description ?? ""}
                            onChange={(e) => updateSectionContent<GalleryContent>(section.id, { description: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold">Imagens</div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            addListItem<GalleryItem>(section.id, "items", {
                              id: makeId(),
                              enabled: true,
                              src: "",
                              alt: "",
                            })
                          }
                        >
                          <Plus className="h-4 w-4" />
                          Adicionar imagem
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        {items.map((it, idx) => (
                          <Card key={it.id} className="p-4">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-semibold">Imagem {idx + 1}</div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Ativa</span>
                                <Switch
                                  checked={it.enabled}
                                  onCheckedChange={(next) => setListItem<GalleryItem>(section.id, "items", it.id, { enabled: next })}
                                />
                              </div>
                            </div>
                            <div className="mt-3 space-y-2">
                              <Label>Src (URL ou caminho)</Label>
                              <Input
                                value={it.src ?? ""}
                                onChange={(e) => setListItem<GalleryItem>(section.id, "items", it.id, { src: e.target.value })}
                              />
                            </div>
                            <div className="mt-3 space-y-2">
                              <Label>Alt</Label>
                              <Input
                                value={it.alt ?? ""}
                                onChange={(e) => setListItem<GalleryItem>(section.id, "items", it.id, { alt: e.target.value })}
                              />
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button type="button" variant="outline" size="sm" onClick={() => duplicateListItem(section.id, "items", it.id)}>
                                <Copy className="h-4 w-4" />
                                Duplicar
                              </Button>
                              <Button type="button" variant="destructive" size="sm" onClick={() => removeListItem(section.id, "items", it.id)}>
                                <Trash2 className="h-4 w-4" />
                                Excluir
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </SortableShell>
                );
              }

              if (section.type === "faq") {
                const c = section.content as FaqContent;
                const items = ensureToggleableArray<FaqItem>(c.items, () => ({ id: makeId(), enabled: true, question: "", answer: "" }));
                return (
                  <SortableShell
                    key={section.id}
                    id={section.id}
                    title="FAQ"
                    enabled={section.enabled}
                    onEnabledChange={(next) => updateSection(section.id, { enabled: next })}
                  >
                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Título</Label>
                          <Input value={c.heading ?? ""} onChange={(e) => updateSectionContent<FaqContent>(section.id, { heading: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Subtítulo</Label>
                          <Input
                            value={c.description ?? ""}
                            onChange={(e) => updateSectionContent<FaqContent>(section.id, { description: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold">Perguntas</div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            addListItem<FaqItem>(section.id, "items", {
                              id: makeId(),
                              enabled: true,
                              question: "New question",
                              answer: "",
                            })
                          }
                        >
                          <Plus className="h-4 w-4" />
                          Adicionar
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        {items.map((it, idx) => (
                          <Card key={it.id} className="p-4">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-semibold">Item {idx + 1}</div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Ativo</span>
                                <Switch
                                  checked={it.enabled}
                                  onCheckedChange={(next) => setListItem<FaqItem>(section.id, "items", it.id, { enabled: next })}
                                />
                              </div>
                            </div>

                            <div className="mt-3 space-y-2">
                              <Label>Pergunta</Label>
                              <Input
                                value={it.question ?? ""}
                                onChange={(e) => setListItem<FaqItem>(section.id, "items", it.id, { question: e.target.value })}
                              />
                            </div>
                            <div className="mt-3 space-y-2">
                              <Label>Resposta</Label>
                              <Textarea
                                value={it.answer ?? ""}
                                onChange={(e) => setListItem<FaqItem>(section.id, "items", it.id, { answer: e.target.value })}
                              />
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button type="button" variant="outline" size="sm" onClick={() => duplicateListItem(section.id, "items", it.id)}>
                                <Copy className="h-4 w-4" />
                                Duplicar
                              </Button>
                              <Button type="button" variant="destructive" size="sm" onClick={() => removeListItem(section.id, "items", it.id)}>
                                <Trash2 className="h-4 w-4" />
                                Excluir
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </SortableShell>
                );
              }

              if (section.type === "cta_final") {
                const c = section.content as FinalCtaContent;
                const ctas = ensureToggleableArray<HeroCta>(c.ctas, () => ({ id: makeId(), enabled: true, label: "", href: "", variant: "default" }));
                return (
                  <SortableShell
                    key={section.id}
                    id={section.id}
                    title="CTA final"
                    enabled={section.enabled}
                    onEnabledChange={(next) => updateSection(section.id, { enabled: next })}
                  >
                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Título</Label>
                          <Input
                            value={c.heading ?? ""}
                            onChange={(e) => updateSectionContent<FinalCtaContent>(section.id, { heading: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Subtítulo</Label>
                          <Input
                            value={c.description ?? ""}
                            onChange={(e) => updateSectionContent<FinalCtaContent>(section.id, { description: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold">Botões</div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            addListItem<HeroCta>(section.id, "ctas", {
                              id: makeId(),
                              enabled: true,
                              label: "New button",
                              href: "#",
                              variant: "default",
                            })
                          }
                        >
                          <Plus className="h-4 w-4" />
                          Adicionar CTA
                        </Button>
                      </div>

                      <div className="grid gap-3">
                        {ctas.map((cta, idx) => (
                          <Card key={cta.id} className="p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                              <div>
                                <div className="text-sm font-semibold">Botão {idx + 1}</div>
                                <div className="text-xs text-muted-foreground">ID: {cta.id}</div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Ativo</span>
                                  <Switch
                                    checked={cta.enabled}
                                    onCheckedChange={(next) => setListItem<HeroCta>(section.id, "ctas", cta.id, { enabled: next })}
                                  />
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={() => duplicateListItem(section.id, "ctas", cta.id)}>
                                  <Copy className="h-4 w-4" />
                                  Duplicar
                                </Button>
                                <Button type="button" variant="destructive" size="sm" onClick={() => removeListItem(section.id, "ctas", cta.id)}>
                                  <Trash2 className="h-4 w-4" />
                                  Excluir
                                </Button>
                              </div>
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-3">
                              <div className="space-y-2">
                                <Label>Texto</Label>
                                <Input value={cta.label ?? ""} onChange={(e) => setListItem<HeroCta>(section.id, "ctas", cta.id, { label: e.target.value })} />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label>Link (href)</Label>
                                <Input value={cta.href ?? ""} onChange={(e) => setListItem<HeroCta>(section.id, "ctas", cta.id, { href: e.target.value })} />
                              </div>
                              <div className="space-y-2">
                                <Label>Estilo</Label>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant={cta.variant === "outline" ? "outline" : "default"}
                                    size="sm"
                                    onClick={() => setListItem<HeroCta>(section.id, "ctas", cta.id, { variant: "default" })}
                                  >
                                    Primário
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={cta.variant === "outline" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setListItem<HeroCta>(section.id, "ctas", cta.id, { variant: "outline" })}
                                  >
                                    Outline
                                  </Button>
                                </div>
                              </div>
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
              const items = ensureToggleableArray<TestimonialItem>(c.items, () => ({ id: makeId(), enabled: true, quote: "", author: "" }));
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

                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold">Itens</div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          addListItem<TestimonialItem>(section.id, "items", {
                            id: makeId(),
                            enabled: true,
                            quote: "New testimonial",
                            author: "",
                          })
                        }
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      {items.map((it, idx) => (
                        <Card key={it.id} className="p-4">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-semibold">Depoimento {idx + 1}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Ativo</span>
                              <Switch checked={it.enabled} onCheckedChange={(next) => setListItem<TestimonialItem>(section.id, "items", it.id, { enabled: next })} />
                            </div>
                          </div>

                          <div className="mt-3 space-y-2">
                            <Label>Frase</Label>
                            <Textarea value={it.quote ?? ""} onChange={(e) => setListItem<TestimonialItem>(section.id, "items", it.id, { quote: e.target.value })} />
                          </div>
                          <div className="mt-3 space-y-2">
                            <Label>Autor</Label>
                            <Input value={it.author ?? ""} onChange={(e) => setListItem<TestimonialItem>(section.id, "items", it.id, { author: e.target.value })} />
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => duplicateListItem(section.id, "items", it.id)}>
                              <Copy className="h-4 w-4" />
                              Duplicar
                            </Button>
                            <Button type="button" variant="destructive" size="sm" onClick={() => removeListItem(section.id, "items", it.id)}>
                              <Trash2 className="h-4 w-4" />
                              Excluir
                            </Button>
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
