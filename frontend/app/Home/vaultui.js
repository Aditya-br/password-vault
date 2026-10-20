"use client";
import { useEffect, useState } from "react";
import {
  Bricolage_Grotesque,
  Instrument_Sans,
  JetBrains_Mono,
} from "next/font/google";

export const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});
export const bodyFont = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});
export const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

/* ---------- icons ---------- */
export const ICONS = {
  lock: "M6 11h12a1 1 0 011 1v7a1 1 0 01-1 1H6a1 1 0 01-1-1v-7a1 1 0 011-1zm2 0V8a4 4 0 118 0v3",
  plus: "M12 5v14M5 12h14",
  close: "M6 6l12 12M18 6L6 18",
  pen: "M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7l1-8z",
  copy: "M9 9h10a1 1 0 011 1v10a1 1 0 01-1 1H9a1 1 0 01-1-1V10a1 1 0 011-1zM5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1",
  check: "M5 13l4 4L19 7",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3",
  search: "M11 4a7 7 0 100 14 7 7 0 000-14zm10 17l-4.5-4.5",
  external: "M14 4h6v6M20 4L10 14M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z",
  eyeOff:
    "M3 3l18 18M10.6 6.1A9.8 9.8 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4M6.5 6.9C3.9 8.7 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.3-1M9.9 9.9a3 3 0 004.2 4.2",
  info: "M12 11v5m0-8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  alert: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
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

export const Spinner = ({ className = "h-5 w-5" }) => (
  <svg className={`${className} animate-spin motion-reduce:animate-none`} fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

/* ---------- shared class strings ---------- */
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#0E1726] px-5 py-3 font-medium text-white shadow-lg shadow-[#0E1726]/20 transition-colors hover:bg-[#1b2940] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E1726]";
export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#0E1726]/20 px-5 py-3 font-medium text-[#0E1726] transition-colors hover:bg-[#0E1726]/5 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E1726]";
export const inputClass =
  "w-full rounded-xl border border-[#0E1726]/15 bg-[#F6F8FA] px-4 py-3 text-[#0E1726] outline-none placeholder:text-[#8A93A3] transition focus:border-[#0E1726] focus:bg-white focus:ring-4 focus:ring-[#0E1726]/10";

/* ---------- form pieces ---------- */
export function Field({ label, id, optional, multiline, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
        {optional && <span className="ml-1.5 font-normal text-[#5B6577]">(optional)</span>}
      </label>
      {multiline ? (
        <textarea id={id} rows={3} {...props} className={`${inputClass} resize-none`} />
      ) : (
        <input id={id} {...props} className={inputClass} />
      )}
    </div>
  );
}

export function PasswordField({ label, id, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          {...props}
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-[#5B6577] hover:text-[#0E1726] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E1726]"
        >
          <Icon d={visible ? ICONS.eyeOff : ICONS.eye} className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export function ErrorNotice({ message, className = "mb-6" }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={`${className} flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700`}
    >
      <Icon d={ICONS.alert} className="mt-0.5 h-5 w-5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

/* ---------- modal ---------- */
export function Modal({ onClose, label, maxW = "max-w-md", children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0E1726]/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className={`modal-in my-0 max-h-[calc(100dvh-2rem)] w-full overflow-y-auto overscroll-contain ${maxW} rounded-3xl bg-white p-5 text-[#0E1726] shadow-2xl sm:p-8`}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.02em]">
          {title}
        </h2>
        <p className="mt-1 text-sm text-[#5B6577]">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="-mr-2 -mt-1 rounded-lg p-2 text-[#5B6577] transition-colors hover:bg-[#0E1726]/5 hover:text-[#0E1726] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E1726]"
      >
        <Icon d={ICONS.close} className="h-5 w-5" />
      </button>
    </div>
  );
}