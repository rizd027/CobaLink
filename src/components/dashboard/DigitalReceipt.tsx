import { format } from "date-fns";
import { Order } from "@/services/orders";
import { Category } from "@/services/categories";
import { ProductField } from "@/services/fields";
import { User, Calendar, Tag, Info, Phone, MapPin } from "lucide-react";
import { CategoryIcon } from "./CategoryIcon";
import { useOrderStore } from "@/store/useOrderStore";

interface DigitalReceiptProps {
  order: Order | null;
  category: Category | null;
  fields: ProductField[];
  userEmail?: string;
}

export function DigitalReceipt({ order, category, fields, userEmail }: DigitalReceiptProps) {
  const { storeSettings } = useOrderStore();
  
  if (!order) return null;

  return (
    <div className="receipt-container bg-white p-10 text-black w-[210mm] min-h-[297mm] mx-auto shadow-2xl font-sans" id="printable-receipt">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-primary/30 pb-6 mb-6">
        <div className="flex gap-4 items-center">
          {storeSettings.logoUrl ? (
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-border/20 shadow-sm bg-muted/10">
              <img src={storeSettings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center text-white text-2xl font-black">
              {storeSettings.name?.[0]?.toUpperCase() || "O"}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-black tracking-tight text-primary uppercase">
              {storeSettings.name || "ORDER FLOW"}
            </h1>
            <div className="flex flex-col mt-1 space-y-0.5">
              {storeSettings.address && (
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  <MapPin size={10} className="text-primary/60" />
                  <span>{storeSettings.address}</span>
                </div>
              )}
              {storeSettings.phone && (
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  <Phone size={10} className="text-primary/60" />
                  <span>{storeSettings.phone}</span>
                </div>
              )}
              {!storeSettings.address && !storeSettings.phone && (
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Digital Receipt System</p>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-primary text-white px-4 py-2 rounded-md font-black text-xs uppercase tracking-[0.22em]">
            NOTA PESANAN
          </div>
          <p className="text-[11px] font-bold mt-2 text-muted-foreground">ID: {order.id?.substring(0, 8).toUpperCase()}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <User size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pelanggan</p>
              <p className="text-base font-bold leading-tight mt-0.5">{order.name}</p>
              <p className="text-xs font-medium text-muted-foreground mt-1">{order.phone}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
          <div className="flex items-center gap-3 justify-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Tanggal Transaksi</p>
              <p className="text-base font-bold leading-tight mt-0.5 text-right">{order.createdAt ? format(new Date(order.createdAt), "dd MMMM yyyy") : "-"}</p>
              <p className="text-xs font-medium text-muted-foreground mt-1 text-right">{order.createdAt ? format(new Date(order.createdAt), "HH:mm") : "-"}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Calendar size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Category Section */}
      <div className="bg-muted/25 rounded-xl p-5 mb-6 border border-border/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
            {category?.icon ? (
              <CategoryIcon name={category.icon} className="w-6 h-6" />
            ) : (
              <Tag size={24} />
            )}
          </div>
          <div className="flex-1">
             <div className="flex justify-between items-center">
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Kategori Pesanan</p>
                 <h2 className="text-xl font-black uppercase tracking-tight">{category?.name || "Uncategorized"}</h2>
               </div>
               <div className="text-right">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Harga Satuan</p>
                 <p className="text-xl font-black text-primary tabular-nums">
                   Rp {category?.pricePerPc?.toLocaleString("id-ID") || "0"}
                 </p>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="mb-8 flex-1">
        <div className="flex items-center gap-2.5 mb-4">
          <Info size={16} className="text-primary" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] border-b border-primary/20 pb-1 flex-1">Detail Spesifikasi</h3>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {Object.entries(order.data || {}).map(([key, value]) => (
            <div key={key} className="rounded-lg border border-border/40 bg-white p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1.5">{key}</p>
              <div className="text-sm font-bold text-foreground leading-snug">
                {(() => {
                  const field = fields.find(f => f.label === key);
                  if (field?.type === "currency") {
                    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
                  }
                  if (field?.type === "image" && value && value.toString().startsWith("http")) {
                    return (
                      <div className="mt-1.5 w-28 h-28 rounded-lg overflow-hidden border border-border/40 shadow-sm bg-muted/20">
                        <img src={value.toString()} alt={key} className="w-full h-full object-cover" />
                      </div>
                    );
                  }
                  return value?.toString() || "—";
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Notes */}
      <div className="mt-auto pt-6 border-t border-border/40">
        <div className="grid grid-cols-2 gap-8 items-end">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2.5">Syarat & Ketentuan</h4>
            {storeSettings.footerNote ? (
              <p className="text-[9px] font-medium text-muted-foreground leading-relaxed whitespace-pre-line">
                {storeSettings.footerNote}
              </p>
            ) : (
              <ul className="text-[9px] font-medium text-muted-foreground leading-relaxed space-y-1">
                <li>• Nota ini adalah bukti pemesanan yang sah.</li>
                <li>• Perubahan data maksimal 1x24 jam setelah nota diterbitkan.</li>
                <li>• Pesanan diproses setelah konfirmasi pembayaran diterima.</li>
              </ul>
            )}
          </div>
          <div className="text-center flex flex-col items-center">
            {storeSettings.signatureUrl ? (
              <div className="h-20 w-32 mb-2 flex items-center justify-center">
                <img src={storeSettings.signatureUrl} alt="Signature" className="max-h-full max-w-full object-contain mix-blend-multiply" />
              </div>
            ) : (
              <div className="h-20" />
            )}
            <div className="border-t border-black/20 pt-2 w-full max-w-[150px]">
              <p className="text-[10px] font-black uppercase tracking-widest">{storeSettings.name || userEmail?.split("@")[0] || "Administrator"}</p>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Authorized Staff</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Specific CSS */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 15mm;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            z-index: 9999;
          }
          #printable-receipt .bg-muted\\/20,
          #printable-receipt .bg-muted\\/25,
          #printable-receipt .bg-primary\\/5,
          #printable-receipt .bg-primary\\/10 {
            background: #ffffff !important;
          }
          #printable-receipt .shadow-2xl,
          #printable-receipt .shadow-xl,
          #printable-receipt .shadow-lg,
          #printable-receipt .shadow-md,
          #printable-receipt .shadow-sm {
            box-shadow: none !important;
          }
          #printable-receipt .rounded-xl,
          #printable-receipt .rounded-lg,
          #printable-receipt .rounded-md {
            border-radius: 8px !important;
          }
          #printable-receipt .border,
          #printable-receipt .border-black\\/20,
          #printable-receipt .border-border\\/40,
          #printable-receipt .border-border\\/50,
          #printable-receipt .border-primary\\/30 {
            border-color: #d4d4d8 !important;
          }
          #printable-receipt img {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
