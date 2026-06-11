import { supabase } from './supabaseClient';

export const uploadAvatar = async (userId, file) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar-${Math.random()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
      
    return publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return null;
  }
};

export const uploadPortfolioImage = async (vendorId, file) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${vendorId}/${Date.now()}-${Math.random()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('vendor-portfolios')
      .upload(fileName, file);

    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('vendor-portfolios')
      .getPublicUrl(fileName);
      
    return publicUrl;
  } catch (error) {
    console.error('Error uploading portfolio image:', error);
    return null;
  }
};
