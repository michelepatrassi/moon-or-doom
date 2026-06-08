import clsx from "clsx";

export const Chip = ({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "danger";
  className?: string;
}) => {
  const variantClasses = {
    default: "bg-gray-800 text-gray-300 border border-gray-700",
    success: "bg-green-800/30 text-green-300 border border-green-300",
    danger: "bg-red-800/30 text-red-300 border border-red-300",
  };

  return (
    <div
      className={clsx(
        "inline-flex items-center px-3 py-1 rounded-md text-xs",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
};
