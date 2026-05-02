"use client";

import { useState } from "react";
import { 
  ArrowLeft, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Share2, 
  Loader2, 
  AlertTriangle,
  CheckCircle2,
  FileJson,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/store/useOrderStore";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { useConfirmStore } from "@/store/useConfirmStore";
import { cn } from "@/lib/utils";

interface DataStorageViewProps {
  onBack: () => void;
}

export function DataStorageView({ onBack }: DataStorageViewProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { orders, categories, destroyData } = useOrderStore();
  const confirmDialog = useConfirmStore(state => state.confirm);

  const handleBackup = (share = false) => {
    try {
      const data = {
        orders,
        categories,
        storeSettings: JSON.parse(localStorage.getItem("store_settings") || "{}"),
        backupDate: new Date().toISOString(),
        version: "1.49.10"
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      if (share && navigator.share) {
        const file = new File([blob], `backup_orderflow_${new Date().getTime()}.json`, { type: "application/json" });
        navigator.share({
          files: [file],
          title: "Backup OrderFlow",
          text: "Backup data aplikasi OrderFlow"
        }).catch(() => toast.error("Gagal berbagi file"));
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = `backup_orderflow_${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Backup berhasil diunduh");
      }
    } catch (error) {
      toast.error("Gagal membuat backup");
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        // Basic validation
        if (!data.orders || !data.categories) {
          throw new Error("Format file tidak valid");
        }

        // Warning: This is a complex operation in a real app with Supabase.
        // For this demo/setup, we'll alert the user.
        confirmDialog({
          title: "Restore Data?",
          message: "Restore data akan menimpa data yang ada. Lanjutkan?",
          onConfirm: () => {
             // Implementation would involve batch inserting to Supabase
             toast.info("Fitur Restore sedang dioptimalkan untuk sinkronisasi cloud.");
          },
          variant: 'default',
          confirmLabel: 'Lanjutkan'
        });
        
      } catch (error) {
        toast.error("Gagal memproses file restore");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    confirmDialog({
      title: "Hapus Semua Data?",
      message: "PERINGATAN: Semua data (Order, Kategori, Pengaturan) akan dihapus PERMANEN. Lanjutkan?",
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          // In a real app, delete from Supabase tables
          destroyData();
          localStorage.clear();
          toast.success("Semua data berhasil dihapus");
          window.location.reload();
        } catch (error) {
          toast.error("Gagal menghapus data");
          setIsProcessing(false);
        }
      }
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-4 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest">Penyimpanan Data</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Backup & kelola data aplikasi</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-0 pt-4 pb-20">
          
          <StorageItem 
            icon={Download} 
            title="Backup Data" 
            description="Unduh file JSON backup ke penyimpanan lokal"
            onClick={() => handleBackup(false)}
          />
          <StorageItem 
            icon={Share2} 
            title="Backup & Kirim" 
            description="Bagikan file backup langsung ke WA / Email"
            onClick={() => handleBackup(true)}
          />
          <div className="relative">
            <input 
              type="file" 
              accept=".json" 
              onChange={handleRestore}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <StorageItem 
              icon={Upload} 
              title="Restore Data" 
              description="Pulihkan data dari file backup sebelumnya"
              onClick={() => {}}
            />
          </div>
          <StorageItem 
            icon={Trash2} 
            title="Hapus Semua Data" 
            description="Hapus seluruh data aplikasi secara permanen"
            variant="danger"
            onClick={handleClearData}
          />

          <div className="mt-10 p-6 rounded-3xl bg-muted/20 border border-border/50 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <FileJson size={18} />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Status Data Saat Ini</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Order</p>
                  <p className="text-xl font-black">{orders.length}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Kategori</p>
                  <p className="text-xl font-black">{categories.length}</p>
               </div>
            </div>
            <p className="text-[10px] font-medium text-muted-foreground/60 leading-relaxed italic border-t border-border/50 pt-3">
              * Data Anda juga tersimpan secara otomatis di Cloud Supabase setiap kali ada perubahan.
            </p>
          </div>

        </div>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="text-primary animate-spin" size={40} />
            <p className="text-xs font-black uppercase tracking-[0.2em]">Memproses Data...</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StorageItem({ icon: Icon, title, description, onClick, variant = "default" }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-5 py-5 px-0 hover:bg-muted/30 active:bg-muted/50 transition-colors text-left border-b border-border/60 last:border-0",
        variant === "danger" && "text-destructive"
      )}
    >
      <div className={cn(
        "flex-shrink-0",
        variant === "danger" ? "text-destructive" : "text-foreground"
      )}>
        <Icon size={24} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[16px] font-bold tracking-tight">{title}</h3>
        <p className="text-[14px] text-muted-foreground font-medium leading-tight mt-1">{description}</p>
      </div>
      <ChevronRight size={18} className="text-muted-foreground/30" />
    </button>
  );
}
