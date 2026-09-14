import { afterEach, expect, test, vi } from "vitest";
import { storageGet, storageRemove, storageSet, storedArray } from "./safe-storage";

afterEach(() => vi.unstubAllGlobals());

test("a quota-limited overwrite returns the new value instead of stale persisted data", () => {
  vi.stubGlobal("localStorage", { getItem: () => "old", setItem: () => { throw new Error("QuotaExceededError"); } });
  storageSet("quota-regression", "new");
  expect(storageGet("quota-regression")).toBe("new");
});

test("failed removal uses a tombstone so deleted personal data does not reappear", () => {
  vi.stubGlobal("localStorage", { getItem: () => "private history", removeItem: () => { throw new Error("SecurityError"); } });
  storageRemove("removal-regression");
  expect(storageGet("removal-regression")).toBeNull();
});

test("cached data survives storage becoming blocked later in the session", () => {
  const getItem = vi.fn().mockReturnValueOnce("saved").mockImplementation(() => { throw new Error("blocked"); });
  vi.stubGlobal("localStorage", { getItem });
  expect(storageGet("read-regression")).toBe("saved");
  expect(storageGet("read-regression")).toBe("saved");
});

test("normal storage reads reflect another tab's changes", () => {
  const getItem = vi.fn().mockReturnValueOnce("first").mockReturnValueOnce("second");
  vi.stubGlobal("localStorage", { getItem });
  expect(storageGet("cross-tab-regression")).toBe("first");
  expect(storageGet("cross-tab-regression")).toBe("second");
});

test("malformed and non-array stored values never become application arrays", () => {
  const isNumber = (value: unknown): value is number => typeof value === "number";
  vi.stubGlobal("localStorage", { getItem: vi.fn().mockReturnValueOnce("null").mockReturnValueOnce("not JSON").mockReturnValueOnce('[1,"bad",2]') });
  expect(storedArray("bad-null", isNumber)).toEqual([]);
  expect(storedArray("bad-json", isNumber)).toEqual([]);
  expect(storedArray("mixed-data", isNumber)).toEqual([1, 2]);
});
