import React from "react";
import axios from "axios";

import type { Player } from "../lib/models/players";

export const usePlayer = () => {
  const [player, setPlayer] = React.useState<Player | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const { data } = await axios.get<Player>("/api/me");
        setPlayer(data);
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          [401, 404].includes(error.response?.status as number)
        ) {
          const { data } = await axios.post<Player>("/api/me");
          setPlayer(data);
          return;
        }

        console.error("Error fetching player:", error);
        setError("Failed to fetch player data");

        throw new Error("Failed to fetch player data");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, []);

  return {
    error,
    loading,
    player,
  };
};
