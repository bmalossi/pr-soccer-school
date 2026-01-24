import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type PublishedContentMap = Record<string, { published: unknown; updated_at: string }>; // eslint-disable-line @typescript-eslint/naming-convention

const toContentMap = (
  rows: { key: string; published: unknown; updated_at: string }[]
): PublishedContentMap =>
  rows.reduce<PublishedContentMap>((acc, row) => {
    acc[row.key] = { published: row.published, updated_at: row.updated_at };
    return acc;
  }, {});

export const usePublishedSiteContent = (keys: string[]) => {
  const stableKeys = useMemo(() => [...keys].sort(), [keys]);
  const [data, setData] = useState<PublishedContentMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc("get_site_content_public", {
        _keys: stableKeys,
      });

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setData({});
        setIsLoading(false);
        return;
      }

      setData(toContentMap((data ?? []) as any));
      setIsLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [stableKeys]);

  return { data, isLoading, error };
};
