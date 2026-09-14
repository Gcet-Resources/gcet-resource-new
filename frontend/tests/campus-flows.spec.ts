import { test, expect, type Page } from "@playwright/test";

// Auth and PostgREST are intercepted; no campus data, email or SMS is sent.
const userId = "11111111-1111-4111-8111-111111111111";
const clubId = "33333333-3333-4333-8333-333333333333";
const noticeId = "44444444-4444-4444-8444-444444444444";
const courseId = "55555555-5555-4555-8555-555555555555";
const requestId = "66666666-6666-4666-8666-666666666666";
type ApiCall = {
  path: string;
  method: string;
  body: Record<string, unknown>;
  prefer: string;
};

async function mockCampus(page: Page, admin = false) {
  const stamp = new Date().toISOString();
  const email = `${admin ? "admin" : "student"}@galgotiacollege.edu`;
  const factors = admin
    ? [
        {
          id: "verified-totp",
          factor_type: "totp",
          status: "verified",
          created_at: stamp,
          updated_at: stamp,
        },
      ]
    : [];
  const user = {
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
  };
  const iat = Math.floor(Date.now() / 1000);
  const claims = {
    sub: userId,
    aud: "authenticated",
    role: "authenticated",
    email,
    aal: admin ? "aal2" : "aal1",
    iat,
    exp: iat + 3600,
    session_id: "22222222-2222-4222-8222-222222222222",
  };
  const token =
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url",
    ) +
    "." +
    Buffer.from(JSON.stringify(claims)).toString("base64url") +
    "." +
    Buffer.alloc(32).toString("base64url");
  const session = {
    access_token: token,
    refresh_token: "campus-fixture-refresh",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: iat + 3600,
    user,
  };
  await page.addInitScript(
    (value) =>
      localStorage.setItem("gcet.supabase.auth", JSON.stringify(value)),
    session,
  );
  const calls: ApiCall[] = [];
  const courses: Array<Record<string, unknown>> = [];
  let bookmarked = false;
  let following = false;
  let approved = false;
  let reviews = 0;
  await page.route("http://127.0.0.1:54321/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();
    const body = request.postData()
      ? (JSON.parse(request.postData()!) as Record<string, unknown>)
      : {};
    calls.push({ path, method, body, prefer: request.headers().prefer || "" });
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
    if (path === "/auth/v1/user") return respond(user);
    if (path === "/auth/v1/token") return respond(session);
    if (path === "/rest/v1/profiles")
      return respond([
        {
          id: userId,
          display_name: "Campus Member",
          course_id: null,
          academic_year: 1,
          semester: 1,
          created_at: stamp,
          updated_at: stamp,
        },
      ]);
    if (path === "/rest/v1/memberships")
      return respond([{ user_id: userId, status: "active" }]);
    if (path === "/rest/v1/role_assignments")
      return respond([
        {
          id: "fixture-role",
          user_id: userId,
          role: admin ? "admin" : "student",
          club_id: null,
        },
      ]);
    if (path === "/rest/v1/courses") {
      if (method === "POST") {
        courses.push({ ...body, id: courseId });
        return respond({ id: courseId }, 201);
      }
      return respond(courses);
    }
    if (path === "/rest/v1/clubs")
      return respond([
        {
          id: clubId,
          name: "Robotics Club",
          slug: "robotics-club",
          description: "Build and learn together.",
          active: true,
        },
      ]);
    if (path === "/rest/v1/notices")
      return respond([
        {
          id: noticeId,
          title: "Library hours",
          body: "The campus library is open until eight this week.",
          category: "academic",
          scope: "campus",
          status: "published",
          important: false,
          course_id: null,
          club_id: null,
          academic_year: null,
          published_at: new Date(Date.now() - 3600000).toISOString(),
          expires_at: null,
          created_by: userId,
          created_at: stamp,
        },
      ]);
    if (path === "/rest/v1/notice_bookmarks") {
      if (method === "POST") bookmarked = true;
      if (method === "DELETE") bookmarked = false;
      return respond(
        method === "GET" && bookmarked ? [{ notice_id: noticeId }] : [],
      );
    }
    if (path === "/rest/v1/club_follows") {
      if (method === "POST") following = true;
      if (method === "DELETE") following = false;
      return respond(
        method === "GET" && following ? [{ club_id: clubId }] : [],
      );
    }
    if (path === "/rest/v1/rpc/admin_list_access_requests")
      return respond(
        approved
          ? []
          : [
              {
                id: requestId,
                user_id: "77777777-7777-4777-8777-777777777777",
                requested_role: "staff",
                club_id: null,
                reason:
                  "I coordinate academic announcements for our department.",
                status: "pending",
                created_at: stamp,
                email: "teacher@galgotiacollege.edu",
                display_name: "Campus Teacher",
              },
            ],
      );
    if (path === "/rest/v1/rpc/review_access_request") {
      reviews += 1;
      if (reviews === 1)
        return respond(
          {
            code: "40001",
            message: "Approval could not be completed. Please retry.",
          },
          400,
        );
      approved = true;
      return respond(null);
    }
    if (path.startsWith("/rest/v1/") && method === "GET") return respond([]);
    if (path === "/rest/v1/rpc/admin_list_users") return respond([]);
    return respond({ message: "Unexpected campus fixture endpoint" }, 500);
  });
  return { calls };
}

