-- Allow admins to read site_content (draft/published) while keeping it private from the public
DROP POLICY IF EXISTS "Admins read site content" ON public.site_content;
CREATE POLICY "Admins read site content"
ON public.site_content
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));