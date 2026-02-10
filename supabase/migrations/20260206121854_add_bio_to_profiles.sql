/*
  # Add bio field to profiles table

  ## Overview
  Adds a bio field to the profiles table to allow users to add a short
  description about themselves.

  ## Changes
  
  ### Modified Tables
  - `profiles`
    - `bio` (text, nullable) - User bio/description (up to 500 characters)

  ## Notes
  - Bio field is optional and defaults to empty string
  - No migration of existing data needed
*/

-- Add bio column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio text DEFAULT '';
  END IF;
END $$;
