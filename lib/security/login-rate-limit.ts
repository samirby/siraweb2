type AttemptState = {
  failures: number;
  firstFailureAt: number;
  blockedUntil: number;
};

const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

const globalForLoginRateLimit = globalThis as unknown as {
  siraLoginAttempts?: Map<string, AttemptState>;
};

const attempts =
  globalForLoginRateLimit.siraLoginAttempts ?? new Map<string, AttemptState>();

if (process.env.NODE_ENV !== "production") {
  globalForLoginRateLimit.siraLoginAttempts = attempts;
}

function keyFor(email: string) {
  return email.trim().toLowerCase();
}

export function canAttemptLogin(email: string) {
  const key = keyFor(email);
  const now = Date.now();
  const state = attempts.get(key);

  if (!state) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (state.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((state.blockedUntil - now) / 1000),
    };
  }

  if (now - state.firstFailureAt > WINDOW_MS) {
    attempts.delete(key);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordLoginFailure(email: string) {
  const key = keyFor(email);
  const now = Date.now();
  const existing = attempts.get(key);

  if (!existing || now - existing.firstFailureAt > WINDOW_MS) {
    attempts.set(key, {
      failures: 1,
      firstFailureAt: now,
      blockedUntil: 0,
    });
    return;
  }

  const failures = existing.failures + 1;

  attempts.set(key, {
    failures,
    firstFailureAt: existing.firstFailureAt,
    blockedUntil: failures >= MAX_FAILURES ? now + BLOCK_MS : 0,
  });
}

export function resetLoginFailures(email: string) {
  attempts.delete(keyFor(email));
}
