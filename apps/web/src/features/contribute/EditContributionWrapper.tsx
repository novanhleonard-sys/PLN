import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { ContributeForm, type ContributeFormData } from './ContributeForm';
import { useAuth } from '../auth/AuthStore';

export const EditContributionWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: submission, isLoading, error } = useQuery({
    queryKey: ['submission', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('submissions').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    }
  });

  const handleUpdate = async (formData: ContributeFormData) => {
    if (!user) return;
    
    // Check if critical fields changed that require re-review
    const needsReview = 
      submission.target_story_id !== formData.target_story_id ||
      submission.lat !== formData.lat ||
      submission.lng !== formData.lng ||
      submission.body !== formData.body;

    const status = needsReview ? 'submitted' : submission.status;

    const { error } = await supabase.from('submissions').update({
      target_story_id: formData.target_story_id || null,
      title: formData.title,
      type: formData.type,
      region_id: formData.region_id || null,
      version_label: formData.version_label,
      body: formData.body,
      sources: formData.sources,
      rights_declared: formData.rights_declared,
      lat: formData.lat || null,
      lng: formData.lng || null,
      synopsis: formData.synopsis || null,
      hero_image_path: formData.hero_image_path || null,
      pin_image_path: formData.pin_image_path || null,
      asset_credits: formData.asset_credits || null,
      force_new_reason: formData.force_new_reason || null,
      status: status
    }).eq('id', id).eq('user_id', user.id); // Ensure ownership

    if (error) throw error;
    navigate(`/kontribusi/${id}`);
  };

  if (isLoading) return <div className="p-8 text-center">Memuat data kontribusi...</div>;
  if (error || !submission) return <div className="p-8 text-center text-red-600">Gagal memuat kontribusi.</div>;

  const initialData: Partial<ContributeFormData> = {
    target_story_id: submission.target_story_id,
    title: submission.title,
    type: submission.type,
    region_id: submission.region_id,
    version_label: submission.version_label,
    body: submission.body,
    sources: submission.sources,
    rights_declared: submission.rights_declared,
    lat: submission.lat,
    lng: submission.lng,
    synopsis: submission.synopsis || '',
    hero_image_path: submission.hero_image_path,
    pin_image_path: submission.pin_image_path,
    asset_credits: submission.asset_credits || '',
    force_new_reason: submission.force_new_reason
  };

  return (
    <ContributeForm 
      isEditMode 
      initialData={initialData} 
      onSubmitOverride={handleUpdate} 
      onCancel={() => navigate(`/kontribusi/${id}`)}
    />
  );
};
