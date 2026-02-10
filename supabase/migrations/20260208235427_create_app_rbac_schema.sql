/*
  # Create RBAC schema with app_ namespace

  ## Overview
  Creates a full role-based access control (RBAC) system with granular permissions.
  All tables use the `app_` prefix for clear namespace separation.
  The system supports both role-level and per-user permission overrides.

  ## New Tables

  ### `app_roles`
  - `id` (uuid, primary key) - Unique role identifier
  - `name` (text, unique, not null) - Machine-readable role name (e.g. 'owner', 'admin')
  - `label` (text, not null) - Human-readable label (e.g. 'Owner', 'Administrator')
  - `description` (text) - Role description
  - `level` (integer, not null, default 0) - Hierarchy level (higher = more access)
  - `is_system` (boolean, default false) - System roles cannot be deleted
  - `created_at` (timestamptz, default now())

  ### `app_permissions`
  - `id` (uuid, primary key) - Unique permission identifier
  - `name` (text, unique, not null) - Machine-readable permission (e.g. 'users.read')
  - `label` (text, not null) - Human-readable label
  - `description` (text) - Permission description
  - `resource` (text, not null) - Resource group (e.g. 'users', 'todos', 'settings')
  - `action` (text, not null) - Action type (e.g. 'read', 'write', 'delete', 'manage')
  - `created_at` (timestamptz, default now())

  ### `app_role_permissions`
  - `role_id` (uuid, FK to app_roles) - Role reference
  - `permission_id` (uuid, FK to app_permissions) - Permission reference
  - Composite primary key (role_id, permission_id)
  - `granted_at` (timestamptz, default now())

  ### `app_user_roles`
  - `user_id` (uuid, FK to auth.users) - User reference
  - `role_id` (uuid, FK to app_roles) - Role reference
  - Composite primary key (user_id, role_id)
  - `assigned_at` (timestamptz, default now())
  - `assigned_by` (uuid, FK to auth.users, nullable) - Who assigned this role

  ### `app_user_permissions`
  - `id` (uuid, primary key) - Unique override identifier
  - `user_id` (uuid, FK to auth.users) - User reference
  - `permission_id` (uuid, FK to app_permissions) - Permission reference
  - `granted` (boolean, default true) - true = grant, false = revoke (override)
  - `granted_at` (timestamptz, default now())
  - `granted_by` (uuid, FK to auth.users, nullable) - Who granted this override
  - Unique constraint (user_id, permission_id)

  ## Security
  - RLS enabled on all tables
  - Owner (level 100) has full access to everything
  - Admins (level 90) can read all RBAC data and manage non-owner roles
  - Regular authenticated users can read their own roles and permissions

  ## Helper Functions
  - `app_user_has_role(user_uuid, role_name)` - Check if user has a specific role
  - `app_user_has_permission(user_uuid, permission_name)` - Check effective permissions (role + overrides)
  - `app_user_role_level(user_uuid)` - Get user's highest role level
  - `app_is_owner(user_uuid)` - Check if user is the owner

  ## Seeded Data
  - 4 system roles: owner (100), admin (90), support (50), user (10)
  - Core permissions for: users, roles, todos, settings, support resources
  - Role-permission mappings following principle of least privilege
*/

-- ============================================================
-- ROLES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS app_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  label text NOT NULL DEFAULT '',
  description text DEFAULT '',
  level integer NOT NULL DEFAULT 0,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE app_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PERMISSIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS app_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  label text NOT NULL DEFAULT '',
  description text DEFAULT '',
  resource text NOT NULL DEFAULT '',
  action text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE app_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ROLE-PERMISSIONS JOIN TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS app_role_permissions (
  role_id uuid REFERENCES app_roles(id) ON DELETE CASCADE NOT NULL,
  permission_id uuid REFERENCES app_permissions(id) ON DELETE CASCADE NOT NULL,
  granted_at timestamptz DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

ALTER TABLE app_role_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USER-ROLES JOIN TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS app_user_roles (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_id uuid REFERENCES app_roles(id) ON DELETE CASCADE NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, role_id)
);

ALTER TABLE app_user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USER-PERMISSION OVERRIDES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS app_user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  permission_id uuid REFERENCES app_permissions(id) ON DELETE CASCADE NOT NULL,
  granted boolean DEFAULT true,
  granted_at timestamptz DEFAULT now(),
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (user_id, permission_id)
);

