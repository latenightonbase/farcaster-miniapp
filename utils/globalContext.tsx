import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { sdk } from "@farcaster/miniapp-sdk"; // Corrected import
import { generateNonce } from "@farcaster/auth-client";

// Create a context with a default value matching the expected structure
const GlobalContext = createContext<{ user: any | null } | null>(null);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      // const sessionUser = sessionStorage.getItem("user");

      // if (!sessionUser) {
      //   await handleSignIn();
      // } else {
      //   setUser(JSON.parse(sessionUser));
      // }
      await handleSignIn();
      if (process.env.NEXT_PUBLIC_ENV !== "DEV") {
        sdk.actions.ready();
      }
    })();
  }, []);

  const getNonce = useCallback(async (): Promise<string> => {
    try {
      const nonce = await generateNonce();
      if (!nonce) throw new Error("Unable to generate nonce");
      return nonce;
    } catch (error) {
      console.error("Error in getNonce:", error);
      throw error;
    }
  }, []);

  const handleSignIn = useCallback(async (): Promise<void> => {
    try {
      var token: any;

      if (process.env.NEXT_PUBLIC_ENV !== "DEV") {
        const nonce = await getNonce();

        await sdk.actions.signIn({ nonce });

        token = (await sdk.quickAuth.getToken()).token;
      }
      console.log("Using token:", token);

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
      console.log("Fetched user data:", data);
      setUser(data.user);
    } catch (error) {
      console.error("Sign in error:", error);
    }
  }, [getNonce]);

  return (
    <GlobalContext.Provider value={{ user }}>{children}</GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
