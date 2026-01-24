import { useEffect, useState } from "react";
import { usePageSEO } from "@/hooks/use-page-seo";
import kidsHuddle from "@/assets/gallery-kids-1.jpg";
import kidsSnacks from "@/assets/gallery-kids-2.jpg";
import kidsGroup from "@/assets/gallery-kids-3.jpg";
import patrickFun from "@/assets/gallery-patrick.jpg";
import galleryUpload1 from "@/assets/gallery-upload-1.jpg";
import galleryUpload2 from "@/assets/gallery-upload-2.jpg";
import galleryUpload3 from "@/assets/gallery-upload-3.jpg";

interface GalleryItem {
  src: string;
  alt: string;
}

const Gallery = () => {
  usePageSEO({
    title: "Gallery | PR Soccer School Training Moments",
    description:
      "See PR Soccer School training sessions, matches, and events that show our Brazilian-inspired youth soccer environment.",
    path: "/gallery",
  });

  const items: GalleryItem[] = [
    {
      src: galleryUpload1,
      alt: "Group photo of youth soccer players and coach on the field",
    },
    {
      src: galleryUpload2,
      alt: "Collage of PR Soccer School training moments",
    },
    {
      src: galleryUpload3,
      alt: "Youth soccer team photo during training session",
    },
    {
      src: kidsHuddle,
      alt: "PR Soccer School kids in a huddle before training",
    },
    {
      src: kidsGroup,
      alt: "Group of young PR Soccer School players posing on the field",
    },
    {
      src: patrickFun,
      alt: "Coach in costume having fun with PR Soccer School kids",
    },
    {
      src: kidsSnacks,
      alt: "PR Soccer School families and kids around a snack table at an event",
    },
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex]);

  const activeItem = activeIndex !== null ? items[activeIndex] : null;

  return (
    <main className="bg-background text-foreground">
      <section className="border-b bg-background">
        <div className="container space-y-4 py-10 md:py-14">
          <header className="space-y-3 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Gallery</p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              A look inside PR Soccer School sessions and events.
            </h1>
            <p className="text-base text-muted-foreground md:text-lg">
              Real moments from training, games, and community events that show our environment and culture.
            </p>
          </header>
        </div>
      </section>

      <section className="bg-muted/40">
        <div className="container py-12 md:py-16">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {items.map((item, index) => (
              <button
                key={item.alt}
                type="button"
                className="group overflow-hidden rounded-2xl border bg-card shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={() => setActiveIndex(index)}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.alt}
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="relative w-full max-w-5xl rounded-3xl border bg-card/95 p-3 shadow-2xl md:p-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-sm font-semibold text-foreground shadow hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onClick={() => setActiveIndex(null)}
              aria-label="Close image"
            >
              ×
            </button>
            <img
              src={activeItem.src}
              alt={activeItem.alt}
              className="max-h-[80vh] w-full rounded-2xl object-contain"
            />
            <p className="mt-3 text-center text-xs text-muted-foreground">{activeItem.alt}</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default Gallery;
