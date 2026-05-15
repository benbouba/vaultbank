const BIOMETRIC_KEY = 'vb-biometric';

interface BiometricData {
  credentialId: string; // base64url encoded
  phone: string;
  refreshToken: string;
}

export function isBiometricSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.PublicKeyCredential !== 'undefined';
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isBiometricSupported()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function getBiometricData(): BiometricData | null {
  try {
    const stored = localStorage.getItem(BIOMETRIC_KEY);
    return stored ? (JSON.parse(stored) as BiometricData) : null;
  } catch {
    return null;
  }
}

export function hasBiometricEnrolled(): boolean {
  return getBiometricData() !== null;
}

function arrayBufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlToArrayBuffer(b64url: string): ArrayBuffer {
  const base64 = b64url.replace(/-/g, '+').replace(/\//g, '/');
  const binary = atob(base64.padEnd(b64url.length + ((4 - (b64url.length % 4)) % 4), '='));
  const buf = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
  return buf;
}

/**
 * Registers a platform biometric credential (Face ID / Touch ID / Windows Hello).
 * Should be called after a successful PIN login to enrol the device.
 * The OS will prompt the user for consent via its native biometric prompt.
 */
export async function enrollBiometric(phone: string, refreshToken: string): Promise<boolean> {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    // Encode phone as user.id — must be ≤ 64 bytes
    const userId = new TextEncoder().encode(phone.slice(0, 64));

    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'VaultBank', id: window.location.hostname },
        user: { id: userId, name: phone, displayName: phone },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },   // ES256 (preferred)
          { alg: -257, type: 'public-key' }, // RS256 (fallback)
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      },
    })) as PublicKeyCredential | null;

    if (!credential) return false;

    const data: BiometricData = {
      credentialId: arrayBufferToBase64url(credential.rawId),
      phone,
      refreshToken,
    };
    localStorage.setItem(BIOMETRIC_KEY, JSON.stringify(data));
    return true;
  } catch {
    // User cancelled or platform doesn't support it
    return false;
  }
}

/**
 * Authenticates the user via the previously enrolled biometric credential.
 * The OS will prompt for Face ID / fingerprint.
 * Returns phone + refreshToken on success, null on failure / cancellation.
 */
export async function authenticateBiometric(): Promise<{ phone: string; refreshToken: string } | null> {
  const data = getBiometricData();
  if (!data) return null;

  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const assertion = (await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [
          { id: base64urlToArrayBuffer(data.credentialId), type: 'public-key' },
        ],
        userVerification: 'required',
        timeout: 60000,
      },
    })) as PublicKeyCredential | null;

    if (!assertion) return null;
    return { phone: data.phone, refreshToken: data.refreshToken };
  } catch {
    // User cancelled or credential not found
    return null;
  }
}

/** Updates the stored refresh token after a successful biometric login (token rotation). */
export function updateBiometricRefreshToken(refreshToken: string): void {
  const data = getBiometricData();
  if (data) {
    localStorage.setItem(BIOMETRIC_KEY, JSON.stringify({ ...data, refreshToken }));
  }
}

export function clearBiometricEnrollment(): void {
  localStorage.removeItem(BIOMETRIC_KEY);
}
