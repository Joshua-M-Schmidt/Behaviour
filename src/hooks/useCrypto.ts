"use client";

import { useState, useCallback } from "react";
import {
  registerCredential,
  encryptApiKey,
  decryptApiKey,
  getCredentialStatus,
  hasCredential,
} from "@/lib/crypto";

export function useCrypto() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const result = await registerCredential();
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
      throw e;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const encrypt = useCallback(async (apiKey: string) => {
    setIsAuthenticating(true);
    setError(null);
    try {
      await encryptApiKey(apiKey);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Encryption failed");
      throw e;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const decrypt = useCallback(async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      return await decryptApiKey();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Decryption failed");
      throw e;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  return {
    register,
    encrypt,
    decrypt,
    getStatus: getCredentialStatus,
    hasCredential,
    isAuthenticating,
    error,
  };
}
