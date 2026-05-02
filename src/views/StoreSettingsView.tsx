"use client";

import { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, 
  Save, 
  Store, 
  MapPin, 
  Phone, 
  FileText, 
  Image as ImageIcon, 
  Pencil, 
  Upload,
  X,
  Check,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOrderStore } from "@/store/useOrderStore";
import { SignaturePad } from "@/components/dashboard/SignaturePad";
import { uploadImage } from "@/services/storage";
import { updateStoreSettings } from "@/services/settings";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StoreSettingsViewProps {
  onBack: () => void;
}

export function StoreSettingsView({ onBack }: StoreSettingsViewProps) {
  const { storeSettings, setStoreSettings } = useOrderStore();
  const [isSaving, setIsSaving] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [localSettings, setLocalSettings] = useState(storeSettings);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalSettings(storeSettings);
  }, [storeSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const url = await uploadImage(file, "store_logos");
      setLocalSettings(prev => ({ ...prev, logoUrl: url }));
      toast.success("Logo berhasil diunggah");
    } catch (error) {
      toast.error("Gagal mengunggah logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSignatureSave = async (dataUrl: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "signature.png", { type: "image/png" });
      
      const url = await uploadImage(file, "store_signatures");
      setLocalSettings(prev => ({ ...prev, signatureUrl: url }));
      setShowSignaturePad(false);
      toast.success("Tanda tangan berhasil disimpan");
    } catch (error) {
      toast.error("Gagal menyimpan tanda tangan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await updateStoreSettings(localSettings);
      setStoreSettings(localSettings);
      localStorage.setItem("store_settings", JSON.stringify(localSettings));
      toast.success("Informasi toko berhasil diperbarui ke cloud");
      onBack();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan pengaturan ke cloud");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-4 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest">Toko Saya</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Atur informasi & identitas toko</p>
          </div>
        </div>
        <Button 
          onClick={handleSaveAll} 
          disabled={isSaving}
          className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
          Simpan
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-8 pb-10">
          
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <ImageIcon size={18} />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Logo Toko</h3>
            </div>
            <div className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-border bg-muted/20 gap-4">
              {localSettings.logoUrl ? (
                <div className="relative group">
                  <img 
                    src={localSettings.logoUrl} 
                    alt="Logo Toko" 
                    className="w-32 h-32 object-contain rounded-2xl bg-white p-2 shadow-sm"
                  />
                  <button 
                    onClick={() => setLocalSettings(prev => ({ ...prev, logoUrl: "" }))}
                    className="absolute -top-2 -right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-background flex items-center justify-center text-muted-foreground border border-border">
                  <Store size={40} strokeWidth={1.5} />
                </div>
              )}
              <input 
                type="file" 
                ref={logoInputRef} 
                onChange={handleLogoUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <Button 
                variant="outline" 
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploadingLogo}
                className="h-9 rounded-xl font-black text-[10px] uppercase tracking-widest"
              >
                {isUploadingLogo ? <Loader2 size={14} className="animate-spin mr-2" /> : <Upload size={14} className="mr-2" />}
                Pilih Logo
              </Button>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Store size={18} />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Informasi Dasar</h3>
            </div>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Nama Toko</Label>
                <Input 
                  name="name"
                  value={localSettings.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama toko..."
                  className="h-12 rounded-xl bg-card border-border font-bold text-sm focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Telepon Toko</Label>
                <Input 
                  name="phone"
                  value={localSettings.phone}
                  onChange={handleChange}
                  placeholder="0812..."
                  className="h-12 rounded-xl bg-card border-border font-bold text-sm focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Alamat Toko</Label>
                <Textarea 
                  name="address"
                  value={localSettings.address}
                  onChange={handleChange}
                  placeholder="Alamat lengkap toko..."
                  className="min-h-[100px] rounded-xl bg-card border-border font-bold text-sm focus:ring-primary/20 resize-none"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Pencil size={18} />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Tanda Tangan</h3>
            </div>
            
            {showSignaturePad ? (
              <div className="p-4 rounded-3xl border border-border bg-card shadow-sm">
                <SignaturePad 
                  onSave={handleSignatureSave} 
                  onCancel={() => setShowSignaturePad(false)} 
                />
              </div>
            ) : (
              <div className="p-6 rounded-3xl border border-border bg-card flex flex-col items-center gap-4">
                {localSettings.signatureUrl ? (
                  <div className="relative group">
                    <img 
                      src={localSettings.signatureUrl} 
                      alt="Tanda Tangan" 
                      className="max-h-32 object-contain bg-white p-2 rounded-xl border border-border"
                    />
                    <button 
                      onClick={() => setLocalSettings(prev => ({ ...prev, signatureUrl: "" }))}
                      className="absolute -top-2 -right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full shadow-lg"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-muted-foreground uppercase italic">Belum ada tanda tangan</p>
                )}
                
                <div className="flex gap-2 w-full max-w-xs">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSignaturePad(true)}
                    className="flex-1 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest"
                  >
                    <Pencil size={14} className="mr-2" /> Tulis
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => signatureInputRef.current?.click()}
                    className="flex-1 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest"
                  >
                    <Upload size={14} className="mr-2" /> Upload
                  </Button>
                </div>
                <input 
                  type="file" 
                  ref={signatureInputRef} 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const url = await uploadImage(file, "store_signatures");
                      setLocalSettings(prev => ({ ...prev, signatureUrl: url }));
                      toast.success("Tanda tangan berhasil diunggah");
                    } catch (err) {
                      toast.error("Gagal mengunggah tanda tangan");
                    }
                  }} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <FileText size={18} />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Catatan Kaki Nota</h3>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Keterangan / Footer</Label>
              <Textarea 
                name="footerNote"
                value={localSettings.footerNote}
                onChange={handleChange}
                placeholder="Contoh: Barang yang sudah dibeli tidak dapat ditukar..."
                className="min-h-[120px] rounded-xl bg-card border-border font-bold text-sm focus:ring-primary/20 resize-none"
              />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
