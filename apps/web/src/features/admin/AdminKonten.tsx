import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export const AdminKonten = () => {
  const queryClient = useQueryClient();

  const { data: stories, isLoading } = useQuery({
    queryKey: ['admin-stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select('*, story_versions(*), adaptations(*)');
      if (error) throw error;
      return data;
    },
  });

  const mutationVersionStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'published' | 'unpublished' }) => {
      const { error } = await supabase
        .from('story_versions')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-stories'] }),
  });

  const mutationDeleteAdaptation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('adaptations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-stories'] }),
  });

  const mutationUpdatePin = useMutation({
    mutationFn: async ({ id, lat, lng }: { id: string; lat: number; lng: number }) => {
      const { error } = await supabase
        .from('stories')
        .update({ lat, lng })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-stories'] }),
  });

  if (isLoading) return <div className="p-8">Memuat konten...</div>;

  return (
    <div className="p-8 font-nunito max-w-6xl mx-auto">
      <h1 className="text-2xl font-fredoka font-semibold mb-6">Kelola Konten</h1>
      <div className="flex flex-col gap-6">
        {stories?.map((story) => (
          <div key={story.id} className="border border-stone-200 p-4 rounded bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-2">{story.title}</h2>
            <div className="flex gap-4 items-center mb-4 text-sm">
              <div>
                <strong>Lat:</strong> {story.lat}
              </div>
              <div>
                <strong>Lng:</strong> {story.lng}
              </div>
              <button
                onClick={() => {
                  const newLat = parseFloat(prompt('Masukkan Latitude baru', story.lat.toString()) || '');
                  const newLng = parseFloat(prompt('Masukkan Longitude baru', story.lng.toString()) || '');
                  if (!isNaN(newLat) && !isNaN(newLng)) {
                    mutationUpdatePin.mutate({ id: story.id, lat: newLat, lng: newLng });
                  }
                }}
                className="text-blue-600 underline"
              >
                Ubah Pin
              </button>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Versi Cerita:</h3>
              <div className="flex flex-col gap-2">
                {story.story_versions?.map((version: any) => (
                  <div key={version.id} className="flex justify-between items-center bg-stone-50 p-2 rounded">
                    <span>
                      {version.label} ({version.language}) - {version.status}
                    </span>
                    <button
                      onClick={() =>
                        mutationVersionStatus.mutate({
                          id: version.id,
                          status: version.status === 'published' ? 'unpublished' : 'published',
                        })
                      }
                      className="text-blue-600 underline text-sm"
                    >
                      {version.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Adaptasi:</h3>
              <div className="flex flex-col gap-2">
                {story.adaptations?.map((adapt: any) => (
                  <div key={adapt.id} className="flex justify-between items-center bg-stone-50 p-2 rounded">
                    <span>
                      Band: {adapt.age_band} | Prompt: {adapt.prompt_version} | Status: {adapt.status}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm('Yakin hapus adaptasi ini?')) {
                          mutationDeleteAdaptation.mutate(adapt.id);
                        }
                      }}
                      className="text-red-600 underline text-sm"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
                {(!story.adaptations || story.adaptations.length === 0) && (
                  <p className="text-sm text-stone-500">Tidak ada adaptasi.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
