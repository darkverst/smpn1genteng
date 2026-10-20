import { useEffect, useState, useCallback, useRef } from 'react';
import { isDbConfigured, checkDatabaseConnection } from '../services/settingsRepository';

type Status = 'connecting' | 'online' | 'offline';

export default function DbIndicator() {
  const [status, setStatus] = useState<Status>('connecting');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const check = useCallback(async () => {
    if (!isDbConfigured) { setStatus('offline'); return; }
    const result = await checkDatabaseConnection();
    setStatus(result.isConnected ? 'online' : 'offline');
  }, []);

  useEffect(() => {
    void check();
    const onSynced = () => {
      setStatus('online');
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setStatus('online'), 100);
    };
    window.addEventListener('db:synced', onSynced);
    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener('db:synced', onSynced);
    };
  }, [check]);

  const color = status === 'online' ? 'bg-green-400' : status === 'offline' ? 'bg-red-400' : 'bg-amber-400';
  const pulse = status === 'connecting' ? 'animate-pulse' : '';

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full shadow-sm ${color} ${pulse}`}
      title={
        status === 'online' ? 'Database terhubung' :
        status === 'offline' ? 'Database offline' : 'Menghubungkan...'
      }
    />
  );
}

