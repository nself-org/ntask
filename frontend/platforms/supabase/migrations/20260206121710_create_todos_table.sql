/*
  # Create Todos Table

  ## Overview
  Creates a todos table to demonstrate full CRUD operations with realtime updates,
  offline support, and multi-backend compatibility through the abstraction layer.

  ## New Tables
  
  ### `todos`
  - `id` (uuid, primary key) - Unique identifier for each todo
  - `user_id` (uuid, foreign key) - References auth.users, owner of the todo
  - `title` (text, not null) - Todo title/description
  - `completed` (boolean, default false) - Completion status
  - `created_at` (timestamptz, default now()) - Creation timestamp
  - `updated_at` (timestamptz, default now()) - Last update timestamp

  ## Security
  
  ### Row Level Security (RLS)
  - RLS is enabled on the todos table
  - Users can only view their own todos
  - Users can only create todos for themselves
  - Users can only update their own todos
  - Users can only delete their own todos

  ## Indexes
  - Index on user_id for efficient user-specific queries
  - Index on created_at for sorting

  ## Notes
  - All operations are scoped to authenticated users only
  - The updated_at timestamp is automatically maintained via trigger
  - Foreign key ensures data integrity with user accounts
*/

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policies for todos
CREATE POLICY "Users can view own todos"
  ON todos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own todos"
  ON todos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos"
  ON todos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos"
  ON todos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos(user_id);
CREATE INDEX IF NOT EXISTS todos_created_at_idx ON todos(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();