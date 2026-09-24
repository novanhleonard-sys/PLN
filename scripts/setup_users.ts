import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import WebSocket from 'ws';
globalThis.WebSocket = WebSocket as any;

dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  // Create admin user
  const adminEmail = 'novanh.leonard@gmail.com';
  
  // We can't easily auto-confirm OAuth users, but we can create an email/password user just for testing admin
  // Wait, if login is Google only, how do we log in as admin? We just login via Google with that email!
  // BUT for local dev, can we use magic links or something? Supabase local dev supports email login with auto confirm if configured.
  // Actually, we can just update the role if the user already exists, or wait for the user to login.
  // But wait! The user said "super admin masukan email novanh.leonard@gmail.com".
  // Let's just create an SQL script or Edge Function logic that automatically sets role to admin for this email.
  // Or we can just seed it!
  
  // Let's check if the user exists
  const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error("Error listing users:", listErr);
    return;
  }
  
  let adminUser = usersData.users.find(u => u.email === adminEmail);
  if (!adminUser) {
    console.log(`User ${adminEmail} not found. Creating...`);
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: 'password123',
      email_confirm: true
    });
    if (createErr) {
      console.error("Error creating admin user:", createErr);
    } else {
      adminUser = newUser.user;
      console.log(`Created user ${adminEmail} with ID ${adminUser.id}`);
    }
  } else {
    console.log(`User ${adminEmail} already exists with ID ${adminUser.id}`);
  }
  
  if (adminUser) {
    // Update profiles table
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', adminUser.id);
      
    if (profileErr) {
      console.error("Error updating profile role:", profileErr);
    } else {
      console.log(`Successfully set role to admin for ${adminEmail}`);
    }
  }
  
  // Create regular user
  const regularEmail = 'user@example.com';
  let regularUser = usersData.users.find(u => u.email === regularEmail);
  if (!regularUser) {
    console.log(`User ${regularEmail} not found. Creating...`);
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: regularEmail,
      password: 'password123',
      email_confirm: true
    });
    if (createErr) {
      console.error("Error creating regular user:", createErr);
    } else {
      console.log(`Created user ${regularEmail}`);
    }
  } else {
    console.log(`User ${regularEmail} already exists`);
  }
}

run();
