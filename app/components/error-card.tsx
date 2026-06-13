import { Card } from "./design-system/card";

type ErrorCardProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const ErrorCard = ({
  title,
  description,
  actionLabel,
  onAction,
}: ErrorCardProps) => {
  return (
    <Card variant="danger">
      <div className="space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-red-900 text-4xl font-black leading-none text-red-300">
          !
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-3xl leading-none tracking-normal text-white">
            {title}
          </h2>
          <p className="max-w-xl text-sm leading-snug text-zinc-300">
            {description}
          </p>
        </div>

        {actionLabel && onAction && (
          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-4 font-mono text-sm font-bold uppercase leading-none tracking-normal text-black transition-colors hover:bg-orange-400"
            onClick={onAction}
            type="button"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </Card>
  );
};
