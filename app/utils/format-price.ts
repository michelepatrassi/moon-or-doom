type FormatPriceParams = {
  price: number;
  locale: string | undefined;
  currency: string;
};

export const formatPrice = ({
  price,
  locale,
  currency,
}: FormatPriceParams): string =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
