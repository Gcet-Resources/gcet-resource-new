import { useEffect, useState } from "react";
import { getPendingRequests, approveRequest, rejectRequest, type PendingRequest } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin";

const AdminApprovals = () => {
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem("gcet_admin_auth") === "true";
    } catch {
      return false;
    }
  });
  const [password, setPassword] = useState("");

  useEffect(() => {
    getPendingRequests().then(setPending);
  }, []);

  const refresh = () => getPendingRequests().then(setPending);

  const handleApprove = (id: string) => {
    approveRequest(id);
    toast({ title: "Approved", description: "Request approved." });
    refresh();
  };

  const handleReject = (id: string) => {
    rejectRequest(id);
    toast({ title: "Rejected", description: "Request rejected." });
    refresh();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      try {
        localStorage.setItem("gcet_admin_auth", "true");
      } catch {
        // localStorage may be unavailable
      }
      setAuthenticated(true);
      toast({ title: "Welcome", description: "Signed in as admissions." });
      setPassword("");
    } else {
      toast({ title: "Invalid password", description: "Please try again." });
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("gcet_admin_auth");
    } catch {
      // localStorage may be unavailable
    }
    setAuthenticated(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h1 className="text-2xl font-semibold mb-4">Admissions — Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block text-sm text-gray-600 dark:text-gray-300">Admin Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter admin password" />
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">Set `VITE_ADMIN_PASSWORD` in environment (default: admin)</div>
              <div>
                <Button type="submit">Sign in</Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admissions — Pending Requests</h1>
        <div>
          <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
        </div>
      </div>
      {pending.length === 0 && <p>No pending requests.</p>}
      <div className="space-y-4">
        {pending.map((p) => (
          <div key={p.id} className="p-4 bg-white dark:bg-gray-800 rounded border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-900 dark:text-white">{p.email}</div>
                <div className="text-xs text-gray-500">Requested: {new Date(p.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="default" size="sm" onClick={() => handleApprove(p.id)}>Approve</Button>
                <Button variant="outline" size="sm" onClick={() => handleReject(p.id)}>Reject</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminApprovals;
