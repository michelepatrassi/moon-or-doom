import React from "react";
import axios from "axios";

import type { Player } from "../lib/players/player.types";

export const usePlayer = () => {
  const [player, setPlayer] = React.useState<Player | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const createPlayer = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post<Player>("/api/me");

      setPlayer(data);

      return data;
    } catch (e) {
      console.error("Error creating player:", e);
      setError("Failed to create player");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const { data } = await axios.get<Player>("/api/me");
        setPlayer(data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          // user not authenticated
          return;
        }

        console.error("Error fetching player:", error);
        setError("Failed to fetch player data");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, []);

  const refreshPlayer = async () => {
    const { data } = await axios.get<Player>("/api/me");

    setPlayer(data);
  };

  return {
    error,
    loading,
    player,
    createPlayer,
    refreshPlayer,
  };
};
