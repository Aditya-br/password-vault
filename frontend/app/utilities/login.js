"use client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/Session";
import { useRouter } from "next/navigation";
import { usePassword } from "../Context/passwordContext";
import { createLoginProof } from "./auth";
import { getApiUrl } from "./apiUrl";
import { generateKey } from "./generatekey";
import AuthShell, {
  Field,
  PasswordField,
  ErrorNotice,
  SubmitButton,
} from "./AuthShell";

async function readApiResponse(response, endpoint) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json") && !contentType.includes("+json")) {
    const deploymentHint = response.status === 404
      ? " The backend may not be deployed with the current authentication routes."
      : "";
    throw new Error(
      `The API ${endpoint} returned a non-JSON response (HTTP ${response.status}). Check the backend URL.${deploymentHint}`
    );
  }

  try {
    return await response.json();
  } catch {
    throw new Error(`The API ${endpoint} returned invalid JSON (HTTP ${response.status}).`);
  }
}

const Login = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { setEncryptionKey, setSessionToken } = usePassword();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const email = form.get("email").trim();
    const password = form.get("password");

    try {
      const apiUrl = getApiUrl();
      const challengeResponse = await fetch(`${apiUrl}auth-challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailid: email }),
      });
      const challenge = await readApiResponse(challengeResponse, "/auth-challenge");
      if (!challengeResponse.ok) {
        setError(challenge.error || "Login failed. Please check your credentials.");
        return;
      }

      const [proof, encryptionKey] = await Promise.all([
        createLoginProof(password, challenge.authSalt, challenge.nonce, challenge.authIterations),
        generateKey(password, new Uint8Array(challenge.encSalt), challenge.encIterations),
      ]);
      const response = await fetch(`${apiUrl}login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailid: email,
          challengeId: challenge.challengeId,
          proof,
        }),
      });

      const data = await readApiResponse(response, "/login");

      if (response.status === 200) {
        dispatch(setUser({ email: email }));
        setEncryptionKey(encryptionKey);
        setSessionToken(data.token);
        router.push("/Home");
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Server error. Please try again later.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to open your vault."
      asideTitle="Your vault is right where you left it."
      asideText="Enter your master password to unlock your saved logins on this device."
      note="Your connection is encrypted and secure"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <button
            onClick={() => router.push("/signup")}
            className="font-semibold text-[#0E1726] underline underline-offset-4 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E1726]"
          >
            Create one
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
          autoComplete="username"
          required
        />
        <PasswordField
          id="password"
          label="Master password"
          placeholder="Enter your master password"
          autoComplete="current-password"
          required
        />
        <SubmitButton loading={loading} idle="Log in" busy="Logging in…" />
      </form>
    </AuthShell>
  );
};

export default Login;