import { create } from "zustand";
import { Order, subscribeToOrders } from "@/services/orders";
import { Category, subscribeToCategories } from "@/services/categories";
import { ProductField, getFieldsByProduct } from "@/services/fields";

interface OrderStore {
  // Dialog state
  isOpen: boolean;
  selectedOrder: Order | null;
  openAdd: () => void;
  openEdit: (order: Order) => void;
  close: () => void;

  // Categories & Fields
  categories: Category[];
  productFields: ProductField[];
  selectedCategoryId: string | "all";
  setCategoryId: (id: string | "all") => void;

  // Shared data
  orders: Order[];
  isOrdersLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  _unsubscribeOrders: (() => void) | null;
  _unsubscribeCategories: (() => void) | null;
  
  initData: () => void;
  destroyData: () => void;
  refreshOrders: () => void;
  refreshFields: () => void;
  upsertOrder: (order: Order) => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  isOpen: false,
  selectedOrder: null,
  openAdd: () => set({ isOpen: true, selectedOrder: null }),
  openEdit: (order: Order) => set({ isOpen: true, selectedOrder: order }),
  close: () => set({ isOpen: false, selectedOrder: null }),

  categories: [],
  productFields: [],
  selectedCategoryId: "all",
  setCategoryId: (id) => {
    set({ selectedCategoryId: id });
    get().refreshOrders();
    get().refreshFields();
  },

  orders: [],
  isOrdersLoading: true,
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  _unsubscribeOrders: null,
  _unsubscribeCategories: null,

  initData: () => {
    // Only subscribe once for categories
    if (!get()._unsubscribeCategories) {
      const unsubCat = subscribeToCategories((data) => {
        set({ categories: data });
      });
      set({ _unsubscribeCategories: unsubCat });
    }
    
    get().refreshOrders();
    get().refreshFields();
  },

  refreshFields: async () => {
    const catId = get().selectedCategoryId;
    if (catId === "all") {
      set({ productFields: [] });
      return;
    }
    
    try {
      const fields = await getFieldsByProduct(catId);
      set({ productFields: fields });
    } catch (error) {
      console.error("Failed to fetch fields:", error);
    }
  },

  refreshOrders: () => {
    // Kill old subscription
    get()._unsubscribeOrders?.();
    
    set({ isOrdersLoading: true });
    
    const catId = get().selectedCategoryId;
    const unsubOrders = subscribeToOrders((data) => {
      set({ orders: data, isOrdersLoading: false });
    }, catId === "all" ? undefined : catId);
    
    set({ _unsubscribeOrders: unsubOrders });
  },

  upsertOrder: (order) => {
    const selectedCategoryId = get().selectedCategoryId;

    set((state) => {
      const exists = state.orders.some((item) => item.id === order.id);
      const shouldInclude =
        selectedCategoryId === "all" || order.categoryId === selectedCategoryId;

      // If current view is filtered and updated order moves out of filter, remove it.
      if (!shouldInclude) {
        return {
          orders: state.orders.filter((item) => item.id !== order.id),
        };
      }

      if (exists) {
        return {
          orders: state.orders
            .map((item) => (item.id === order.id ? order : item))
            .sort((a, b) => {
              const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return bTime - aTime;
            }),
        };
      }

      return {
        orders: [order, ...state.orders].sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        }),
      };
    });
  },

  destroyData: () => {
    get()._unsubscribeOrders?.();
    get()._unsubscribeCategories?.();
    set({ 
      _unsubscribeOrders: null, 
      _unsubscribeCategories: null, 
      orders: [], 
      categories: [],
      isOrdersLoading: true 
    });
  },
}));
