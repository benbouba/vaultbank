import { config } from '../config';

export interface BvnResult {
  verified: boolean;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phone?: string;
  error?: string;
}

/**
 * Verifies a BVN via Prembly (Identitypass) when API keys are configured,
 * or returns a simulated response in development mode.
 *
 * Prembly docs: https://docs.prembly.com/docs/bvn-verification
 */
export async function verifyBvn(bvn: string): Promise<BvnResult> {
  if (!/^\d{11}$/.test(bvn)) {
    return { verified: false, error: 'BVN must be exactly 11 digits.' };
  }

  // Use real Prembly API when keys are present
  if (config.prembly.apiKey && config.prembly.appId) {
    return callPrembly(bvn);
  }

  // Development simulation — mimics NIBSS data shape
  if (config.isDev) {
    return simulateBvnLookup(bvn);
  }

  return {
    verified: false,
    error: 'BVN verification is not configured. Set PREMBLY_API_KEY and PREMBLY_APP_ID.',
  };
}

async function callPrembly(bvn: string): Promise<BvnResult> {
  try {
    const response = await fetch(
      'https://api.prembly.com/identitypass/verification/bvn',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.prembly.apiKey,
          'app-id': config.prembly.appId,
        },
        body: JSON.stringify({ number: bvn }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('[Prembly] HTTP error:', response.status, err);
      return { verified: false, error: 'BVN verification service unavailable. Try again.' };
    }

    const data = (await response.json()) as {
      status: boolean;
      detail?: {
        firstName?: string;
        lastName?: string;
        dateOfBirth?: string;
        phoneNumber1?: string;
      };
    };

    if (!data.status || !data.detail) {
      return { verified: false, error: 'BVN could not be verified. Check the number and try again.' };
    }

    return {
      verified: true,
      firstName: data.detail.firstName,
      lastName: data.detail.lastName,
      dateOfBirth: data.detail.dateOfBirth,
      phone: data.detail.phoneNumber1,
    };
  } catch (err) {
    console.error('[Prembly] Network error:', err);
    return { verified: false, error: 'Could not reach BVN verification service. Try again.' };
  }
}

/**
 * Simulates a realistic NIBSS BVN response for development & testing.
 * Returns deterministic data derived from the BVN digits so it is
 * reproducible (same BVN → same "name") without hitting a real API.
 */
function simulateBvnLookup(bvn: string): BvnResult {
  const firstNames = ['Emeka', 'Fatima', 'Chidi', 'Amaka', 'Tunde', 'Ngozi', 'Bola', 'Yemi'];
  const lastNames = ['Okafor', 'Adeleke', 'Ibrahim', 'Nwosu', 'Balogun', 'Eze', 'Abubakar', 'Adeyemi'];

  const fnIndex = parseInt(bvn[4], 10) % firstNames.length;
  const lnIndex = parseInt(bvn[7], 10) % lastNames.length;
  const year = 1970 + (parseInt(bvn.slice(8, 10), 10) % 35);
  const month = String((parseInt(bvn[5], 10) % 12) + 1).padStart(2, '0');
  const day = String((parseInt(bvn[6], 10) % 28) + 1).padStart(2, '0');

  return {
    verified: true,
    firstName: firstNames[fnIndex],
    lastName: lastNames[lnIndex],
    dateOfBirth: `${year}-${month}-${day}`,
    phone: `0${bvn.slice(1, 11)}`,
  };
}