ALTER TABLE app_user_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS app_roles_name_idx ON app_roles(name);
CREATE INDEX IF NOT EXISTS app_roles_level_idx ON app_roles(level);
CREATE INDEX IF NOT EXISTS app_permissions_name_idx ON app_permissions(name);
CREATE INDEX IF NOT EXISTS app_permissions_resource_idx ON app_permissions(resource);
CREATE INDEX IF NOT EXISTS app_user_roles_user_id_idx ON app_user_roles(user_id);
CREATE INDEX IF NOT EXISTS app_user_roles_role_id_idx ON app_user_roles(role_id);
CREATE INDEX IF NOT EXISTS app_user_permissions_user_id_idx ON app_user_permissions(user_id);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION app_user_role_level(user_uuid uuid)
RETURNS integer AS $$
  SELECT COALESCE(MAX(r.level), 0)
  FROM app_user_roles ur
  JOIN app_roles r ON r.id = ur.role_id
  WHERE ur.user_id = user_uuid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION app_is_owner(user_uuid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM app_user_roles ur
    JOIN app_roles r ON r.id = ur.role_id
    WHERE ur.user_id = user_uuid AND r.name = 'owner'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION app_user_has_role(user_uuid uuid, role_name text)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM app_user_roles ur
    JOIN app_roles r ON r.id = ur.role_id
    WHERE ur.user_id = user_uuid AND r.name = role_name
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION app_user_has_permission(user_uuid uuid, perm_name text)
RETURNS boolean AS $$
DECLARE
  has_override boolean;
  override_granted boolean;
BEGIN
  SELECT granted INTO override_granted
  FROM app_user_permissions up
  JOIN app_permissions p ON p.id = up.permission_id
  WHERE up.user_id = user_uuid AND p.name = perm_name;

  IF FOUND THEN
    RETURN override_granted;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM app_user_roles ur
    JOIN app_role_permissions rp ON rp.role_id = ur.role_id
    JOIN app_permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = user_uuid AND p.name = perm_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- RLS POLICIES: app_roles
-- ============================================================

CREATE POLICY "Authenticated users can read roles"
  ON app_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert roles"
  ON app_roles FOR INSERT
  TO authenticated
  WITH CHECK (app_user_role_level(auth.uid()) >= 90);

CREATE POLICY "Admins can update non-system roles"
  ON app_roles FOR UPDATE
  TO authenticated
  USING (app_user_role_level(auth.uid()) >= 90 AND is_system = false)
  WITH CHECK (app_user_role_level(auth.uid()) >= 90 AND is_system = false);

CREATE POLICY "Admins can delete non-system roles"
  ON app_roles FOR DELETE
  TO authenticated
  USING (app_user_role_level(auth.uid()) >= 90 AND is_system = false);

-- ============================================================
-- RLS POLICIES: app_permissions
-- ============================================================

CREATE POLICY "Authenticated users can read permissions"
  ON app_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only owners can insert permissions"
  ON app_permissions FOR INSERT
  TO authenticated
  WITH CHECK (app_is_owner(auth.uid()));

CREATE POLICY "Only owners can update permissions"
  ON app_permissions FOR UPDATE
  TO authenticated
  USING (app_is_owner(auth.uid()))
  WITH CHECK (app_is_owner(auth.uid()));

CREATE POLICY "Only owners can delete permissions"
  ON app_permissions FOR DELETE
  TO authenticated
  USING (app_is_owner(auth.uid()));

-- ============================================================
-- RLS POLICIES: app_role_permissions
-- ============================================================

CREATE POLICY "Authenticated users can read role permissions"
  ON app_role_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can assign role permissions"
  ON app_role_permissions FOR INSERT
  TO authenticated
  WITH CHECK (app_user_role_level(auth.uid()) >= 90);

CREATE POLICY "Admins can remove role permissions"
  ON app_role_permissions FOR DELETE
  TO authenticated
  USING (app_user_role_level(auth.uid()) >= 90);

-- ============================================================
-- RLS POLICIES: app_user_roles
-- ============================================================

CREATE POLICY "Users can read own roles"
  ON app_user_roles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR app_user_role_level(auth.uid()) >= 90
  );

CREATE POLICY "Admins can assign roles below their level"
  ON app_user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    app_user_role_level(auth.uid()) >= 90
    AND (SELECT level FROM app_roles WHERE id = role_id) < app_user_role_level(auth.uid())
  );

CREATE POLICY "Admins can update role assignments below their level"
  ON app_user_roles FOR UPDATE
  TO authenticated
  USING (
    app_user_role_level(auth.uid()) >= 90
    AND (SELECT level FROM app_roles WHERE id = role_id) < app_user_role_level(auth.uid())
  )
  WITH CHECK (
    app_user_role_level(auth.uid()) >= 90
    AND (SELECT level FROM app_roles WHERE id = role_id) < app_user_role_level(auth.uid())
  );

CREATE POLICY "Admins can remove roles below their level"
  ON app_user_roles FOR DELETE
  TO authenticated
  USING (
    app_user_role_level(auth.uid()) >= 90
    AND (SELECT level FROM app_roles WHERE id = role_id) < app_user_role_level(auth.uid())
    AND NOT app_is_owner(user_id)
  );

