"use client";

import { useState } from "react";
import {
  Camera,
  Coffee,
  Gamepad,
  Gift,
  Heart,
  Laptop,
  Music,
  Package,
  Pizza,
  Shirt,
  Smartphone,
  Star,
  Truck,
  Watch,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const PRESET_CATEGORY_ICONS = [
  { name: "Package", icon: Package },
  { name: "Shirt", icon: Shirt },
  { name: "Smartphone", icon: Smartphone },
  { name: "Laptop", icon: Laptop },
  { name: "Watch", icon: Watch },
  { name: "Coffee", icon: Coffee },
  { name: "Gamepad", icon: Gamepad },
  { name: "Truck", icon: Truck },
  { name: "Heart", icon: Heart },
  { name: "Star", icon: Star },
  { name: "Pizza", icon: Pizza },
  { name: "Zap", icon: Zap },
  { name: "Camera", icon: Camera },
  { name: "Music", icon: Music },
  { name: "Gift", icon: Gift },
];

const isImageLike = (value: string) =>
  value.startsWith("http://") ||
  value.startsWith("https://") ||
  value.startsWith("data:image/") ||
  value.startsWith("/");

export function CategoryIcon({ name, className }: { name?: string; className?: string }) {
  const iconName = (name || "").trim();
  const [imageFailed, setImageFailed] = useState(false);

  if (!iconName) return <Package className={className} />;

  if (isImageLike(iconName) && !imageFailed) {
    return (
      <img
        src={iconName}
        alt="category icon"
        className={cn("object-cover rounded-lg", className)}
        onError={() => setImageFailed(true)}
      />
    );
  }

  const found = PRESET_CATEGORY_ICONS.find(
    (item) => item.name.toLowerCase() === iconName.toLowerCase()
  );
  const IconComponent = found ? found.icon : Package;
  return <IconComponent className={className} />;
}
