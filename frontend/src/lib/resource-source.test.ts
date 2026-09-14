import { expect, test } from "vitest";
import { safeSource, sourceKind, drivePreview } from "./resource-source";

test("signed and uppercase PDF URLs use the PDF renderer", () => {
  expect(sourceKind("https://example.org/FILE.PDF?token=signed#page=2")).toBe("pdf");
  expect(sourceKind("https://example.org/file.pdf?download=true")).toBe("pdf");
});

test("Drive preview uses an exact trusted hostname and validated file ID", () => {
  expect(drivePreview("https://drive.google.com/file/d/abc_123-xyz/view?usp=sharing")).toBe("https://drive.google.com/file/d/abc_123-xyz/preview");
  expect(drivePreview("https://drive.google.com.evil.example/file/d/abc/view")).toBeNull();
  expect(drivePreview("https://drive.google.com/open?id=../../bad")).toBeNull();
  expect(drivePreview("https://drive.google.com/drive/folders/abc")).toBeNull();
  expect(sourceKind("https://drive.google.com/drive/folders/abc")).toBe("drive-folder");
});

test("unsafe protocols are rejected before rendering or external navigation", () => {
  for (const value of ["", "javascript:alert(1)", "data:text/html,bad", "file:///private/document.pdf", "http://example.org/document.pdf", "https://username:secret@example.org/document.pdf"]) expect(safeSource(value)).toBeNull();
  expect(safeSource("http://127.0.0.1:8080/fixture.pdf")).toBeTruthy();
});
