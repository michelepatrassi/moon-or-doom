import clsx from "clsx";
import type { ReactNode } from "react";

type CardVariant = "default" | "success" | "danger" | "warm";
type CardPadding = "default" | "none";

type CardProps = {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
};

const variantClasses: Record<CardVariant, string> = {
  default: "border-zinc-800 bg-zinc-900",
  success: "border-green-500 bg-green-950",
  danger: "border-red-500 bg-red-950",
  warm: "border-amber-700 bg-amber-950",
};

const paddingClasses: Record<CardPadding, string> = {
  default: "p-4",
  none: "",
};

export const Card = ({
  children,
  padding = "default",
  variant = "default",
}: CardProps) => {
  return (
    <div
      className={clsx(
        "w-full rounded-xl border text-white shadow-md",
        variantClasses[variant],
        paddingClasses[padding],
      )}
    >
      {children}
    </div>
  );
};
