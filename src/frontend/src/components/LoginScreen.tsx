import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const CREDS_KEY = "amky_credentials";

function getCredentials(): { username: string; password: string } {
  try {
    const stored = localStorage.getItem(CREDS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { username: "admin", password: "amky2001" };
}

function saveCredentials(username: string, password: string) {
  localStorage.setItem(CREDS_KEY, JSON.stringify({ username, password }));
}

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  // Reset dialog state
  const [resetOpen, setResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState<"verify" | "new">("verify");
  const [resetCurrentUser, setResetCurrentUser] = useState("");
  const [resetCurrentPass, setResetCurrentPass] = useState("");
  const [resetNewUser, setResetNewUser] = useState("");
  const [resetNewPass, setResetNewPass] = useState("");
  const [resetConfirmPass, setResetConfirmPass] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const creds = getCredentials();
    if (username.trim() === creds.username && password === creds.password) {
      onLogin();
    } else {
      setError("Invalid credentials. Please try again.");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  const openReset = () => {
    setResetStep("verify");
    setResetCurrentUser("");
    setResetCurrentPass("");
    setResetNewUser("");
    setResetNewPass("");
    setResetConfirmPass("");
    setResetError("");
    setResetSuccess(false);
    setResetOpen(true);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const creds = getCredentials();
    if (
      resetCurrentUser.trim() === creds.username &&
      resetCurrentPass === creds.password
    ) {
      setResetError("");
      setResetStep("new");
    } else {
      setResetError("Current username or password is incorrect.");
    }
  };

  const handleSetNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetNewUser.trim()) {
      setResetError("New username cannot be empty.");
      return;
    }
    if (resetNewPass.length < 4) {
      setResetError("New password must be at least 4 characters.");
      return;
    }
    if (resetNewPass !== resetConfirmPass) {
      setResetError("Passwords do not match.");
      return;
    }
    saveCredentials(resetNewUser.trim(), resetNewPass);
    setResetSuccess(true);
    setResetError("");
    setTimeout(() => setResetOpen(false), 1500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — navy branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, oklch(0.7 0.17 72) 0%, transparent 50%), radial-gradient(circle at 75% 75%, oklch(0.7 0.17 72 / 0.5) 0%, transparent 50%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center text-center gap-8"
        >
          <img
            src="/assets/uploads/Final-Crop-Gif-1-1.gif"
            alt="AMKY & Co"
            className="h-24 w-auto rounded-xl object-contain bg-white/10 p-2 backdrop-blur-sm"
          />
          <div>
            <h1 className="font-display text-4xl font-bold text-white tracking-wide">
              AMKY <span style={{ color: "oklch(0.7 0.17 72)" }}>&amp;</span> Co
            </h1>
            <p className="mt-2 text-white/70 tracking-[0.2em] uppercase text-sm">
              Chartered Accountants
            </p>
          </div>
          <div
            className="h-px w-24"
            style={{ backgroundColor: "oklch(0.7 0.17 72 / 0.6)" }}
          />
          <p className="text-white/60 text-sm max-w-xs leading-relaxed">
            Secure client management portal for professional accounting
            communications.
          </p>
          <div className="mt-4 text-xs text-white/40 text-center">
            <p>Shop No 28, Palika Bazar, Ghodbunder Rd</p>
            <p>Kapurbawdi, Thane West — 400607</p>
          </div>
        </motion.div>
      </div>

      {/* Right panel — login form with solid white background */}
      <div
        className="flex-1 flex items-center justify-center p-6"
        style={{ backgroundColor: "#ffffff" }}
      >
        <motion.div
          animate={shaking ? { x: [-8, 8, -8, 8, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center">
            <img
              src="/assets/uploads/Final-Crop-Gif-1-1.gif"
              alt="AMKY & Co"
              className="h-14 w-auto rounded object-contain border p-1"
              style={{ borderColor: "#e2e8f0" }}
            />
            <div>
              <h1
                className="font-display text-xl font-bold"
                style={{ color: "#1a2a4a" }}
              >
                AMKY <span style={{ color: "oklch(0.7 0.17 72)" }}>&amp;</span>{" "}
                Co
              </h1>
              <p
                className="text-xs tracking-widest uppercase"
                style={{ color: "#64748b" }}
              >
                Chartered Accountants
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: "#1a2a4a" }}
            >
              Welcome back
            </h2>
            <p className="text-sm" style={{ color: "#475569" }}>
              Sign in to your client management portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="login-user"
                className="text-sm font-semibold"
                style={{ color: "#1e293b" }}
              >
                Username
              </Label>
              <Input
                id="login-user"
                data-ocid="login.input"
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="admin"
                className="h-11 text-slate-900 placeholder:text-slate-400 border-slate-300 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="login-pass"
                className="text-sm font-semibold"
                style={{ color: "#1e293b" }}
              >
                Password
              </Label>
              <Input
                id="login-pass"
                data-ocid="login.input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                className="h-11 text-slate-900 placeholder:text-slate-400 border-slate-300 bg-white"
              />
            </div>
            {error && (
              <p
                className="text-sm font-medium text-red-600"
                data-ocid="login.error_state"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              data-ocid="login.submit_button"
              className="w-full h-11 font-semibold text-base"
              style={{
                backgroundColor: "oklch(0.25 0.12 258)",
                color: "white",
              }}
            >
              Sign In
            </Button>
          </form>

          {/* Reset Credentials Button */}
          <div className="space-y-3">
            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span
                className="text-xs uppercase tracking-widest"
                style={{ color: "#94a3b8" }}
              >
                Account
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <Button
              type="button"
              variant="outline"
              data-ocid="login.open_modal_button"
              onClick={openReset}
              className="w-full gap-2 h-10 font-medium border-2"
              style={{
                borderColor: "oklch(0.7 0.17 72 / 0.5)",
                color: "oklch(0.55 0.15 72)",
                backgroundColor: "transparent",
              }}
            >
              <KeyRound className="h-4 w-4" />
              Reset Login Credentials
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Reset Credentials Dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="sm:max-w-sm" data-ocid="reset.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              {resetStep === "verify"
                ? "Verify Identity"
                : "Set New Credentials"}
            </DialogTitle>
          </DialogHeader>

          {resetSuccess ? (
            <div
              className="py-6 text-center text-sm text-green-600 font-medium"
              data-ocid="reset.success_state"
            >
              Credentials updated successfully!
            </div>
          ) : resetStep === "verify" ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter your current username and password to continue.
              </p>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Current Username</Label>
                <Input
                  data-ocid="reset.input"
                  autoComplete="username"
                  value={resetCurrentUser}
                  onChange={(e) => {
                    setResetCurrentUser(e.target.value);
                    setResetError("");
                  }}
                  placeholder="admin"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Current Password</Label>
                <Input
                  data-ocid="reset.input"
                  type="password"
                  autoComplete="current-password"
                  value={resetCurrentPass}
                  onChange={(e) => {
                    setResetCurrentPass(e.target.value);
                    setResetError("");
                  }}
                  placeholder="••••••••"
                />
              </div>
              {resetError && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="reset.error_state"
                >
                  {resetError}
                </p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="reset.cancel_button"
                  onClick={() => setResetOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  data-ocid="reset.confirm_button"
                  className="bg-primary text-primary-foreground hover:opacity-90"
                >
                  Verify
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleSetNew} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose a new username and password.
              </p>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">New Username</Label>
                <Input
                  data-ocid="reset.input"
                  autoComplete="new-password"
                  value={resetNewUser}
                  onChange={(e) => {
                    setResetNewUser(e.target.value);
                    setResetError("");
                  }}
                  placeholder="e.g. admin"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">New Password</Label>
                <Input
                  data-ocid="reset.input"
                  type="password"
                  autoComplete="new-password"
                  value={resetNewPass}
                  onChange={(e) => {
                    setResetNewPass(e.target.value);
                    setResetError("");
                  }}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Confirm New Password
                </Label>
                <Input
                  data-ocid="reset.input"
                  type="password"
                  autoComplete="new-password"
                  value={resetConfirmPass}
                  onChange={(e) => {
                    setResetConfirmPass(e.target.value);
                    setResetError("");
                  }}
                  placeholder="••••••••"
                />
              </div>
              {resetError && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="reset.error_state"
                >
                  {resetError}
                </p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="reset.cancel_button"
                  onClick={() => setResetOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  data-ocid="reset.submit_button"
                  className="bg-primary text-primary-foreground hover:opacity-90"
                >
                  Save Credentials
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
