import { WhopServerSdk } from "@whop/api";

// ---------------------------------------------------------------------------
// Whop access control
//
// Whop embeds your app in an iframe on whop.com and sends a short-lived JWT in
// the `x-whop-user-token` header on every same-origin request. We verify that
// token to get a user id, then check whether that user has access to the
// experience that installed the app.
// Docs: https://docs.whop.com/developer/guides/authentication
//
// GATED by the WHOP_ACCESS_ENABLED env flag:
//   - WHOP_ACCESS_ENABLED !== "true"  -> "open" mode: everyone is allowed
//     (local dev, demos, and standalone deploys work out of the box).
//   - WHOP_ACCESS_ENABLED === "true"  -> paid mode: request must carry a valid
//     Whop user token AND that user must have access to WHOP_EXPERIENCE_ID.
//
// Required env in paid mode:
//   WHOP_API_KEY, WHOP_APP_ID (or NEXT_PUBLIC_WHOP_APP_ID), WHOP_EXPERIENCE_ID
// ---------------------------------------------------------------------------

export type AccessResult =
  | { ok: true; mode: "open"; userId: null }
  | { ok: true; mode: "paid"; userId: string }
  | { ok: false; status: number; message: string };

const ENABLED = process.env.WHOP_ACCESS_ENABLED === "true";

export function accessGatingEnabled(): boolean {
  return ENABLED;
}

// Lazily create the SDK so builds and "open" mode never require credentials.
let cachedSdk: ReturnType<typeof WhopServerSdk> | null = null;

function getSdk() {
  if (cachedSdk) return cachedSdk;

  const appApiKey = process.env.WHOP_API_KEY;
  const appId = process.env.WHOP_APP_ID || process.env.NEXT_PUBLIC_WHOP_APP_ID;
  if (!appApiKey || !appId) {
    throw new Error(
      "Whop gating is enabled but WHOP_API_KEY and WHOP_APP_ID are not set."
    );
  }

  cachedSdk = WhopServerSdk({ appApiKey, appId });
  return cachedSdk;
}

/**
 * Verify the incoming request has access to the app.
 * Returns an AccessResult that the caller turns into an HTTP response.
 */
export async function checkAccess(request: Request): Promise<AccessResult> {
  // Open mode: no gating. Keeps the MVP usable without Whop configured.
  if (!ENABLED) {
    return { ok: true, mode: "open", userId: null };
  }

  const experienceId = process.env.WHOP_EXPERIENCE_ID;
  if (!experienceId) {
    return {
      ok: false,
      status: 500,
      message: "Server misconfigured: WHOP_EXPERIENCE_ID is not set.",
    };
  }

  let sdk: ReturnType<typeof WhopServerSdk>;
  try {
    sdk = getSdk();
  } catch (err) {
    return {
      ok: false,
      status: 500,
      message: err instanceof Error ? err.message : "Whop is not configured.",
    };
  }

  // 1. Verify the JWT from the x-whop-user-token header. dontThrow -> null on
  //    a missing/invalid token so we can return a clean 401.
  let userId: string;
  try {
    const payload = await sdk.verifyUserToken(request.headers, {
      dontThrow: true,
    });
    if (!payload?.userId) {
      return {
        ok: false,
        status: 401,
        message: "Please open this app from your Whop to continue.",
      };
    }
    userId = payload.userId;
  } catch {
    return {
      ok: false,
      status: 401,
      message: "Could not verify your Whop session.",
    };
  }

  // 2. Confirm the user has access to the experience that embeds this app.
  try {
    const access = await sdk.access.checkIfUserHasAccessToExperience({
      experienceId,
      userId,
    });
    if (!access.hasAccess) {
      return {
        ok: false,
        status: 403,
        message: "You need an active membership to use this tool.",
      };
    }
    return { ok: true, mode: "paid", userId };
  } catch (err) {
    return {
      ok: false,
      status: 502,
      message:
        err instanceof Error ? err.message : "Failed to check Whop access.",
    };
  }
}
