import React from "react";

type CountdownProps = {
  seconds: number;
  onComplete?: () => void;
};

export const Countdown = ({ seconds, onComplete }: CountdownProps) => {
  const [secondsLeft, setSecondsLeft] = React.useState(seconds);
  const completeCountdown = React.useEffectEvent(() => {
    onComplete?.();
  });

  React.useEffect(() => {
    if (secondsLeft <= 0) {
      completeCountdown();
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((currentSecondsLeft) => currentSecondsLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return (
    <>
      <p className="text-7xl font-black leading-none tracking-normal text-white tabular-nums">
        {secondsLeft}
      </p>
      <p className="mt-3 font-mono text-sm font-bold uppercase leading-none tracking-normal text-zinc-400">
        Seconds left
      </p>
    </>
  );
};
