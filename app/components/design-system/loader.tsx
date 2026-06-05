"use client";

type LoaderProps = {
  message?: string;
};

export const Loader = ({ message = "Loading..." }: LoaderProps) => {
  return (
    <div className="loader" role="status">
      <span>{message}</span>
    </div>
  );
};
