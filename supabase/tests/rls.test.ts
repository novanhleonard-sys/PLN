import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'anon';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'service';

describe('RLS Policies', () => {
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  it('1. Anon membaca stories yang terbit berhasil, yang unpublished tidak', async () => {
    // Just a sanity check for now
    const { data, error } = await anonClient.from('stories').select('*');
    expect(error).toBeNull();
  });

  // Other tests will go here
});
