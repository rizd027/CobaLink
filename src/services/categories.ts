import { supabase } from "./supabase";

export interface Category {
  id: string;
  name: string;
  type?: string;
  status?: string;
  pricePerPc?: number;
  icon?: string;
  userId: string;
  createdAt: string;
}

const CATEGORIES_TABLE = "categories";
const ICON_COLUMN_NAME = "icon";

const isMissingIconColumnError = (error: unknown) => {
  const message =
    typeof error === "object" && error && "message" in error
      ? String((error as { message?: string }).message || "")
      : "";
  return message.includes(`Could not find the '${ICON_COLUMN_NAME}' column`);
};

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from(CATEGORIES_TABLE)
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data as Category[];
};

export const subscribeToCategories = (callback: (categories: Category[]) => void) => {
  // Initial fetch
  getCategories().then(callback).catch(console.error);

  // Subscribe
  const channel = supabase
    .channel('categories-changes')
    .on(
      'postgres_changes' as any,
      { event: '*', table: CATEGORIES_TABLE },
      async () => {
        const categories = await getCategories();
        callback(categories);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const addCategory = async (name: string, type?: string, status?: string, pricePerPc?: number, icon?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  const basePayload = {
    name,
    type: type || "FASHION",
    status: status || "TO DO",
    pricePerPc: pricePerPc || 0,
    userId: user?.id,
  };
  const payloadWithIcon = { ...basePayload, icon: icon || "Package" };

  let { data, error } = await supabase
    .from(CATEGORIES_TABLE)
    .insert([payloadWithIcon])
    .select()
    .single();

  // Backward-compatible fallback for older schema without `icon` column.
  if (error && isMissingIconColumnError(error)) {
    const retry = await supabase
      .from(CATEGORIES_TABLE)
      .insert([basePayload])
      .select()
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) throw error;
  return data;
};

export const deleteCategory = async (id: string) => {
  const { error } = await supabase
    .from(CATEGORIES_TABLE)
    .delete()
    .eq("id", id);

  if (error) throw error;
};

export const updateCategory = async (id: string, name: string, type?: string, status?: string, pricePerPc?: number, icon?: string) => {
  const basePayload = {
    name,
    type,
    status,
    pricePerPc,
    updatedAt: new Date().toISOString(),
  };
  const payloadWithIcon = { ...basePayload, icon };

  let { data, error } = await supabase
    .from(CATEGORIES_TABLE)
    .update(payloadWithIcon)
    .eq("id", id)
    .select()
    .single();

  // Backward-compatible fallback for older schema without `icon` column.
  if (error && isMissingIconColumnError(error)) {
    const retry = await supabase
      .from(CATEGORIES_TABLE)
      .update(basePayload)
      .eq("id", id)
      .select()
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) throw error;
  return data;
};
