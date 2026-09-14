import test from "node:test";
import assert from "node:assert/strict";
import {
  isAllowedDomain,
  isVerifiedCollegeUser,
  safeReturnPath,
  isValidPhoneNumber,
  validateProfilePreferences,
  isPrivilegedMembership,
  needsSecondFactor,
  authErrorMessage,
} from "../src/lib/auth-policy.ts";

test("institutional identity admits only the exact college domain", () => {
  assert.equal(isAllowedDomain(" Student+club@GALGOTIACOLLEGE.EDU "), true);
  for (const email of [
    "",
    "@galgotiacollege.edu",
    "student@gmail.com",
    "student@galgotiacollege.edu.attacker.test",
    "student@sub.galgotiacollege.edu",
    "student@evil.test@galgotiacollege.edu",
    "a b@galgotiacollege.edu",
    "a\nb@galgotiacollege.edu",
  ]) {
    assert.equal(isAllowedDomain(email), false, email);
  }
});

test("college email text alone is insufficient, including for a saved session", () => {
  assert.equal(isVerifiedCollegeUser(null), false);
  assert.equal(
    isVerifiedCollegeUser({ email: "student@galgotiacollege.edu" }),
    false,
  );
  assert.equal(
    isVerifiedCollegeUser({
      email: "student@galgotiacollege.edu",
      email_confirmed_at: null,
    }),
    false,
  );
  assert.equal(
    isVerifiedCollegeUser({
      email: "outsider@example.test",
      email_confirmed_at: "2026-09-14T00:00:00Z",
    }),
    false,
  );
  assert.equal(
    isVerifiedCollegeUser({
      email: "student@galgotiacollege.edu",
      email_confirmed_at: "2026-09-14T00:00:00Z",
    }),
    true,
  );
});

test("post-login destinations cannot leave the app or loop through login", () => {
  for (const path of [
    null,
    "",
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/\nevil.test",
    "javascript:alert(1)",
    "/login?next=/admin",
    "/auth/callback?code=secret",
  ]) {
    assert.equal(safeReturnPath(path), "/dashboard", String(path));
  }
  assert.equal(
    safeReturnPath("/resources/1st/BAS101?kind=notes#chapter"),
    "/resources/1st/BAS101?kind=notes#chapter",
  );
});

test("all privileged roles need active membership; student role is not elevated", () => {
  for (const role of ["staff", "club_head", "council", "admin"]) {
    assert.equal(isPrivilegedMembership("active", [{ role }]), true);
    assert.equal(isPrivilegedMembership("pending", [{ role }]), false);
    assert.equal(isPrivilegedMembership("suspended", [{ role }]), false);
  }
  assert.equal(isPrivilegedMembership("active", [{ role: "student" }]), false);
});

test("student MFA becomes required when opted in; privilege requires enrollment too", () => {
  assert.equal(needsSecondFactor(false, "aal1", "aal1"), false);
  assert.equal(needsSecondFactor(false, "aal1", "aal2"), true);
  assert.equal(needsSecondFactor(true, "aal1", "aal1"), true);
  assert.equal(needsSecondFactor(true, null, null), true);
  assert.equal(needsSecondFactor(true, "aal2", "aal2"), false);
  assert.equal(needsSecondFactor(false, "aal2", "aal2"), false);
});

test("phone factor input uses international E.164 format", () => {
  assert.equal(isValidPhoneNumber("+919876543210"), true);
  for (const number of [
    "9876543210",
    "+0123456789",
    "+91 9876543210",
    "+123",
    "+1234567890123456",
    "+919876543210<script>",
  ])
    assert.equal(isValidPhoneNumber(number), false);
});

test("profile preferences reject mismatched semester/year without guessing course", () => {
  assert.equal(validateProfilePreferences("Student Name", null, null), null);
  assert.equal(validateProfilePreferences("Student Name", 2, 4), null);
  assert.ok(validateProfilePreferences("Student Name", 2, 5));
  assert.ok(validateProfilePreferences("Student Name", 0, 1));
  assert.ok(validateProfilePreferences("Student Name", 5, 9));
  assert.ok(validateProfilePreferences("Student Name", 1.5, 2));
  assert.ok(validateProfilePreferences(" ", null, null));
  assert.ok(validateProfilePreferences("x".repeat(101), null, null));
});

test("OTP and backend capability errors produce honest recovery messages", () => {
  assert.match(
    authErrorMessage({ code: "otp_expired" }),
    /invalid or has expired/,
  );
  assert.match(
    authErrorMessage({ code: "over_email_send_rate_limit" }),
    /Wait/,
  );
  assert.match(
    authErrorMessage({ code: "mfa_phone_enroll_not_enabled" }),
    /not available/,
  );
  assert.match(authErrorMessage({ code: "42501" }), /does not have permission/);
  assert.equal(
    authErrorMessage(
      { message: "sensitive internal database details" },
      "Unable to save.",
    ),
    "Unable to save.",
  );
});
