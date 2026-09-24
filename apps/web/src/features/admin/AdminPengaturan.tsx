import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export const AdminPengaturan = () => {
  const queryClient = useQueryClient();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('app_settings').select('*');
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key, value });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      setEditingKey(null);
      setEditValue('');
    },
  });

  if (isLoading) return <div className="p-8">Memuat pengaturan...</div>;

  return (
    <div className="p-8 font-nunito max-w-4xl mx-auto">
      <h1 className="text-2xl font-fredoka font-semibold mb-6">Pengaturan Aplikasi</h1>
      <div className="flex flex-col gap-4">
        {settings?.map((setting) => (
          <div key={setting.key} className="border border-stone-200 p-4 rounded bg-white shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-bold">{setting.key}</h2>
              {editingKey !== setting.key && (
                <button
                  onClick={() => {
                    setEditingKey(setting.key);
                    setEditValue(JSON.stringify(setting.value, null, 2));
                  }}
                  className="text-blue-600 underline text-sm"
                >
                  Edit
                </button>
              )}
            </div>
            
            {editingKey === setting.key ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full h-40 p-2 border rounded font-mono text-sm"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setEditingKey(null)}
                    className="px-4 py-2 text-sm border rounded"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(editValue);
                        mutation.mutate({ key: setting.key, value: parsed });
                      } catch (e) {
                        alert('JSON tidak valid');
                      }
                    }}
                    disabled={mutation.isPending}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            ) : (
              <pre className="bg-stone-50 p-3 rounded text-sm overflow-auto max-h-60">
                {JSON.stringify(setting.value, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