test("verified admin saves campus content with the real CMS request and sees persisted data", async ({
  page,
}) => {
  const fixture = await mockCampus(page, true);
  await page.goto("/admin");
  await page
    .getByRole("button", { name: "Campus content", exact: true })
    .click();
  await page.getByRole("button", { name: "New course", exact: true }).click();
  await page.getByLabel("Course code *", { exact: true }).fill("BTECH-CSE");
  await page
    .getByLabel("Course name *", { exact: true })
    .fill("Computer Science and Engineering");
  await page.getByLabel("Department", { exact: true }).fill("Engineering");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Course saved." }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", {
      name: "Computer Science and Engineering",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    fixture.calls.find(
      (call) => call.path === "/rest/v1/courses" && call.method === "POST",
    )?.body,
  ).toEqual({
    code: "BTECH-CSE",
    name: "Computer Science and Engineering",
    department: "Engineering",
    active: true,
  });
});

test("admin approval sends the exact RPC payload and reports a failed attempt before retry", async ({
  page,
}) => {
  const fixture = await mockCampus(page, true);
  await page.goto("/admin");
  await page
    .getByRole("button", { name: "Access requests", exact: true })
    .click();
  await page.getByRole("button", { name: "Approve role", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Approval could not be completed. Please retry.",
  );
  await expect(
    page.getByText(/request approved and role assigned/),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Approve role", exact: true }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "request approved and role assigned" }),
  ).toBeVisible();
  await expect(
    page.getByText("No pending requests", { exact: true }),
  ).toBeVisible();
  const reviews = fixture.calls.filter(
    (call) =>
      call.path === "/rest/v1/rpc/review_access_request" &&
      call.method === "POST",
  );
  expect(reviews).toHaveLength(2);
  for (const call of reviews)
    expect(call.body).toEqual({ p_request_id: requestId, p_approve: true });
});

test("student bookmarks an announcement using insert-only upsert then removes it", async ({
  page,
}) => {
  const fixture = await mockCampus(page);
  await page.goto("/notices");
  await page
    .getByRole("button", { name: "Save Library hours", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Unsave Library hours", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const insert = fixture.calls.find(
    (call) =>
      call.path === "/rest/v1/notice_bookmarks" && call.method === "POST",
  );
  expect(insert?.body).toEqual({ user_id: userId, notice_id: noticeId });
  expect(insert?.prefer).toContain("resolution=ignore-duplicates");
  await page
    .getByRole("button", { name: "Unsave Library hours", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Save Library hours", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  expect(
    fixture.calls.some(
      (call) =>
        call.path === "/rest/v1/notice_bookmarks" && call.method === "DELETE",
    ),
  ).toBe(true);
});

test("student follows a club using insert-only upsert and can unfollow", async ({
  page,
}) => {
  const fixture = await mockCampus(page);
  await page.goto("/clubs");
  await page.getByRole("button", { name: "Follow club", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Following · unfollow", exact: true }),
  ).toBeVisible();
  const insert = fixture.calls.find(
    (call) => call.path === "/rest/v1/club_follows" && call.method === "POST",
  );
  expect(insert?.body).toEqual({ user_id: userId, club_id: clubId });
  expect(insert?.prefer).toContain("resolution=ignore-duplicates");
  await page
    .getByRole("button", { name: "Following · unfollow", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Follow club", exact: true }),
  ).toBeVisible();
  expect(
    fixture.calls.some(
      (call) =>
        call.path === "/rest/v1/club_follows" && call.method === "DELETE",
    ),
  ).toBe(true);
});
