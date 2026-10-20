"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bricolage_Grotesque,
  Instrument_Sans,
  JetBrains_Mono,
} from "next/font/google";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

/* Sample entries for the live demo card (not real credentials) */
const ENTRIES = [
  { site: "GitHub", user: "dev@example.com", pw: "Tk9#vQ2-lm8Rz!" },
  { site: "Figma", user: "design@example.com", pw: "ro4$Wn7!xPe2Kd" },
  { site: "Bank", user: "me@example.com", pw: "h8Z@q1-Vtb5Ycm" },
];

const FEATURES = [
  {
    title: "Encrypted end to end",
    text: "Your passwords are scrambled before they are stored, so only you can read them.",
  },
  {
    title: "Instant access",
    text: "Find and fill any login in a couple of taps.",
  },
  {
    title: "On all your devices",
    text: "Phone, tablet, laptop. Your vault is always in sync.",
  },
];

/* ---------- small icons ---------- */
const Icon = ({ d, className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);
const LOCK = "M6 11h12a1 1 0 011 1v7a1 1 0 01-1 1H6a1 1 0 01-1-1v-7a1 1 0 011-1zm2 0V8a4 4 0 118 0v3";
const UNLOCK = "M6 11h12a1 1 0 011 1v7a1 1 0 01-1 1H6a1 1 0 01-1-1v-7a1 1 0 011-1zm2 0V8a4 4 0 017.5-2";
const EYE = "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z";
const EYE_OFF = "M3 3l18 18M10.6 6.1A9.8 9.8 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4M6.5 6.9C3.9 8.7 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.3-1M9.9 9.9a3 3 0 004.2 4.2";
const COPY = "M9 9h10a1 1 0 011 1v10a1 1 0 01-1 1H9a1 1 0 01-1-1V10a1 1 0 011-1zM5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1";
const CHECK = "M5 13l4 4L19 7";
const ARROW = "M5 12h14M13 6l6 6-6 6";

/* ---------- demo vault card ---------- */
function VaultDemo() {
  const [unlocked, setUnlocked] = useState(false);
  const [shown, setShown] = useState(null);
  const [copied, setCopied] = useState(null);

  const toggleLock = () => {
    setUnlocked((u) => !u);
    setShown(null);
    setCopied(null);
  };

  const copy = async (i) => {
    try {
      await navigator.clipboard.writeText(ENTRIES[i].pw);
    } catch {}
    setCopied(i);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div className="vault-in relative rounded-3xl bg-[#0E1726] text-white shadow-[0_30px_80px_-20px_rgba(14,23,38,0.55)] ring-1 ring-white/10 overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span
            className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
              unlocked ? "bg-emerald-400" : "bg-[#D4A24C]"
            }`}
          />
          <span className="font-medium">Personal vault</span>
        </div>
        <button
          onClick={toggleLock}
          className="flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 px-3.5 py-1.5 text-sm transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A24C]"
        >
          <Icon d={unlocked ? UNLOCK : LOCK} />
          {unlocked ? "Lock" : "Unlock demo"}
        </button>
      </div>

      {/* rows */}
      <ul className="relative divide-y divide-white/10">
        {ENTRIES.map((e, i) => (
          <li
            key={e.site}
            className={`flex items-center gap-4 px-5 py-4 transition duration-300 ${
              unlocked ? "" : "blur-[5px] select-none"
            }`}
            aria-hidden={!unlocked}
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 font-[family-name:var(--font-display)] text-lg">
              {e.site[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium leading-tight">{e.site}</p>
              <p className="truncate text-sm text-white/50">{e.user}</p>
              <p className="mt-1 truncate font-[family-name:var(--font-mono)] text-sm text-[#D4A24C]">
                {shown === i ? e.pw : "••••••••••••"}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                disabled={!unlocked}
                onClick={() => setShown(shown === i ? null : i)}
                aria-label={shown === i ? `Hide ${e.site} password` : `Show ${e.site} password`}
                className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A24C]"
              >
                <Icon d={shown === i ? EYE_OFF : EYE} className="w-5 h-5" />
              </button>
              <button
                disabled={!unlocked}
                onClick={() => copy(i)}
                aria-label={`Copy ${e.site} password`}
                className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A24C]"
              >
                <Icon d={copied === i ? CHECK : COPY} className="w-5 h-5" />
              </button>
            </div>
          </li>
        ))}

        {!unlocked && (
          <div className="absolute inset-0 grid place-items-center">
            <button
              onClick={toggleLock}
              className="flex items-center gap-2 rounded-full bg-[#D4A24C] px-5 py-2.5 font-medium text-[#0E1726] shadow-lg hover:brightness-110 transition cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Icon d={UNLOCK} />
              Try the vault
            </button>
          </div>
        )}
      </ul>

      {/* footer */}
      <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-sm text-white/50">
        <span>3 items</span>
        <span aria-live="polite">{copied !== null ? "Copied to clipboard" : "Sample data"}</span>
      </div>
    </div>
  );
}

/* ---------- page ---------- */
export default function Home() {
  const router = useRouter();

  // Runs once on mount instead of on every render.
  // Next.js only exposes env vars prefixed with NEXT_PUBLIC_ to the browser.
  useEffect(() => {
    const testBackend = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/`);
        const data = await response.text();
        console.log("Backend test response:", data);
      } catch (err) {
        console.error("Backend connection failed:", err);
      }
    };
    testBackend();
  }, []);

  return (
    <div
      className={`${display.variable} ${body.variable} ${mono.variable} min-h-screen bg-[#ECEFF3] text-[#0E1726] font-[family-name:var(--font-body)] antialiased`}
    >
      <style>{`
        @keyframes vault-in {
          from { opacity: 0; transform: translateY(24px) scale(.98); }
          to   { opacity: 1; transform: none; }
        }
        .vault-in { animation: vault-in .8s cubic-bezier(.2,.8,.2,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .vault-in { animation: none; }
        }
      `}</style>

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 sm:px-10">
        {/* nav */}
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0E1726] text-[#D4A24C]">
              <Icon d={LOCK} className="w-5 h-5" />
            </span>
            <span className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
              Secure Vault
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <button
              onClick={() => router.push("/Login")}
              className="rounded-full px-4 py-2 text-sm font-medium text-[#0E1726]/70 hover:text-[#0E1726] transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E1726]"
            >
              Log in
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="rounded-full bg-[#0E1726] px-5 py-2 text-sm font-medium text-white hover:bg-[#1b2940] transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E1726]"
            >
              Create account
            </button>
          </nav>
        </header>

        {/* hero */}
        <main className="grid flex-1 items-center gap-14 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
          <section>
            <h1 className="font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
              Every password, behind one key.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-[#5B6577]">
              Save your logins once. Open them anywhere, and keep them
              encrypted the whole way.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => router.push("/signup")}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#0E1726] px-7 py-3.5 font-medium text-white shadow-lg shadow-[#0E1726]/20 hover:bg-[#1b2940] transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E1726]"
              >
                Create account
                <Icon
                  d={ARROW}
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                />
              </button>
              <button
                onClick={() => router.push("/Login")}
                className="inline-flex items-center justify-center rounded-full border border-[#0E1726]/20 px-7 py-3.5 font-medium hover:bg-white/60 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E1726]"
              >
                Log in
              </button>
            </div>
          </section>

          <section aria-label="Interactive vault preview">
            <VaultDemo />
          </section>
        </main>

        {/* features */}
        <section className="grid gap-8 border-t border-[#0E1726]/10 py-12 md:grid-cols-3 md:gap-0">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`md:px-8 ${
                i === 0 ? "md:pl-0" : "md:border-l md:border-[#0E1726]/10"
              }`}
            >
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
                {f.title}
              </h3>
              <p className="mt-2 max-w-xs leading-relaxed text-[#5B6577]">
                {f.text}
              </p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}