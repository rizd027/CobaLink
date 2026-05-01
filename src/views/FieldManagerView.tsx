"use client";

import { useState, useRef } from "react";
import {
  ArrowLeft,
  Settings2,
  Plus,
  Trash2,
  Copy,
  Hash,
  ChevronDown,
  ToggleLeft,
  Image as ImageIcon,
  AlignLeft,
  AlignJustify,
  LayoutGrid,
  Star,
  Radio,
  SlidersHorizontal,
  Calendar,
  Clock,
  CheckSquare,
  Circle,
  SquareStack,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useOrderStore } from "@/store/useOrderStore";
import { ProductField, addField, deleteField, updateField } from "@/services/fields";
import { cn } from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface FieldManagerViewProps {
  onBack: () => void;
}

type DraftField = {
  id?: string;
  label: string;
  type: ProductField["type"];
  options: string;
  isRequired: boolean;
  isNew?: boolean;
};

type FieldTypeGroup = {
  separator?: boolean;
  value?: ProductField["type"];
  label?: string;
  icon?: React.ReactNode;
  description?: string;
};

const FIELD_TYPE_LIST: FieldTypeGroup[] = [
  { value: "text",     label: "Jawaban Singkat",     icon: <AlignLeft size={16} />,        description: "Teks satu baris" },
  { value: "textarea", label: "Paragraf",             icon: <AlignJustify size={16} />,     description: "Teks panjang multi-baris" },
  { separator: true },
  { value: "radio",    label: "Pilihan Ganda",        icon: <Circle size={16} />,           description: "Pilih satu dari beberapa opsi" },
  { value: "checkbox", label: "Kotak Centang",        icon: <CheckSquare size={16} />,      description: "Toggle ya/tidak" },
  { value: "select",   label: "Drop-down",            icon: <ChevronDown size={16} />,      description: "Pilih dari menu dropdown" },
  { separator: true },
  { value: "image",    label: "Upload File / Gambar", icon: <ImageIcon size={16} />,        description: "Upload foto atau file" },
  { separator: true },
  { value: "scale",    label: "Skala Linier",         icon: <SlidersHorizontal size={16} />, description: "Nilai dari 1 s/d N" },
  { value: "rating",   label: "Rating Bintang",       icon: <Star size={16} />,             description: "Rating 1–5 bintang" },
  { separator: true },
  { value: "number",   label: "Numerik",              icon: <Hash size={16} />,             description: "Angka / bilangan" },
  { value: "currency", label: "Mata Uang",            icon: <Banknote size={16} />,         description: "Nilai uang / nominal" },
  { separator: true },
  { value: "date",     label: "Tanggal",              icon: <Calendar size={16} />,         description: "Pilih tanggal (dd/mm/yyyy)" },
  { value: "time",     label: "Waktu",                icon: <Clock size={16} />,            description: "Pilih jam (HH:mm)" },
];

const FIELD_TYPES = FIELD_TYPE_LIST.filter((t) => !t.separator) as Required<Omit<FieldTypeGroup, "separator">>[];

function getTypeIcon(type: string) {
  const found = FIELD_TYPES.find((t) => t.value === type);
  return found?.icon ?? <AlignLeft size={16} />;
}

function getTypeLabel(type: string) {
  const found = FIELD_TYPES.find((t) => t.value === type);
  return found?.label ?? type;
}


