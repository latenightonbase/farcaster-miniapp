import React, { createContext, useContext, useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk"; // Corrected import

// Create a context with a default value matching the expected structure
const GlobalContext = createContext<{ user: number | null } | null>(null);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<number | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Get the authorization token
        const token = await sdk.quickAuth.getToken(); // Corrected usage

        // Hit the API route
        const response = await fetch("/api/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error("Failed to fetch user", response.statusText);
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <GlobalContext.Provider value={{ user }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
