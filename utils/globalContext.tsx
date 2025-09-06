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
  // Create a ref to track if sign-in has been attempted
  const hasAttemptedSignIn = React.useRef(false);

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
      // Save user to session storage to prevent repeated sign-ins
      sessionStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      console.error("Sign in error:", error);
    }
  }, [getNonce]);

  useEffect(() => {
    let isMounted = true;
    
    (async () => {
      // Only attempt sign-in once
      if (!hasAttemptedSignIn.current && isMounted) {
        hasAttemptedSignIn.current = true;
        
        // Check for existing user in session storage first
        const sessionUser = sessionStorage.getItem("user");
        
        if (sessionUser && isMounted) {
          setUser(JSON.parse(sessionUser));
        } else if (isMounted) {
          await handleSignIn();
        }
        
        if (process.env.NEXT_PUBLIC_ENV !== "DEV" && isMounted) {
          sdk.actions.ready();
        }
      }
    })();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [handleSignIn]);

  return (
    <GlobalContext.Provider value={{ user }}>{children}</GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
