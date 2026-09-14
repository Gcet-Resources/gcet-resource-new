// Authentication is owned by Supabase and AuthProvider. No browser flag grants access.
export { isAllowedDomain, normalizeEmail, COLLEGE_DOMAIN } from "./auth-policy";
export { useAuth } from "@/context/AuthProvider";
