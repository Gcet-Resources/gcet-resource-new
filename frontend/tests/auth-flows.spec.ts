import { test, expect, type Page } from "@playwright/test";

// All Auth/PostgREST traffic is intercepted. These tests never send email or SMS.
const userId = "11111111-1111-4111-8111-111111111111";
const email = "student@galgotiacollege.edu";
type FixtureFactor = {
  id: string;
  friendly_name: string;
  factor_type: "totp" | "phone";
  status: "verified" | "unverified";
  created_at: string;
  updated_at: string;
};

async function mockCampus(
  page: Page,
  options: {
    privileged?: boolean;
    enrolled?: boolean;
    noProfile?: boolean;
  } = {},
) {
  await page.route(
    "https://challenges.cloudflare.com/turnstile/v0/api.js*",
    (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: `
    const widgets = new Map(); let count = 0;
    window.turnstile = {
      render(container, options) {
        const id = 'captcha-' + (++count);
        const complete = document.createElement('button'); complete.type = 'button';
        complete.textContent = 'Complete test security check';
        complete.onclick = () => options.callback('captcha-fixture-token');
        const expire = document.createElement('button'); expire.type = 'button';
        expire.textContent = 'Expire test security check'; expire.onclick = () => options['expired-callback']();
        container.append(complete, expire); widgets.set(id, { container, options }); return id;
      },
      reset(id) { if (widgets.has(id)) widgets.get(id).container.dataset.reset = 'true'; },
      remove(id) { if (widgets.has(id)) widgets.get(id).container.replaceChildren(); widgets.delete(id); }
    };
  `,
      }),
  );
  const stamp = new Date().toISOString();
  let factors: FixtureFactor[] = options.enrolled
    ? [
        {
          id: "phone-existing",
          friendly_name: "Phone ending 3210",
          factor_type: "phone",
          status: "verified",
          created_at: stamp,
          updated_at: stamp,
        },
      ]
    : [];
  let profile: Record<string, unknown> | null = options.noProfile
    ? null
    : {
        id: userId,
        display_name: "Campus Student",
        course_id: null,
        academic_year: 1,
        semester: 1,
        created_at: stamp,
        updated_at: stamp,
      };
  let membership: Record<string, unknown> | null = profile
    ? { user_id: userId, status: "active" }
    : null;
  let aal = "aal1";
  let expired = false;
  const calls: Array<{
    path: string;
    method: string;
    body: Record<string, unknown>;
  }> = [];
  const user = () => ({
    id: userId,
    aud: "authenticated",
    role: "authenticated",
    email,
    email_confirmed_at: stamp,
    confirmed_at: stamp,
    created_at: stamp,
    updated_at: stamp,
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
    identities: [],
    factors,
  });
  function session() {
    const iat = Math.floor(Date.now() / 1000);
    const payload = {
      sub: userId,
      aud: "authenticated",
      role: "authenticated",
      email,
      aal,
      iat,
      exp: iat + 3600,
      session_id: "22222222-2222-4222-8222-222222222222",
    };
    const token =
      Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
        "base64url",
      ) +
      "." +
      Buffer.from(JSON.stringify(payload)).toString("base64url") +
      "." +
      Buffer.alloc(32).toString("base64url");
    return {
      access_token: token,
      refresh_token: "local-fixture-refresh-token",
      token_type: "bearer",
      expires_in: 3600,
      expires_at: iat + 3600,
      user: user(),
    };
  }
  await page.route("http://127.0.0.1:54321/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();
    const body = request.postData()
      ? (JSON.parse(request.postData()!) as Record<string, unknown>)
      : {};
    calls.push({ path, method, body });
    const respond = (data: unknown, status = 200) =>
      route.fulfill({
        status,
        contentType: "application/json",
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "*",
        },
        body: JSON.stringify(data),
      });
    if (method === "OPTIONS") return respond({});
    if (path === "/auth/v1/otp") return respond({});
    if (path === "/auth/v1/verify") {
      if (expired)
        return respond(
          { code: "otp_expired", msg: "Token has expired or is invalid" },
          403,
        );
      aal = "aal1";
      return respond(session());
    }
    if (path === "/auth/v1/user") return respond(user());
    if (path === "/auth/v1/logout") return respond({});
    if (path === "/auth/v1/token") return respond(session());
    if (path === "/auth/v1/factors" && method === "POST") {
      const type = body.factor_type as "phone" | "totp";
      const id = type + "-" + (factors.length + 1);
      factors.push({
        id,
        factor_type: type,
        friendly_name: String(body.friendly_name),
        status: "unverified",
        created_at: stamp,
        updated_at: stamp,
      });
      return respond(
        type === "phone"
          ? { id, type, phone: body.phone }
          : {
              id,
              type,
              totp: {
                qr_code:
                  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="black"/></svg>',
                secret: "JBSWY3DPEHPK3PXP",
                uri: "otpauth://totp/fixture",
              },
            },
      );
    }
    if (/\/factors\/[^/]+\/challenge$/.test(path))
      return respond({
        id: "fixture-challenge",
        type: factors.find((factor) => path.includes(factor.id))?.factor_type,
        expires_at: Math.floor(Date.now() / 1000) + 300,
      });
    if (/\/factors\/[^/]+\/verify$/.test(path)) {
      factors = factors.map((factor) =>
        path.includes(factor.id) ? { ...factor, status: "verified" } : factor,
      );
      aal = "aal2";
      return respond(session());
    }
    if (/\/factors\/[^/]+$/.test(path) && method === "DELETE") {
      factors = factors.filter((factor) => !path.endsWith("/" + factor.id));
      return respond({ id: path.split("/").at(-1) });
    }
    if (path === "/rest/v1/rpc/complete_onboarding") {
      profile = {
        id: userId,
        display_name: body.p_display_name,
        course_id: body.p_course_id,
        academic_year: body.p_academic_year,
        semester: body.p_semester,
        created_at: stamp,
        updated_at: stamp,
      };
      membership = { user_id: userId, status: "active" };
      return respond(profile);
    }
    if (path === "/rest/v1/profiles") return respond(profile ? [profile] : []);
    if (path === "/rest/v1/memberships")
      return respond(membership ? [membership] : []);
    if (path === "/rest/v1/role_assignments")
      return respond(
        membership
          ? [
              {
                id: "fixture-role",
                user_id: userId,
                role: options.privileged ? "admin" : "student",
                club_id: null,
              },
            ]
          : [],
      );
    if (path.startsWith("/rest/v1/")) return respond([]);
    return respond({ error: "Unexpected fixture endpoint" }, 500);
  });
  return {
    calls,
    expireCode: () => {
      expired = true;
    },
  };
}

