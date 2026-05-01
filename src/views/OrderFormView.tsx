"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { 
  Plus,
  Loader2, 
  Upload, 
  X, 
  Save, 
  Phone, 
  CheckCircle2, 
  Circle, 
  Type, 
  Hash, 
  ChevronDown, 
  CheckSquare,
  User,
  Package,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Image as ImageIcon,
  ArrowLeft,
  Star,
  Banknote
} from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Order, addOrder, updateOrder } from "@/services/orders";
import { uploadPaymentProof, uploadImage } from "@/services/storage";
import { getFieldsByProduct, ProductField } from "@/services/fields";
import { cn } from "@/lib/utils";
import { useOrderStore } from "@/store/useOrderStore";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const baseSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  phone: z.string().min(10, "Invalid phone number"),
  categoryId: z.string().min(1, "Category is required"),
});

interface OrderFormViewProps {
  order?: Order | null;
  onBack: () => void;
}

interface OrderFormValues {
  name: string;
  phone: string;
  categoryId: string;
  data: Record<string, any>;
}

export function OrderFormView({ order, onBack }: OrderFormViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFieldsLoading, setIsFieldsLoading] = useState(false);
  const [dialogFields, setDialogFields] = useState<ProductField[]>([]);
  
  const [dynamicFiles, setDynamicFiles] = useState<Record<string, File>>({});
  const [dynamicPreviews, setDynamicPreviews] = useState<Record<string, string>>({});

  const { categories, selectedCategoryId, upsertOrder } = useOrderStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const dynamicSchema = z.object({
    ...baseSchema.shape,
    data: z.record(z.string(), z.any()).superRefine((data, ctx) => {
      dialogFields.forEach(field => {
        if (field.isRequired && !data[field.label]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${field.label} is required`,
            path: [field.label]
          });
        }
      });
    })
  });

  const form = useForm<OrderFormValues>({
    // @ts-ignore
    resolver: (zodResolver as any)(dynamicSchema),
    defaultValues: {
      name: "",
      phone: "",
      categoryId: selectedCategoryId !== "all" ? selectedCategoryId : (categories[0]?.id || ""),
      data: {},
    },
  });

  const currentCategoryId = form.watch("categoryId");

  useEffect(() => {
    async function fetchFields() {
      if (!currentCategoryId) {
        setDialogFields([]);
        return;
      }
      setIsFieldsLoading(true);
      try {
        const fields = await getFieldsByProduct(currentCategoryId);
        setDialogFields(fields);
        
        const currentData = form.getValues("data") || {};
        const newData = { ...currentData };
        let changed = false;

        fields.forEach(f => {
          if (f.type === "checkbox") {
            if (newData[f.label] === undefined) {
              newData[f.label] = false;
              changed = true;
            } else if (typeof newData[f.label] !== "boolean") {
              newData[f.label] = newData[f.label] === "true" || newData[f.label] === 1 || newData[f.label] === "1";
              changed = true;
            }
          } else if (newData[f.label] === undefined) {
            if (f.type === "number" || f.type === "rating" || f.type === "scale") newData[f.label] = 0;
            else newData[f.label] = "";
            changed = true;
          }
        });

        if (changed) {
           form.setValue("data", newData);
        }
      } catch (error) {
        console.error("Failed to fetch fields:", error);
      } finally {
        setIsFieldsLoading(false);
      }
    }
    fetchFields();
  }, [currentCategoryId, order, form]);

  useEffect(() => {
    if (order) {
      form.reset({
        name: order.name,
        phone: order.phone,
        categoryId: order.categoryId || "",
        data: order.data || {},
      });
    }
  }, [order, form]);

  useGSAP(() => {
    if (containerRef.current) {
      const sections = containerRef.current.querySelectorAll(".form-section");
      gsap.fromTo(sections, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" }
      );
    }
  }, { dependencies: [] });



  const handleDynamicFileChange = (e: React.ChangeEvent<HTMLInputElement>, label: string) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setDynamicFiles(prev => ({ ...prev, [label]: selectedFile }));
      const reader = new FileReader();
      reader.onloadend = () => setDynamicPreviews(prev => ({ ...prev, [label]: reader.result as string }));
      reader.readAsDataURL(selectedFile);
      form.setValue(`data.${label}`, "pending_upload", { shouldValidate: true });
    }
  };

  const onSubmit = async (values: OrderFormValues) => {
    setIsLoading(true);
    try {
      const dynamicData = { ...values.data };

      for (const field of dialogFields) {
        if (field.type === 'image' && dynamicFiles[field.label]) {
          dynamicData[field.label] = await uploadImage(dynamicFiles[field.label], "orderflow_products");
        }
      }

      const finalValues = { ...values, data: dynamicData };

      if (order?.id) {
        const updated = await updateOrder(order.id, finalValues);
        upsertOrder(updated);
        toast.success("Order updated successfully");
      } else {
        const created = await addOrder(finalValues);
        upsertOrder(created);
        toast.success("Order added successfully");
      }
      onBack();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Dynamic Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-80 -mt-80 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none" />

      {/* Modern Navigation Header */}
      <div className="px-6 sm:px-12 py-4 flex items-center justify-between z-20 relative shrink-0 border-b border-border/40 backdrop-blur-xl bg-background/60">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="w-9 h-9 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all active:scale-90"
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="h-5 w-[1px] bg-border/60" />
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2.5">
              {order ? "Edit Order" : "New Order"}
              {!order && <Sparkles size={16} className="text-primary animate-pulse" />}
            </h1>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-50">
               Formulir transaksi pesanan pelanggan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onBack} 
            className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all"
          >
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isLoading} 
            className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] bg-primary text-primary-foreground shadow-lg shadow-primary/10 transition-all active:scale-[0.98] hover:shadow-primary/20"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
              <span className="flex items-center gap-2">
                <Sparkles size={14} /> {order ? "Update" : "Create"}
              </span>
            )}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0 relative z-10" ref={formRef}>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto px-6 sm:px-12 py-6" ref={containerRef}>
              
              <div className="space-y-6">
                
                {/* SECTION 1: IDENTITY */}
                <div className="form-section group">
                  <div className="bg-card/40 border border-border/50 rounded-2xl p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                          <User size={16} />
                       </div>
                       <div>
                         <h2 className="text-sm font-black uppercase tracking-[0.15em]">Customer Identity</h2>
                         <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider opacity-60">Informasi dasar pelanggan</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <FormField
                         control={form.control}
                         name="name"
                         render={({ field }) => (
                           <FormItem className="space-y-2.5">
                             <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</FormLabel>
                             <FormControl>
                               <div className="relative group/input">
                                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within/input:text-primary transition-colors" size={18} />
                                 <Input 
                                   placeholder="e.g. Alex Johnson" 
                                   {...field} 
                                   className="pl-12 rounded-xl border-border/60 bg-background/50 h-14 font-semibold text-sm focus-visible:ring-primary/20 transition-all shadow-sm group-hover/input:border-primary/30" 
                                 />
                               </div>
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />

                       <FormField
                         control={form.control}
                         name="phone"
                         render={({ field }) => (
                           <FormItem className="space-y-2.5">
                             <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">WhatsApp Number</FormLabel>
                             <FormControl>
                               <div className="relative group/input">
                                 <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within/input:text-primary transition-colors" size={18} />
                                 <Input 
                                   placeholder="+62 8..." 
                                   {...field} 
                                   className="pl-12 rounded-xl border-border/60 bg-background/50 h-14 font-semibold text-sm focus-visible:ring-primary/20 transition-all shadow-sm group-hover/input:border-primary/30" 
                                 />
                               </div>
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: SPECIFICATIONS */}
                <div className="form-section">
                  <div className="bg-card/40 border border-border/50 rounded-2xl p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                          <Package size={16} />
                       </div>
                       <div>
                         <h2 className="text-sm font-black uppercase tracking-[0.15em]">Product Specifications</h2>
                         <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider opacity-60">Detail pesanan yang dipilih</p>
                       </div>
                    </div>

                    {isFieldsLoading ? (
                       <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                          <Loader2 className="animate-spin text-primary" size={28} />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Loading custom schema...</p>
                       </div>
                     ) : dialogFields.length > 0 ? (
                       <div className="flex flex-col gap-y-8">
                         {dialogFields.map((field) => (
                           <FormField
                             key={field.id}
                             control={form.control}
                             name={`data.${field.label}`}
                             render={({ field: formField }) => (
                               <FormItem className={cn("space-y-2.5", (field.type === "textarea" || field.type === "image") && "md:col-span-2")}>
                                 <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 ml-1">
                                   {field.label}
                                   {field.isRequired && <span className="text-rose-500 font-black">*</span>}
                                 </FormLabel>
                                 <FormControl>
                                   {field.type === "select" ? (
                                     <Select 
                                       onValueChange={formField.onChange} 
                                       value={formField.value}
                                     >
                                       <SelectTrigger className="h-14 rounded-xl bg-background/50 border-border/60 focus:ring-primary/20 transition-all font-semibold text-sm shadow-sm hover:border-primary/30">
                                         <SelectValue placeholder={`Select ${field.label}`} />
                                       </SelectTrigger>
                                       <SelectContent className="rounded-xl border-border shadow-2xl p-1">
                                         {field.options?.split(",").map(opt => (
                                           <SelectItem key={opt.trim()} value={opt.trim()} className="font-semibold text-xs py-3 px-4 rounded-lg">
                                             {opt.trim()}
                                           </SelectItem>
                                         ))}
                                       </SelectContent>
                                     </Select>
                                   ) : field.type === "checkbox" ? (
                                     <div className="flex items-center justify-between h-14 px-5 rounded-xl bg-background/50 border border-border/60 shadow-sm hover:border-primary/30 transition-all group/toggle">
                                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover/toggle:text-foreground transition-colors">
                                         Aktifkan {field.label}
                                       </span>
                                       <button
                                         type="button"
                                         onClick={() => formField.onChange(!formField.value)}
                                         className={cn(
                                           "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 focus:outline-none",
                                           formField.value ? "bg-primary shadow-lg shadow-primary/20" : "bg-muted-foreground/20"
                                         )}
                                       >
                                         <span
                                           className={cn(
                                             "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-md ring-0 transition-all duration-300",
                                             formField.value ? "translate-x-6" : "translate-x-1"
                                           )}
                                         />
                                       </button>
                                     </div>
                                   ) : field.type === "image" ? (
                                     <div className="space-y-4">
                                       <div className="group relative">
                                         {(dynamicPreviews[field.label] || formField.value) ? (
                                           <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-muted/20">
                                             <img src={dynamicPreviews[field.label] || formField.value} alt={field.label} className="w-full h-full object-cover" />
                                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm">
                                               <Button type="button" variant="destructive" size="sm" onClick={() => {
                                                 setDynamicFiles(prev => { const next = { ...prev }; delete next[field.label]; return next; });
                                                 setDynamicPreviews(prev => { const next = { ...prev }; delete next[field.label]; return next; });
                                                 formField.onChange("");
                                               }} className="rounded-xl px-5 h-10 font-black text-[10px] uppercase tracking-widest">
                                                 Ganti Gambar
                                               </Button>
                                             </div>
                                           </div>
                                         ) : (
                                           <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 transition-all border-border/60 hover:border-primary/50 hover:bg-primary/5 cursor-pointer group bg-background/30">
                                             <Upload size={20} className="text-muted-foreground group-hover:text-primary transition-colors mb-4" />
                                             <span className="text-[10px] font-black uppercase tracking-widest text-foreground opacity-60">Upload {field.label}</span>
                                             <input type="file" className="hidden" accept="image/*" onChange={(e) => handleDynamicFileChange(e, field.label)} />
                                           </label>
                                         )}
                                       </div>
                                     </div>
                                   ) : field.type === "radio" ? (
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                       {field.options?.split(",").filter(Boolean).map(opt => (
                                         <button key={opt.trim()} type="button" onClick={() => formField.onChange(opt.trim())}
                                           className={cn("flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left group/opt",
                                             formField.value === opt.trim() ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 hover:border-border bg-background/50")}>
                                           <div className={cn("w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
                                             formField.value === opt.trim() ? "border-primary" : "border-muted-foreground/40 group-hover/opt:border-muted-foreground/60")}>
                                             {formField.value === opt.trim() && <div className="w-2 h-2 rounded-full bg-primary" />}
                                           </div>
                                           <span className={cn("font-bold text-xs", formField.value === opt.trim() ? "text-foreground" : "text-muted-foreground group-hover/opt:text-foreground/80")}>
                                             {opt.trim()}
                                           </span>
                                         </button>
                                       ))}
                                     </div>
                                   ) : field.type === "scale" ? (
                                     (() => {
                                       const parts = field.options ? field.options.split(",") : ["1","5"];
                                       const min = parseInt(parts[0]) || 1;
                                       const max = parseInt(parts[1]) || 5;
                                       const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);
                                       return (
                                         <div className="flex flex-wrap gap-2.5">
                                           {steps.map((n) => (
                                             <button key={n} type="button" onClick={() => formField.onChange(n)}
                                               className={cn("w-12 h-12 rounded-xl border font-black text-xs transition-all",
                                                 Number(formField.value) === n ? "border-primary bg-primary text-primary-foreground shadow-lg scale-110" : "border-border/60 hover:border-primary/40 text-muted-foreground hover:text-foreground bg-background/50")}>
                                               {n}
                                             </button>
                                           ))}
                                         </div>
                                       );
                                     })()
                                   ) : field.type === "rating" ? (
                                     <div className="flex items-center gap-2 px-1">
                                       {[1,2,3,4,5].map((star) => (
                                         <button key={star} type="button" onClick={() => formField.onChange(formField.value === star ? 0 : star)} className="transition-all active:scale-90 group/star">
                                           <Star size={28} className={cn("transition-all duration-300",
                                             Number(formField.value) >= star ? "fill-amber-400 text-amber-400 scale-110" : "fill-muted/20 text-muted-foreground/20 group-hover/star:text-amber-300/50")} />
                                         </button>
                                       ))}
                                     </div>
                                   ) : field.type === "currency" ? (
                                     <div className="relative group/input">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within/input:text-primary transition-colors">
                                          <Banknote size={18} />
                                        </div>
                                        <Input
                                          type="text"
                                          placeholder={`Isi ${field.label}...`}
                                          value={formField.value ? Number(formField.value.toString().replace(/\D/g, "")).toLocaleString("id-ID") : ""}
                                          onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            formField.onChange(val);
                                          }}
                                          className="h-14 pl-12 rounded-xl bg-background/50 border-border/60 focus-visible:ring-primary/20 transition-all font-semibold text-sm shadow-sm hover:border-primary/30"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[10px] text-primary/40 uppercase">IDR</div>
                                     </div>
                                   ) : field.type === "textarea" ? (
                                     <Textarea 
                                       {...formField} 
                                       placeholder={`Tulis ${field.label}...`} 
                                       className="w-full min-h-[120px] rounded-xl bg-background/50 border border-border/60 focus-visible:ring-primary/20 transition-all font-semibold text-sm shadow-sm px-5 py-4 placeholder:text-muted-foreground/40" 
                                     />
                                   ) : (
                                     <div className="relative group/input">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within/input:text-primary transition-colors">
                                          {field.type === "number" ? <Hash size={18} /> : field.type === "date" ? <ImageIcon size={18} /> : <Type size={18} />}
                                        </div>
                                        <Input
                                          {...formField}
                                          type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "time" ? "time" : "text"}
                                          placeholder={`Isi ${field.label}...`}
                                          className="h-14 pl-12 rounded-xl bg-background/50 border-border/60 focus-visible:ring-primary/20 transition-all font-semibold text-sm shadow-sm hover:border-primary/30"
                                        />
                                     </div>
                                   )}
                                 </FormControl>
                                 <FormMessage className="text-[10px] font-bold uppercase tracking-widest ml-1" />
                               </FormItem>
                             )}
                           />
                         ))}
                       </div>
                     ) : (
                       <div className="py-20 text-center border-2 border-dashed border-border/40 rounded-3xl bg-background/20">
                         <Package className="mx-auto text-muted-foreground/10 mb-4" size={40} />
                         <h3 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">No custom specifications for this category</h3>
                       </div>
                     )}
                  </div>
                </div>

              </div>
            </div>
          </div>

        </form>
      </Form>
    </div>
  );
}
