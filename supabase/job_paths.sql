-- ============================================================================
-- Phase 2 - Real Job Coach : table job_paths
-- ----------------------------------------------------------------------------
-- A executer dans : Supabase Dashboard -> SQL Editor -> New query
-- Idempotent : peut etre execute plusieurs fois sans erreur.
--
-- Stocke les parcours d'apprentissage personnalises generes a partir
-- d'un CV + offre d'emploi.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.job_paths (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title       text NOT NULL,
  company_name    text NOT NULL,
  offer_text      text,                 -- texte brut de l'offre colle par l'utilisateur
  cv_summary      jsonb,                -- skills, experiences extraites du CV
  gap_analysis    jsonb,                -- ecarts CV / offre + plan de comblement
  learning_plan   jsonb,                -- parcours 5-7 jours (vocab, grammaire, etc.)
  interview_questions jsonb,            -- questions probables pre-generees
  company_briefing text,                -- 1 paragraphe sur la societe
  progress        jsonb DEFAULT '{}'::jsonb, -- avancement utilisateur
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS job_paths_user_id_idx
  ON public.job_paths (user_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- Trigger pour updated_at
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS job_paths_set_updated_at ON public.job_paths;
CREATE TRIGGER job_paths_set_updated_at
  BEFORE UPDATE ON public.job_paths
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
ALTER TABLE public.job_paths ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "job_paths_select_own" ON public.job_paths;
CREATE POLICY "job_paths_select_own"
  ON public.job_paths
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "job_paths_insert_own" ON public.job_paths;
CREATE POLICY "job_paths_insert_own"
  ON public.job_paths
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "job_paths_update_own" ON public.job_paths;
CREATE POLICY "job_paths_update_own"
  ON public.job_paths
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "job_paths_delete_own" ON public.job_paths;
CREATE POLICY "job_paths_delete_own"
  ON public.job_paths
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Verification
-- ----------------------------------------------------------------------------
-- SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname = 'public' AND tablename = 'job_paths';
--
-- SELECT policyname, cmd FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'job_paths'
--   ORDER BY cmd;
