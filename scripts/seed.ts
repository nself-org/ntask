import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SEED_USERS = [
  { email: 'owner@nself.org', password: 'Owner123!', displayName: 'System Owner', role: 'owner' },
  { email: 'admin@nself.org', password: 'Admin123!', displayName: 'Administrator', role: 'admin' },
  { email: 'support@nself.org', password: 'Support123!', displayName: 'Support Agent', role: 'support' },
  { email: 'user@nself.org', password: 'User123!', displayName: 'Demo User', role: 'user' },
];

const SAMPLE_TODOS: Record<string, { title: string; completed: boolean }[]> = {
  'owner@nself.org': [
    { title: 'Welcome to nApp', completed: true },
    { title: 'Review RBAC configuration', completed: false },
  ],
  'admin@nself.org': [
    { title: 'Set up application settings', completed: false },
    { title: 'Configure user management', completed: false },
  ],
  'support@nself.org': [
    { title: 'Review support workflows', completed: false },
  ],
  'user@nself.org': [
    { title: 'Explore the dashboard', completed: false },
    { title: 'Customize your profile', completed: false },
    { title: 'Try the offline features', completed: false },
    { title: 'Review the documentation', completed: false },
  ],
};

async function createOrGetUser(email: string, password: string, displayName: string): Promise<string | null> {
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users?.find(u => u.email === email);
  if (found) {
    console.log(`  User ${email} already exists`);
    return found.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });

  if (error) {
    console.error(`  Error creating ${email}:`, error.message);
    return null;
  }

  console.log(`  Created ${email}`);
  return data.user.id;
}

async function assignRole(userId: string, roleName: string, assignedBy?: string) {
  const { data: role } = await supabase
    .from('app_roles')
    .select('id')
    .eq('name', roleName)
    .maybeSingle();

  if (!role) {
    console.error(`  Role '${roleName}' not found. Run RBAC migration first.`);
    return;
  }

  const { error } = await supabase
    .from('app_user_roles')
    .upsert(
      { user_id: userId, role_id: role.id, assigned_by: assignedBy || null },
      { onConflict: 'user_id,role_id' }
    );

  if (error) {
    console.error(`  Error assigning role ${roleName}:`, error.message);
  } else {
    console.log(`  Assigned role: ${roleName}`);
  }
}

async function seedTodos(userId: string, email: string) {
  const todos = SAMPLE_TODOS[email];
  if (!todos || todos.length === 0) return;

  const todosToInsert = todos.map(t => ({
    user_id: userId,
    title: t.title,
    completed: t.completed,
  }));

  const { error } = await supabase.from('app_todos').insert(todosToInsert);
  if (error) {
    if (error.message.includes('duplicate')) {
      console.log(`  Todos already exist for ${email}`);
    } else {
      console.error(`  Error seeding todos for ${email}:`, error.message);
    }
  } else {
    console.log(`  Seeded ${todos.length} todos for ${email}`);
  }
}

async function seedDatabase() {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT || 'local';
  const backend = process.env.NEXT_PUBLIC_BACKEND_PROVIDER || 'bolt';

  console.log(`\nSeeding database...`);
  console.log(`  Environment: ${env}`);
  console.log(`  Backend: ${backend}\n`);

  if (backend !== 'supabase' && backend !== 'bolt') {
    console.log('Seeding is only supported for Supabase-backed environments.');
    console.log('For nSelf/Nhost, use the Hasura seed scripts in backend/.\n');
    return;
  }

  const userIds: Record<string, string> = {};

  console.log('Creating users...');
  for (const user of SEED_USERS) {
    const id = await createOrGetUser(user.email, user.password, user.displayName);
    if (id) userIds[user.email] = id;
  }

  const ownerUserId = userIds['owner@nself.org'];

  console.log('\nAssigning roles...');
  for (const user of SEED_USERS) {
    const userId = userIds[user.email];
    if (!userId) continue;
    console.log(`  ${user.email}:`);
    await assignRole(userId, user.role, user.email === 'owner@nself.org' ? undefined : ownerUserId);
  }

  console.log('\nSeeding todos...');
  for (const user of SEED_USERS) {
    const userId = userIds[user.email];
    if (!userId) continue;
    await seedTodos(userId, user.email);
  }

  console.log('\n--- Seed Complete ---\n');
  console.log('Default credentials:');
  for (const user of SEED_USERS) {
    console.log(`  ${user.email.padEnd(24)} ${user.password.padEnd(14)} (${user.role})`);
  }
  console.log('');
}

seedDatabase().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Seed error:', error);
  process.exit(1);
});
