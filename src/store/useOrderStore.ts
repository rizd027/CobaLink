import { create } from "zustand";
import { Order, subscribeToOrders } from "@/services/orders";
import { Category, subscribeToCategories } from "@/services/categories";
import { ProductField, getFieldsByProduct } from "@/services/fields";
import { getStoreSettings } from "@/services/settings";

export interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  logoUrl: string;
  signatureUrl: string;
  footerNote: string;
}

interface OrderStore {
  // Dialog state
  isOpen: boolean;
  isCategoryDialogOpen: boolean;
  selectedOrder: Order | null;
  openAdd: () => void;
  openCategoryAdd: () => void;
  openEdit: (order: Order) => void;
  close: () => void;
  closeCategory: () => void;

  // Categories & Fields
  categories: Category[];
  productFields: ProductField[];
  selectedCategoryId: string | "all";
  isViewingCategories: boolean;
  setCategoryId: (id: string | "all") => void;
  setIsViewingCategories: (isViewing: boolean) => void;

  // Shared data
  orders: Order[];
  isOrdersLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOrder: "newest" | "oldest";
  setSortOrder: (order: "newest" | "oldest") => void;
  _unsubscribeOrders: (() => void) | null;
  _unsubscribeCategories: (() => void) | null;
  
  initData: () => void;
  destroyData: () => void;
  refreshFields: () => void;
  upsertOrder: (order: Order) => void;
  
  // Store Settings
  storeSettings: StoreSettings;
  setStoreSettings: (settings: Partial<StoreSettings>) => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  isOpen: false,
  isCategoryDialogOpen: false,
  selectedOrder: null,
  openAdd: () => set({ isOpen: true, selectedOrder: null }),
  openCategoryAdd: () => set({ isCategoryDialogOpen: true }),
  openEdit: (order: Order) => set({ isOpen: true, selectedOrder: order }),
  close: () => set({ isOpen: false, selectedOrder: null }),
  closeCategory: () => set({ isCategoryDialogOpen: false }),

  categories: [],
  productFields: [],
  selectedCategoryId: "all",
  isViewingCategories: true,
  setCategoryId: (id) => {
    set({ selectedCategoryId: id });
    get().refreshFields();
  },
  setIsViewingCategories: (isViewing) => set({ isViewingCategories: isViewing }),

  orders: [],
  isOrdersLoading: true,
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  sortOrder: "newest",
  setSortOrder: (order) => set({ sortOrder: order }),
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
    
    // Only subscribe once for ALL orders
    if (!get()._unsubscribeOrders) {
      set({ isOrdersLoading: true });
      const unsubOrders = subscribeToOrders((data) => {
        set({ orders: data, isOrdersLoading: false });
      });
      set({ _unsubscribeOrders: unsubOrders });
    }

    get().refreshFields();

    // Fetch store settings from Supabase
    getStoreSettings().then(settings => {
      if (settings) {
        set({ storeSettings: settings });
        localStorage.setItem("store_settings", JSON.stringify(settings));
      }
    });
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

  upsertOrder: (order) => {
    set((state) => {
      const exists = state.orders.some((item) => item.id === order.id);

      if (exists) {
        return {
          orders: state.orders
            .map((item) => (item.id === order.id ? order : item))
            .sort((a, b) => {
              const aTime = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
              const bTime = b.createdAt ? new Date(b.createdAt).getTime() : Date.now();
              if (bTime !== aTime) return bTime - aTime;
              return (b.id || "").localeCompare(a.id || "");
            }),
        };
      }

      return {
        orders: [order, ...state.orders].sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : Date.now();
          if (bTime !== aTime) return bTime - aTime;
          // Fallback to ID for stable sort
          return (b.id || "").localeCompare(a.id || "");
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

  storeSettings: {
    name: "",
    address: "",
    phone: "",
    logoUrl: "",
    signatureUrl: "",
    footerNote: ""
  },
  setStoreSettings: (settings) => set((state) => ({
    storeSettings: { ...state.storeSettings, ...settings }
  })),
}));
