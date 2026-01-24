-- Public API to read ONLY published site content (bypasses RLS on site_content safely)
CREATE OR REPLACE FUNCTION public.get_site_content_public(_keys text[])
RETURNS TABLE (key text, published jsonb, updated_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sc.key, sc.published, sc.updated_at
  FROM public.site_content sc
  WHERE sc.key = ANY(_keys);
$$;

-- Allow anyone (anon) and logged-in users to call it
GRANT EXECUTE ON FUNCTION public.get_site_content_public(text[]) TO anon;
GRANT EXECUTE ON FUNCTION public.get_site_content_public(text[]) TO authenticated;