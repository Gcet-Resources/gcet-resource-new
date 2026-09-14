import { useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Search,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { requireSupabase } from "@/lib/supabase";
import {
  checked,
  errorMessage,
  formatCampusDate,
  useCampusQuery,
  validatePublication,
  type Course,
  type Club,
  type CampusSubject,
} from "@/lib/campus";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  actionClass,
  secondaryClass,
  inputClass,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/campus/CampusShell";

export type ContentTable =
  | "courses"
  | "subjects"
  | "resources"
  | "notices"
  | "exam_events"
  | "clubs"
  | "reports";
type DataRow = { id: string; [key: string]: unknown };
type Choice = { value: string; label: string };
type Field = {
  key: string;
  label: string;
  kind?:
    "textarea" | "select" | "number" | "datetime-local" | "checkbox" | "url";
  required?: boolean;
  options?: Choice[];
  min?: number;
  max?: number;
  maxLength?: number;
  help?: string;
};
type Definition = {
  title: string;
  singular: string;
  search: string;
  fields: Field[];
  defaults: Record<string, unknown>;
  columns: string[];
  create?: boolean;
};
const choices = (...values: string[]) =>
  values.map((value) => ({ value, label: value.replace(/_/g, " ") }));
const publication = choices("draft", "published", "archived");
const statusField: Field = {
  key: "status",
  label: "Publication status",
  kind: "select",
  required: true,
  options: publication,
};
const yearOptions = choices("1st", "2nd", "3rd", "4th");

function definitions(
  lookup: { courses: Course[]; clubs: Club[]; subjects: CampusSubject[] },
  scopes: string[],
  allowedClubs?: string[],
): Record<ContentTable, Definition> {
  const courseOptions = lookup.courses.map((row) => ({
    value: row.id,
    label: `${row.code} · ${row.name}`,
  }));
  const clubOptions = lookup.clubs
    .filter((row) => !allowedClubs || allowedClubs.includes(row.id))
    .map((row) => ({ value: row.id, label: row.name }));
  const course: Field = {
    key: "course_id",
    label: "Course",
    kind: "select",
    options: courseOptions,
    help: "Leave unassigned for shared or campus-wide content.",
  };
  const year: Field = {
    key: "academic_year",
    label: "Academic year",
    kind: "number",
    min: 1,
    max: 4,
    help: "Optional; leave blank for all years.",
  };
  return {
    courses: {
      title: "Courses",
      singular: "course",
      search: "name",
      columns: ["code", "name", "department", "active"],
      defaults: { active: true },
      fields: [
        { key: "code", label: "Course code", required: true, maxLength: 40 },
        { key: "name", label: "Course name", required: true, maxLength: 200 },
        { key: "department", label: "Department", maxLength: 200 },
        { key: "active", label: "Available to students", kind: "checkbox" },
      ],
    },
    subjects: {
      title: "Subjects",
      singular: "subject",
      search: "title",
      columns: ["legacy_code", "title", "year", "course_id"],
      defaults: { year: "1st", color: "text-teal-700", bg_color: "bg-teal-50" },
      fields: [
        {
          key: "legacy_code",
          label: "Subject code",
          required: true,
          maxLength: 40,
        },
        {
          key: "title",
          label: "Subject title",
          required: true,
          maxLength: 200,
        },
        {
          key: "year",
          label: "Year",
          kind: "select",
          required: true,
          options: yearOptions,
        },
        course,
        {
          key: "description",
          label: "Description",
          kind: "textarea",
          maxLength: 2000,
        },
      ],
    },
    resources: {
      title: "Resources",
      singular: "resource",
      search: "title",
      columns: ["title", "subject_id", "resource_type", "status"],
      defaults: {
        provider: "pdf",
        resource_type: "pdf-notes",
        status: "draft",
        sort_order: 0,
      },
      fields: [
        {
          key: "title",
          label: "Resource title",
          required: true,
          maxLength: 300,
        },
        {
          key: "subject_id",
          label: "Subject",
          kind: "select",
          required: true,
          options: lookup.subjects.map((row) => ({
            value: row.id,
            label: `${row.year} · ${row.legacy_code} · ${row.title}`,
          })),
        },
        {
          key: "resource_type",
          label: "Resource type",
          kind: "select",
          required: true,
          options: choices(
            "pdf-notes",
            "aktu-pyq",
            "cae",
            "handwritten",
            "quantum",
            "question-bank",
          ),
        },
        {
          key: "provider",
          label: "Source format",
          kind: "select",
          required: true,
          options: choices("pdf", "drive", "external"),
        },
        {
          key: "source_url",
          label: "HTTPS resource URL",
          kind: "url",
          maxLength: 2048,
          help: "Use an existing source link or upload a PDF below. Missing sources may be saved as drafts.",
        },
        {
          key: "storage_path",
          label: "Uploaded file path",
          maxLength: 500,
          help: "Filled when a PDF is uploaded. Use an existing approved storage path only.",
        },
        {
          key: "description",
          label: "Description",
          kind: "textarea",
          maxLength: 4000,
        },
        {
          key: "sort_order",
          label: "Display order",
          kind: "number",
          min: 0,
          max: 100000,
        },
        statusField,
      ],
    },
    notices: {
      title: "Announcements",
      singular: "announcement",
      search: "title",
      columns: ["title", "scope", "status", "published_at"],
      defaults: {
        category: "announcement",
        scope: scopes[0] || "campus",
        status: "draft",
        important: false,
        published_at: new Date().toISOString(),
        club_id: allowedClubs?.length === 1 ? allowedClubs[0] : null,
      },
      fields: [
        { key: "title", label: "Title", required: true, maxLength: 240 },
        {
          key: "body",
          label: "Announcement text",
          kind: "textarea",
          required: true,
          maxLength: 12000,
        },
        {
          key: "category",
          label: "Category",
          kind: "select",
          required: true,
          options: choices(
            "announcement",
            "academic",
            "examination",
            "event",
            "placement",
            "resources",
          ),
        },
        {
          key: "scope",
          label: "Audience",
          kind: "select",
          required: true,
          options: choices(...scopes),
        },
        course,
        { key: "club_id", label: "Club", kind: "select", options: clubOptions },
        year,
        { key: "important", label: "Mark as important", kind: "checkbox" },
        {
          key: "published_at",
          label: "Publish at (your local time)",
          kind: "datetime-local",
        },
        {
          key: "expires_at",
          label: "Expires at (your local time)",
          kind: "datetime-local",
        },
        statusField,
      ],
    },
    exam_events: {
      title: "Exam calendar",
      singular: "exam event",
      search: "title",
      columns: ["title", "starts_at", "ends_at", "status"],
      defaults: { status: "draft" },
      fields: [
        { key: "title", label: "Exam title", required: true, maxLength: 240 },
        {
          key: "description",
          label: "Description",
          kind: "textarea",
          maxLength: 4000,
        },
        course,
        year,
        {
          key: "starts_at",
          label: "Starts at (your local time)",
          kind: "datetime-local",
          required: true,
        },
        {
          key: "ends_at",
          label: "Ends at (your local time)",
          kind: "datetime-local",
        },
        statusField,
      ],
    },
    clubs: {
      title: "Clubs",
      singular: "club",
      search: "name",
      columns: ["name", "slug", "active"],
      defaults: { active: true },
      fields: [
        { key: "name", label: "Club name", required: true, maxLength: 200 },
        {
          key: "slug",
          label: "Club slug",
          required: true,
          maxLength: 100,
          help: "For example: robotics-club. Use lowercase letters, numbers and hyphens.",
        },
        {
          key: "description",
          label: "About the club",
          kind: "textarea",
          maxLength: 4000,
        },
        {
          key: "active",
          label: "Show in the club directory",
          kind: "checkbox",
        },
      ],
    },
    reports: {
      title: "Reports",
      singular: "report",
      search: "subject",
      columns: ["subject", "message", "status", "created_at"],
      defaults: {},
      create: false,
      fields: [
        {
          key: "status",
          label: "Report status",
          kind: "select",
          required: true,
          options: choices("open", "in_progress", "resolved", "dismissed"),
        },
      ],
    },
  };
}

function localDateValue(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export function ContentManager({
  tables,
  noticeScopes = ["campus", "course", "club", "council"],
  allowedClubIds,
}: {
  tables: ContentTable[];
  noticeScopes?: string[];
  allowedClubIds?: string[];
}) {
  const { user } = useAuth();
  const [table, setTable] = useState<ContentTable>(tables[0]);
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<DataRow | "new" | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const pendingUploads = useRef<string[]>([]);
  const lookups = useCampusQuery(`content-lookups:${user?.id}`, async () => {
    const results = await Promise.all([
      requireSupabase().from("courses").select("*").order("name").limit(1000),
      requireSupabase().from("clubs").select("*").order("name").limit(1000),
      requireSupabase()
        .from("subjects")
        .select("*")
        .order("legacy_code")
        .limit(1000),
    ]);
    return {
      courses: checked<Course[]>(results[0]),
      clubs: checked<Club[]>(results[1]),
      subjects: checked<CampusSubject[]>(results[2]),
    };
  });
  const defs = definitions(
    lookups.data || { courses: [], clubs: [], subjects: [] },
    noticeScopes,
    allowedClubIds,
  );
  const definition = defs[table];
  const rows = useCampusQuery(
    `manage:${user?.id}:${table}:${page}:${search}:${noticeScopes.join(",")}:${allowedClubIds?.join(",")}`,
    async () => {
      let query = requireSupabase()
        .from(table)
        .select("*")
        .order("id")
        .range(page * 30, page * 30 + 29);
      if (search)
        query = query.ilike(
          defs[table].search,
          `%${search.replace(/[\\%_]/g, "\\$&")}%`,
        );
      if (table === "notices") {
        query = query.in("scope", noticeScopes);
        if (noticeScopes.includes("club") && allowedClubIds !== undefined) {
          if (allowedClubIds.length)
            query = query.or(
              `scope.neq.club,club_id.in.(${allowedClubIds.join(",")})`,
            );
          else query = query.neq("scope", "club");
        }
      }
      return checked<DataRow[]>(await query);
    },
  );
  const openEditor = (row: DataRow | "new") => {
    setEditor(row);
    setError(null);
    setSuccess(null);
    setValues(
      row === "new"
        ? { ...definition.defaults }
        : Object.fromEntries(
            definition.fields.map((field) => [field.key, row[field.key] ?? ""]),
          ),
    );
  };
  const removeUnattachedUploads = async () => {
    if (!pendingUploads.current.length) return;
    const result = await requireSupabase()
      .storage.from("resources")
      .remove([...pendingUploads.current]);
    if (result.error)
      throw new Error(
        `Could not remove the unattached upload: ${result.error.message}`,
      );
    pendingUploads.current = [];
  };
  const cancelEditor = async () => {
    if (saving || uploading) return;
    setSaving(true);
    setError(null);
    try {
      await removeUnattachedUploads();
      setEditor(null);
      setSuccess(null);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editor || !user || saving || uploading) return;
    const payload: Record<string, unknown> = {};
    for (const field of definition.fields) {
      const value = values[field.key];
      if (field.kind === "checkbox") payload[field.key] = !!value;
      else if (field.kind === "number")
        payload[field.key] =
          value === "" || value === undefined ? null : Number(value);
      else if (field.kind === "datetime-local")
        payload[field.key] = value
          ? new Date(String(value)).toISOString()
          : null;
      else
        payload[field.key] =
          typeof value === "string" && value.trim()
            ? value.trim()
            : field.key.endsWith("_id") ||
                ["source_url", "storage_path"].includes(field.key)
              ? null
              : "";
    }
    if (table === "notices") {
      if (payload.scope !== "course") payload.course_id = null;
      if (payload.scope !== "club") payload.club_id = null;
    }
    const invalid = validatePublication(table, payload);
    if (invalid) {
      setError(invalid);
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (editor === "new") {
        if (["notices", "resources", "exam_events"].includes(table))
          payload.created_by = user.id;
        if (table === "resources") payload.legacy_id = crypto.randomUUID();
        if (table === "subjects") {
          payload.color = "text-teal-700";
          payload.bg_color = "bg-teal-50";
        }
        checked<unknown>(
          await requireSupabase()
            .from(table)
            .insert(payload)
            .select("id")
            .single(),
        );
      } else {
        // Explicit fields only: the author, record ID and timestamps never change here.
        checked<unknown>(
          await requireSupabase()
            .from(table)
            .update(payload)
            .eq("id", editor.id)
            .select("id")
            .single(),
        );
      }
      pendingUploads.current = pendingUploads.current.filter(
        (path) => path !== payload.storage_path,
      );
      let cleanupWarning = "";
      try {
        await removeUnattachedUploads();
      } catch (caught) {
        cleanupWarning = ` ${errorMessage(caught)}`;
      }
      setEditor(null);
      setSuccess(
        `${definition.singular.charAt(0).toUpperCase() + definition.singular.slice(1)} saved.${cleanupWarning}`,
      );
      rows.reload();
      lookups.reload();
      if (["subjects", "resources", "courses"].includes(table))
        window.dispatchEvent(new Event("gcet:catalog-changed"));
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  };
  const upload = async (file: File | undefined) => {
    if (!file || !user) return;
    setError(null);
    if (
      !file.name.toLowerCase().endsWith(".pdf") ||
      (file.type && file.type !== "application/pdf")
    ) {
      setError("Choose a PDF document.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("Choose a PDF smaller than 25 MB.");
      return;
    }
    setUploading(true);
    try {
      const signature = new TextDecoder().decode(
        await file.slice(0, 5).arrayBuffer(),
      );
      if (signature !== "%PDF-")
        throw new Error("This file does not appear to be a PDF.");
      const path = `${user.id}/${crypto.randomUUID()}.pdf`;
      const result = await requireSupabase()
        .storage.from("resources")
        .upload(path, file, { contentType: "application/pdf", upsert: false });
      if (result.error) throw result.error;
      pendingUploads.current.push(path);
      setValues((previous) => ({
        ...previous,
        storage_path: path,
        source_url: "",
        provider: "pdf",
      }));
      setSuccess(
        "PDF uploaded. Save the resource to attach it; it remains private until publication.",
      );
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setUploading(false);
    }
  };
  const display = (row: DataRow, key: string) => {
    const value = row[key];
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "boolean") return value ? "Active" : "Inactive";
    if (key.endsWith("_at")) return formatCampusDate(String(value));
    if (key === "course_id")
      return (
        lookups.data?.courses.find((item) => item.id === value)?.code ||
        "Unassigned course"
      );
    if (key === "subject_id")
      return (
        lookups.data?.subjects.find((item) => item.id === value)?.legacy_code ||
        String(value)
      );
    return String(value).replace(/_/g, " ");
  };
  return (
    <section>
      <div className="mb-5 flex flex-wrap gap-2" aria-label="Content sections">
        {tables.map((item) => (
          <button
            key={item}
            aria-pressed={table === item}
            onClick={() => {
              setTable(item);
              setPage(0);
              setSearch("");
              setSearchInput("");
              setError(null);
              setSuccess(null);
            }}
            className={`${table === item ? actionClass : secondaryClass} !px-3 !py-2 !text-xs`}
          >
            {defs[item].title}
          </button>
        ))}
      </div>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPage(0);
            setSearch(searchInput.trim());
          }}
          className="flex max-w-lg flex-1 gap-2"
        >
          <label className="relative flex-1">
            <span className="sr-only">
              Search {definition.title.toLowerCase()}
            </span>
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              className={`${inputClass} pl-9`}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={`Search ${definition.search === "name" ? "names" : definition.search === "subject" ? "report subjects" : "titles"}…`}
              maxLength={200}
            />
          </label>
          <button className={secondaryClass} type="submit">
            Search
          </button>
        </form>
        {definition.create !== false && (
          <button
            className={actionClass}
            onClick={() => openEditor("new")}
            disabled={lookups.loading || !!lookups.error}
          >
            <Plus className="h-4 w-4" />
            New {definition.singular}
          </button>
        )}
      </div>
      {lookups.error && (
        <div className="mb-4">
          <ErrorState
            message={`Could not load editor options: ${lookups.error}`}
            retry={lookups.reload}
          />
        </div>
      )}
      {!editor && success && (
        <p
          role="status"
          className="mb-4 rounded-xl bg-teal-50 p-3 text-sm text-teal-800 dark:bg-teal-950 dark:text-teal-300"
        >
          {success}
        </p>
      )}
      {rows.loading ? (
        <LoadingState label={`Loading ${definition.title.toLowerCase()}…`} />
      ) : rows.error ? (
        <ErrorState message={rows.error} retry={rows.reload} />
      ) : rows.data?.length ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-900">
              <tr>
                {definition.columns.map((key) => (
                  <th scope="col" key={key} className="px-4 py-3 font-semibold">
                    {key.replace(/_/g, " ")}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-950">
              {rows.data.map((row) => (
                <tr key={row.id}>
                  {definition.columns.map((key) => (
                    <td key={key} className="max-w-xs px-4 py-4">
                      <span
                        className={`line-clamp-2 ${key === "status" ? "w-fit rounded-full bg-slate-100 px-2 py-1 text-xs font-medium dark:bg-slate-800" : ""}`}
                      >
                        {display(row, key)}
                      </span>
                    </td>
                  ))}
                  <td className="px-4 py-4">
                    <button
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400"
                      onClick={() => openEditor(row)}
                      aria-label={`Edit ${String(row.title || row.name || row.subject || definition.singular)}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title={
            search
              ? "No matching records"
              : `No ${definition.title.toLowerCase()} on this page`
          }
        >
          {definition.create === false
            ? "Submitted reports appear here for review."
            : "Create a record or try another search. Unpublished items remain visible to authorised editors."}
        </EmptyState>
      )}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>Page {page + 1} · up to 30 records</span>
        <div className="flex gap-2">
          <button
            className={secondaryClass}
            disabled={!page || rows.loading}
            onClick={() => setPage((value) => value - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            className={secondaryClass}
            disabled={rows.loading || (rows.data?.length || 0) < 30}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <Dialog
        open={editor !== null}
        onOpenChange={(open) => {
          if (!open) void cancelEditor();
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>
              {editor === "new" ? "Create" : "Edit"} {definition.singular}
            </DialogTitle>
            <DialogDescription>
              {table === "reports"
                ? "Review the original report and update its triage status."
                : "Save a draft to prepare content. Published records appear for their intended audience."}
            </DialogDescription>
          </DialogHeader>
          {table === "reports" && editor && editor !== "new" && (
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="font-semibold">
                {String(editor.subject || "Report")}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-500">
                {String(editor.message || "")}
              </p>
              <p className="mt-3 text-xs text-slate-400">
                Submitted {formatCampusDate(String(editor.created_at))} · User{" "}
                {String(editor.user_id)}
              </p>
            </div>
          )}
          <form onSubmit={(event) => void save(event)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {definition.fields.map((field) => (
                <label
                  key={field.key}
                  className={field.kind === "textarea" ? "sm:col-span-2" : ""}
                >
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {field.label}
                    {field.required && " *"}
                  </span>
                  {field.kind === "checkbox" ? (
                    <input
                      type="checkbox"
                      checked={!!values[field.key]}
                      onChange={(event) =>
                        setValues((previous) => ({
                          ...previous,
                          [field.key]: event.target.checked,
                        }))
                      }
                      className="h-5 w-5 accent-teal-700"
                      disabled={saving || uploading}
                    />
                  ) : field.kind === "select" ? (
                    <select
                      required={field.required}
                      className={inputClass}
                      value={String(values[field.key] || "")}
                      onChange={(event) =>
                        setValues((previous) => ({
                          ...previous,
                          [field.key]: event.target.value,
                        }))
                      }
                      disabled={saving || uploading}
                    >
                      <option value="">
                        {field.required ? "Choose…" : "Not assigned"}
                      </option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.kind === "textarea" ? (
                    <textarea
                      className={`${inputClass} min-h-28`}
                      required={field.required}
                      maxLength={field.maxLength}
                      value={String(values[field.key] || "")}
                      onChange={(event) =>
                        setValues((previous) => ({
                          ...previous,
                          [field.key]: event.target.value,
                        }))
                      }
                      disabled={saving || uploading}
                    />
                  ) : (
                    <input
                      className={inputClass}
                      type={field.kind || "text"}
                      required={field.required}
                      min={field.min}
                      max={field.max}
                      maxLength={field.maxLength}
                      value={
                        field.kind === "datetime-local"
                          ? localDateValue(values[field.key])
                          : String(values[field.key] ?? "")
                      }
                      onChange={(event) =>
                        setValues((previous) => ({
                          ...previous,
                          [field.key]: event.target.value,
                        }))
                      }
                      disabled={saving || uploading}
                    />
                  )}
                  {field.help && (
                    <span className="mt-1.5 block text-[11px] leading-5 text-slate-500">
                      {field.help}
                    </span>
                  )}
                </label>
              ))}
            </div>
            {table === "resources" && (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
                <label className="block text-sm font-semibold">
                  <span className="mb-3 flex items-center gap-2">
                    <UploadCloud className="h-4 w-4" />
                    Upload a PDF (up to 25 MB)
                  </span>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    disabled={saving || uploading}
                    onChange={(event) => {
                      void upload(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                    className="block max-w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:font-semibold file:text-teal-800"
                  />
                </label>
                <p className="mt-2 text-xs text-slate-500">
                  Upload once, then save this resource. Cancelling removes new,
                  unattached uploads.
                </p>
              </div>
            )}
            {error && <ErrorState message={error} />}
            {success && (
              <p
                role="status"
                className="text-sm text-teal-700 dark:text-teal-400"
              >
                {success}
              </p>
            )}
            <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
              <button
                type="button"
                className={secondaryClass}
                disabled={saving || uploading}
                onClick={() => void cancelEditor()}
              >
                Cancel
              </button>
              <button className={actionClass} disabled={saving || uploading}>
                {(saving || uploading) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {uploading ? "Uploading…" : saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
