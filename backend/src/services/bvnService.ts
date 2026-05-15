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
 * Sandbox BVN records — realistic Nigerian profiles for dev/demo use.
 * These mirror the shape of real NIBSS data returned by Prembly.
 * Use any of these BVNs in the registration form to see auto-fill in action.
 */
const SANDBOX_BVNS: Record<string, Omit<BvnResult, 'verified'>> = {
  '22191234560': { firstName: 'Chukwuemeka', lastName: 'Okonkwo',  dateOfBirth: '1985-03-15', phone: '08012345670' },
  '22192345671': { firstName: 'Fatima',       lastName: 'Abubakar', dateOfBirth: '1990-07-22', phone: '08023456781' },
  '22193456782': { firstName: 'Adebayo',      lastName: 'Adeleke',  dateOfBirth: '1988-11-05', phone: '08034567892' },
  '22194567893': { firstName: 'Ngozi',        lastName: 'Eze',      dateOfBirth: '1993-02-18', phone: '08045678903' },
  '22195678904': { firstName: 'Tunde',        lastName: 'Balogun',  dateOfBirth: '1982-09-30', phone: '08056789014' },
  '22196789015': { firstName: 'Amaka',        lastName: 'Nwosu',    dateOfBirth: '1995-06-12', phone: '08067890125' },
  '22197890126': { firstName: 'Ibrahim',      lastName: 'Musa',     dateOfBirth: '1979-12-25', phone: '08078901236' },
  '22198901237': { firstName: 'Chidinma',     lastName: 'Obi',      dateOfBirth: '1997-04-08', phone: '08089012347' },
  '22199012348': { firstName: 'Oluwaseun',    lastName: 'Adeyemi',  dateOfBirth: '1986-08-14', phone: '08090123458' },
  '22100123459': { firstName: 'Hauwa',        lastName: 'Yakubu',   dateOfBirth: '1992-01-27', phone: '08011234569' },
  '22101234560': { firstName: 'Emeka',        lastName: 'Nwankwo',  dateOfBirth: '1984-05-03', phone: '08022345670' },
  '22102345671': { firstName: 'Yetunde',      lastName: 'Ogunleye', dateOfBirth: '1991-10-19', phone: '08033456781' },
  '22103456782': { firstName: 'Usman',        lastName: 'Danjuma',  dateOfBirth: '1978-07-07', phone: '08044567892' },
  '22104567893': { firstName: 'Blessing',     lastName: 'Onyeka',   dateOfBirth: '1996-03-22', phone: '08055678903' },
  '22105678904': { firstName: 'Rotimi',       lastName: 'Fashola',  dateOfBirth: '1983-11-11', phone: '08066789014' },
  '22106789015': { firstName: 'Aisha',        lastName: 'Garba',    dateOfBirth: '1994-09-04', phone: '08077890125' },
  '22107890126': { firstName: 'Kelechi',      lastName: 'Uchenna',  dateOfBirth: '1989-06-16', phone: '08088901236' },
  '22108901237': { firstName: 'Folake',       lastName: 'Salami',   dateOfBirth: '1987-02-28', phone: '08099012347' },
  '22109012348': { firstName: 'Musa',         lastName: 'Aliyu',    dateOfBirth: '1976-12-01', phone: '08010123458' },
  '22110123459': { firstName: 'Adaeze',       lastName: 'Okafor',   dateOfBirth: '1998-08-09', phone: '08021234569' },
};

/**
 * Simulates a NIBSS BVN response for development & testing.
 * Checks the sandbox database first; unknown BVNs get a deterministic
 * profile so any 11-digit number still produces a consistent result.
 */
function simulateBvnLookup(bvn: string): BvnResult {
  // Known sandbox BVN → return exact record
  const record = SANDBOX_BVNS[bvn];
  if (record) {
    return { verified: true, ...record };
  }

  // Unknown BVN → deterministic fallback (keeps behaviour reproducible)
  const firstNames = ['Emeka', 'Fatima', 'Chidi', 'Amaka', 'Tunde', 'Ngozi', 'Bola', 'Yemi',
                      'Kunle', 'Ada', 'Seun', 'Halima', 'Gbenga', 'Ifeoma', 'Bashir', 'Sola'];
  const lastNames  = ['Okafor', 'Adeleke', 'Ibrahim', 'Nwosu', 'Balogun', 'Eze', 'Abubakar',
                      'Adeyemi', 'Musa', 'Obi', 'Lawal', 'Dankwa', 'Fashola', 'Ogbu', 'Yakubu'];

  const fn  = firstNames[parseInt(bvn[4], 10) % firstNames.length];
  const ln  = lastNames[parseInt(bvn[7], 10) % lastNames.length];
  const yr  = 1970 + (parseInt(bvn.slice(8, 10), 10) % 35);
  const mo  = String((parseInt(bvn[5], 10) % 12) + 1).padStart(2, '0');
  const day = String((parseInt(bvn[6], 10) % 28) + 1).padStart(2, '0');

  return {
    verified: true,
    firstName: fn,
    lastName: ln,
    dateOfBirth: `${yr}-${mo}-${day}`,
    phone: `0${bvn.slice(1, 11)}`,
  };
}
