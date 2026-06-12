type HeaderProps = {
  score: number | undefined;
  loading: boolean;
};

export const Header = ({ score, loading }: HeaderProps) => {
  return (
    <header className=" text-white flex items-center justify-between w-full">
      <div>
        <h1 className="text-2xl font-bold uppercase">Moon or Doom</h1>
        <h2 className="text-lg fond-semibold text-gray-400">Make your guess</h2>
      </div>
      <div className="text-lg bg-gray-800 border border-gray-600 px-4 py-2 rounded-xl font-bold">
        🏆 <span className="ml-2">{loading ? "Loading..." : score}</span>
      </div>
    </header>
  );
};
