/*
  # Rename tables to app_ namespace

  ## Overview
  Renames existing tables to use the `app_` prefix for consistent database namespacing.
  All application tables now follow the `app_*` convention.

  ## Changes
  - Renames `profiles` -> `app_profiles`
  - Renames `todos` -> `app_todos`
  - Updates the `handle_new_user()` trigger function to reference `app_profiles`
  - Recreates updated_at triggers on the renamed tables

  ## Notes
  - This is a non-destructive operation: ALTER TABLE RENAME preserves all data, indexes, and constraints
  - Foreign keys, indexes, and RLS policies are automatically carried over
*/

ALTER TABLE IF EXISTS profiles RENAME TO app_profiles;
ALTER TABLE IF EXISTS todos RENAME TO app_todos;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.app_profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
