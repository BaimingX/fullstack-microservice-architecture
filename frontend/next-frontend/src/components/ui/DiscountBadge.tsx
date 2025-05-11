// components/ui/DiscountBadge.tsx
import React from "react";

interface DiscountBadgeProps {
  text?: string;
  className?: string;
  style?: React.CSSProperties;
  icon?: string; // 可选图标
}

const DiscountBadge: React.FC<DiscountBadgeProps> = ({
  text = "Discount",
  className = "",
  style = {},
  icon = "🏷️",
}) => {
  return (
    <div
      className={`absolute top-2 right-2 px-3 py-1 rounded-md text-xs font-extrabold tracking-widest uppercase font-[var(--font-orbitron)] flex items-center gap-1 ${className}`}
      style={{
        backgroundColor: "#00FFFF", // 霓虹青蓝
        color: "#000000", // 黑字
        boxShadow: "0 0 10px #00FFFF, 0 0 20px #00FFFF",
        textShadow: "0 0 1px white",
        ...style,
      }}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
};

export default DiscountBadge;
