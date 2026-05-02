"use client";

import { useConfirmStore } from "@/store/useConfirmStore";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfirmDialog() {
  const { isOpen, title, message, onConfirm, close, confirmLabel, cancelLabel, variant } = useConfirmStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop - Static, no animation */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
        onClick={close} 
      />
      
      {/* Modal - Static, no animation */}
      <div className="relative w-full max-w-[400px] bg-card border-2 border-border/80 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="p-6 sm:p-10 text-center">
          <div className={cn(
            "mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6",
            variant === 'destructive' ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
          )}>
            {variant === 'destructive' ? <Trash2 size={32} /> : <HelpCircle size={32} />}
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground uppercase leading-tight">
            {title}
          </h2>
          <p className="mt-4 text-sm sm:text-base font-semibold text-foreground/80 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex p-5 gap-4 bg-muted/40 border-t border-border/50">
          <Button
            variant="ghost"
            onClick={close}
            className="flex-1 h-12 sm:h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs text-foreground/60 hover:text-foreground hover:bg-muted"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={() => {
              onConfirm();
              close();
            }}
            className={cn(
              "flex-[1.5] h-12 sm:h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-xl",
              variant === 'destructive' 
                ? "bg-destructive text-destructive-foreground shadow-destructive/30" 
                : "bg-primary text-primary-foreground shadow-primary/30"
            )}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
