"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";

const DEFAULT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2ZjNhNDY2Zi05ZjE0LTRjZDktODM4NS1mMzU5MzE4MmJiNDQiLCJzdWIiOiI4NDUzMWEzNC0yMWM4LTQ0ODEtOTcxMC0zZjliYjU4MjViMzQiLCJ1aWQiOiI4NDUzMWEzNC0yMWM4LTQ0ODEtOTcxMC0zZjliYjU4MjViMzQiLCJlbWFpbCI6WyJXVUZVSEFJQFFORS5DT00uTVkiLCJXVUZVSEFJQFFORS5DT00uTVkiXSwibmFtZSI6IldVRlVIQUlAUU5FLkNPTS5NWSIsImRuYW1lIjoiUU5FIEtlbHZpbiBXdSIsInRlbmFudElkIjoiOGQzZTQwZDktYzRkYi00MmU5LTgxZWEtY2UzNDQyZDY5ODI2IiwidGVuYW50Q29kZSI6IjREQi0yRTktMUVBIiwic2NvcGUiOiJxY2FBcGkiLCJzZWN1cml0eV9zdGFtcCI6IkpKRlEzNFhNUDZVRExGVlE2QUpIRDVLN08yUFVOSkhMIiwic2FtcGxlIjoiRmFsc2UiLCJvd25lcklkIjoiODQ1MzFhMzQtMjFjOC00NDgxLTk3MTAtM2Y5YmI1ODI1YjM0Iiwicm9sZXMiOiJzeXMtYWRtaW4iLCJ0bW5sIjoiMTQzNTg2NGUtMzU1MC00NDNmLTgxNGEtNGM1MjI1MDg2MzRhIiwidG1ubE5hbWUiOiJFZGdlIiwiYWNjb3VudGFudCI6IkZhbHNlIiwiZXhwIjoxNzc4NzIzMTEwLCJpc3MiOiJodHRwczovL2FwaS5hY2NvdW50LnFuZS5jbG91ZCIsImF1ZCI6Imh0dHBzOi8vYWNjb3VudC5xbmUuY2xvdWQifQ.PNwKG1Ewc0mDLr-a28rkIGa_5XpbWqICUVRHPlDzXL8";

interface TokenContextType {
  token: string;
  setToken: (token: string) => void;
  isLoading: boolean;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    } else {
      setToken(DEFAULT_TOKEN);
    }
    setIsLoading(false);
  }, [searchParams]);

  return (
    <TokenContext.Provider value={{ token, setToken, isLoading }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useToken() {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error("useToken must be used within a TokenProvider");
  }
  return context;
}
