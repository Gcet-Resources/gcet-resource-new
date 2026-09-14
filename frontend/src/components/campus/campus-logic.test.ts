import { test, expect } from "vitest";
import {
  matchesAudience,
  validatePublication,
  formatCampusDate,
} from "./campus-logic";

test("published resources require a usable source while drafts may be incomplete", () => {
  const resource = {
    title: "Calculus",
    subject_id: "subject-1",
    status: "published",
    source_url: "",
    storage_path: "",
  };
  expect(validatePublication("resources", resource)).toContain(
    "before publishing",
  );
  expect(
    validatePublication("resources", { ...resource, status: "draft" }),
  ).toBeNull();
  expect(
    validatePublication("resources", {
      ...resource,
      storage_path: "author/document.pdf",
    }),
  ).toBeNull();
});

test("resource URLs reject unsafe schemes and accept signed HTTPS URLs", () => {
  const resource = {
    title: "Calculus",
    subject_id: "subject-1",
    status: "published",
  };
  for (const source_url of [
    "javascript:alert(1)",
    "http://example.org/file.pdf",
    "file:///etc/passwd",
    "not a URL",
  ]) {
    expect(
      validatePublication("resources", { ...resource, source_url }),
    ).not.toBeNull();
  }
  expect(
    validatePublication("resources", {
      ...resource,
      source_url: "https://example.org/file.pdf?token=signed",
    }),
  ).toBeNull();
});

test("course and club announcements require their audience assignment", () => {
  const notice = {
    title: "Meetup",
    body: "Campus meeting details",
    status: "draft",
  };
  expect(
    validatePublication("notices", { ...notice, scope: "course" }),
  ).toContain("course");
  expect(
    validatePublication("notices", { ...notice, scope: "club" }),
  ).toContain("club");
  expect(
    validatePublication("notices", {
      ...notice,
      scope: "club",
      club_id: "club-1",
    }),
  ).toBeNull();
});

test("publication and expiry dates have a valid chronological order", () => {
  const notice = {
    title: "Notice",
    body: "Body",
    scope: "campus",
    status: "published",
  };
  expect(validatePublication("notices", notice)).toContain("publication");
  expect(
    validatePublication("notices", { ...notice, published_at: "invalid" }),
  ).toContain("valid date");
  expect(
    validatePublication("notices", {
      ...notice,
      published_at: "2026-09-15T10:00:00Z",
      expires_at: "2026-09-15T09:00:00Z",
    }),
  ).toContain("after publication");
  expect(
    validatePublication("notices", {
      ...notice,
      published_at: "2026-09-15T10:00:00Z",
      expires_at: "2026-09-16T10:00:00Z",
    }),
  ).toBeNull();
});

test("exam dates reject missing starts and non-positive duration", () => {
  expect(validatePublication("exam_events", { title: "Midterm" })).toContain(
    "starts",
  );
  expect(
    validatePublication("exam_events", {
      title: "Midterm",
      starts_at: "2026-09-15T10:00:00Z",
      ends_at: "2026-09-15T10:00:00Z",
    }),
  ).toContain("after the start");
});

test("audience matching respects course, year and followed club together", () => {
  const profile = { course_id: "cs", academic_year: 2 };
  const common = {
    scope: "campus",
    course_id: null,
    academic_year: null,
    club_id: null,
  };
  expect(matchesAudience(common, profile, [])).toBe(true);
  expect(matchesAudience({ ...common, academic_year: 3 }, profile, [])).toBe(
    false,
  );
  expect(
    matchesAudience(
      { ...common, scope: "course", course_id: "cs" },
      profile,
      [],
    ),
  ).toBe(true);
  expect(
    matchesAudience(
      { ...common, scope: "course", course_id: "me" },
      profile,
      [],
    ),
  ).toBe(false);
  const club = { ...common, scope: "club", club_id: "robotics" };
  expect(matchesAudience(club, profile, [])).toBe(false);
  expect(matchesAudience(club, profile, ["robotics"])).toBe(true);
  expect(
    matchesAudience({ ...club, academic_year: 3 }, profile, ["robotics"]),
  ).toBe(false);
});

test("unselected course does not claim course-specific announcements", () => {
  expect(
    matchesAudience(
      { scope: "course", course_id: "cs", academic_year: null, club_id: null },
      null,
      [],
    ),
  ).toBe(false);
});

test("club slugs and academic years are validated", () => {
  expect(
    validatePublication("clubs", { name: "Robotics", slug: "robotics-club" }),
  ).toBeNull();
  expect(
    validatePublication("clubs", { name: "Robotics", slug: "../Admin" }),
  ).not.toBeNull();
  expect(
    validatePublication("notices", {
      title: "Notice",
      body: "Body",
      scope: "campus",
      academic_year: 5,
    }),
  ).toContain("1 to 4");
});

test("campus dates render in India time and tolerate missing or malformed values", () => {
  expect(formatCampusDate(null)).toBe("Not scheduled");
  expect(formatCampusDate("invalid")).toBe("Date unavailable");
  expect(formatCampusDate("2026-09-14T23:30:00Z")).toContain("15");
});
