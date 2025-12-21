import { useEffect } from "react";

interface UsePageSEOOptions {
  title: string;
  description: string;
  path?: string;
}

export const usePageSEO = ({ title, description, path }: UsePageSEOOptions) => {
  useEffect(() => {
    if (typeof document === "undefined") return;

    document.title = title;

    const metaDescription = document.querySelector<HTMLMetaElement>("meta[name='description']");
    if (metaDescription) {
      metaDescription.content = description;
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = description;
      document.head.appendChild(meta);
    }

    const canonicalUrl = (() => {
      if (typeof window === "undefined") return undefined;
      const base = window.location.origin;
      const cleanedPath = path ?? window.location.pathname;
      return `${base}${cleanedPath}`;
    })();

    if (canonicalUrl) {
      let link = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonicalUrl;
    }
  }, [title, description, path]);
};
