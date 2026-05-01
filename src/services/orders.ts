import { supabase } from "./supabase";

export interface Order {
  id?: string;
  name: string;
  phone: string;
  status?: "Lunas" | "Belum Lunas";
  data: Record<string, any>; // Dynamic fields go here
  paymentProofUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  categoryId?: string;
}

const ORDERS_TABLE = "orders";

export const subscribeToOrders = (callback: (orders: Order[]) => void, categoryId?: string) => {
  const fetchOrders = async () => {
    console.log("DEBUG: fetchOrder started....");
    try {
      let query = supabase
        .from(ORDERS_TABLE)
        .select("*")
        .order("createdAt", { ascending: false });

      if (categoryId) {
        console.log("DEBUG: Filtering by categoryId:", categoryId);
        query = query.eq("categoryId", categoryId);
      }

      console.log("DEBUG: Executing Supabase query...");
      const { data, error } = await query;

      if (error) {
        console.error("Supabase Orders Fetch Error:", error.message, error.details, error.hint);
        callback([]);
        return;
      }

      console.log("DEBUG: Query successful, data length:", data?.length || 0);
      callback((data as Order[]) || []);
    } catch (err) {
      console.error("DEBUG: Unexpected error in fetchOrders:", err);
      callback([]);
    }
  };

  // Initial fetch
  fetchOrders();

  // Subscribe to changes with a unique channel name to avoid conflicts
  const channel = supabase
    .channel(`orders-changes-${categoryId || 'all'}-${Math.random().toString(36).substring(7)}`)
    .on(
      'postgres_changes' as any,
      {
        event: '*',
        table: ORDERS_TABLE,
        ...(categoryId ? { filter: `categoryId=eq.${categoryId}` } : {})
      },
      async () => {
        fetchOrders();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const addOrder = async (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .insert([{ ...order, userId: user?.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateOrder = async (id: string, order: Partial<Order>) => {
  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .update(order)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteOrder = async (id: string) => {
  const { error } = await supabase
    .from(ORDERS_TABLE)
    .delete()
    .eq("id", id);

  if (error) throw error;
};
