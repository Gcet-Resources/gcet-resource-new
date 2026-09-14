import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Search,
  GraduationCap,
  ArrowUpRight,
  LogOut,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { DarkModeToggle } from "./DarkModeToggle";
import { GlobalSearch } from "./GlobalSearch";
import { useAuth } from "@/context/AuthProvider";
export const Navigation = () => {
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { user, loading, hasRole, isPrivileged, signOut } = useAuth();
  const location = useLocation();
  useEffect(() => {
    setMenu(false);
  }, [location.pathname]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearch((s) => !s);
      }
      if (e.key === "Escape") setMenu(false);
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  const links = [
    { label: "Resources", to: "/year-selection" },
    { label: "Notices", to: "/notices" },
    { label: "Clubs", to: "/clubs" },
    ...(user ? [{ label: "My campus", to: "/dashboard" }] : []),
    ...(isPrivileged
      ? [
          {
            label: hasRole("admin") ? "Admin" : "Publish",
            to: hasRole("admin") ? "/admin" : "/publish",
          },
        ]
      : []),
  ];
  const logout = async () => {
    setBusy(true);
    setError("");
    try {
      await signOut();
    } catch {
      setError("Sign out failed. Please retry.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6"
        >
          <Link
            to="/"
            aria-label="GCET Campus home"
            className="flex shrink-0 items-center gap-2.5"
          >
            <span className="rounded-xl bg-teal-700 p-2.5 text-white">
              <GraduationCap size={24} />
            </span>
            <span className="text-lg font-bold tracking-tight">
              GCET
              <span className="ml-1.5 font-normal text-slate-500 dark:text-slate-400">
                Campus
              </span>
            </span>
          </Link>
          <div className="hidden items-center gap-5 lg:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? "text-teal-700 dark:text-teal-400" : "text-slate-600 hover:text-teal-700 dark:text-slate-300"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Search resources"
              onClick={() => setSearch(true)}
              className="rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Search size={20} />
            </button>
            <DarkModeToggle />
            {!loading &&
              (user ? (
                <>
                  <Link
                    to="/account"
                    className="hidden rounded-xl border px-3 py-2 text-sm sm:inline-flex"
                  >
                    Account
                  </Link>
                  <button
                    disabled={busy}
                    aria-label="Sign out"
                    onClick={() => void logout()}
                    className="hidden rounded-xl p-2.5 hover:bg-slate-100 sm:inline-flex dark:hover:bg-slate-800"
                  >
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="hidden items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-medium text-white sm:inline-flex"
                >
                  Join campus
                  <ArrowUpRight size={16} />
                </Link>
              ))}
            <button
              aria-label={
                menu ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={menu}
              aria-controls="mobile-nav"
              onClick={() => setMenu((m) => !m)}
              className="rounded-xl p-2 lg:hidden"
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </nav>
        {error && (
          <p
            role="alert"
            className="px-4 pb-2 text-center text-sm text-red-600"
          >
            {error}
          </p>
        )}
        {menu && (
          <nav
            id="mobile-nav"
            aria-label="Mobile navigation"
            className="border-t bg-background px-5 py-4 lg:hidden"
          >
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="block rounded-lg px-3 py-3 text-sm hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to={user ? "/account" : "/login"}
              className="block px-3 py-3 font-medium text-teal-700"
            >
              {user ? "Account & security" : "Join campus"}
            </Link>
            {user && (
              <button
                disabled={busy}
                onClick={() => void logout()}
                className="px-3 py-3 text-sm"
              >
                Sign out
              </button>
            )}
          </nav>
        )}
      </header>
      <GlobalSearch isOpen={search} onClose={() => setSearch(false)} />
    </>
  );
};
