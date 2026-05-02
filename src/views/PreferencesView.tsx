"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, LayoutGrid, Loader2, ShieldCheck, Fingerprint, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface PreferencesViewProps {
  onBack: () => void;
}

export function PreferencesView({ onBack }: PreferencesViewProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pin, setPin] = useState("");

  useEffect(() => {
    const savedPin = localStorage.getItem("app_pin");
    const isEnabled = localStorage.getItem("pin_enabled") === "true";
    if (savedPin) setPin(savedPin);
    setPinEnabled(isEnabled);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    try {
      if (pinEnabled && pin.length !== 4) {
        toast.error("PIN harus 4 digit angka");
        return;
      }
      
      localStorage.setItem("app_pin", pin);
      localStorage.setItem("pin_enabled", pinEnabled.toString());
      
      toast.success("Preferensi berhasil disimpan");
      onBack();
    } catch (error) {
      toast.error("Gagal menyimpan preferensi");
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
            <h2 className="text-sm font-black uppercase tracking-widest">Preferensi</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Atur keamanan & tampilan aplikasi</p>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
          Simpan
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        <div className="max-w-md mx-auto space-y-8 pt-6 pb-20">
          
          <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                <Fingerprint size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight">PIN Pengaman</h3>
                <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">Kunci aplikasi saat dibuka</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border">
              <span className="text-xs font-black uppercase tracking-wider">Aktifkan PIN</span>
              <Switch 
                checked={pinEnabled}
                onCheckedChange={setPinEnabled}
              />
            </div>

            {pinEnabled && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">PIN 4-Digit</Label>
                <Input 
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="xxxx"
                  className="h-14 rounded-2xl bg-card border-border font-black text-center text-2xl tracking-[1em] focus:ring-primary/20"
                />
                <p className="text-[9px] font-bold text-muted-foreground uppercase text-center mt-2">PIN ini akan diminta setiap kali aplikasi dijalankan</p>
              </div>
            )}
          </div>

          <div className="p-6 rounded-3xl border border-border bg-card/50 space-y-4">
             <div className="flex items-center gap-3">
               <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
                 <LayoutGrid size={24} />
               </div>
               <div>
                 <h3 className="text-sm font-black uppercase tracking-tight">Tampilan</h3>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Kustomisasi visual</p>
               </div>
             </div>
             <p className="text-[10px] font-bold text-muted-foreground uppercase italic text-center py-4">Opsi tampilan tambahan akan segera hadir...</p>
          </div>

        </div>
      </div>
    </div>
  );
}
