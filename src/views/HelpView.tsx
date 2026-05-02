"use client";

import { ArrowLeft, HelpCircle, ChevronRight, BookOpen, MessageSquare, Info, Shield, ShoppingCart, Tag, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface HelpViewProps {
  onBack: () => void;
}

export function HelpView({ onBack }: HelpViewProps) {
  return (
    <div className="h-full flex flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-4 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest">Bantuan</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Panduan penggunaan & FAQ</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-8 pt-4 pb-20">
          
          {/* Quick Support */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-6 rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <MessageSquare size={24} className="mb-2" />
              <span className="text-[11px] font-black uppercase tracking-widest">WhatsApp Support</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 rounded-3xl bg-card border border-border shadow-sm">
              <BookOpen size={24} className="mb-2 text-primary" />
              <span className="text-[11px] font-black uppercase tracking-widest">Tutorial Video</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Info size={18} />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Pertanyaan Umum (FAQ)</h3>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              <HelpItem 
                value="item-1" 
                icon={ShoppingCart}
                title="Bagaimana cara menambah order?" 
                content="Klik tombol '+' di pojok kanan bawah pada halaman utama. Isi detail pelanggan, pilih kategori produk, dan masukkan data spesifik produk. Klik 'Simpan' untuk mencatat pesanan." 
              />
              <HelpItem 
                value="item-2" 
                icon={Tag}
                title="Mengapa kategori saya kosong?" 
                content="Anda perlu menambahkan kategori produk terlebih dahulu melalui menu 'Kategori' di sidebar. Setiap kategori dapat memiliki kolom input unik yang bisa Anda atur di 'Custom Fields'." 
              />
              <HelpItem 
                value="item-3" 
                icon={Shield}
                title="Apakah data saya aman?" 
                content="Ya, data Anda disimpan secara terenkripsi di Cloud Supabase. Kami juga menyediakan fitur PIN di menu Preferensi untuk mengamankan akses aplikasi di perangkat Anda." 
              />
              <HelpItem 
                value="item-4" 
                icon={BarChart3}
                title="Cara melihat laporan keuangan?" 
                content="Buka tab 'Laporan' di navigasi bawah. Anda dapat melihat grafik penjualan, total pendapatan, dan filter data berdasarkan rentang waktu tertentu." 
              />
            </Accordion>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Shield size={18} />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Keamanan Data</h3>
            </div>
            
            <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-5">
              <h4 className="text-sm font-black leading-tight">Keamanan Data Anda Adalah Prioritas Utama Kami</h4>
              <p className="text-[13px] font-medium text-muted-foreground leading-relaxed">
                Kami memahami bahwa data keuangan adalah informasi yang sangat sensitif. Oleh karena itu, aplikasi ini dibangun dengan standar keamanan industri menggunakan infrastruktur Supabase:
              </p>
              
              <div className="space-y-4 pt-2">
                <SecurityPoint 
                  title="Enkripsi End-to-End" 
                  description="Semua data Anda dienkripsi menggunakan standar AES-256 saat disimpan dan dilindungi oleh protokol SSL/TLS saat dikirimkan." 
                />
                <SecurityPoint 
                  title="Row Level Security (RLS)" 
                  description="Kami menerapkan sistem isolasi data yang ketat. Setiap pengguna memiliki ruang privat masing-masing yang tidak dapat diakses oleh pengguna lain." 
                />
                <SecurityPoint 
                  title="Autentikasi Aman" 
                  description="Kami tidak pernah menyimpan kata sandi Anda dalam bentuk teks biasa. Semua kredensial diproses melalui sistem enkripsi yang aman." 
                />
                <SecurityPoint 
                  title="Kepatuhan Standar Internasional" 
                  description="Infrastruktur kami memenuhi sertifikasi keamanan global seperti SOC2 Type 2 dan ISO 27001." 
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-muted/20 border border-border">
             <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-3">Tentang Aplikasi</h4>
             <p className="text-xs font-medium text-muted-foreground leading-relaxed">
               OrderFlow (e-Nota) dirancang untuk memudahkan pemilik bisnis dalam mencatat pesanan, mengelola inventaris, dan memantau performa bisnis secara real-time. Kami terus mengembangkan fitur baru untuk membantu pertumbuhan bisnis Anda.
             </p>
             <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Versi 1.49.10</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">© 2026 frd027</span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function HelpItem({ value, icon: Icon, title, content }: any) {
  return (
    <AccordionItem value={value} className="border-none rounded-2xl bg-card border border-border overflow-hidden">
      <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3 text-left">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Icon size={16} />
          </div>
          <span className="text-xs font-black uppercase tracking-tight">{title}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-5 pb-4 pt-1 text-[13px] font-medium text-muted-foreground leading-relaxed border-t border-border/50 mx-4 mt-2">
        {content}
      </AccordionContent>
    </AccordionItem>
  );
}

function SecurityPoint({ title, description }: { title: string, description: string }) {
  return (
    <div className="space-y-1">
      <h5 className="text-[11px] font-black uppercase tracking-widest text-primary">{title}</h5>
      <p className="text-xs font-medium text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
