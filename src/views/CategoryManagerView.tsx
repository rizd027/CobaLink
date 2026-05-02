"use client";

import { useState, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Tag, 
  ArrowLeft,
  Search,
  LayoutGrid,
  Settings2,
  CheckCircle2,
  AlertCircle,
  Edit2
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useOrderStore } from "@/store/useOrderStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import { addCategory, deleteCategory } from "@/services/categories";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
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
import { Label } from "@/components/ui/label";

interface CategoryManagerViewProps {
  onBack: () => void;
}

export function CategoryManagerView({ onBack }: CategoryManagerViewProps) {
  const { categories } = useOrderStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "FASHION",
    status: "TO DO"
  });
  const [otherType, setOtherType] = useState("");
  const [otherStatus, setOtherStatus] = useState("");

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.name.trim()) return;
    setIsAdding(true);
    
    const finalType = formData.type === "OTHER" ? otherType : formData.type;
    const finalStatus = formData.status === "OTHER" ? otherStatus : formData.status;

    try {
      await addCategory(formData.name.trim(), finalType, finalStatus);
      setFormData({ name: "", type: "FASHION", status: "TO DO" });
      setOtherType("");
      setOtherStatus("");
      setIsDialogOpen(false);
      toast.success("Category created successfully");
    } catch (error) {
      toast.error("Failed to create category");
    } finally {
      setIsAdding(false);
    }
  };

  const confirmDialog = useConfirmStore((state) => state.confirm);

  const handleDelete = async (id: string) => {
    confirmDialog({
      title: "Hapus Kategori?",
      message: "Ini tidak akan menghapus pesanan, tetapi pesanan tersebut akan menjadi tidak berkategori.",
      onConfirm: async () => {
        try {
          await deleteCategory(id);
          toast.success("Category removed");
        } catch (error) {
          toast.error("Failed to remove category");
        }
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48" />
      
      {/* Header */}
      <div className="px-6 sm:px-12 py-8 flex items-center justify-between z-10 relative shrink-0 border-b border-border/40 backdrop-blur-xl bg-background/40">
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="w-12 h-12 rounded-2xl hover:bg-muted/50 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={24} />
          </Button>
          <div className="h-10 w-[1px] bg-border mx-2" />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <Tag className="text-primary" />
              Manage Categories
            </h1>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
              Organize your product hierarchy and data schemas
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 space-y-12">
          
          {/* Action Bar */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
              <div className="space-y-4 flex-1 max-w-2xl">
                 <div className="flex items-center gap-2 ml-1">
                    <div className="h-1.5 w-4 bg-primary rounded-full" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Administration</p>
                 </div>
                 
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger 
                      className={cn(
                        "h-14 rounded-2xl bg-primary text-white font-bold uppercase text-[12px] tracking-[0.2em] px-10 shadow-xl shadow-primary/20 hover:shadow-primary/40 group inline-flex items-center justify-center cursor-pointer"
                      )}
                    >
                      <Plus className="mr-3" size={20} />
                      Create Category
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-3xl border-2 border-primary/10 shadow-2xl p-0 overflow-hidden">
                      <div className="bg-primary/5 p-8 border-b border-primary/10">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-black tracking-tight text-primary uppercase">New Category</DialogTitle>
                          <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mt-1">Configure your new product classification</p>
                        </DialogHeader>
                      </div>
                      
                      <form onSubmit={handleAdd} className="p-8 space-y-6">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Category Name</Label>
                          <Input
                            required
                            placeholder="e.g. FASHION, ELECTRONIC..."
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="h-14 bg-muted/20 border-none rounded-xl font-bold text-base px-6 focus-visible:ring-primary/20"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Type</Label>
                            <Select 
                              value={formData.type} 
                              onValueChange={(val) => setFormData(prev => ({ ...prev, type: val ?? "" }))}
                            >
                              <SelectTrigger className="h-14 bg-muted/20 border-none rounded-xl font-bold text-sm px-6">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-border shadow-xl">
                                <SelectItem value="FASHION" className="font-bold text-xs uppercase tracking-wider">FASHION</SelectItem>
                                <SelectItem value="ELECTRONIC" className="font-bold text-xs uppercase tracking-wider">ELECTRONIC</SelectItem>
                                <SelectItem value="FOODS" className="font-bold text-xs uppercase tracking-wider">FOODS</SelectItem>
                                <SelectItem value="VEHICLE" className="font-bold text-xs uppercase tracking-wider">VEHICLE</SelectItem>
                                <SelectItem value="STATIONERY" className="font-bold text-xs uppercase tracking-wider">STATIONERY</SelectItem>
                                <SelectItem value="OTHER" className="font-bold text-xs uppercase tracking-wider text-primary">OTHER...</SelectItem>
                              </SelectContent>
                            </Select>
                            {formData.type === "OTHER" && (
                              <Input
                                required
                                placeholder="Enter manual type..."
                                value={otherType}
                                onChange={(e) => setOtherType(e.target.value)}
                                className="h-12 bg-primary/5 border-2 border-primary/10 rounded-xl font-bold text-xs px-4"
                              />
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Initial Status</Label>
                            <Select 
                              value={formData.status} 
                              onValueChange={(val) => setFormData(prev => ({ ...prev, status: val ?? "" }))}
                            >
                              <SelectTrigger className="h-14 bg-muted/20 border-none rounded-xl font-bold text-sm px-6">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-border shadow-xl">
                                <SelectItem value="TO DO" className="font-bold text-xs uppercase tracking-wider">TO DO</SelectItem>
                                <SelectItem value="IN PROGRESS" className="font-bold text-xs uppercase tracking-wider">IN PROGRESS</SelectItem>
                                <SelectItem value="COMPLETE" className="font-bold text-xs uppercase tracking-wider">COMPLETE</SelectItem>
                                <SelectItem value="OTHER" className="font-bold text-xs uppercase tracking-wider text-primary">OTHER...</SelectItem>
                              </SelectContent>
                            </Select>
                            {formData.status === "OTHER" && (
                              <Input
                                required
                                placeholder="Enter manual status..."
                                value={otherStatus}
                                onChange={(e) => setOtherStatus(e.target.value)}
                                className="h-12 bg-primary/5 border-2 border-primary/10 rounded-xl font-bold text-xs px-4"
                              />
                            )}
                          </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                           <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => setIsDialogOpen(false)}
                            className="h-14 flex-1 rounded-xl font-bold uppercase text-[11px] tracking-widest text-muted-foreground hover:bg-muted"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={isAdding}
                            className="h-14 flex-[2] rounded-xl bg-primary text-white font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-primary/20"
                          >
                            {isAdding ? "Saving Category..." : "Confirm & Create"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                 </Dialog>
              </div>

             <div className="flex items-center gap-4">
                <div className="relative group w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
                  <Input 
                    placeholder="Search categories..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 rounded-lg bg-gray-100/50 border-none font-bold text-sm focus-visible:ring-primary/20"
                  />
                </div>
             </div>
          </div>

          {/* Table List matching Image 2 */}
          <div className="bg-primary/[0.01] rounded-xl border border-border/80 shadow-sm overflow-hidden min-h-[400px]">
            <Table>
              <TableHeader className="bg-primary/[0.03] border-y border-border/60">
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="font-bold text-[11px] uppercase tracking-wider px-6 py-4 text-muted-foreground/60 w-[120px]">ID</TableHead>
                  <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground/60">Katagory Name</TableHead>
                  <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground/60 text-center">Type</TableHead>
                  <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground/60 text-center">Status</TableHead>
                  <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground/60 min-w-[150px]">Date Created</TableHead>
                  <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider px-6 text-muted-foreground/60 w-[120px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((cat) => (
                  <TableRow key={cat.id} className="group border-b border-border/40 hover:bg-primary/[0.01]">
                    <TableCell className="px-6 py-4 font-bold text-xs text-muted-foreground/60 uppercase">
                      {cat.id.substring(0, 6)}
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="font-bold text-sm tracking-tight text-foreground uppercase">{cat.name}</span>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                        {cat.type || "FASHION"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className="text-[10px] font-black text-primary/80 uppercase tracking-widest px-3 py-1 bg-primary/5 rounded-full">
                        {cat.status || "TO DO"}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-[11px] font-bold text-muted-foreground/80">
                        {cat.createdAt ? format(new Date(cat.createdAt), "HH:mm, dd/MM/yyyy") : "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-3">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-primary hover:bg-primary/5"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast("Edit feature coming soon");
                          }}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(cat.id)}
                          className="h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredCategories.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center">
                <AlertCircle size={48} className="text-muted-foreground/10 mb-4" />
                <h3 className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest">No Categories Found</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
