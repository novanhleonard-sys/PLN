import { useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthStore';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function useReadSessionTracker(
  storyId?: string,
  versionId?: string,
  adaptationId?: string,
  mode?: string,
  isCompleted?: boolean
) {
  const { user } = useAuth();
  const sessionId = useRef<string | null>(null);

  useEffect(() => {
    if (!storyId || !versionId || !adaptationId || !mode) return;

    if (!sessionId.current) {
      sessionId.current = uuidv4();
    }
    
    const sid = sessionId.current;
    
    const ping = async () => {
      if (!sid) return;
      try {
        await supabase.from('read_sessions').upsert({
          id: sid,
          user_id: user?.id || null,
          story_id: storyId,
          version_id: versionId,
          adaptation_id: adaptationId,
          mode: mode.toLowerCase(),
          last_ping_at: new Date().toISOString(),
          is_completed: isCompleted || false
        }, { onConflict: 'id' });
      } catch (e) {
      }
    };

    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, [user, storyId, versionId, adaptationId, mode, isCompleted]);
}