function FieldCard({
  field,
  isActive,
  onActivate,
  onChange,
  onDelete,
  onDuplicate,
  onSave,
  isSaving,
}: {
  field: DraftField;
  isActive: boolean;
  onActivate: () => void;
  onChange: (updates: Partial<DraftField>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSave: () => void;
  isSaving: boolean;
}) {
  const selectedType = FIELD_TYPES.find((t) => t.value === field.type)!;

  return (
    <div
      onClick={() => !isActive && onActivate()}
      className={cn(
        "relative rounded-2xl border-2 bg-card transition-all duration-300 cursor-pointer group",
        isActive
          ? "border-primary shadow-xl shadow-primary/10 cursor-default"
          : "border-border/50 hover:border-border shadow-sm"
      )}
    >
      {/* Left accent bar */}
      <div
        className={cn(
          "absolute left-0 top-4 bottom-4 w-1 rounded-full transition-all duration-300",
          isActive ? "bg-primary" : "bg-transparent"
        )}
      />

      {/* Drag handle */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-20 group-hover:opacity-40 transition-opacity cursor-grab active:cursor-grabbing">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-0.5 h-0.5 rounded-full bg-muted-foreground" />
        ))}
      </div>

      <div className="px-8 pt-8 pb-5">
        {/* Question + Type row */}
        <div className="flex items-start gap-4">
          <div className="flex-1">
            {isActive ? (
              <Input
                autoFocus
                value={field.label}
                onChange={(e) => onChange({ label: e.target.value })}
                placeholder="Judul Kolom"
                className="h-12 text-base font-semibold border-0 border-b-2 border-border rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:border-primary transition-colors placeholder:text-muted-foreground/40"
              />
            ) : (
              <div className="flex items-center gap-2 h-12 border-b border-border/30">
                <span className={cn("text-base font-semibold", !field.label && "text-muted-foreground/40")}>
                  {field.label || "Pertanyaan Tanpa Judul"}
                </span>
                {field.isRequired && (
                  <span className="text-rose-500 font-black text-lg leading-none">*</span>
                )}
              </div>
            )}
          </div>

          {/* Type selector */}
          <div className="shrink-0">
            <Select
              value={field.type}
              onValueChange={(val: any) => onChange({ type: val, options: "" })}
              disabled={!isActive}
            >
              <SelectTrigger
                className={cn(
                  "h-12 w-[220px] rounded-xl border font-semibold text-sm gap-3 px-4 transition-all",
                  isActive
                    ? "border-border bg-background shadow-sm hover:border-primary/40"
                    : "border-transparent bg-transparent text-muted-foreground"
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-primary">{selectedType?.icon}</span>
                  <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border shadow-2xl p-1 max-h-[380px]">
                {FIELD_TYPE_LIST.map((t, i) =>
                  t.separator ? (
                    <SelectSeparator key={`sep-${i}`} className="my-1" />
                  ) : (
                    <SelectItem
                      key={t.value!}
                      value={t.value!}
                      className="rounded-lg py-2.5 px-4 font-semibold text-sm cursor-pointer"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-muted-foreground">{t.icon}</span>
                        <span>
                          <span className="block">{t.label}</span>
                        </span>
                      </span>
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Options for radio/select type (active edit) */}
        {(field.type === "radio" || field.type === "select") && isActive && (
          <div className="mt-6 space-y-3">
            {(field.options ? field.options.split(",") : [""]).map((opt, idx, arr) => (
              <div key={idx} className="flex items-center gap-3 group/opt">
                {field.type === "radio"
                  ? <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/40 shrink-0" />
                  : <ChevronDown size={14} className="text-muted-foreground/40 shrink-0" />}
                <input
                  value={opt}
                  onChange={(e) => {
                    const newArr = [...arr];
                    newArr[idx] = e.target.value;
                    onChange({ options: newArr.join(",") });
                  }}
                  placeholder={`Opsi ${idx + 1}`}
                  className="flex-1 h-9 border-0 border-b border-dashed border-border bg-transparent text-sm font-medium outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30"
                />
                {arr.length > 1 && (
                  <button
                    onClick={() => {
                      const newArr = arr.filter((_, i) => i !== idx);
                      onChange({ options: newArr.join(",") });
                    }}
                    className="opacity-0 group-hover/opt:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => {
                const arr = field.options ? field.options.split(",") : [];
                arr.push("");
                onChange({ options: arr.join(",") });
              }}
              className="flex items-center gap-3 text-sm text-primary/70 hover:text-primary font-semibold transition-colors mt-1"
            >
              <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/20 flex items-center justify-center">
                <Plus size={9} />
              </div>
              Tambah opsi
            </button>
          </div>
        )}

        {/* Scale config (active) */}
        {field.type === "scale" && isActive && (
          <div className="mt-5 space-y-2">
            <p className="text-xs text-muted-foreground font-semibold">Masukkan batas skala, contoh: <span className="text-primary">1,5</span> atau <span className="text-primary">0,10</span></p>
            <input
              value={field.options}
              onChange={(e) => onChange({ options: e.target.value })}
              placeholder="min,max  (contoh: 1,5)"
              className="w-44 h-9 rounded-lg border border-border bg-muted/10 px-3 text-sm font-medium outline-none focus:border-primary transition-colors"
            />
          </div>
        )}

        {/* ── PREVIEWS ── */}

        {/* Radio preview */}
        {field.type === "radio" && !isActive && (
          <div className="mt-4 space-y-2">
            {(field.options ? field.options.split(",").filter(Boolean) : ["Opsi 1"]).map((opt) => (
              <div key={opt} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                <span className="text-sm text-muted-foreground/70 font-medium">{opt.trim()}</span>
              </div>
            ))}
          </div>
        )}

        {/* Select/Dropdown preview */}
        {field.type === "select" && !isActive && field.options && (
          <div className="mt-3 flex flex-wrap gap-2">
            {field.options.split(",").filter(Boolean).map((opt) => (
              <span
                key={opt}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted/60 text-muted-foreground border border-border/40"
              >
                {opt.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Checkbox/Toggle preview */}
        {field.type === "checkbox" && (
          <div className="mt-4 flex items-center gap-3">
            <div className="w-9 h-5 rounded-full bg-muted-foreground/20 relative flex items-center">
              <div className="w-3 h-3 rounded-full bg-white shadow-sm absolute left-1" />
            </div>
            <span className="text-sm text-muted-foreground/60 font-medium">{field.label || "Toggle"}</span>
          </div>
        )}

        {/* Image/File preview */}
        {field.type === "image" && (
          <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-border/60 bg-muted/5 w-fit">
            <ImageIcon size={18} className="text-muted-foreground/40" />
            <span className="text-xs font-semibold text-muted-foreground/40 uppercase tracking-wider">Upload File / Gambar</span>
          </div>
        )}

        {/* Scale preview */}
        {field.type === "scale" && (
          <div className="mt-4">
            {(() => {
              const parts = field.options ? field.options.split(",") : ["1", "5"];
              const min = parseInt(parts[0]) || 1;
              const max = parseInt(parts[1]) || 5;
              const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);
              return (
                <div className="flex items-center gap-1.5">
                  {steps.map((n) => (
                    <div key={n} className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full border-2 border-border/50 flex items-center justify-center text-xs font-bold text-muted-foreground/50">{n}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Rating preview */}
        {field.type === "rating" && (
          <div className="mt-4 flex items-center gap-1.5">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={20} className="text-muted-foreground/20 fill-muted-foreground/10" />
            ))}
          </div>
        )}

        {/* Text/Textarea/Number preview */}
        {(field.type === "text" || field.type === "number" || field.type === "currency") && (
          <div className="mt-4 border-b border-dashed border-border/40 pb-1">
            <span className="text-sm text-muted-foreground/30 font-medium">
              {field.type === "currency" ? "Nominal uang..." : field.type === "number" ? "Jawaban numerik..." : "Jawaban singkat..."}
            </span>
          </div>
        )}
        {field.type === "textarea" && (
          <div className="mt-4 border-b border-dashed border-border/40 pb-6">
            <span className="text-sm text-muted-foreground/30 font-medium">Paragraf teks panjang...</span>
          </div>
        )}

        {/* Date preview */}
        {field.type === "date" && (
          <div className="mt-4 flex items-center gap-2 border-b border-dashed border-border/40 pb-1.5 w-fit">
            <Calendar size={16} className="text-muted-foreground/30" />
            <span className="text-sm text-muted-foreground/30 font-medium">dd/mm/yyyy</span>
          </div>
        )}

        {/* Time preview */}
        {field.type === "time" && (
          <div className="mt-4 flex items-center gap-2 border-b border-dashed border-border/40 pb-1.5 w-fit">
            <Clock size={16} className="text-muted-foreground/30" />
            <span className="text-sm text-muted-foreground/30 font-medium">HH:mm</span>
          </div>
        )}
      </div>

      {/* Bottom action bar — only visible when active */}
      {isActive && (
        <div className="px-8 py-4 border-t border-border/40 flex items-center justify-end gap-1">
          <button
            onClick={onDuplicate}
            className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
            title="Duplikat"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={onDelete}
            className="p-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
            title="Hapus"
          >
            <Trash2 size={18} />
          </button>
          <div className="w-px h-6 bg-border/60 mx-2" />
          {/* Required toggle */}
          <span className="text-sm font-semibold text-muted-foreground mr-2">Wajib diisi</span>
          <button
            onClick={() => onChange({ isRequired: !field.isRequired })}
            className={cn(
              "w-11 h-6 rounded-full relative flex items-center transition-all duration-300",
              field.isRequired ? "bg-primary shadow-md shadow-primary/30" : "bg-muted-foreground/20"
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-full bg-white shadow-md absolute transition-all duration-300",
                field.isRequired ? "left-6" : "left-1"
              )}
            />
          </button>
          <div className="w-px h-6 bg-border/60 mx-2" />
          <Button
            onClick={onSave}
            disabled={isSaving || !field.label.trim()}
            size="sm"
            className="rounded-xl h-9 px-5 font-bold text-xs uppercase tracking-wider bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {isSaving ? "Menyimpan..." : field.id ? "Simpan" : "Buat Kolom"}
          </Button>
        </div>
      )}
    </div>
  );
}

export function FieldManagerView({ onBack }: FieldManagerViewProps) {
  const { productFields, selectedCategoryId, categories, refreshFields } = useOrderStore();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [fieldOverrides, setFieldOverrides] = useState<Record<string, DraftField>>({});
  const [newFields, setNewFields] = useState<DraftField[]>([]);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const allDrafts: DraftField[] = [
    ...productFields.map((f) => fieldOverrides[f.id!] ?? {
      id: f.id,
      label: f.label,
      type: f.type,
      options: f.options || "",
      isRequired: f.isRequired,
    }),
    ...newFields,
  ];

  const updateDraftAt = (index: number, updates: Partial<DraftField>) => {
    const field = allDrafts[index];
    if (field.isNew) {
      const newFieldIndex = index - productFields.length;
      setNewFields((prev) => {
        const next = [...prev];
        next[newFieldIndex] = { ...next[newFieldIndex], ...updates };
        return next;
      });
    } else if (field.id) {
      setFieldOverrides((prev) => ({
        ...prev,
        [field.id!]: { ...field, ...updates },
      }));
    }
  };

  useGSAP(() => {
    if (containerRef.current) {
      const items = containerRef.current.querySelectorAll(".field-card");
      if (items.length > 0) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power3.out" }
        );
      }
    }
  }, { dependencies: [productFields.length], scope: containerRef });

  const handleAddNew = () => {
    const newDraft: DraftField = {
      label: "",
      type: "text",
      options: "",
      isRequired: false,
      isNew: true,
    };
    const newIndex = allDrafts.length;
    setNewFields((prev) => [...prev, newDraft]);
    setActiveIndex(newIndex);
  };

  const handleSave = async (index: number) => {
    const draft = allDrafts[index];
    if (!draft.label.trim() || selectedCategoryId === "all") return;
    setSavingIndex(index);
    try {
      if (draft.isNew || !draft.id) {
        await addField({
          label: draft.label.trim(),
          type: draft.type,
          options: draft.options,
          isRequired: draft.isRequired,
          productId: selectedCategoryId,
          sortOrder: productFields.length,
        });
        // Remove the new draft
        setNewFields((prev) => prev.filter((d) => d !== draft));
        toast.success("Kolom berhasil dibuat");
      } else {
        await updateField(draft.id, {
          label: draft.label.trim(),
          type: draft.type,
          options: draft.options,
          isRequired: draft.isRequired,
        });
        // Clear override after save
        setFieldOverrides((prev) => {
          const next = { ...prev };
          delete next[draft.id!];
          return next;
        });
        toast.success("Kolom berhasil diperbarui");
      }
      refreshFields();
      setActiveIndex(null);
    } catch (err) {
      toast.error("Gagal menyimpan kolom");
    } finally {
      setSavingIndex(null);
    }
  };

  const handleDelete = async (index: number) => {
    const draft = allDrafts[index];
    if (draft.isNew || !draft.id) {
      // Remove from new drafts list
      setNewFields((prev) => prev.filter((d) => d !== draft));
      setActiveIndex(null);
      return;
    }
    try {
      await deleteField(draft.id!);
      setFieldOverrides((prev) => {
        const next = { ...prev };
        delete next[draft.id!];
        return next;
      });
      refreshFields();
      setActiveIndex(null);
      toast.success("Kolom dihapus");
    } catch {
      toast.error("Gagal menghapus kolom");
    }
  };

  const handleDuplicate = async (index: number) => {
    const draft = allDrafts[index];
    if (selectedCategoryId === "all") return;
    try {
      await addField({
        label: `${draft.label} (Salinan)`,
        type: draft.type,
        options: draft.options,
        isRequired: draft.isRequired,
        productId: selectedCategoryId,
        sortOrder: productFields.length,
      });
      refreshFields();
      toast.success("Kolom diduplikat");
    } catch {
      toast.error("Gagal menduplikat kolom");
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Soft background decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/3 rounded-full blur-[150px] -mr-64 -mt-64 pointer-events-none" />

      {/* Header */}
      <div className="px-6 sm:px-12 py-7 flex items-center justify-between z-10 relative shrink-0 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="w-11 h-11 rounded-2xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all active:scale-90"
          >
            <ArrowLeft size={22} />
          </Button>
          <div className="h-8 w-px bg-border" />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
              <Settings2 size={20} className="text-primary" />
              Column Definition:{" "}
              <span className="text-primary">{selectedCategory?.name}</span>
            </h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 opacity-50">
              Buat dan atur kolom data seperti Google Forms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 bg-muted/20 px-3 py-1.5 rounded-full border border-border/30">
            {productFields.length} kolom aktif
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto px-6 py-10 space-y-4" ref={containerRef}>
          {allDrafts.map((field, index) => (
            <div key={field.id ?? `new-${index}`} className="field-card">
              <FieldCard
                field={field}
                isActive={activeIndex === index}
                onActivate={() => setActiveIndex(index)}
                onChange={(updates) => updateDraftAt(index, updates)}
                onDelete={() => handleDelete(index)}
                onDuplicate={() => handleDuplicate(index)}
                onSave={() => handleSave(index)}
                isSaving={savingIndex === index}
              />
            </div>
          ))}

          {/* Empty state */}
          {allDrafts.length === 0 && (
            <div className="py-28 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-3xl bg-muted/5">
              <LayoutGrid size={56} className="text-muted-foreground/15 mb-5" />
              <h3 className="text-lg font-black text-muted-foreground/30 uppercase tracking-widest">
                Belum Ada Kolom
              </h3>
              <p className="text-xs font-medium text-muted-foreground/20 mt-2 text-center max-w-xs">
                Klik tombol di bawah untuk mulai menambahkan kolom data untuk kategori ini.
              </p>
            </div>
          )}

          {/* Add button */}
          <button
            onClick={handleAddNew}
            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl border-2 border-dashed border-border/40 hover:border-primary/40 hover:bg-primary/3 text-muted-foreground hover:text-primary transition-all duration-300 group mt-2"
          >
            <div className="w-8 h-8 rounded-full bg-muted/40 group-hover:bg-primary/10 flex items-center justify-center transition-all">
              <Plus size={18} className="group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-sm font-bold uppercase tracking-wider">Tambah Kolom Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
}
