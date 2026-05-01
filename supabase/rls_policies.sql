-- ============================================================================
-- Row Level Security policies for Fluent
-- ----------------------------------------------------------------------------
-- A executer dans : Supabase Dashboard -> SQL Editor -> New query
-- Ce script est idempotent : il peut etre execute plusieurs fois sans erreur.
--
-- Tables protegees :
--   - public.user_progress  : progression d'apprentissage par utilisateur
--   - public.interviews     : historique des simulations d'entretien
--
-- Regle : un utilisateur ne peut lire/modifier que ses propres lignes
--         (auth.uid() = user_id).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. user_progress
-- ----------------------------------------------------------------------------
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_progress_select_own" ON public.user_progress;
CREATE POLICY "user_progress_select_own"
  ON public.user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_progress_insert_own" ON public.user_progress;
CREATE POLICY "user_progress_insert_own"
  ON public.user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_progress_update_own" ON public.user_progress;
CREATE POLICY "user_progress_update_own"
  ON public.user_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_progress_delete_own" ON public.user_progress;
CREATE POLICY "user_progress_delete_own"
  ON public.user_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 2. interviews
-- ----------------------------------------------------------------------------
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "interviews_select_own" ON public.interviews;
CREATE POLICY "interviews_select_own"
  ON public.interviews
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "interviews_insert_own" ON public.interviews;
CREATE POLICY "interviews_insert_own"
  ON public.interviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "interviews_update_own" ON public.interviews;
CREATE POLICY "interviews_update_own"
  ON public.interviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "interviews_delete_own" ON public.interviews;
CREATE POLICY "interviews_delete_own"
  ON public.interviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 3. Verification (a executer apres le script ci-dessus pour confirmer)
-- ----------------------------------------------------------------------------
-- SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname = 'public' AND tablename IN ('user_progress', 'interviews');
--
-- Resultat attendu : rowsecurity = true pour les deux lignes.
--
-- SELECT schemaname, tablename, policyname, cmd
--   FROM pg_policies
--   WHERE schemaname = 'public' AND tablename IN ('user_progress', 'interviews')
--   ORDER BY tablename, cmd;
--
-- Resultat attendu : 4 politiques par table (SELECT, INSERT, UPDATE, DELETE).
