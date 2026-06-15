import { authApi } from "@/lib/api";

export type PendingRequest = {
  id: string;
  email: string;
  createdAt: number;
  status: "pending" | "approved" | "rejected";
  name?: string;
  year?: string;
};

export type User = {
  email: string;
  name: string;
  year: string;
};

const USER_KEY = "gcet_current_user";

function readUser(): User | null {
  try {
    const v = localStorage.getItem(USER_KEY);
    return v ? (JSON.parse(v) as User) : null;
  } catch {
    return null;
  }
}

function writeUser(user: User | null) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function isAllowedDomain(email: string) {
  return email.trim().toLowerCase().endsWith("@galgotiacollege.edu");
}

export async function checkEmailStatus(email: string): Promise<"allowed" | "pending" | "new"> {
  try {
    const result = await authApi.checkEmail(email);
    return result.status;
  } catch {
    return "new";
  }
}

export async function addPendingRequest(email: string) {
  return authApi.requestAccess(email);
}

export async function getPendingRequests(): Promise<PendingRequest[]> {
  try {
    const adminToken = localStorage.getItem("gcet_admin_token");
    return await authApi.getPendingRequests();
  } catch {
    return [];
  }
}

export async function approveRequest(id: string, name?: string, year?: string) {
  return authApi.approveRequest(id, name, year);
}

export async function rejectRequest(id: string) {
  return authApi.rejectRequest(id);
}

export async function login(email: string, name: string, year: string): Promise<boolean> {
  try {
    const result = await authApi.login(email, name, year);
    writeUser(result.user);
    return true;
  } catch {
    return false;
  }
}

export async function logout() {
  try {
    await authApi.logout();
  } catch {
    // ignore
  }
  writeUser(null);
}

export function getCurrentUser(): User | null {
  return readUser();
}

export async function getApprovedUsers(): Promise<User[]> {
  // We don't expose all approved users via API for security
  return [];
}