-- ============================================================
-- RLS POLICIES: app_user_permissions
-- ============================================================

CREATE POLICY "Users can read own permission overrides"
  ON app_user_permissions FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR app_user_role_level(auth.uid()) >= 90
  );

CREATE POLICY "Admins can grant permission overrides"
  ON app_user_permissions FOR INSERT
  TO authenticated
  WITH CHECK (app_user_role_level(auth.uid()) >= 90);

CREATE POLICY "Admins can update permission overrides"
  ON app_user_permissions FOR UPDATE
  TO authenticated
  USING (app_user_role_level(auth.uid()) >= 90)
  WITH CHECK (app_user_role_level(auth.uid()) >= 90);

CREATE POLICY "Admins can revoke permission overrides"
  ON app_user_permissions FOR DELETE
  TO authenticated
  USING (app_user_role_level(auth.uid()) >= 90);

-- ============================================================
-- SEED: System Roles
-- ============================================================

INSERT INTO app_roles (name, label, description, level, is_system) VALUES
  ('owner',   'Owner',         'Full system access. Cannot be modified or deleted.', 100, true),
  ('admin',   'Administrator', 'Full administrative access except owner-level operations.', 90, true),
  ('support', 'Support',       'Customer support and content moderation access.', 50, true),
  ('user',    'User',          'Standard authenticated user access.', 10, true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED: Permissions
-- ============================================================

INSERT INTO app_permissions (name, label, resource, action, description) VALUES
  ('users.read',       'View Users',         'users',    'read',   'View user profiles and listings'),
  ('users.write',      'Edit Users',         'users',    'write',  'Edit user profiles'),
  ('users.delete',     'Delete Users',       'users',    'delete', 'Delete user accounts'),
  ('users.manage',     'Manage Users',       'users',    'manage', 'Full user management including role assignment'),
  ('roles.read',       'View Roles',         'roles',    'read',   'View roles and permissions'),
  ('roles.write',      'Edit Roles',         'roles',    'write',  'Create and edit roles'),
  ('roles.delete',     'Delete Roles',       'roles',    'delete', 'Delete roles'),
  ('roles.manage',     'Manage Roles',       'roles',    'manage', 'Full role and permission management'),
  ('todos.read',       'View Todos',         'todos',    'read',   'View own todos'),
  ('todos.write',      'Edit Todos',         'todos',    'write',  'Create and edit own todos'),
  ('todos.delete',     'Delete Todos',       'todos',    'delete', 'Delete own todos'),
  ('todos.manage',     'Manage All Todos',   'todos',    'manage', 'View and manage all users todos'),
  ('settings.read',    'View Settings',      'settings', 'read',   'View application settings'),
  ('settings.write',   'Edit Settings',      'settings', 'write',  'Edit application settings'),
  ('settings.manage',  'Manage Settings',    'settings', 'manage', 'Full settings management'),
  ('support.read',     'View Support',       'support',  'read',   'View support tickets and logs'),
  ('support.write',    'Handle Support',     'support',  'write',  'Respond to support tickets'),
  ('support.manage',   'Manage Support',     'support',  'manage', 'Full support management')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED: Role-Permission Mappings
-- ============================================================

-- Owner gets ALL permissions
INSERT INTO app_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM app_roles r
CROSS JOIN app_permissions p
WHERE r.name = 'owner'
ON CONFLICT DO NOTHING;

-- Admin gets everything except owner-level manage on roles/settings
INSERT INTO app_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM app_roles r
CROSS JOIN app_permissions p
WHERE r.name = 'admin'
AND p.name NOT IN ('roles.manage')
ON CONFLICT DO NOTHING;

-- Support gets support.*, todos.read, users.read
INSERT INTO app_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM app_roles r
CROSS JOIN app_permissions p
WHERE r.name = 'support'
AND p.name IN ('support.read', 'support.write', 'support.manage', 'todos.read', 'users.read')
ON CONFLICT DO NOTHING;

-- User gets basic self-service
INSERT INTO app_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM app_roles r
CROSS JOIN app_permissions p
WHERE r.name = 'user'
AND p.name IN ('todos.read', 'todos.write', 'todos.delete', 'settings.read')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PROTECT OWNER: Trigger to prevent owner role removal
-- ============================================================

CREATE OR REPLACE FUNCTION app_protect_owner_role()
RETURNS trigger AS $$
BEGIN
  IF (SELECT name FROM app_roles WHERE id = OLD.role_id) = 'owner' THEN
    RAISE EXCEPTION 'Cannot remove owner role from a user';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'protect_owner_role_removal'
  ) THEN
    CREATE TRIGGER protect_owner_role_removal
      BEFORE DELETE ON app_user_roles
      FOR EACH ROW
      EXECUTE FUNCTION app_protect_owner_role();
  END IF;
END $$;
