# Database Schema

Complete reference for the application database schema.

---

## Overview

The boilerplate uses a simple but complete schema demonstrating:
- User profiles with auto-creation
- Todo items with CRUD operations
- Public/private visibility
- Sharing with permissions
- Proper foreign keys and indexes

---

## Tables

### `app_profiles`

User profiles, automatically created on signup.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (references auth.users.id) |
| `email` | TEXT | User's email address |
| `display_name` | TEXT | Display name for UI |
| `avatar_url` | TEXT | Avatar image URL |
| `bio` | TEXT | User bio/description |
| `created_at` | TIMESTAMPTZ | When created |
| `updated_at` | TIMESTAMPTZ | Last updated (auto-updated) |

**Indexes:**
- Primary key on `id`

**Triggers:**
- Auto-creates profile when user signs up
- Auto-updates `updated_at` on changes

**Example:**
```graphql
query {
  app_profiles {
    id
    email
    display_name
    avatar_url
    bio
  }
}
```

---

### `app_todos`

Todo items with public/private visibility.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | UUID | Owner (references auth.users.id) |
| `title` | TEXT | Todo title |
| `description` | TEXT | Optional description |
| `completed` | BOOLEAN | Completion status |
| `is_public` | BOOLEAN | Public visibility toggle |
| `created_at` | TIMESTAMPTZ | When created |
| `updated_at` | TIMESTAMPTZ | Last updated (auto-updated) |

**Indexes:**
- Primary key on `id`
- Index on `user_id` (for user queries)
- Index on `is_public` (for public todo queries)

**Permissions:**
- Users can only CRUD their own todos
- Public role can view todos where `is_public = true`

**Triggers:**
- Auto-updates `updated_at` on changes

**Example:**
```graphql
mutation {
  insert_app_todos_one(object: {
    title: "Buy groceries"
    completed: false
    is_public: false
  }) {
    id
    title
    completed
    is_public
  }
}
```

---

### `app_todo_shares`

Share todos with other users by email.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `todo_id` | UUID | Todo being shared (references app_todos.id) |
| `shared_with_email` | TEXT | Email of recipient |
| `permission` | TEXT | 'view' or 'edit' |
| `created_at` | TIMESTAMPTZ | When shared |
| `updated_at` | TIMESTAMPTZ | Last updated (auto-updated) |

**Indexes:**
- Primary key on `id`
- Index on `todo_id` (for todo share queries)
- Index on `shared_with_email` (for user share queries)
- Unique constraint on `(todo_id, shared_with_email)` (prevent duplicate shares)

**Constraints:**
- `permission` must be 'view' or 'edit'
- Foreign key on `todo_id` (cascading delete)

**Permissions:**
- Users can create shares for todos they own
- Users can view shares for todos they own
- Users can delete shares for todos they own

**Triggers:**
- Auto-updates `updated_at` on changes

**Example:**
```graphql
mutation {
  insert_app_todo_shares_one(object: {
    todo_id: "uuid-here"
    shared_with_email: "friend@example.com"
    permission: "view"
  }) {
    id
    todo_id
    shared_with_email
    permission
  }
}
```

---

## Relationships

```
auth.users (from Hasura Auth)
    ↓ (1:1)
app_profiles
    ↓ (1:many)
app_todos
    ↓ (1:many)
app_todo_shares
```

- Each **user** has one **profile** (auto-created)
- Each **user** has many **todos**
- Each **todo** has many **shares**

---

## Row-Level Security

### Hasura Permissions

**app_profiles:**
- Users can only view/edit their own profile
- No public access

**app_todos:**
- Users can CRUD only their own todos
- Public role can view todos where `is_public = true`
- Enforced via `user_id: { _eq: X-Hasura-User-Id }`

**app_todo_shares:**
- Users can create shares for todos they own
- Users can view/delete shares for todos they own
- Enforced via relationship to `app_todos.user_id`

### How It Works

When authenticated, Hasura receives JWT with claims:
```json
{
  "x-hasura-user-id": "uuid",
  "x-hasura-default-role": "user",
  "x-hasura-allowed-roles": ["user"]
}
```

Hasura uses these claims to filter queries:
```graphql
# This query...
query {
  app_todos {
    id
    title
  }
}

# ...automatically becomes...
query {
  app_todos(where: { user_id: { _eq: "uuid-from-jwt" } }) {
    id
    title
  }
}
```

Users **cannot** see other users' private data, even if they try to query it.

---

## Extending the Schema

### Adding a New Table

1. **Create table in `backend/postgres/init.sql`:**
```sql
CREATE TABLE IF NOT EXISTS public.app_my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_my_table_user_id ON public.app_my_table(user_id);
```

2. **Add updated_at trigger:**
```sql
DROP TRIGGER IF EXISTS set_app_my_table_updated_at ON public.app_my_table;
CREATE TRIGGER set_app_my_table_updated_at
  BEFORE UPDATE ON public.app_my_table
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
```

3. **Track in Hasura metadata** (`backend/hasura/metadata/databases/default/tables/tables.yaml`):
```yaml
- table:
    schema: public
    name: app_my_table
  select_permissions:
    - role: user
      permission:
        columns:
          - id
          - user_id
          - name
          - created_at
          - updated_at
        filter:
          user_id:
            _eq: X-Hasura-User-Id
```

4. **Register fields in backend adapters:**

In `lib/backend/nself/database.ts` and `lib/backend/nhost/database.ts`:
```typescript
const TABLE_FIELDS: Record<string, string> = {
  app_my_table: 'id user_id name created_at updated_at',
  // ... existing tables
};
```

5. **Create service and hooks:**
```typescript
// lib/services/my-service.ts
export interface MyItem {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}
```

---

## Migrations

### Development

Schema changes happen in `backend/postgres/init.sql`. Restart backend to apply:

```bash
cd backend
make down
make up
```

### Production

For production, use Hasura migrations:

```bash
cd backend
hasura migrate create add_my_feature --database-name default
# Edit the generated SQL file
hasura migrate apply --database-name default
```

---

## Next Steps

- [Authentication](Authentication) - How auth integrates with the schema
- [API Reference](API-Reference) - Services for working with data
- [Customization](Customization) - Replace example with your schema

---

**Questions?** [Open an issue](https://github.com/acamarata/nself-app/issues) or check [Troubleshooting](Troubleshooting).
