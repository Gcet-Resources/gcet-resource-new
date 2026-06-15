import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  isAllowedDomain,
  addPendingRequest,
  login as doLogin,
  getApprovedUsers,
  getPendingRequests,
} from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "details" | "pending">("email");
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const navigate = useNavigate();

  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const val = email.trim().toLowerCase();
    if (!val || !val.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email.",
      });
      return;
    }

    // if allowed domain or already approved, go to details
    if (
      isAllowedDomain(val) ||
      getApprovedUsers().some((u) => u.email === val)
    ) {
      setStep("details");
      return;
    }

    // if already requested
    if (
      getPendingRequests().some(
        (p) => p.email === val && p.status === "pending"
      )
    ) {
      setStep("pending");
      toast({
        title: "Request pending",
        description: "Your access request is pending approval.",
      });
      return;
    }

    // otherwise create a pending request
    addPendingRequest(val);
    setStep("pending");
    toast({
      title: "Request sent",
      description:
        "Your access request has been sent to admissions for approval.",
    });
  };

  const handleDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = doLogin(email, name, year);
    if (ok) {
      toast({ title: "Logged in", description: `Welcome ${name}` });
      navigate("/");
    } else {
      toast({
        title: "Not approved",
        description:
          "Your account is not approved yet. A request has been sent.",
      });
      setStep("pending");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
          Student login
        </h2>

        {step === "email" && (
          <form onSubmit={handleEmail} className="space-y-4">
            <label className="block text-sm text-gray-600 dark:text-gray-300">
              College Email
            </label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@galgotiacollege.edu"
            />
            <div className="flex justify-end">
              <Button type="submit">Continue</Button>
            </div>
          </form>
        )}

        {step === "details" && (
          <form onSubmit={handleDetails} className="space-y-4">
            <label className="block text-sm text-gray-600 dark:text-gray-300">
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
            <label className="block text-sm text-gray-600 dark:text-gray-300">
              Year
            </label>
            <Input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g., 1st, 2nd, 3rd"
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("email")}>
                Back
              </Button>
              <Button type="submit">Login</Button>
            </div>
          </form>
        )}

        {step === "pending" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Your email <strong>{email}</strong> is pending approval.
              Admissions will review your request.
            </p>
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => navigate("/")}>
                Back to home
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
