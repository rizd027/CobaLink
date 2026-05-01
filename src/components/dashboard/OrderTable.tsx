"use client";

import { useState, useRef } from "react";
import { format } from "date-fns";
import { 
  MoreHorizontal, 
  Search, 
  Trash2, 
  Edit, 
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Circle,
  Image as ImageIcon,
  Printer,
  Star
} from "lucide-react";
import { DigitalReceipt } from "./DigitalReceipt";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Order, deleteOrder, updateOrder } from "@/services/orders";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useOrderStore } from "@/store/useOrderStore";
import { useAuthStore } from "@/store/authStore";

interface OrderTableProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  embedded?: boolean;
}

export function OrderTable({ orders, onEdit, embedded = false }: OrderTableProps) {
  const { productFields, selectedCategoryId, categories } = useOrderStore();
  const { user } = useAuthStore();
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const showCategoryColumn = selectedCategoryId === "all";

  const filteredOrders = orders;

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(id);
        toast.success("Order deleted");
      } catch (error) {
        toast.error("Failed to delete order");
      }
    }
  };

  const handleInlineUpdate = async (orderId: string, field: string, value: any) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      
      const newData = { ...order.data, [field]: value };
      await updateOrder(orderId, { data: newData });
      
      // Visual feedback: brief highlight
      const cell = document.getElementById(`cell-${orderId}-${field}`);
      if (cell) {
        cell.classList.add("bg-primary/10");
        setTimeout(() => {
          cell.classList.remove("bg-primary/10");
        }, 200);
      }
      toast.success("Updated", { duration: 800, position: "bottom-right" });
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const openWhatsApp = (phoneNumber: string, name: string) => {
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    let formattedNumber = cleanNumber;
    if (cleanNumber.startsWith("0")) {
      formattedNumber = "62" + cleanNumber.substring(1);
    }
    const message = encodeURIComponent(`Halo ${name}, saya ingin mengonfirmasi pesanan Anda.`);
    window.open(`https://wa.me/${formattedNumber}?text=${message}`, "_blank");
  };

  const handlePrint = (order: Order) => {
    setPrintingOrder(order);
    toast.success("Preparing professional receipt...");
    // Give state a moment to update before printing
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full">
      <div
        className={cn(
          "overflow-hidden flex-1 flex flex-col min-h-0 h-full",
          embedded
            ? "rounded-xl border border-border/50 bg-background/85"
            : "bg-white rounded-2xl border border-border/60 shadow-md",
        )}
      >
        <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 min-h-0">
          <Table>
            <TableHeader className={cn("border-y border-border/40", embedded ? "bg-muted/20" : "bg-card shadow-sm")}>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className={cn("font-bold text-[10px] uppercase tracking-widest text-muted-foreground/40 w-[80px]", embedded ? "px-4 py-3.5" : "px-6 py-4")}>ID</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground/40 min-w-[180px]">CUSTOMER INFO</TableHead>
                {showCategoryColumn && (
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground/40 min-w-[140px] text-center">
                    CATEGORY
                  </TableHead>
                )}
                {productFields.map(field => (
                  <TableHead key={field.id} className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground/40 text-center">
                    {field.label.toUpperCase()}
                  </TableHead>
                ))}
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground/40 min-w-[150px]">DATE CREATED</TableHead>
                <TableHead className={cn("text-right font-bold text-[10px] uppercase tracking-widest text-muted-foreground/40 w-[120px]", embedded ? "px-4" : "px-6")}>ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody ref={tableBodyRef}>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <TableRow
                    key={order.id}
                    className="group border-b border-border/40 hover:bg-primary/[0.01]"
                  >
                    <TableCell className={cn("font-medium text-xs text-muted-foreground/60", embedded ? "px-4" : "px-6")}>
                      {index + 1}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-sm tracking-tight text-foreground uppercase">{order.name}</span>
                        <span className="text-[10px] text-muted-foreground/60 font-medium tracking-wide">{order.phone}</span>
                      </div>
                    </TableCell>

                    {showCategoryColumn && (
                      <TableCell className="text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-wide text-primary/80">
                          {categories.find((cat) => cat.id === order.categoryId)?.name || "UNCATEGORIZED"}
                        </span>
                      </TableCell>
                    )}

                    {/* Dynamic Columns */}
                    {productFields.map(field => (
                      <TableCell 
                        key={field.id} 
                        id={`cell-${order.id}-${field.label}`}
                        className="text-center p-0 group/cell border-x border-border/10 last:border-r-0"
                      >
                        {field.type === "select" || field.type === "radio" ? (
                           <div className="h-12 flex items-center justify-center">
                             <span className="font-bold text-xs uppercase tracking-wider text-foreground/80">
                               {(order.data?.[field.label]) || "—"}
                             </span>
                           </div>
                        ) : field.type === "checkbox" ? (
                          <div className="flex justify-center items-center h-12">
                             <div className={cn(
                               "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                               order.data?.[field.label] ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/20 bg-transparent"
                             )}>
                               {order.data?.[field.label] && <CheckCircle2 size={12} />}
                             </div>
                          </div>
                        ) : field.type === "currency" ? (
                           <div className="h-12 flex items-center justify-center px-4">
                             <span className="font-bold text-xs uppercase tracking-wider text-primary tabular-nums">
                               {order.data?.[field.label] ? `Rp ${Number(order.data[field.label]).toLocaleString("id-ID")}` : "—"}
                             </span>
                           </div>
                        ) : field.type === "rating" ? (
                           <div className="flex justify-center items-center h-12 gap-0.5">
                             {[1, 2, 3, 4, 5].map((star) => (
                               <Star
                                 key={star}
                                 size={12}
                                 className={cn(
                                   Number(order.data?.[field.label] || 0) >= star
                                     ? "fill-amber-400 text-amber-400"
                                     : "fill-muted/10 text-muted-foreground/10"
                                 )}
                                />
                             ))}
                           </div>
                        ) : field.type === "image" ? (
                          <div className="flex justify-center items-center h-12">
                             {order.data?.[field.label] ? (
                               <a 
                                 href={order.data?.[field.label]} 
                                 target="_blank" 
                                 rel="noreferrer" 
                                 className="block w-8 h-8 rounded-lg overflow-hidden border border-border shadow-sm hover:scale-110 transition-transform duration-300"
                               >
                                 <img src={order.data?.[field.label]} alt={field.label} className="w-full h-full object-cover" />
                               </a>
                             ) : (
                               <div className="w-8 h-8 rounded-lg bg-muted/30 border border-dashed border-border/60 flex items-center justify-center text-muted-foreground/20">
                                 <ImageIcon size={12} />
                               </div>
                             )}
                          </div>
                        ) : (
                          <div className="h-12 flex items-center justify-center px-4">
                             <span className="font-bold text-xs uppercase tracking-wider text-foreground/80 truncate max-w-[200px]">
                               {(order.data?.[field.label]) || "—"}
                             </span>
                          </div>
                        )}
                      </TableCell>
                    ))}

                    <TableCell>
                      <span className="text-[11px] font-bold text-muted-foreground/80" suppressHydrationWarning>
                        {order.createdAt ? format(new Date(order.createdAt), "HH:mm, dd/MM/yyyy") : "-"}
                      </span>
                    </TableCell>
                    <TableCell className={cn("text-right", embedded ? "px-4" : "px-6")}>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-blue-500 hover:bg-blue-50 transition-all"
                          onClick={() => handlePrint(order)}
                          title="Cetak Nota"
                        >
                          <Printer size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-primary hover:bg-primary/5 transition-all"
                          onClick={() => onEdit(order)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-red-500 hover:bg-red-50 transition-all"
                          onClick={() => handleDelete(order.id!)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={productFields.length + 4 + (showCategoryColumn ? 1 : 0)} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30">
                      <Search size={48} className="mb-4 text-primary/40" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">No matching records found</p>
                      <p className="text-xs font-bold text-muted-foreground mt-2">Try adjusting your filters or search term</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Hidden Receipt for Printing */}
      <div className="hidden print:block">
        <DigitalReceipt 
          order={printingOrder}
          category={categories.find(c => c.id === printingOrder?.categoryId) || null}
          fields={productFields}
          userEmail={user?.email}
        />
      </div>
    </div>
  );
}
