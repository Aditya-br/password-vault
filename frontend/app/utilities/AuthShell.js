"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body" });

/* ---------- icons ---------- */
export const ICONS = {
  lock: "M6 11h12a1 1 0 011 1v7a1 1 0 01-1 1H6a1 1 0 01-1-1v-7a1 1 0 011-1zm2 0V8a4 4 0 118 0v3",
  back: "M19 12H5m6-6l-6 6 6 6",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z",
  eyeOff:
    "M3 3l18 18M10.6 6.1A9.8 9.8 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4M6.5 6.9C3.9 8.7 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.3-1M9.9 9.9a3 3 0 004.2 4.2",
  check: "M5 13l4 4L19 7",
  alert: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  shield:
    "M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3zm-3 9l2 2 4-4",
};

export const Icon = ({ d, className = "w-4 h-4" }) => (
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

/* ---------- form pieces ---------- */
const inputClass =
  "w-full rounded-xl border border-[#0E1726]/15 bg-white px-4 py-3 text-[#0E1726] outline-none placeholder:text-[#8A93A3] transition focus:border-[#0E1726] focus:ring-4 focus:ring-[#0E1726]/10";

export function Field({ label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <input id={id} name={id} {...props} className={inputClass} />
    </div>
  );
}

export function PasswordField({ label, id, children, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          {...props}
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center text-[#5B6577] hover:text-[#0E1726] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E1726] rounded-r-xl"
        >
          <Icon d={visible ? ICONS.eyeOff : ICONS.eye} className="w-5 h-5" />
        </button>
      </div>
      {children}
    </div>
  );
}

export function ErrorNotice({ message }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      <Icon d={ICONS.alert} className="mt-0.5 h-5 w-5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

export function SubmitButton({ loading, idle, busy }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0E1726] py-3.5 font-medium text-white shadow-lg shadow-[#0E1726]/20 transition-colors hover:bg-[#1b2940] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E1726]"
    >
      {loading ? (
        <>
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {busy}
        </>
      ) : (
        idle
      )}
    </button>
  );
}

/* ---------- vault dial motif ---------- */
function Dial() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="dial-in absolute -bottom-32 -right-32 h-[520px] w-[520px] text-[#D4A24C] opacity-30"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <circle cx="200" cy="200" r="190" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="170" strokeWidth="6" strokeDasharray="2 10.6" />
      <circle cx="200" cy="200" r="130" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="90" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="14" strokeWidth="1.5" />
      <path d="M200 10v40M200 350v40M10 200h40M350 200h40" strokeWidth="3" />
    </svg>
  );
}

/* ---------- page shell ---------- */
export default function AuthShell({
  title,
  subtitle,
  asideTitle,
  asideText,
  note,
  footer,
  children,
}) {
  const router = useRouter();

  return (
    <div
      className={`${display.variable} ${body.variable} min-h-screen bg-[#ECEFF3] font-[family-name:var(--font-body)] text-[#0E1726] antialiased lg:grid lg:grid-cols-[0.9fr_1.1fr]`}
    >
      <style>{`
        @keyframes dial-in {
          from { opacity: 0; transform: rotate(-50deg); }
          to   { opacity: .3; transform: none; }
        }
        .dial-in { animation: dial-in 1.4s cubic-bezier(.2,.8,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .dial-in { animation: none; } }
      `}</style>

      {/* brand panel */}
      <aside className="relative hidden overflow-hidden bg-[#0E1726] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <button
          onClick={() => router.push("/")}
          className="flex w-fit items-center gap-2.5 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A24C]"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[#D4A24C]">
            <Icon d={ICONS.lock} className="h-5 w-5" />
          </span>
          <span className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
            Secure Vault
          </span>
        </button>

        <Dial />

        <div className="relative z-10 max-w-sm">
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] tracking-[-0.02em]">
            {asideTitle}
          </h2>
          <p className="mt-4 leading-relaxed text-white/60">{asideText}</p>
        </div>
      </aside>

      {/* form panel */}
      <main className="flex min-h-screen flex-col px-6 py-8 sm:px-12 lg:min-h-0">
        <button
          onClick={() => router.push("/")}
          className="flex w-fit items-center gap-2 text-sm font-medium text-[#5B6577] transition-colors hover:text-[#0E1726] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E1726]"
        >
          <Icon d={ICONS.back} className="h-4 w-4" />
          Back
        </button>

        <div className="flex flex-1 items-center">
          <div className="mx-auto w-full max-w-sm py-10">
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-[-0.02em]">
              {title}
            </h1>
            <p className="mb-8 mt-2 text-[#5B6577]">{subtitle}</p>

            {children}

            <div className="mt-6 text-sm text-[#5B6577]">{footer}</div>
          </div>
        </div>

        <p className="mx-auto flex items-center gap-2 text-xs text-[#5B6577]">
          <Icon d={ICONS.shield} className="h-4 w-4" />
          {note}
        </p>
      </main>
    </div>
  );
}