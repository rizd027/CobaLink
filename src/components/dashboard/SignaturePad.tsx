"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Check, X, Pencil } from "lucide-react";

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

export function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set drawing style
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Handle resizing
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 200;
        // Re-set styles after resize as they get cleared
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasContent(true);
    }
    // Prevent scrolling when drawing on touch devices
    if (e.cancelable) e.preventDefault();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasContent(false);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas && hasContent) {
      // Create a temporary canvas to trim whitespace and ensure transparent background
      const trimmedDataUrl = canvas.toDataURL("image/png");
      onSave(trimmedDataUrl);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative border-2 border-dashed border-muted-foreground/20 rounded-xl bg-white overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair w-full"
        />
        {!hasContent && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="flex flex-col items-center gap-2">
              <Pencil size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest">Draw your signature here</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-row items-center gap-2 w-full">
        <Button
          variant="outline"
          size="sm"
          onClick={clear}
          className="flex-1 h-9 px-2 rounded-lg font-black text-[9px] uppercase tracking-widest bg-white border-border"
        >
          <Eraser size={14} className="mr-1.5 shrink-0" /> Clear
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="flex-1 h-9 px-2 rounded-lg font-black text-[9px] uppercase tracking-widest text-muted-foreground"
        >
          <X size={14} className="mr-1.5 shrink-0" /> Batal
        </Button>

        <Button
          size="sm"
          onClick={handleSave}
          disabled={!hasContent}
          className="flex-[1.5] h-9 px-2 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-lg shadow-primary/10 whitespace-nowrap"
        >
          <Check size={14} className="mr-1.5 shrink-0" /> Simpan
        </Button>
      </div>
    </div>
  );
}
