-------------------------------------------------------------------------------
-- nSelf Backend - PostgreSQL Initialization
--
-- This script runs automatically when the PostgreSQL container starts for the
-- first time. It creates the required schemas and extensions.
--
-- Hasura Auth and Hasura Storage will create their own tables automatically
-- when they start. This script only sets up the foundation.
--
-- To add your own tables, use Hasura Migrations:
--   cd backend
--   hasura migrate create <migration_name> --database-name default
--   hasura migrate apply --database-name default
--
-- Or create migrations manually in backend/hasura/migrations/default/
-------------------------------------------------------------------------------

-- Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Auth schema (used by hasura-auth)
CREATE SCHEMA IF NOT EXISTS auth;

-- Storage schema (used by hasura-storage)
CREATE SCHEMA IF NOT EXISTS storage;

-- Public schema tables for the application
-- These are examples. Modify or replace them for your app.

-- ---------------------------------------------------------------------------
-- Profiles table (extends auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Todos table (example feature table)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  completed BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Todo Shares table (for sharing todos with specific users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_todo_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  todo_id UUID NOT NULL REFERENCES public.app_todos(id) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL,
  permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'edit')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(todo_id, shared_with_email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_app_todos_user_id ON public.app_todos(user_id);
CREATE INDEX IF NOT EXISTS idx_app_todos_is_public ON public.app_todos(is_public);
CREATE INDEX IF NOT EXISTS idx_app_todo_shares_todo_id ON public.app_todo_shares(todo_id);
CREATE INDEX IF NOT EXISTS idx_app_todo_shares_email ON public.app_todo_shares(shared_with_email);
CREATE INDEX IF NOT EXISTS idx_app_profiles_id ON public.app_profiles(id);

-- ---------------------------------------------------------------------------
-- Auto-create profile on user signup (trigger)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.app_profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.display_name, ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Updated_at trigger function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_app_profiles_updated_at ON public.app_profiles;
CREATE TRIGGER set_app_profiles_updated_at
  BEFORE UPDATE ON public.app_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS set_app_todos_updated_at ON public.app_todos;
CREATE TRIGGER set_app_todos_updated_at
  BEFORE UPDATE ON public.app_todos
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS set_app_todo_shares_updated_at ON public.app_todo_shares;
CREATE TRIGGER set_app_todo_shares_updated_at
  BEFORE UPDATE ON public.app_todo_shares
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
