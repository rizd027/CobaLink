"use client";

import { useState } from "react";
import { ArrowLeft, Save, Key, Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";

interface PasswordSettingsViewProps {
  onBack: () => void;
}

export function PasswordSettingsView({ onBack }: PasswordSettingsViewProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: "",
    password: "",
    confirmPassword: "",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Password baru tidak cocok");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setIsSaving(true);
    try {
      // Re-authenticate to verify old password
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: formData.oldPassword,
        });
        
        if (signInError) {
          throw new Error("Password lama salah");
        }
      }

      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });
      if (error) throw error;
      toast.success("Password berhasil diperbarui");
      onBack();
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui password");
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
            <h2 className="text-sm font-black uppercase tracking-widest">Password</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ubah kata sandi akun Anda</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        <form onSubmit={handleSave} className="max-w-md mx-auto space-y-6 pt-10">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
              <Lock size={32} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black uppercase tracking-tight">Ganti Password</h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Gunakan kombinasi yang kuat</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Password Lama</Label>
              <Input 
                type="password"
                value={formData.oldPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, oldPassword: e.target.value }))}
                placeholder="Masukkan password lama..."
                className="h-12 rounded-xl bg-card border-border font-bold text-sm focus:ring-primary/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Password Baru</Label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Masukkan password baru..."
                  className="h-12 rounded-xl bg-card border-border font-bold text-sm focus:ring-primary/20 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Konfirmasi Password</Label>
              <Input 
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Ulangi password baru..."
                className="h-12 rounded-xl bg-card border-border font-bold text-sm focus:ring-primary/20"
                required
              />
            </div>
          </div>

          <Button 
            type="submit"
            disabled={isSaving}
            className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 mt-4"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
            Perbarui Password
          </Button>
        </form>
      </div>
    </div>
  );
}
