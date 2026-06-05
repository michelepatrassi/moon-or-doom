import { Card } from "./design-system/card";
import { Chip } from "./design-system/chip";
import { CURRENCY, TICKER } from "../constant";
import { formatPrice } from "../utils/format-price";
import { type AppError } from "../types";

type PricePanelProps = {
  error?: AppError | null;
  loading: boolean;
  price: number | undefined;
};

const getBrowserLocale = () =>
  typeof navigator === "undefined" ? undefined : navigator.language;

const PriceSkeleton = () => (
  <span
    aria-hidden="true"
    className="block h-[1em] w-64 max-w-full rounded-md bg-zinc-700/70 motion-safe:animate-pulse"
  />
);

export const PricePanel = ({ error, loading, price }: PricePanelProps) => {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs font-bold text-zinc-400">{TICKER}</p>

        {error ? (
          <Chip className="font-semibold" variant="danger">
            FAILED
          </Chip>
        ) : !loading ? (
          <Chip className="font-semibold" variant="success">
            LIVE
          </Chip>
        ) : (
          <Chip className="font-semibold" variant="default">
            CONNECTING
          </Chip>
        )}
      </div>

      <p className="mt-2 w-full text-[42px] font-black leading-none tracking-normal text-white tabular-nums">
        {error ? (
          "No live price"
        ) : loading || typeof price !== "number" ? (
          <PriceSkeleton />
        ) : (
          formatPrice({
            price,
            locale: getBrowserLocale(),
            currency: CURRENCY,
          })
        )}
      </p>

      {error && (
        <p className="mt-3 text-sm font-bold leading-snug text-red-300">
          {error.message}
        </p>
      )}
    </Card>
  );
};
