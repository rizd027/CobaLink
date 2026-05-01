import { supabase } from "./supabase";

export interface ProductField {
  id: string;
  productId: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'radio' | 'select' | 'checkbox' | 'image' | 'scale' | 'rating' | 'date' | 'time' | 'currency';
  options?: string; // Comma-separated for select
  isRequired: boolean;
  sortOrder: number;
}

const FIELDS_TABLE = "product_fields";

export const getFieldsByProduct = async (productId: string): Promise<ProductField[]> => {
  const { data, error } = await supabase
    .from(FIELDS_TABLE)
    .select("*")
    .eq("productId", productId)
    .order("sortOrder", { ascending: true });

  if (error) throw error;
  return data as ProductField[];
};

export const addField = async (field: Omit<ProductField, "id">) => {
  const { data, error } = await supabase
    .from(FIELDS_TABLE)
    .insert([{
      productId: field.productId,
      label: field.label,
      type: field.type,
      options: field.options,
      isRequired: field.isRequired,
      sortOrder: field.sortOrder
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteField = async (id: string) => {
  const { error } = await supabase
    .from(FIELDS_TABLE)
    .delete()
    .eq("id", id);

  if (error) throw error;
};

export const updateField = async (id: string, field: Partial<Omit<ProductField, "id">>) => {
  const { data, error } = await supabase
    .from(FIELDS_TABLE)
    .update(field)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