async function emailSignIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("College email", { exact: true }).fill(email);
  await page
    .getByRole("button", { name: "Complete test security check" })
    .click();
  await page.getByRole("button", { name: "Send email code" }).click();
  await page.getByLabel("Email verification code").fill("123456");
  await page.getByRole("button", { name: "Verify and continue" }).click();
}

test("rejects external email locally and reports expired OTP without signing in", async ({
  page,
}) => {
  const fixture = await mockCampus(page);
  await page.goto("/login");
  await expect(
    page.getByRole("button", { name: "Send email code" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Complete test security check" })
    .click();
  await page
    .getByRole("button", { name: "Expire test security check" })
    .click();
  await expect(
    page.getByRole("button", { name: "Send email code" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Complete test security check" })
    .click();
  await page
    .getByLabel("College email", { exact: true })
    .fill("outsider@example.com");
  await page.getByRole("button", { name: "Send email code" }).click();
  await expect(page.getByRole("alert")).toContainText("cannot register");
  expect(fixture.calls.some((call) => call.path === "/auth/v1/otp")).toBe(
    false,
  );
  await page.getByLabel("College email", { exact: true }).fill(email);
  await page.getByRole("button", { name: "Send email code" }).click();
  await expect(page.getByRole("button", { name: /Resend in/ })).toBeDisabled();
  expect(
    fixture.calls.find((call) => call.path === "/auth/v1/otp")?.body,
  ).toMatchObject({
    gotrue_meta_security: { captcha_token: "captcha-fixture-token" },
  });
  fixture.expireCode();
  await page.getByLabel("Email verification code").fill("123456");
  await page.getByRole("button", { name: "Verify and continue" }).click();
  await expect(page.getByRole("alert")).toContainText("invalid or has expired");
  await expect(page).toHaveURL(/\/login$/);
});

test("verified student completes profile and enrolls a real phone MFA factor", async ({
  page,
}) => {
  const fixture = await mockCampus(page, { noProfile: true });
  await emailSignIn(page);
  await expect(page).toHaveURL(/\/account/);
  await page.getByLabel("Full name", { exact: true }).fill("Campus Student");
  await page.getByLabel(/Academic year/).selectOption("2");
  await page.getByLabel(/Semester/).selectOption("4");
  await page.getByRole("button", { name: "Create my student profile" }).click();
  await expect(page.getByRole("status")).toContainText(
    "preferences have been saved",
  );
  expect(
    fixture.calls.find((call) => call.path.endsWith("complete_onboarding"))
      ?.body,
  ).toMatchObject({
    p_display_name: "Campus Student",
    p_academic_year: 2,
    p_semester: 4,
  });
  await page.getByLabel("Phone with country code").fill("+919876543210");
  await page.getByRole("button", { name: "Send verification SMS" }).click();
  await expect(
    page.getByText("Verification SMS requested.", { exact: false }),
  ).toBeVisible();
  expect(
    fixture.calls.find((call) => call.path === "/auth/v1/factors")?.body,
  ).toMatchObject({ factor_type: "phone", phone: "+919876543210" });
  expect(
    fixture.calls.find((call) => call.path.endsWith("/challenge"))?.body,
  ).toMatchObject({ channel: "sms" });
  await page.getByLabel("Verification code", { exact: true }).fill("123456");
  await page.getByRole("button", { name: "Verify code", exact: true }).click();
  await expect(
    page.getByText("Second step verified for this session", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Phone ending 3210", { exact: true }),
  ).toBeVisible();
  expect(
    fixture.calls.some((call) => /\/factors\/.+\/verify$/.test(call.path)),
  ).toBe(true);
});

test("an opted-in student must challenge their saved phone before continuing and can remove it", async ({
  page,
}) => {
  const fixture = await mockCampus(page, { enrolled: true });
  await emailSignIn(page);
  await expect(page).toHaveURL(/\/account/);
  await expect(
    page.getByText(/You enabled an extra verification step/),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Continue to campus" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Send SMS code", exact: true })
    .click();
  await page.getByLabel("Verification code", { exact: true }).fill("123456");
  await page.getByRole("button", { name: "Verify code", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Continue to campus" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Remove Phone ending 3210" }).click();
  await page
    .getByRole("button", { name: "Remove method", exact: true })
    .click();
  await expect(
    page.getByText("Verification method removed.", { exact: true }),
  ).toBeVisible();
  expect(
    fixture.calls.some(
      (call) =>
        call.path.endsWith("phone-existing") && call.method === "DELETE",
    ),
  ).toBe(true);
});

test("privileged membership requires TOTP setup and protects its last method", async ({
  page,
}) => {
  const fixture = await mockCampus(page, { privileged: true });
  await emailSignIn(page);
  await expect(page).toHaveURL(/\/account/);
  await expect(
    page.getByText(/Your campus role requires a second verification step/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add authenticator" }).click();
  await expect(page.getByAltText(/QR code to add GCET/)).toBeVisible();
  expect(
    fixture.calls.find((call) => call.path === "/auth/v1/factors")?.body
      .factor_type,
  ).toBe("totp");
  await page.getByLabel("Verification code", { exact: true }).fill("123456");
  await page.getByRole("button", { name: "Verify code", exact: true }).click();
  await expect(
    page.getByText("Second step verified for this session", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^Remove Authenticator/ }),
  ).toBeDisabled();
});

test("invitation token callback verifies once and removes the token from the URL", async ({
  page,
}) => {
  const fixture = await mockCampus(page);
  await page.goto(
    "/auth/callback?token_hash=local-invite-fixture&type=invite&next=%2Faccount",
  );
  await expect(page).toHaveURL(/\/account$/);
  expect(
    fixture.calls.filter((call) => call.path === "/auth/v1/verify"),
  ).toHaveLength(1);
  expect(
    fixture.calls.find((call) => call.path === "/auth/v1/verify")?.body,
  ).toMatchObject({ token_hash: "local-invite-fixture", type: "invite" });
  expect(page.url()).not.toContain("token_hash");
});
