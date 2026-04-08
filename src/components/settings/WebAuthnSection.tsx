"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useCrypto } from "@/hooks/useCrypto";

export function WebAuthnSection() {
  const { register, getStatus, isAuthenticating, error } = useCrypto();
  const [status, setStatus] = useState<{
    registered: boolean;
    prfEnabled: boolean;
  }>({ registered: false, prfEnabled: false });

  useEffect(() => {
    getStatus().then(setStatus);
  }, [getStatus]);

  const handleRegister = async () => {
    await register();
    const newStatus = await getStatus();
    setStatus(newStatus);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
        Biometric Security
      </h2>

      <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-xl">
            🔐
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">
              {status.registered
                ? "Biometric registered"
                : "Not registered"}
            </div>
            <div className="text-xs text-[var(--text-secondary)]">
              {status.registered
                ? status.prfEnabled
                  ? "PRF encryption active — API key encrypted at rest"
                  : "Biometric gate active — PRF not supported on this device"
                : "Register your biometric to encrypt your API key"}
            </div>
          </div>
          <span
            className={`w-2 h-2 rounded-full ${
              status.registered
                ? "bg-[var(--success)]"
                : "bg-[var(--text-muted)]"
            }`}
          />
        </div>

        <Button
          size="sm"
          variant={status.registered ? "secondary" : "primary"}
          onClick={handleRegister}
          disabled={isAuthenticating}
          className="w-full"
        >
          {isAuthenticating
            ? "Authenticating..."
            : status.registered
            ? "Re-register biometric"
            : "Register biometric"}
        </Button>

        {error && (
          <p className="text-xs text-[var(--error)]">{error}</p>
        )}
      </div>
    </section>
  );
}
