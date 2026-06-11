import { supabase } from './supabaseClient';

export const fetchVendors = async (category = null, location = null) => {
  let query = supabase
    .from('vendors')
    .select(`
      id,
      business_name,
      category,
      starting_price,
      location,
      latitude,
      longitude,
      rating,
      review_count,
      portfolio_urls,
      tags
    `)
    .eq('is_approved', true);

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }
  
  if (location && location !== 'Anywhere') {
    query = query.ilike('location', `%${location}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }
  return data;
};

export const fetchVendorById = async (id) => {
  const { data, error } = await supabase
    .from('vendors')
    .select(`
      *,
      vendor_packages (*)
    `)
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching vendor:', error);
    return null;
  }
  return data;
};

export const fetchEvent = async (id) => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }
  return data;
};
