import clsx from "clsx";
import { GuessDirection } from "../lib/guesses/guess.types";

type GuessActionsProps = {
  onGuess: (direction: GuessDirection) => void;
  disabled?: boolean;
};

type GuessButtonProps = {
  label: string;
  caption: string;
  disabled?: boolean;
  emoji: string;
  onClick: () => void;
  variant: "moon" | "doom";
};

const variantClasses = {
  moon: "border-green-700 bg-green-900 text-green-400 hover:bg-green-800",
  doom: "border-red-800 bg-red-950 text-red-400 hover:bg-red-900",
};

export const GuessButton = ({
  label,
  caption,
  disabled,
  emoji,
  onClick,
  variant,
}: GuessButtonProps) => {
  return (
    <button
      className={clsx(
        "flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center shadow-xl transition-colors cursor-pointer",
        "disabled:cursor-not-allowed disabled:shadow-none",
        disabled
          ? "border-zinc-800 bg-zinc-900 text-zinc-400"
          : variantClasses[variant]
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span className="text-3xl leading-none">{disabled ? "🔒" : emoji}</span>
      <span className="text-3xl font-black leading-none tracking-normal">
        {label}
      </span>
      <span className="font-mono text-xs font-bold leading-tight">
        {disabled ? "waiting for price" : caption}
      </span>
    </button>
  );
};

export const GuessActions = ({ onGuess }: GuessActionsProps) => {
  return (
    <div className="grid w-full grid-cols-2 gap-3">
      <GuessButton
        caption="price goes up"
        emoji="📈"
        label="MOON"
        onClick={() => onGuess("up")}
        variant="moon"
      />
      <GuessButton
        caption="price goes down"
        emoji="📉"
        label="DOOM"
        onClick={() => onGuess("down")}
        variant="doom"
      />
    </div>
  );
};
