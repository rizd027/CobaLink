"use client";

import { useState, useRef } from "react";
import { OrderTable } from "@/components/dashboard/OrderTable";
import { useOrderStore } from "@/store/useOrderStore";
import { 
  Loader2, 
  ShoppingCart, 
  Plus, 
  ArrowLeft,
  ChevronRight,
  Tag,
  Edit2,
  Trash2,
  FileText,
  Download,
  Settings2,
  Image as ImageIcon, 
  Upload, 
  X,
  Check
} from "lucide-react";
import { uploadImage } from "@/services/storage";
import { CategoryIcon, PRESET_CATEGORY_ICONS } from "@/components/dashboard/CategoryIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { exportCategoriesToExcel, exportCategoriesToPDF, exportToExcel, exportToPDF } from "@/services/export";
import { deleteCategory, addCategory, updateCategory } from "@/services/categories";
import { useConfirmStore } from "@/store/useConfirmStore";
import { toast } from "sonner";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageId } from "@/components/dashboard/DashboardShell";

interface OrdersPageProps {
  onNavigate: (page: PageId) => void;
}

export function OrdersPage({ onNavigate }: OrdersPageProps) {
  const { 
    orders,
    isOrdersLoading,
    categories,
    selectedCategoryId,
    setCategoryId,
    openEdit,
    searchQuery,
    isCategoryDialogOpen,
    closeCategory,
    openCategoryAdd,
    isViewingCategories,
    setIsViewingCategories,
    sortOrder
  } = useOrderStore();
  
  // Category Form State
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: "", type: "", status: "", pricePerPc: "", icon: "Package" });
  const [otherType, setOtherType] = useState("");
  const [otherStatus, setOtherStatus] = useState("");
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);

  // Edit Category Form State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ id: "", name: "", type: "", status: "", pricePerPc: "", icon: "Package" });
  const [editOtherType, setEditOtherType] = useState("");
  const [editOtherStatus, setEditOtherStatus] = useState("");

  const confirmDialog = useConfirmStore((state) => state.confirm);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsAdding(true);
    try {
      const finalType = formData.type === "OTHER" ? otherType : formData.type;
      const finalStatus = formData.status === "OTHER" ? otherStatus : formData.status;

      await addCategory(
        formData.name.trim(),
        finalType || undefined,
        finalStatus || undefined,
        formData.pricePerPc ? parseFloat(formData.pricePerPc.replace(/\D/g, "")) : undefined,
        formData.icon
      );
      
      setFormData({ name: "", type: "", status: "", pricePerPc: "", icon: "Package" });
      setOtherType("");
      setOtherStatus("");
      closeCategory();
      toast.success("Category created successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create category");
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.name.trim()) return;

    setIsEditing(true);
    try {
      const finalType = editFormData.type === "OTHER" ? editOtherType : editFormData.type;
      const finalStatus = editFormData.status === "OTHER" ? editOtherStatus : editFormData.status;

      await updateCategory(
        editFormData.id,
        editFormData.name.trim(),
        finalType || undefined,
        finalStatus || undefined,
        editFormData.pricePerPc ? parseFloat(editFormData.pricePerPc.replace(/\D/g, "")) : undefined,
        editFormData.icon
      );
      
      setIsEditDialogOpen(false);
      toast.success("Category updated successfully");
    } catch (error: any) {
      console.error("Update Category Error:", error);
      if (error?.message) console.error("Error Message:", error.message);
      toast.error(error?.message || "Failed to update category");
    } finally {
      setIsEditing(false);
    }
  };

  const contentRef = useRef<HTMLDivElement>(null);

  const displayedCategories = categories;

  const handleCategoryExport = (type: "excel" | "pdf") => {
    if (displayedCategories.length === 0) {
      toast.error("No category data to export");
      return;
    }
    if (type === "excel") exportCategoriesToExcel(displayedCategories);
    else exportCategoriesToPDF(displayedCategories);
    toast.success(`Categories exported to ${type.toUpperCase()}`);
  };

  const handleOrdersExport = (type: "excel" | "pdf") => {
    if (filteredOrders.length === 0) {
      toast.error("No order data to export");
      return;
    }
    if (type === "excel") exportToExcel(filteredOrders);
    else exportToPDF(filteredOrders);
    toast.success(`Orders exported to ${type.toUpperCase()}`);
  };

  const filteredOrders = orders
    .filter(order => {
      const matchesCategory = selectedCategoryId === "all" || order.categoryId === selectedCategoryId;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        order.name.toLowerCase().includes(searchLower) ||
        order.phone.includes(searchQuery) ||
        Object.values(order.data || {}).some(val => 
          String(val).toLowerCase().includes(searchLower)
        );
      
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });

  const handleCategoryClick = (id: string) => {
    window.history.pushState({ page: "orders", isViewingCategories: false, categoryId: id }, "");
    setCategoryId(id);
    setIsViewingCategories(false);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col" suppressHydrationWarning>
      <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col min-h-0 pt-0 sm:pt-5 md:pt-6" suppressHydrationWarning>
        {isViewingCategories ? (
          <div className="gap-0 sm:gap-6 flex-1 flex flex-col min-h-0" suppressHydrationWarning>
            {/* Header Section - Only for Categories */}
            <header 
              className="hidden sm:flex flex-col lg:flex-row justify-between items-start lg:items-end gap-2 sm:gap-5 px-1 sm:px-4"
              suppressHydrationWarning
            >
              <div className="space-y-2 sm:space-y-3" suppressHydrationWarning>
                <div className="flex flex-col gap-1" suppressHydrationWarning>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-primary flex items-center gap-3 hidden sm:flex">
                    CATEGORIES
                  </h1>
                  <div className="h-1 w-24 bg-primary rounded-full mt-1 hidden sm:block" suppressHydrationWarning />
                </div>
              </div>

              <div className="hidden sm:flex flex-wrap items-center gap-2 sm:gap-3" suppressHydrationWarning>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline"
                      className="h-8 sm:h-10 px-3 sm:px-6 rounded-lg border border-primary/20 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider"
                    >
                      EXPORT
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl border-border bg-card shadow-xl p-1">
                    <DropdownMenuItem onClick={() => handleCategoryExport("excel")} className="rounded-lg p-2.5 gap-3 cursor-pointer font-bold text-[10px] uppercase tracking-wider">
                      <Download size={14} className="text-primary" /> Export Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCategoryExport("pdf")} className="rounded-lg p-2.5 gap-3 cursor-pointer font-bold text-[10px] uppercase tracking-wider">
                      <FileText size={14} className="text-primary" /> Export PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Dialog open={isCategoryDialogOpen} onOpenChange={(open) => !open && closeCategory()}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={openCategoryAdd}
                      className={cn(
                        "h-8 sm:h-10 px-3 sm:px-6 rounded-lg border border-primary/20 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider text-primary bg-transparent"
                      )}
                    >
                      CREATE CATEGORY
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95%] sm:max-w-[750px] rounded-2xl sm:rounded-3xl border border-primary/10 sm:border-2 shadow-2xl p-0 overflow-hidden z-[100] gap-0">
                    <div className="bg-primary/5 p-4 sm:p-6 pb-3 sm:pb-4 border-b border-primary/10">
                      <DialogHeader>
                        <DialogTitle className="text-base sm:text-xl font-black tracking-tight text-primary uppercase">New Category</DialogTitle>
                        <p className="text-[9px] sm:text-[10px] font-bold text-primary/40 uppercase tracking-widest mt-0.5">Configure classification</p>
                      </DialogHeader>
                    </div>
                    
                    <form onSubmit={handleAddCategory} className="p-4 sm:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4 sm:gap-8">
                        {/* Left Side: Text Details */}
                        <div className="space-y-4 sm:space-y-5">
                      <div className="space-y-1.5 sm:space-y-3">
                        <Label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Category Name</Label>
                        <Input
                          required
                          placeholder="e.g. FASHION..."
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="h-11 sm:h-14 bg-primary/5 border border-primary/20 sm:border-2 rounded-xl font-bold text-sm sm:text-base text-primary px-4 sm:px-6 focus-visible:border-primary/50 focus-visible:ring-0 placeholder:text-primary/30"
                        />
                      </div>

                          <Label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Price Per Pc</Label>
                          <div className="relative">
                            <span className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 font-bold text-primary/40 text-xs sm:text-sm">Rp</span>
                            <Input
                              type="text"
                              placeholder="0"
                              value={formData.pricePerPc}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "");
                                setFormData(prev => ({ 
                                  ...prev, 
                                  pricePerPc: val ? Number(val).toLocaleString("id-ID") : "" 
                                }));
                              }}
                              className="h-11 sm:h-14 bg-primary/5 border border-primary/20 sm:border-2 rounded-xl font-bold text-sm sm:text-base text-primary pl-10 sm:pl-14 pr-4 sm:pr-6 focus-visible:border-primary/50 focus-visible:ring-0 placeholder:text-primary/30"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1.5 sm:space-y-3">
                          <Label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Type</Label>
                          <Select 
                            value={formData.type} 
                            onValueChange={(val) => setFormData(prev => ({ ...prev, type: val ?? "" }))}
                          >
                            <SelectTrigger className="w-full h-11 sm:h-14 bg-primary/5 border border-primary/20 sm:border-2 rounded-xl font-bold text-[10px] sm:text-[11px] text-primary uppercase tracking-widest px-4 sm:px-6 hover:border-primary/40 focus:ring-0 focus:border-primary/50">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent side="bottom" align="start" sideOffset={8} alignItemWithTrigger={false} className="rounded-2xl border-2 border-primary/10 shadow-2xl z-[105] p-2 bg-white">
                              <SelectItem value="FASHION" className="font-bold text-[11px] uppercase tracking-widest cursor-pointer mb-1 last:mb-0">FASHION</SelectItem>
                              <SelectItem value="ELECTRONIC" className="font-bold text-[11px] uppercase tracking-widest cursor-pointer mb-1 last:mb-0">ELECTRONIC</SelectItem>
                              <SelectItem value="FOODS" className="font-bold text-[11px] uppercase tracking-widest cursor-pointer mb-1 last:mb-0">FOODS</SelectItem>
                              <SelectItem value="VEHICLE" className="font-bold text-[11px] uppercase tracking-widest cursor-pointer mb-1 last:mb-0">VEHICLE</SelectItem>
                              <SelectItem value="STATIONERY" className="font-bold text-[11px] uppercase tracking-widest cursor-pointer mb-1 last:mb-0">STATIONERY</SelectItem>
                              <SelectItem value="OTHER" className="font-bold text-[11px] uppercase tracking-widest cursor-pointer text-primary">OTHER...</SelectItem>
                            </SelectContent>
                          </Select>
                          {formData.type === "OTHER" && (
                            <Input
                              required
                              placeholder="Manual type..."
                              value={otherType}
                              onChange={(e) => setOtherType(e.target.value)}
                              className="h-10 sm:h-12 bg-primary/5 border border-primary/20 sm:border-2 rounded-xl font-bold text-xs text-primary px-4 placeholder:text-primary/30 focus-visible:border-primary/50 focus-visible:ring-0"
                            />
                          )}
                        </div>
                        
                        <div className="space-y-1.5 sm:space-y-3">
                          <Label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Status</Label>
                          <Select 
                            value={formData.status} 
                            onValueChange={(val) => setFormData(prev => ({ ...prev, status: val ?? "" }))}
                          >
                            <SelectTrigger className="w-full h-11 sm:h-14 bg-primary/5 border border-primary/20 sm:border-2 rounded-xl font-bold text-[10px] sm:text-[11px] text-primary uppercase tracking-widest px-4 sm:px-6 hover:border-primary/40 focus:ring-0 focus:border-primary/50">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent side="bottom" align="start" sideOffset={8} alignItemWithTrigger={false} className="rounded-2xl border-2 border-primary/10 shadow-2xl z-[105] p-2 bg-white">
                              <SelectItem value="TO DO" className="font-bold text-[11px] uppercase tracking-widest cursor-pointer mb-1 last:mb-0">TO DO</SelectItem>
                              <SelectItem value="IN PROGRESS" className="font-bold text-[11px] uppercase tracking-widest cursor-pointer mb-1 last:mb-0">IN PROGRESS</SelectItem>
                              <SelectItem value="COMPLETE" className="font-bold text-[11px] uppercase tracking-widest cursor-pointer mb-1 last:mb-0">COMPLETE</SelectItem>
                              <SelectItem value="OTHER" className="font-bold text-[11px] uppercase tracking-widest cursor-pointer text-primary">OTHER...</SelectItem>
                            </SelectContent>
                          </Select>
                          {formData.status === "OTHER" && (
                            <Input
                              required
                              placeholder="Manual status..."
                              value={otherStatus}
                              onChange={(e) => setOtherStatus(e.target.value)}
                              className="h-10 sm:h-12 bg-primary/5 border border-primary/20 sm:border-2 rounded-xl font-bold text-xs text-primary px-4 placeholder:text-primary/30 focus-visible:border-primary/50 focus-visible:ring-0"
                            />
                          )}
                        </div>
                      </div>

                        <div className="col-span-1 md:col-span-2 space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t border-border/40 mt-1 sm:mt-2">
                          <Label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Category Icon</Label>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {PRESET_CATEGORY_ICONS.slice(0, 14).map((preset) => {
                              const Icon = preset.icon;
                              return (
                                <button
                                  key={preset.name}
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, icon: preset.name }))}
                                  className={cn(
                                    "w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center",
                                    formData.icon === preset.name 
                                      ? "bg-primary text-white shadow-md" 
                                      : "bg-primary/5 text-primary/60 hover:bg-primary/10 hover:text-primary"
                                  )}
                                  title={preset.name}
                                >
                                  <Icon size={16} />
                                </button>
                              );
                            })}
                            <div className="relative">
                              <input 
                                type="file" 
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setIsUploadingIcon(true);
                                  try {
                                     const url = await uploadImage(file, "icons");
                                     setFormData(prev => ({ ...prev, icon: url }));
                                  } catch (error) {
                                     toast.error("Failed to upload icon");
                                  } finally {
                                     setIsUploadingIcon(false);
                                  }
                                }}
                              />
                              <button
                                type="button"
                                disabled={isUploadingIcon}
                                className={cn(
                                  "w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center relative",
                                  formData.icon?.startsWith("http") 
                                    ? "bg-primary text-white shadow-md" 
                                    : "bg-primary/5 text-primary/60 hover:bg-primary/10 hover:text-primary"
                                )}
                                title="Upload Custom Icon"
                              >
                                {isUploadingIcon ? <Loader2 size={16} /> : (formData.icon?.startsWith("http") ? <img src={formData.icon} alt="Custom" className="w-5 h-5 rounded object-cover" /> : <Upload size={16} />)}
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>

                      <div className="pt-3 sm:pt-4 flex gap-3">
                         <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={() => closeCategory()}
                          className="h-10 sm:h-12 flex-1 rounded-xl font-bold uppercase text-[10px] sm:text-[11px] tracking-widest text-muted-foreground hover:bg-muted"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isAdding}
                          className="h-10 sm:h-12 flex-[2] rounded-xl bg-primary text-white font-bold uppercase text-[10px] sm:text-[11px] tracking-widest shadow-lg shadow-primary/20"
                        >
                          {isAdding ? "Saving..." : "Confirm"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogContent className="w-[95%] sm:max-w-[760px] rounded-2xl sm:rounded-2xl border border-primary/15 shadow-2xl p-0 overflow-hidden z-[100] gap-0">
                    <div className="bg-primary/5 px-4 sm:px-6 py-3 sm:py-4 border-b border-primary/10">
                      <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg font-extrabold tracking-tight text-primary uppercase">Edit Category</DialogTitle>
                        <p className="text-[9px] sm:text-[10px] font-semibold text-primary/45 uppercase tracking-[0.18em] mt-0.5">Update classification details</p>
                      </DialogHeader>
                    </div>
                    
                    <form onSubmit={handleEditCategory} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                        <div className="space-y-1.5 sm:space-y-2 md:col-span-1">
                          <Label className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70 ml-1">Type</Label>
                          <Select 
                            value={editFormData.type} 
                            onValueChange={(val) => setEditFormData(prev => ({ ...prev, type: val ?? "" }))}
                          >
                            <SelectTrigger className="w-full h-10 sm:h-11 data-[size=default]:h-10 sm:data-[size=default]:h-11 py-0 bg-primary/5 border border-primary/20 rounded-lg font-bold text-[10px] sm:text-[11px] text-primary uppercase tracking-wider px-3 sm:px-4 hover:border-primary/40 focus:ring-0 focus:border-primary/50">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent side="bottom" align="start" sideOffset={8} alignItemWithTrigger={false} className="rounded-xl border border-primary/10 shadow-xl z-[105] p-2 bg-white">
                              <SelectItem value="FASHION" className="font-bold text-[11px] uppercase tracking-widest cursor-pointer mb-1 last:mb-0">FASHION</SelectItem>
                              <SelectItem value="ELECTRONIC" className="font-bold text-[11px] uppercase tracking-widest cursor-pointer mb-1 last:mb-0">ELECTRONIC</SelectItem>
                              <SelectItem value="FOODS" className="font-bold text-[11px] uppercase tracking-widest cursor-pointer mb-1 last:mb-0">FOODS</SelectItem>
                              <SelectItem value="VEHICLE" className="font-bold text-[11px] uppercase tracking-widest cursor-pointer mb-1 last:mb-0">VEHICLE</SelectItem>
                              <SelectItem value="STATIONERY" className="font-bold text-[11px] uppercase tracking-widest cursor-pointer mb-1 last:mb-0">STATIONERY</SelectItem>
                              <SelectItem value="OTHER" className="font-bold text-[11px] uppercase tracking-widest cursor-pointer text-primary">OTHER...</SelectItem>
                            </SelectContent>
                          </Select>
                          {editFormData.type === "OTHER" && (
                            <Input
                              required
                              placeholder="Manual type..."
                              value={editOtherType}
                              onChange={(e) => setEditOtherType(e.target.value)}
                              className="h-9 sm:h-10 bg-primary/5 border border-primary/20 rounded-lg font-bold text-xs text-primary px-3 placeholder:text-primary/30 focus-visible:border-primary/50 focus-visible:ring-0"
                            />
                          )}
                        </div>

                        <div className="space-y-1.5 sm:space-y-2 md:col-span-1">
                          <Label className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70 ml-1">Status</Label>
                          <Select 
                            value={editFormData.status} 
                            onValueChange={(val) => setEditFormData(prev => ({ ...prev, status: val ?? "" }))}
                          >
                            <SelectTrigger className="w-full h-10 sm:h-11 data-[size=default]:h-10 sm:data-[size=default]:h-11 py-0 bg-primary/5 border border-primary/20 rounded-lg font-bold text-[10px] sm:text-[11px] text-primary uppercase tracking-wider px-3 sm:px-4 hover:border-primary/40 focus:ring-0 focus:border-primary/50">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent side="bottom" align="start" sideOffset={8} alignItemWithTrigger={false} className="rounded-xl border border-primary/10 shadow-xl z-[105] p-2 bg-white">
                              <SelectItem value="TO DO" className="font-bold text-[11px] uppercase tracking-widest cursor-pointer mb-1 last:mb-0">TO DO</SelectItem>
                              <SelectItem value="IN PROGRESS" className="font-bold text-[11px] uppercase tracking-widest cursor-pointer mb-1 last:mb-0">IN PROGRESS</SelectItem>
                              <SelectItem value="COMPLETE" className="font-bold text-[11px] uppercase tracking-widest cursor-pointer mb-1 last:mb-0">COMPLETE</SelectItem>
                              <SelectItem value="OTHER" className="font-bold text-[11px] uppercase tracking-widest cursor-pointer text-primary">OTHER...</SelectItem>
                            </SelectContent>
                          </Select>
                          {editFormData.status === "OTHER" && (
                            <Input
                              required
                              placeholder="Manual status..."
                              value={editOtherStatus}
                              onChange={(e) => setEditOtherStatus(e.target.value)}
                              className="h-9 sm:h-10 bg-primary/5 border border-primary/20 rounded-lg font-bold text-xs text-primary px-3 placeholder:text-primary/30 focus-visible:border-primary/50 focus-visible:ring-0"
                            />
                          )}
                        </div>

                        <div className="space-y-1.5 sm:space-y-2 md:col-span-1">
                          <Label className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70 ml-1">Price Per Pc</Label>
                          <div className="relative">
                            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 font-bold text-primary/45 text-[10px] sm:text-xs">Rp</span>
                            <Input
                              type="text"
                              placeholder="0"
                              value={editFormData.pricePerPc}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "");
                                setEditFormData(prev => ({ 
                                  ...prev, 
                                  pricePerPc: val ? Number(val).toLocaleString("id-ID") : "" 
                                }));
                              }}
                              className="h-10 sm:h-11 bg-primary/5 border border-primary/20 rounded-lg font-bold text-xs sm:text-sm text-primary pl-9 sm:pl-11 pr-4 focus-visible:border-primary/50 focus-visible:ring-0 placeholder:text-primary/30"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70 ml-1">Category Name</Label>
                        <Input
                          required
                          placeholder="e.g. FASHION..."
                          value={editFormData.name}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="h-10 sm:h-11 bg-primary/5 border border-primary/20 rounded-lg font-semibold text-xs sm:text-sm text-primary px-4 focus-visible:border-primary/50 focus-visible:ring-0 placeholder:text-primary/30"
                        />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2 pt-3 sm:pt-4 border-t border-border/50">
                          <Label className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70 ml-1">Category Icon</Label>
                          <div className="flex flex-wrap gap-2 sm:gap-2.5">
                            {PRESET_CATEGORY_ICONS.slice(0, 14).map((preset) => {
                              const Icon = preset.icon;
                              return (
                                <button
                                  key={preset.name}
                                  type="button"
                                  onClick={() => setEditFormData(prev => ({ ...prev, icon: preset.name }))}
                                  className={cn(
                                    "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center",
                                    editFormData.icon === preset.name 
                                      ? "bg-primary text-white shadow-md" 
                                      : "bg-primary/5 text-primary/60 hover:bg-primary/10 hover:text-primary"
                                  )}
                                  title={preset.name}
                                >
                                  <Icon size={14} />
                                </button>
                              );
                            })}
                            <div className="relative">
                              <input 
                                type="file" 
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setIsUploadingIcon(true);
                                  try {
                                     const url = await uploadImage(file, "icons");
                                     setEditFormData(prev => ({ ...prev, icon: url }));
                                  } catch (error) {
                                     toast.error("Failed to upload icon");
                                  } finally {
                                     setIsUploadingIcon(false);
                                  }
                                }}
                              />
                              <button
                                type="button"
                                disabled={isUploadingIcon}
                                className={cn(
                                  "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center relative",
                                  editFormData.icon?.startsWith("http") 
                                    ? "bg-primary text-white shadow-md" 
                                    : "bg-primary/5 text-primary/60 hover:bg-primary/10 hover:text-primary"
                                )}
                                title="Upload Custom Icon"
                              >
                                {isUploadingIcon ? <Loader2 size={14} /> : (editFormData.icon?.startsWith("http") ? <img src={editFormData.icon} alt="Custom" className="w-4 h-4 rounded object-cover" /> : <Upload size={14} />)}
                              </button>
                            </div>
                          </div>
                      </div>

                      <div className="pt-2 sm:pt-2 flex gap-3">
                         <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={() => setIsEditDialogOpen(false)}
                          className="h-9 sm:h-10 flex-1 rounded-lg font-bold uppercase text-[10px] sm:text-[11px] tracking-[0.15em] text-muted-foreground hover:bg-muted"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isEditing}
                          className="h-9 sm:h-10 flex-[2] rounded-lg bg-primary text-white font-bold uppercase text-[10px] sm:text-[11px] tracking-[0.15em] shadow-lg shadow-primary/20"
                        >
                          {isEditing ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </header>

            <div className="sm:bg-white rounded-none sm:rounded-2xl border-t border-b sm:border border-border/60 sm:shadow-sm overflow-hidden flex-1 flex flex-col min-h-0 mx-0 sm:mx-4 bg-transparent">
              {/* Summary Bar */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-primary/[0.03] border-b border-border/60">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/70">
                  {displayedCategories.length} categories total
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/70">Click rows to view order</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto overflow-y-auto custom-scrollbar flex-1 min-h-0">
                  <Table>
                    <TableHeader className="bg-card border-b border-border/50 shadow-sm">
                      <TableRow className="border-0 hover:bg-transparent">
                        <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] px-6 py-4 text-muted-foreground/40 w-[60px]">#</TableHead>
                        <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 min-w-[200px]">Category Name</TableHead>
                        <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 text-center w-[150px]">Type</TableHead>
                        <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 text-center w-[150px]">Price/Pc</TableHead>
                        <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 text-center w-[150px]">Status</TableHead>
                        <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 w-[180px]">Created At</TableHead>
                        <TableHead className="text-right font-black text-[9px] uppercase tracking-[0.2em] px-6 text-muted-foreground/40 w-[100px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedCategories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-48 text-center">
                            <div className="flex flex-col items-center justify-center opacity-30 gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <span className="text-2xl">📂</span>
                              </div>
                              <p className="text-xs font-black uppercase tracking-[0.2em]">No categories yet</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        displayedCategories.map((cat, index) => (
                          <TableRow 
                            key={cat.id} 
                            className="group border-b border-border/30 hover:bg-primary/[0.025] cursor-pointer"
                            onClick={() => handleCategoryClick(cat.id)}
                          >
                            <TableCell className="px-6 py-4">
                              <span className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center font-black text-[10px] text-primary/40 group-hover:bg-primary/10">
                                {index + 1}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center text-primary overflow-hidden border border-border/40 shadow-sm group-hover:scale-105">
                                  <CategoryIcon name={cat.icon} className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-black text-sm tracking-tight text-foreground uppercase group-hover:text-primary">{cat.name}</span>
                                  <span className="text-[10px] text-muted-foreground/40 font-bold tracking-[0.2em] uppercase">{cat.id.substring(0, 8)}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center py-4">
                              {cat.type ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-secondary/10 border border-secondary/20 text-[10px] font-black uppercase tracking-widest text-secondary-foreground/70">
                                  {cat.type}
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center py-4">
                              <span className="text-xs font-black text-primary tracking-tight tabular-nums">
                                {cat.pricePerPc ? `Rp ${cat.pricePerPc.toLocaleString()}` : "—"}
                              </span>
                            </TableCell>
                            <TableCell className="text-center py-4">
                              {(() => {
                                const status = (cat.status || "ACTIVE").toUpperCase();
                                const isComplete = status === "COMPLETE";
                                const isInProgress = status === "IN PROGRESS";
                                const isToDo = status === "TO DO";
                                return (
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    isComplete ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                    isInProgress ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                    isToDo ? "bg-blue-50 text-blue-700 border border-blue-200" :
                                    "bg-primary/5 text-primary border border-primary/10"
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                      isComplete ? "bg-emerald-500" :
                                      isInProgress ? "bg-amber-500" :
                                      isToDo ? "bg-blue-500" :
                                      "bg-primary/60"
                                    }`} />
                                    {status}
                                  </span>
                                );
                              })()}
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="text-[11px] font-bold text-muted-foreground/60 tabular-nums" suppressHydrationWarning>
                                {cat.createdAt ? format(new Date(cat.createdAt), "HH:mm, dd/MM/yyyy") : "—"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right px-6 py-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-9 w-9 rounded-xl bg-primary/5 text-primary/60 hover:text-primary hover:bg-primary/10 transition-all"
                                  onClick={() => {
                                    const isCustomType = !["FASHION", "ELECTRONIC", "FOODS", "VEHICLE", "STATIONERY"].includes(cat.type || "");
                                    const isCustomStatus = !["TO DO", "IN PROGRESS", "COMPLETE"].includes(cat.status || "");
                                    setEditFormData({
                                      id: cat.id,
                                      name: cat.name,
                                      type: isCustomType && cat.type ? "OTHER" : (cat.type || ""),
                                      status: isCustomStatus && cat.status ? "OTHER" : (cat.status || ""),
                                      pricePerPc: cat.pricePerPc ? cat.pricePerPc.toLocaleString("id-ID") : "",
                                      icon: cat.icon || "Package"
                                    });
                                    setEditOtherType(isCustomType ? (cat.type || "") : "");
                                    setEditOtherStatus(isCustomStatus ? (cat.status || "") : "");
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Edit2 size={16} strokeWidth={2.5} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-9 w-9 rounded-xl bg-destructive/5 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    confirmDialog({
                                      title: "Hapus Kategori?",
                                      message: "Kategori ini akan dihapus. Pesanan di dalamnya tidak akan terhapus namun menjadi tidak berkategori.",
                                      onConfirm: async () => {
                                        try {
                                          await deleteCategory(cat.id);
                                          toast.success("Category removed");
                                        } catch (error) {
                                          toast.error("Failed to remove category");
                                        }
                                      }
                                    });
                                  }}
                                >
                                  <Trash2 size={16} strokeWidth={2.5} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card List View */}
                <div className="sm:hidden flex-1 overflow-y-auto custom-scrollbar bg-primary/[0.03]">
                  {displayedCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 opacity-30 gap-3">
                      <span className="text-2xl">📂</span>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">No categories yet</p>
                    </div>
                  ) : (
                    <div>
                      {displayedCategories.map((cat, index) => (
                        <div 
                          key={cat.id} 
                          className="border-b border-border/60 active:bg-primary/[0.05] cursor-pointer px-3 py-3.5"
                          onClick={() => handleCategoryClick(cat.id)}
                        >
                          <div className="flex justify-between gap-3 sm:gap-4">
                            {/* Left: Title & Table */}
                            <div className="flex-1 min-w-0 flex flex-col gap-2">
                              <div className="text-[10.5px] font-black text-foreground uppercase tracking-tight leading-none truncate">
                                #{index + 1} {cat.name}
                              </div>
                              <table className="border-collapse w-full">
                                <tbody>
                                  <tr>
                                    <td className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground pr-2 pb-[4px] w-[65px] align-top whitespace-nowrap">TYPE</td>
                                    <td className="text-[9px] font-black text-muted-foreground pr-2 pb-[4px] align-top w-[10px]">:</td>
                                    <td className="text-[9.5px] font-black uppercase tracking-wide text-foreground pb-[4px] align-top leading-tight truncate">{cat.type || "—"}</td>
                                  </tr>
                                  <tr>
                                    <td className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground pr-2 pb-[4px] align-top whitespace-nowrap">PRICE/PC</td>
                                    <td className="text-[9px] font-black text-muted-foreground pr-2 pb-[4px] align-top w-[10px]">:</td>
                                    <td className="text-[9.5px] font-black uppercase tracking-wide text-foreground pb-[4px] align-top leading-tight truncate">{cat.pricePerPc ? `Rp ${cat.pricePerPc.toLocaleString()}` : "—"}</td>
                                  </tr>
                                  <tr>
                                    <td className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground pr-2 pb-[4px] align-top whitespace-nowrap">STATUS</td>
                                    <td className="text-[9px] font-black text-muted-foreground pr-2 pb-[4px] align-top w-[10px]">:</td>
                                    <td className="text-[9.5px] font-black uppercase tracking-wide text-foreground pb-[4px] align-top leading-tight truncate">{cat.status || "TO DO"}</td>
                                  </tr>
                                  <tr suppressHydrationWarning>
                                    <td className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground pr-2 align-top whitespace-nowrap">CREATED AT</td>
                                    <td className="text-[9px] font-black text-muted-foreground pr-2 align-top w-[10px]">:</td>
                                    <td className="text-[9.5px] font-black uppercase tracking-wide text-foreground align-top leading-tight" suppressHydrationWarning>
                                      {cat.createdAt ? (
                                        <>
                                          {format(new Date(cat.createdAt), "HH:mm,")}<br/>
                                          {format(new Date(cat.createdAt), "dd/MM/yyyy")}
                                        </>
                                      ) : "—"}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            
                              {/* Right: Actions & Icon */}
                              <div className="shrink-0 flex flex-col items-center gap-4 w-[85px]">
                                {/* Actions */}
                                <div className="flex items-center justify-center gap-2.5 w-full" onClick={(e) => e.stopPropagation()}>
                                  <button 
                                    onClick={() => {
                                      const isCustomType = !["FASHION", "ELECTRONIC", "FOODS", "VEHICLE", "STATIONERY"].includes(cat.type || "");
                                      const isCustomStatus = !["TO DO", "IN PROGRESS", "COMPLETE"].includes(cat.status || "");
                                      setEditFormData({
                                        id: cat.id,
                                        name: cat.name,
                                        type: isCustomType && cat.type ? "OTHER" : (cat.type || ""),
                                        status: isCustomStatus && cat.status ? "OTHER" : (cat.status || ""),
                                        pricePerPc: cat.pricePerPc ? cat.pricePerPc.toLocaleString("id-ID") : "",
                                        icon: cat.icon || "Package"
                                      });
                                      setEditOtherType(isCustomType ? (cat.type || "") : "");
                                      setEditOtherStatus(isCustomStatus ? (cat.status || "") : "");
                                      setIsEditDialogOpen(true);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary/10 text-primary active:scale-90 transition-transform"
                                  >
                                    <Edit2 size={14} strokeWidth={2.5} />
                                  </button>
                                  <button 
                                    onClick={async () => {
                                      confirmDialog({
                                        title: "Hapus Kategori?",
                                        message: "Anda yakin ingin menghapus kategori ini?",
                                        onConfirm: async () => {
                                          try {
                                            await deleteCategory(cat.id);
                                            toast.success("Category removed");
                                          } catch (error) {
                                            toast.error("Failed to remove category");
                                          }
                                        }
                                      });
                                    }}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-destructive/10 text-destructive active:scale-90 transition-transform"
                                  >
                                    <Trash2 size={14} strokeWidth={2.5} />
                                  </button>
                                </div>
                              
                              {/* Icon */}
                              <div className="flex items-center justify-center w-[45px] h-[45px] opacity-[0.35]">
                                <CategoryIcon name={cat.icon} className="w-full h-full text-primary" strokeWidth={1.5} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 px-0 sm:px-6 md:px-8 pb-0 sm:pb-8 gap-0 sm:gap-6">
            {/* Back button and filters */}
            <div className="flex items-center justify-between border-b border-border/60 pb-2 sm:pb-4 pt-2 sm:pt-0 px-4 sm:px-0 gap-2">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.history.back()}
                  className="h-8 px-0 text-muted-foreground hover:text-primary font-bold text-[10px] sm:text-[11px] uppercase tracking-widest flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} /> 
                  <span className="hidden sm:inline">BACK TO CATEGORIES</span>
                  <span className="sm:hidden">BACK</span>
                </Button>
                
                <div className="hidden sm:flex items-center gap-3">
                  <div className="h-4 w-[2px] bg-border/60 mx-1" />
                  <Button 
                    onClick={() => onNavigate("add-order")}
                    className="h-9 sm:h-11 rounded-lg sm:rounded-xl bg-primary text-white font-bold text-[10px] sm:text-[11px] uppercase tracking-widest px-4 sm:px-8 shadow-sm"
                  >
                    <Plus size={16} className="mr-2" />
                    ADD NEW {selectedCategoryId === "all" ? "ORDER" : categories.find(c => c.id === selectedCategoryId)?.name.toUpperCase()}
                  </Button>

                  {selectedCategoryId !== "all" && (
                    <Button 
                      variant="outline"
                      onClick={() => onNavigate("fields")}
                      className="h-9 sm:h-11 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-[11px] uppercase tracking-widest px-4 sm:px-8 border border-primary/10 flex items-center gap-2"
                    >
                      <Settings2 size={16} className="text-primary" />
                      DEFINE COLUMNS
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-9 sm:h-11 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-[11px] uppercase tracking-widest px-4 sm:px-6 border border-primary/10 flex items-center gap-2"
                      >
                        <Download size={16} className="text-primary" />
                        EXPORT ORDERS
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48 rounded-xl border-border bg-card shadow-xl p-1">
                      <DropdownMenuItem onClick={() => handleOrdersExport("excel")} className="rounded-lg p-2.5 gap-3 cursor-pointer font-bold text-[10px] uppercase tracking-wider">
                        <Download size={14} className="text-primary" /> Export Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleOrdersExport("pdf")} className="rounded-lg p-2.5 gap-3 cursor-pointer font-bold text-[10px] uppercase tracking-wider">
                        <FileText size={14} className="text-primary" /> Export PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-primary/40 bg-primary/[0.02] px-3 sm:px-5 py-1.5 sm:py-2 rounded-full border border-primary/5 shrink-0">
                {filteredOrders.length} <span className="hidden sm:inline">RECORDS FOUND</span><span className="sm:hidden">RECORDS</span>
              </div>
            </div>

            {isOrdersLoading ? (
              <div className="flex flex-col items-center justify-center h-[40vh] space-y-4">
                <Loader2 className="text-primary/40" size={32} />
                <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em]">Loading database...</p>
              </div>
            ) : (
              <div ref={contentRef} className="flex-1 flex flex-col min-h-0">
                <OrderTable 
                  orders={filteredOrders} 
                  onEdit={(order) => {
                    openEdit(order);
                    onNavigate("edit-order");
                  }} 
                />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
