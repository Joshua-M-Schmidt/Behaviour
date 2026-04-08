import { db } from "./db";

const PRF_SALT = new TextEncoder().encode("behaviour-api-key-encryption");

export async function isPrfSupported(): Promise<boolean> {
  if (
    !window.PublicKeyCredential ||
    !navigator.credentials
  ) {
    return false;
  }
  return true;
}

export async function registerCredential(): Promise<{
  credentialId: ArrayBuffer;
  prfEnabled: boolean;
}> {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));

  const credential = (await navigator.credentials.create({
    publicKey: {
      rp: { name: "Behaviour" },
      user: {
        id: userId,
        name: "behaviour-user",
        displayName: "Behaviour User",
      },
      challenge: challenge.buffer,
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "preferred",
        userVerification: "required",
      },
      timeout: 60000,
      extensions: { prf: {} } as AuthenticationExtensionsClientInputs,
    },
  })) as PublicKeyCredential | null;

  if (!credential) throw new Error("Credential creation cancelled");

  const results = credential.getClientExtensionResults() as AuthenticationExtensionsClientOutputs & {
    prf?: { enabled?: boolean };
  };

  const prfEnabled = results.prf?.enabled === true;

  const rawId = credential.rawId;

  await db.credentials.put({
    id: "primary",
    credentialId: rawId,
    prfEnabled,
    createdAt: Date.now(),
  });

  return { credentialId: rawId, prfEnabled };
}

async function authenticateWithPrf(): Promise<{
  prfOutput: ArrayBuffer;
}> {
  const cred = await db.credentials.get("primary");
  if (!cred) throw new Error("No credential registered");

  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)).buffer,
      allowCredentials: [
        {
          type: "public-key",
          id: cred.credentialId,
          transports: ["internal"],
        },
      ],
      userVerification: "required",
      timeout: 60000,
      extensions: {
        prf: {
          eval: { first: PRF_SALT },
        },
      } as AuthenticationExtensionsClientInputs,
    },
  })) as PublicKeyCredential | null;

  if (!assertion) throw new Error("Authentication cancelled");

  const results = assertion.getClientExtensionResults() as AuthenticationExtensionsClientOutputs & {
    prf?: { results?: { first?: ArrayBuffer } };
  };

  const prfOutput = results.prf?.results?.first;
  if (!prfOutput) throw new Error("PRF output not available");

  return { prfOutput };
}

async function deriveAesKey(prfOutput: ArrayBuffer): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    prfOutput,
    "HKDF",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: PRF_SALT,
      info: new TextEncoder().encode("behaviour-aes-key"),
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptApiKey(plaintext: string): Promise<void> {
  const cred = await db.credentials.get("primary");
  if (!cred) throw new Error("No credential registered");

  if (cred.prfEnabled) {
    const { prfOutput } = await authenticateWithPrf();
    const aesKey = await deriveAesKey(prfOutput);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesKey,
      encoded
    );

    const existing = await db.apiConfig.get("default");
    await db.apiConfig.put({
      ...existing!,
      id: "default",
      encryptedApiKey: encrypted,
      iv: iv.buffer,
      plaintextKey: null,
      isConfigured: true,
    });
  } else {
    await authenticateForFallback();
    const existing = await db.apiConfig.get("default");
    await db.apiConfig.put({
      ...existing!,
      id: "default",
      encryptedApiKey: null,
      iv: null,
      plaintextKey: plaintext,
      isConfigured: true,
    });
  }
}

export async function decryptApiKey(): Promise<string> {
  const config = await db.apiConfig.get("default");
  if (!config?.isConfigured) throw new Error("API key not configured");

  const cred = await db.credentials.get("primary");
  if (!cred) throw new Error("No credential registered");

  if (cred.prfEnabled && config.encryptedApiKey && config.iv) {
    const { prfOutput } = await authenticateWithPrf();
    const aesKey = await deriveAesKey(prfOutput);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(config.iv) },
      aesKey,
      config.encryptedApiKey
    );

    return new TextDecoder().decode(decrypted);
  }

  if (config.plaintextKey) {
    await authenticateForFallback();
    return config.plaintextKey;
  }

  throw new Error("No API key available");
}

async function authenticateForFallback(): Promise<void> {
  const cred = await db.credentials.get("primary");
  if (!cred) throw new Error("No credential registered");

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)).buffer,
      allowCredentials: [
        {
          type: "public-key",
          id: cred.credentialId,
          transports: ["internal"],
        },
      ],
      userVerification: "required",
      timeout: 60000,
    },
  });

  if (!assertion) throw new Error("Authentication cancelled");
}

export async function hasCredential(): Promise<boolean> {
  const cred = await db.credentials.get("primary");
  return !!cred;
}

export async function getCredentialStatus(): Promise<{
  registered: boolean;
  prfEnabled: boolean;
}> {
  const cred = await db.credentials.get("primary");
  if (!cred) return { registered: false, prfEnabled: false };
  return { registered: true, prfEnabled: cred.prfEnabled };
}
