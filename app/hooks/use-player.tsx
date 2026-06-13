import React from "react";
import axios from "axios";

import type { Player } from "../lib/players/player.types";
import { SessionError } from "./use-moon-or-doom-session";

export const usePlayer = () => {
  const [player, setPlayer] = React.useState<Player>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<SessionError>();

  const createPlayer = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const { data } = await axios.post<Player>("/api/me");

      setPlayer(data);

      return data;
    } catch (e) {
      console.error("Error creating player:", e);
      setError({ code: "create_failed" });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const { data } = await axios.get<Player>("/api/me");
        setPlayer(data);
        setError(undefined);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          // user not authenticated, not an error
          setError(undefined);
          return;
        }

        console.error("Error fetching player:", error);
        setError({ code: "fetch_failed" });
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, []);

  const refreshPlayer = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const { data } = await axios.get<Player>("/api/me");

      setPlayer(data);
    } catch (e) {
      console.error("Error fetching player:", e);
      setError({ code: "fetch_failed" });
    } finally {
      setLoading(false);
    }
  };

  const clearPlayer = async () => {
    setLoading(true);

    await axios.delete("/api/me");

    setPlayer(undefined);
    setError(undefined);
    setLoading(false);
  };

  return {
    error,
    loading,
    player,
    createPlayer,
    refreshPlayer,
    clearPlayer,
  };
};
