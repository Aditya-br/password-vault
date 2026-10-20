"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/Session";
import { usePassword } from "../Context/passwordContext";
import { hashPassword } from "./auth";
import { getApiUrl } from "./apiUrl";
import { generateKey } from "./generatekey";
import { CURRENT_KDF_ITERATIONS } from "./cryptoParams";
import AuthShell, {
  Field,
  PasswordField,
  ErrorNotice,
  SubmitButton,
  Icon,
  ICONS,
} from "./AuthShell";

const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];
const strengthLabels = ["Very weak", "Weak", "Fair", "Good", "Strong"];

const REQUIREMENTS = [
  { key: "length", label: "At least 8 characters (12 or more is better)" },
  { key: "mixed", label: "Upper and lower case letters" },
  { key: "number", label: "A number" },
  { key: "symbol", label: "A special character" },
];

const Signup = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { setEncryptionKey, setSessionToken } = usePassword();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [checks, setChecks] = useState({
    length: false,
    mixed: false,
    number: false,
    symbol: false,
  });

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
    setChecks({
      length: password.length >= 8,
      mixed: /[a-z]/.test(password) && /[A-Z]/.test(password),
      number: /\d/.test(password),
      symbol: /[^a-zA-Z0-9]/.test(password),
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const email = form.get("email").trim();
    const password = form.get("password");

    try {
      const authSalt = crypto.getRandomValues(new Uint8Array(16));
      const encSalt = crypto.getRandomValues(new Uint8Array(16));
      const [passwordHash, encryptionKey] = await Promise.all([
        hashPassword(password, authSalt, CURRENT_KDF_ITERATIONS),
        generateKey(password, encSalt, CURRENT_KDF_ITERATIONS),
      ]);
      const response = await fetch(`${getApiUrl()}signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailid: email,
          passwordHash,
          authIterations: CURRENT_KDF_ITERATIONS,
          encIterations: CURRENT_KDF_ITERATIONS,
          authSalt: Array.from(authSalt),
          encSalt: Array.from(encSalt),
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        dispatch(setUser({ email: email }));
        setEncryptionKey(encryptionKey);
        setSessionToken(data.token);
        router.push("/Home");
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Server error — please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Start securing your passwords today."
      asideTitle="One master password. Everything else stays locked."
      asideText="Pick a strong master password. It unlocks your vault, so only you can open it."
      note="Your master password is never stored or transmitted"
      footer={
        <>
          Already have an account?{" "}
          <button
            onClick={() => router.push("/Login")}
            className="font-semibold text-[#0E1726] underline underline-offset-4 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E1726]"
          >
            Sign in
          </button>
        </>
      }
    >
      <ErrorNotice message={error} />

      <form onSubmit={onSubmit} className="space-y-6">
        <Field
          id="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <PasswordField
          id="password"
          label="Master password"
          placeholder="Create a strong master password"
          autoComplete="new-password"
          required
          onChange={(e) => checkPasswordStrength(e.target.value)}
        >
          {/* strength meter */}
          {passwordStrength > 0 && (
            <div className="mt-3" aria-live="polite">
              <div className="mb-2 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i < passwordStrength
                        ? strengthColors[passwordStrength - 1]
                        : "bg-[#0E1726]/10"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-[#5B6577]">
                Strength: {strengthLabels[passwordStrength - 1]}
              </p>
            </div>
          )}
        </PasswordField>

        {/* live requirements */}
        <ul className="space-y-2 text-sm">
          {REQUIREMENTS.map((r) => {
            const met = checks[r.key];
            return (
              <li
                key={r.key}
                className={`flex items-center gap-2.5 transition-colors ${
                  met ? "text-[#0E1726]" : "text-[#5B6577]"
                }`}
              >
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full border transition-colors ${
                    met
                      ? "border-[#0E1726] bg-[#0E1726] text-white"
                      : "border-[#0E1726]/20"
                  }`}
                >
                  {met && <Icon d={ICONS.check} className="h-3 w-3" />}
                </span>
                {r.label}
              </li>
            );
          })}
        </ul>

        <SubmitButton loading={loading} idle="Create account" busy="Creating account…" />
      </form>
    </AuthShell>
  );
};

export default Signup;