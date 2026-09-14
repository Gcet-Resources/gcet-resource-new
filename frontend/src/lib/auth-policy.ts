export const COLLEGE_DOMAIN = "galgotiacollege.edu";
export type CampusRole =
  "student" | "staff" | "club_head" | "council" | "admin";
export const PRIVILEGED_ROLES: readonly CampusRole[] = [
  "staff",
  "club_head",
  "council",
  "admin",
];

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAllowedDomain(email: string): boolean {
  const value = normalizeEmail(email);
  return (
    value.length <= 254 &&
    /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@galgotiacollege\.edu$/.test(value)
  );
}

export function isVerifiedCollegeUser(
  user: { email?: string; email_confirmed_at?: string | null } | null,
): boolean {
  return Boolean(
    user?.email && user.email_confirmed_at && isAllowedDomain(user.email),
  );
}

export function safeReturnPath(
  value: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    [...value].some((character) => character.charCodeAt(0) < 32)
  )
    return fallback;
  try {
    const parsed = new URL(value, "https://campus.invalid");
    if (
      parsed.origin !== "https://campus.invalid" ||
      ["/login", "/auth/callback"].includes(parsed.pathname)
    )
      return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function isValidPhoneNumber(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

export function validateProfilePreferences(
  displayName: string,
  year: number | null,
  semester: number | null,
): string | null {
  if (displayName.trim().length < 2 || displayName.trim().length > 100)
    return "Enter a name between 2 and 100 characters.";
  if (year !== null && (!Number.isInteger(year) || year < 1 || year > 4))
    return "Choose an academic year from 1 to 4.";
  if (
    semester !== null &&
    (!Number.isInteger(semester) || semester < 1 || semester > 8)
  )
    return "Choose a semester from 1 to 8.";
  if (year !== null && semester !== null && Math.ceil(semester / 2) !== year)
    return "Choose a semester that belongs to your academic year.";
  return null;
}

export function isPrivilegedMembership(
  status: string | null | undefined,
  roles: readonly { role: CampusRole }[],
): boolean {
  return (
    status === "active" &&
    roles.some(({ role }) => PRIVILEGED_ROLES.includes(role))
  );
}

export function needsSecondFactor(
  isPrivileged: boolean,
  currentLevel: string | null,
  nextLevel: string | null,
): boolean {
  return currentLevel !== "aal2" && (isPrivileged || nextLevel === "aal2");
}

export function authErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const candidate = error as { code?: string; message?: string } | null;
  const code = candidate?.code ?? "";
  const message = candidate?.message ?? "";
  if (code === "otp_expired" || /token has expired|otp.*expired/i.test(message))
    return "This code is invalid or has expired. Check the latest email or request a new code.";
  if (
    /rate_limit|over_email_send_rate_limit|over_request_rate_limit/.test(
      code,
    ) ||
    /rate limit|too many requests|seconds before requesting/i.test(message)
  )
    return "Too many attempts. Wait a little before requesting another code.";
  if (/mfa_verification_failed|mfa_challenge_expired/.test(code))
    return "That verification code is invalid or expired. Try a fresh code.";
  if (
    /mfa_phone_enroll_not_enabled|mfa_phone_verify_not_enabled|phone_provider_disabled/.test(
      code,
    )
  )
    return "SMS verification is not available right now. Use an authenticator app or contact the campus team.";
  if (/mfa_totp_enroll_not_enabled/.test(code))
    return "Authenticator setup is not available right now. Please contact the campus team.";
  if (/insufficient_aal|mfa_required/.test(code))
    return "Verify your second factor before making this change.";
  if (/suspended/i.test(message))
    return "Your campus account is suspended. Contact the campus team for help.";
  if (/college|institutional|galgotiacollege/i.test(message))
    return "Use a verified @galgotiacollege.edu email to access your campus account.";
  if (/email_address_not_authorized|email_provider_disabled/.test(code))
    return "Email sign-in is not available on this deployment yet. Please contact the campus team.";
  if (/hook_timeout|hook_timeout_after_retry/.test(code))
    return "Account verification is taking too long. Please try again shortly.";
  if (/captcha_failed/.test(code) || /captcha/i.test(message))
    return "The security check could not be verified. Complete it again and request a new code.";
  if (/fetch|network|load failed|offline/i.test(message))
    return "We couldn't reach the campus service. Check your connection and try again.";
  if (code === "42501" || /permission denied/.test(message))
    return "Your account does not have permission to make this change.";
  if (error instanceof Error && error.message.startsWith("Campus accounts"))
    return error.message;
  return fallback;
}
