import { type AppError } from "../types";
import { Card } from "./design-system/card";

type ErrorCardProps = {
  actionLabel?: string;
  error: AppError;
  onAction?: () => void;
};

export const ErrorCard = ({
  actionLabel,
  error,
  onAction,
}: ErrorCardProps) => {
  return (
    <Card variant="danger">
      <div className="space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-red-900 text-4xl font-black leading-none text-red-300">
          !
        </div>

        <p className="font-mono text-xs font-bold uppercase leading-none tracking-normal text-red-300">
          Price unavailable
        </p>

        <div className="space-y-3">
          <h2 className="font-heading text-5xl leading-none tracking-normal text-white">
            {error.title}
          </h2>
          <p className="max-w-xl text-sm leading-snug text-zinc-300">
            {error.message} Moon and Doom stay locked until the live price
            returns.
          </p>
        </div>

        {actionLabel && onAction && (
          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-4 font-mono text-sm font-bold uppercase leading-none tracking-normal text-black transition-colors hover:bg-orange-400"
            onClick={onAction}
            type="button"
          >
            {actionLabel}
            <span aria-hidden="true">↻</span>
          </button>
        )}
      </div>
    </Card>
  );
};
