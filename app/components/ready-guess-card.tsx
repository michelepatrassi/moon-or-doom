import { COUNTDOWN } from "../constant";
import { Card } from "./design-system/card";

export const ReadyGuessCard = () => {
  return (
    <Card padding="none" variant="warm">
      <section className="px-6 py-8 sm:px-10 sm:py-11">
        <p className="font-mono text-sm font-bold uppercase leading-none tracking-normal text-[#FF9800] sm:text-base">
          NEXT {COUNTDOWN} SECONDS
        </p>

        <h2 className="mt-8 font-heading text-6xl leading-none tracking-normal text-white sm:text-7xl">
          Moon or doom?
        </h2>

        <p className="mt-8 max-w-2xl text-xl leading-snug text-[#A9A7B0] sm:text-2xl">
          Make one call. Score moves by one when the price changes after the
          timer clears.
        </p>
      </section>
    </Card>
  );
};
