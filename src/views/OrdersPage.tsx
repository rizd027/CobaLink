"use client";

import { useState, useRef } from "react";
import { OrderTable } from "@/components/dashboard/OrderTable";
import { useOrderStore } from "@/store/useOrderStore";
import { 
  Loader2, 
  ShoppingCart, 
  Plus, 
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
    searchQuery
  } = useOrderStore();
  
  const [isViewingCategories, setIsViewingCategories] = useState(true);
  
  // Category Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      setIsDialogOpen(false);
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

  const filteredOrders = orders.filter(order => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      order.name.toLowerCase().includes(searchLower) ||
      order.phone.includes(searchQuery) ||
      Object.values(order.data || {}).some(val => 
        String(val).toLowerCase().includes(searchLower)
      );
    
    return matchesSearch;
  });

  const handleCategoryClick = (id: string) => {
    setCategoryId(id);
    setIsViewingCategories(false);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col" suppressHydrationWarning>
      <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col min-h-0 pt-3 sm:pt-5 md:pt-6" suppressHydrationWarning>
        {isViewingCategories ? (
          <div className="space-y-4 sm:space-y-6 flex-1 flex flex-col min-h-0" suppressHydrationWarning>
            {/* Header Section - Only for Categories */}
            <header 
              className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-3 sm:gap-5 px-3 sm:px-4"
              suppressHydrationWarning
            >
              <div className="space-y-2 sm:space-y-3" suppressHydrationWarning>
                <div className="flex flex-col gap-1" suppressHydrationWarning>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-primary flex items-center gap-3">
                    CATEGORIES
                  </h1>
                  <div className="h-1 w-24 bg-primary rounded-full mt-1" suppressHydrationWarning />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger 
                    render={
                      <Button 
                        className={cn(
                          "h-8 sm:h-10 px-3 sm:px-6 rounded-lg border border-primary/20 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider text-primary bg-transparent"
                        )}
                      >
                        CREATE CATEGORY
                      </Button>
                    }
                  />
                  <DialogContent className="sm:max-w-[750px] rounded-3xl border-2 border-primary/10 shadow-2xl p-0 overflow-hidden z-[100]">
                    <div className="bg-primary/5 p-6 pb-4 border-b border-primary/10">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-black tracking-tight text-primary uppercase">New Category</DialogTitle>
                        <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mt-0.5">Configure your new product classification</p>
                      </DialogHeader>
                    </div>
                    
                    <form onSubmit={handleAddCategory} className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
                        {/* Left Side: Text Details */}
                        <div className="space-y-5">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Category Name</Label>
                        <Input
                          required
                          placeholder="e.g. FASHION, ELECTRONIC..."
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="h-14 bg-primary/5 border-2 border-primary/20 rounded-xl font-bold text-base text-primary px-6 focus-visible:border-primary/50 focus-visible:ring-0 placeholder:text-primary/30"
                        />
                      </div>

                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Price Per Pc</Label>
                          <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-primary/40 text-sm">Rp</span>
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
                              className="h-14 bg-primary/5 border-2 border-primary/20 rounded-xl font-bold text-base text-primary pl-14 pr-6 focus-visible:border-primary/50 focus-visible:ring-0 placeholder:text-primary/30"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Type</Label>
                          <Select 
                            value={formData.type} 
                            onValueChange={(val) => setFormData(prev => ({ ...prev, type: val ?? "" }))}
                          >
                            <SelectTrigger className="w-full h-14 bg-primary/5 border-2 border-primary/20 rounded-xl font-bold text-[11px] text-primary uppercase tracking-widest px-6 hover:border-primary/40 focus:ring-0 focus:border-primary/50">
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
                              placeholder="Enter manual type..."
                              value={otherType}
                              onChange={(e) => setOtherType(e.target.value)}
                              className="h-12 bg-primary/5 border-2 border-primary/20 rounded-xl font-bold text-xs text-primary px-4 animate-in slide-in-from-top-2 placeholder:text-primary/30 focus-visible:border-primary/50 focus-visible:ring-0"
                            />
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Initial Status</Label>
                          <Select 
                            value={formData.status} 
                            onValueChange={(val) => setFormData(prev => ({ ...prev, status: val ?? "" }))}
                          >
                            <SelectTrigger className="w-full h-14 bg-primary/5 border-2 border-primary/20 rounded-xl font-bold text-[11px] text-primary uppercase tracking-widest px-6 hover:border-primary/40 focus:ring-0 focus:border-primary/50">
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
                              placeholder="Enter manual status..."
                              value={otherStatus}
                              onChange={(e) => setOtherStatus(e.target.value)}
                              className="h-12 bg-primary/5 border-2 border-primary/20 rounded-xl font-bold text-xs text-primary px-4 animate-in slide-in-from-top-2 placeholder:text-primary/30 focus-visible:border-primary/50 focus-visible:ring-0"
                            />
                          )}
                        </div>
                      </div>

                        <div className="col-span-1 md:col-span-2 space-y-3 pt-4 border-t border-border/40 mt-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Category Icon</Label>
                          <div className="flex flex-wrap gap-2">
                            {PRESET_CATEGORY_ICONS.slice(0, 14).map((preset) => {
                              const Icon = preset.icon;
                              return (
                                <button
                                  key={preset.name}
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, icon: preset.name }))}
                                  className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                    formData.icon === preset.name 
                                      ? "bg-primary text-white shadow-md scale-110" 
                                      : "bg-primary/5 text-primary/60 hover:bg-primary/10 hover:text-primary"
                                  )}
                                  title={preset.name}
                                >
                                  <Icon size={18} />
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
                                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all relative",
                                  formData.icon?.startsWith("http") 
                                    ? "bg-primary text-white shadow-md scale-110" 
                                    : "bg-primary/5 text-primary/60 hover:bg-primary/10 hover:text-primary"
                                )}
                                title="Upload Custom Icon"
                              >
                                {isUploadingIcon ? <Loader2 className="animate-spin" size={18} /> : (formData.icon?.startsWith("http") ? <img src={formData.icon} alt="Custom" className="w-6 h-6 rounded object-cover" /> : <Upload size={18} />)}
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>

                      <div className="pt-4 flex gap-3">
                         <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={() => setIsDialogOpen(false)}
                          className="h-12 flex-1 rounded-xl font-bold uppercase text-[11px] tracking-widest text-muted-foreground hover:bg-muted"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isAdding}
                          className="h-12 flex-[2] rounded-xl bg-primary text-white font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-primary/20"
                        >
                          {isAdding ? "Saving Category..." : "Confirm & Create"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogContent className="sm:max-w-[760px] rounded-2xl border border-primary/15 shadow-2xl p-0 overflow-hidden z-[100]">
                    <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-extrabold tracking-tight text-primary uppercase">Edit Category</DialogTitle>
                        <p className="text-[10px] font-semibold text-primary/45 uppercase tracking-[0.18em] mt-0.5">Update classification details</p>
                      </DialogHeader>
                    </div>
                    
                    <form onSubmit={handleEditCategory} className="p-6 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2 md:col-span-1">
                          <Label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70 ml-1">Type</Label>
                          <Select 
                            value={editFormData.type} 
                            onValueChange={(val) => setEditFormData(prev => ({ ...prev, type: val ?? "" }))}
                          >
                            <SelectTrigger className="w-full h-11 data-[size=default]:h-11 py-0 bg-primary/5 border border-primary/20 rounded-lg font-bold text-[11px] text-primary uppercase tracking-wider px-4 hover:border-primary/40 focus:ring-0 focus:border-primary/50">
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
                              placeholder="Enter manual type..."
                              value={editOtherType}
                              onChange={(e) => setEditOtherType(e.target.value)}
                              className="h-10 bg-primary/5 border border-primary/20 rounded-lg font-bold text-xs text-primary px-3 animate-in slide-in-from-top-2 placeholder:text-primary/30 focus-visible:border-primary/50 focus-visible:ring-0"
                            />
                          )}
                        </div>

                        <div className="space-y-2 md:col-span-1">
                          <Label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70 ml-1">Initial Status</Label>
                          <Select 
                            value={editFormData.status} 
                            onValueChange={(val) => setEditFormData(prev => ({ ...prev, status: val ?? "" }))}
                          >
                            <SelectTrigger className="w-full h-11 data-[size=default]:h-11 py-0 bg-primary/5 border border-primary/20 rounded-lg font-bold text-[11px] text-primary uppercase tracking-wider px-4 hover:border-primary/40 focus:ring-0 focus:border-primary/50">
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
                              placeholder="Enter manual status..."
                              value={editOtherStatus}
                              onChange={(e) => setEditOtherStatus(e.target.value)}
                              className="h-10 bg-primary/5 border border-primary/20 rounded-lg font-bold text-xs text-primary px-3 animate-in slide-in-from-top-2 placeholder:text-primary/30 focus-visible:border-primary/50 focus-visible:ring-0"
                            />
                          )}
                        </div>

                        <div className="space-y-2 md:col-span-1">
                          <Label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70 ml-1">Price Per Pc</Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary/45 text-xs">Rp</span>
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
                              className="h-11 bg-primary/5 border border-primary/20 rounded-lg font-bold text-sm text-primary pl-11 pr-4 focus-visible:border-primary/50 focus-visible:ring-0 placeholder:text-primary/30"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70 ml-1">Category Name</Label>
                        <Input
                          required
                          placeholder="e.g. FASHION, ELECTRONIC..."
                          value={editFormData.name}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="h-11 bg-primary/5 border border-primary/20 rounded-lg font-semibold text-sm text-primary px-4 focus-visible:border-primary/50 focus-visible:ring-0 placeholder:text-primary/30"
                        />
                      </div>
                      <div className="space-y-2 pt-4 border-t border-border/50">
                          <Label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70 ml-1">Category Icon</Label>
                          <div className="flex flex-wrap gap-2.5">
                            {PRESET_CATEGORY_ICONS.slice(0, 14).map((preset) => {
                              const Icon = preset.icon;
                              return (
                                <button
                                  key={preset.name}
                                  type="button"
                                  onClick={() => setEditFormData(prev => ({ ...prev, icon: preset.name }))}
                                  className={cn(
                                    "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                                    editFormData.icon === preset.name 
                                      ? "bg-primary text-white shadow-md scale-110" 
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
                                  "w-9 h-9 rounded-lg flex items-center justify-center transition-all relative",
                                  editFormData.icon?.startsWith("http") 
                                    ? "bg-primary text-white shadow-md scale-110" 
                                    : "bg-primary/5 text-primary/60 hover:bg-primary/10 hover:text-primary"
                                )}
                                title="Upload Custom Icon"
                              >
                                {isUploadingIcon ? <Loader2 className="animate-spin" size={16} /> : (editFormData.icon?.startsWith("http") ? <img src={editFormData.icon} alt="Custom" className="w-5 h-5 rounded object-cover" /> : <Upload size={16} />)}
                              </button>
                            </div>
                          </div>
                      </div>

                      <div className="pt-2 flex gap-3">
                         <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={() => setIsEditDialogOpen(false)}
                          className="h-10 flex-1 rounded-lg font-bold uppercase text-[11px] tracking-[0.15em] text-muted-foreground hover:bg-muted"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isEditing}
                          className="h-10 flex-[2] rounded-lg bg-primary text-white font-bold uppercase text-[11px] tracking-[0.15em] shadow-lg shadow-primary/20"
                        >
                          {isEditing ? "Saving Changes..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </header>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-border/60 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0 mx-3 sm:mx-4">
              {/* Table Summary Bar */}
              <div className="flex items-center justify-between px-6 py-3 bg-primary/[0.03] border-b border-border/40">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">
                  {displayedCategories.length} categories total
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary/40 inline-block" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Click row to view orders</span>
                </div>
              </div>

              <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 min-h-0">
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
                          className="group border-b border-border/30 hover:bg-primary/[0.025] transition-all duration-200 cursor-pointer"
                          onClick={() => handleCategoryClick(cat.id)}
                        >
                          {/* Row Number */}
                          <TableCell className="px-6 py-4">
                            <span className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center font-black text-[10px] text-primary/40 group-hover:bg-primary/10 transition-colors">
                              {index + 1}
                            </span>
                          </TableCell>

                          {/* Category Icon & Name */}
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center text-primary overflow-hidden border border-border/40 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                <CategoryIcon name={cat.icon} className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-black text-sm tracking-tight text-foreground uppercase group-hover:text-primary transition-colors">{cat.name}</span>
                                <span className="text-[10px] text-muted-foreground/40 font-bold tracking-[0.2em] uppercase">{cat.id.substring(0, 8)}</span>
                              </div>
                            </div>
                          </TableCell>

                          {/* Type Badge */}
                          <TableCell className="text-center py-4">
                            {cat.type ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-secondary/10 border border-secondary/20 text-[10px] font-black uppercase tracking-widest text-secondary-foreground/70">
                                {cat.type}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">—</span>
                            )}
                          </TableCell>

                          {/* Price */}
                          <TableCell className="text-center py-4">
                            <span className="text-xs font-black text-primary tracking-tight tabular-nums">
                              {cat.pricePerPc ? `Rp ${cat.pricePerPc.toLocaleString()}` : "—"}
                            </span>
                          </TableCell>

                          {/* Status Badge */}
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

                          {/* Date */}
                          <TableCell className="py-4">
                            <span className="text-[11px] font-bold text-muted-foreground/60 tabular-nums" suppressHydrationWarning>
                              {cat.createdAt ? format(new Date(cat.createdAt), "HH:mm, dd/MM/yyyy") : "—"}
                            </span>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-1.5 transition-opacity">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
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
                                <Edit2 size={14} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-red-500 hover:bg-red-50 transition-all"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (confirm("Are you sure? This will not delete orders, but they will become uncategorized.")) {
                                    try {
                                      await deleteCategory(cat.id);
                                      toast.success("Category removed");
                                    } catch (error) {
                                      toast.error("Failed to remove category");
                                    }
                                  }
                                }}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 px-3 sm:px-6 md:px-8 pb-4 sm:pb-8 gap-4 sm:gap-6">
            {/* Back button and filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/60 pb-3 sm:pb-4 gap-3 sm:gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsViewingCategories(true)}
                  className="h-8 sm:h-10 px-0 text-muted-foreground hover:text-primary font-bold text-[10px] sm:text-[11px] uppercase tracking-widest flex items-center gap-2"
                >
                  ← BACK TO CATEGORIES
                </Button>
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

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 bg-primary/[0.03] px-5 py-2 rounded-full border border-primary/10 shadow-sm">
                  {filteredOrders.length} RECORDS FOUND
                </div>
              </div>
            </div>

            {isOrdersLoading ? (
              <div className="flex flex-col items-center justify-center h-[40vh] space-y-4">
                <Loader2 className="animate-spin text-primary/40" size={32} />
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
