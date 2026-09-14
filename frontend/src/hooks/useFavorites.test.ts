import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { beforeEach, expect, test, vi } from "vitest";
import { useFavorites } from "./useFavorites";

const fixture = vi.hoisted(() => ({ needsMfa: true, upsert: vi.fn(), from: vi.fn(), storage: new Map<string, string>() }));
vi.mock("@/context/AuthProvider", () => ({ useAuth: () => ({ user: { id: "student-1" }, membership: { status: "active" }, needsMfa: fixture.needsMfa, loading: false }) }));
vi.mock("@/context/CatalogProvider", () => ({ useCatalog: () => ({ subjects: [{ id: "BAS101", year: "1st", title: "Physics", dbId: "subject-1" }], loading: false }) }));
vi.mock("@/lib/supabase", () => ({ supabase: { from: fixture.from } }));

function renderHook() {
  let result: ReturnType<typeof useFavorites>;
  function Probe() { result = useFavorites(); return null; }
  renderToString(createElement(Probe));
  return result!;
}
beforeEach(() => {
  fixture.needsMfa = true; fixture.from.mockReset(); fixture.upsert.mockReset(); fixture.storage.clear();
  fixture.from.mockReturnValue({ upsert: fixture.upsert }); fixture.upsert.mockResolvedValue({ error: null });
  vi.stubGlobal("localStorage", { getItem: (key: string) => fixture.storage.get(key) || null, setItem: (key: string, value: string) => fixture.storage.set(key, value), removeItem: (key: string) => fixture.storage.delete(key) });
  vi.stubGlobal("window", { dispatchEvent: vi.fn() });
});

test("an enrolled student's unverified MFA session cannot write or import favorites", async () => {
  const hook = renderHook();
  expect(hook.needsVerification).toBe(true);
  expect(await hook.addFavorite({ id: "BAS101", year: "1st", title: "Physics" })).toBe(false);
  await hook.importGuestFavorites();
  expect(fixture.from).not.toHaveBeenCalled();
});

test("verified favorite insertion requires no UPDATE grant and preserves creation date", async () => {
  fixture.needsMfa = false;
  const hook = renderHook();
  expect(await hook.addFavorite({ id: "BAS101", year: "1st", title: "Physics" })).toBe(true);
  expect(fixture.upsert).toHaveBeenCalledWith({ user_id: "student-1", subject_id: "subject-1" }, { onConflict: "user_id,subject_id", ignoreDuplicates: true });
});

test("guest import deduplicates valid rows and retains unmatched browser entries", async () => {
  fixture.needsMfa = false;
  fixture.storage.set("gcet-favorites", JSON.stringify([{ id: "BAS101", year: "1st", title: "Physics", savedAt: 1 }, { id: "BAS101", year: "1st", title: "Physics", savedAt: 2 }, { id: "UNKNOWN", year: "1st", title: "Old subject", savedAt: 3 }]));
  await renderHook().importGuestFavorites();
  expect(fixture.upsert).toHaveBeenCalledWith([{ user_id: "student-1", subject_id: "subject-1" }], { onConflict: "user_id,subject_id", ignoreDuplicates: true });
  expect(JSON.parse(fixture.storage.get("gcet-favorites")!)).toEqual([{ id: "UNKNOWN", year: "1st", title: "Old subject", savedAt: 3 }]);
});
