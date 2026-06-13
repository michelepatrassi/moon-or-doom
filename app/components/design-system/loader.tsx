import clsx from "clsx";

type LoaderSize = "sm" | "md" | "lg";

type LoaderProps = {
  size?: LoaderSize;
  className?: string;
};

const sizeClasses: Record<LoaderSize, string> = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export const Loader = ({ size = "md", className }: LoaderProps) => {
  return (
    <div
      className={clsx(
        "rounded-full border-4 border-blue-500 border-t-transparent animate-spin",
        sizeClasses[size],
        className
      )}
    />
  );
};
