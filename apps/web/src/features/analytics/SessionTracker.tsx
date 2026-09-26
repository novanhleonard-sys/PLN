import { useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthStore';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function SessionTracker() {
  const { user, isInitialized } = useAuth();
  const sessionId = useRef<string | null>(null);

  useEffect(() => {
    if (!isInitialized) return;

    if (!sessionId.current) {
      sessionId.current = uuidv4();
    }
    
    const sid = sessionId.current;
    
    const ping = async () => {
      if (!sid) return;
      try {
        await supabase.from('app_sessions').upsert({
          id: sid,
          user_id: user?.id || null,
          last_ping_at: new Date().toISOString()
        }, { onConflict: 'id' });
      } catch (e) {
      }
    };

    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, [user, isInitialized]);

  return null;
}
