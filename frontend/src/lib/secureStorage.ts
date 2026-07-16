import { StateStorage } from "zustand/middleware";

const PASSPHRASE = "kybergym-secure-persistence-key-999";
const SALT = new Uint8Array([83, 101, 99, 117, 114, 101, 75, 121, 98, 101, 114, 71, 121, 109, 83, 97]); // Stable salt

async function getEncryptionKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(PASSPHRASE),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: SALT,
      iterations: 1000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encrypt(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const key = await getEncryptionKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12-byte IV for AES-GCM
  
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  
  const encryptedBytes = new Uint8Array(encrypted);
  const combined = new Uint8Array(iv.length + encryptedBytes.length);
  combined.set(iv);
  combined.set(encryptedBytes, iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

async function decrypt(ciphertext: string): Promise<string> {
  const key = await getEncryptionKey();
  const binaryString = atob(ciphertext);
  const combined = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    combined[i] = binaryString.charCodeAt(i);
  }
  
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

export const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = localStorage.getItem(name);
    if (!value) return null;
    try {
      return await decrypt(value);
    } catch (e) {
      console.warn(`Secure storage decryption failed for ${name}. Clearing corrupted storage.`, e);
      localStorage.removeItem(name);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const encrypted = await encrypt(value);
      localStorage.setItem(name, encrypted);
    } catch (e) {
      console.error(`Secure storage encryption failed for ${name}`, e);
    }
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};
