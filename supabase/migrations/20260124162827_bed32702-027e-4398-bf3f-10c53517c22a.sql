-- 1) Roles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER helper to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Policies for user_roles
DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- 2) Content (draft/published)
CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  draft JSONB NOT NULL DEFAULT '{}'::jsonb,
  published JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- updated_at trigger helper (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_site_content_updated_at'
  ) THEN
    CREATE TRIGGER trg_site_content_updated_at
    BEFORE UPDATE ON public.site_content
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Public view (only published JSON)
DROP VIEW IF EXISTS public.site_content_public;
CREATE VIEW public.site_content_public
WITH (security_invoker=on)
AS
  SELECT key, published, updated_at
  FROM public.site_content;

-- Policies for site_content
-- Deny direct SELECT to everyone; use the view for public reads
DROP POLICY IF EXISTS "No direct reads" ON public.site_content;
CREATE POLICY "No direct reads"
ON public.site_content
FOR SELECT
USING (false);

DROP POLICY IF EXISTS "Admins manage site content" ON public.site_content;
CREATE POLICY "Admins manage site content"
ON public.site_content
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update site content" ON public.site_content;
CREATE POLICY "Admins update site content"
ON public.site_content
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete site content" ON public.site_content;
CREATE POLICY "Admins delete site content"
ON public.site_content
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
