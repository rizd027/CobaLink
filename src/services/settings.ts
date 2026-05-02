import { supabase } from './supabase';
import { StoreSettings } from '@/store/useOrderStore';

export const getStoreSettings = async (): Promise<StoreSettings | null> => {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
};

export const updateStoreSettings = async (settings: Partial<StoreSettings>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Remove any fields that shouldn't be in the payload
  const { id, userId, createdAt, ...payload } = settings as any;

  const { data, error } = await supabase
    .from('store_settings')
    .upsert({ 
      ...payload, 
      userId: user.id 
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
