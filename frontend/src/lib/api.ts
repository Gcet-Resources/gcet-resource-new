/**
 * API client for the GCET Resources backend.
 * Configurable base URL — in dev Vite proxies /api to the backend.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const { method = "GET", body, headers = {}, credentials = "include" } = options;

  const config: RequestInit = {
    method,
    credentials,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);

  // Handle non-JSON responses (blobs, empty)
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.text()) as unknown as T;
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

// ─── Auth API ──────────────────────────────────────────────────────

export const authApi = {
  checkEmail: (email: string) =>
    request<{ status: "allowed" | "pending" | "new" }>(
      `/auth/check-email?email=${encodeURIComponent(email)}`
    ),

  requestAccess: (email: string) =>
    request<{ message: string; id: string }>("/auth/request-access", {
      method: "POST",
      body: { email },
    }),

  login: (email: string, name: string, year: string) =>
    request<{ user: { email: string; name: string; year: string }; token: string }>(
      "/auth/login",
      { method: "POST", body: { email, name, year } }
    ),

  logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),

  me: () => request<{ user: { email: string; name: string; year: string } }>("/auth/me"),

  adminLogin: (password: string) =>
    request<{ token: string }>("/auth/admin-login", {
      method: "POST",
      body: { password },
    }),

  getPendingRequests: () =>
    request<Array<{
      id: string;
      email: string;
      createdAt: number;
      status: string;
    }>>("/auth/pending-requests"),

  approveRequest: (id: string, name?: string, year?: string) =>
    request<{ message: string }>(`/auth/approve/${id}`, {
      method: "POST",
      body: { name, year },
    }),

  rejectRequest: (id: string) =>
    request<{ message: string }>(`/auth/reject/${id}`, { method: "POST" }),
};

// ─── Data API ──────────────────────────────────────────────────────

export const dataApi = {
  getSubjects: () => request<Record<string, Array<{ id: string; title: string; description: string; color: string; bgColor: string }>>>("/subjects"),

  getSubjectsForYear: (year: string) =>
    request<Array<{ id: string; title: string; description: string; color: string; bgColor: string }>>(`/subjects/${year}`),

  getSubject: (year: string, subjectId: string) =>
    request<{ id: string; title: string; description: string; color: string; bgColor: string }>(`/subject/${year}/${subjectId}`),

  getPdfMappings: (year: string) =>
    request<Array<{ year: string; subjectId: string; resourceType: string; chapters: Array<{ id: string; title: string; fileUrl: string; description?: string; pages?: number }> }>>(`/pdf-mappings/${year}`),

  getChapters: (year: string, subjectId: string, resourceType: string) =>
    request<Array<{ id: string; title: string; fileUrl: string; description?: string; pages?: number }>>(`/pdf-mappings/${year}/${subjectId}/${resourceType}/chapters`),

  getAvailability: () =>
    request<Record<string, Record<string, boolean>>>("/availability"),

  getSearchIndex: () =>
    request<Array<{ year: string; subjectId: string; resourceType: string; title: string; searchText: string }>>("/search-index"),

  getExamCalendar: () =>
    request<Array<{ title: string; date: string; description?: string }>>("/exam-calendar"),

  getNotices: () =>
    request<Array<{ title: string; message: string; date: string; urgent: boolean }>>("/notices"),
};

// ─── PDF Proxy ─────────────────────────────────────────────────────

export function getPdfProxyUrl(url: string): string {
  return `${API_BASE}/pdf-proxy?url=${encodeURIComponent(url)}`;
}
