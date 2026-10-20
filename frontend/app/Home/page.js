"use client"
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { usePassword } from '../Context/passwordContext'
import CreateSecret from './createsecret'
import PasswordGenerate from './passwordgenerate'
import ShowSecret from './showsecret'
import {
  displayFont,
  bodyFont,
  monoFont,
  Icon,
  ICONS,
  Modal,
  ModalHeader,
} from './vaultui'

const OptionButton = ({ icon, title, text, onClick }) => (
  <button
    onClick={onClick}
    className="group flex w-full items-center gap-4 rounded-2xl border border-[#0E1726]/10 bg-[#F6F8FA] p-4 text-left transition-colors hover:border-[#0E1726]/30 hover:bg-white cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E1726]"
  >
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#0E1726] text-[#D4A24C]">
      <Icon d={icon} className="h-5 w-5" />
    </span>
    <span className="flex-1">
      <span className="block font-medium">{title}</span>
      <span className="block text-sm text-[#5B6577]">{text}</span>
    </span>
  </button>
)

const Page = () => {
  const router = useRouter();
  const { encryptionKey, sessionToken } = usePassword();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [showChoice, setShowChoice] = useState(false);
  const [customPassword, setCustomPassword] = useState(true);
  const [toast, setToast] = useState("");
  const email = useSelector((state) => state.session.email);

  useEffect(() => {
    if (!encryptionKey || !sessionToken) {
      router.replace('/Login');
    }
  }, [encryptionKey, router, sessionToken]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  if (!encryptionKey || !sessionToken) return null;

  const handleChoice = (isCustom) => {
    setCustomPassword(isCustom);
    setShowCreate(true);
    setShowChoice(false);
  };

  const handleCloseModal = () => {
    setShowCreate(false);
    setShowChoice(false);
  };

  const handleSecretSaved = (message) => {
    handleCloseModal();
    setRefreshKey((key) => key + 1);
    if (typeof message === "string") setToast(message);
  };

  return (
    <div
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} min-h-screen bg-[#ECEFF3] font-[family-name:var(--font-body)] text-[#0E1726] antialiased`}
    >
      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: translateY(12px) scale(.98); }
          to   { opacity: 1; transform: none; }
        }
        .modal-in { animation: modal-in .25s cubic-bezier(.2,.8,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .modal-in { animation: none; } }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#0E1726]/10 bg-[#ECEFF3]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0E1726] text-[#D4A24C]">
              <Icon d={ICONS.lock} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="font-[family-name:var(--font-display)] text-lg font-semibold leading-tight tracking-tight">
                Secure Vault
              </h1>
              <p className="truncate text-xs text-[#5B6577]">{email}</p>
            </div>
          </div>

          <button
            onClick={() => setShowChoice(true)}
            aria-label="Add password"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#0E1726] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#0E1726]/20 transition-colors hover:bg-[#1b2940] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E1726] sm:px-5"
          >
            <Icon d={ICONS.plus} className="h-4 w-4" />
            <span className="hidden sm:inline">Add password</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <ShowSecret refreshKey={refreshKey} onAdd={() => setShowChoice(true)} />
      </main>

      {/* Choice Modal */}
      {showChoice && (
        <Modal onClose={handleCloseModal} label="Add a password" maxW="max-w-md">
          <ModalHeader
            title="Add a password"
            subtitle="Choose how to create it."
            onClose={handleCloseModal}
          />
          <div className="space-y-3">
            <OptionButton
              icon={ICONS.pen}
              title="Enter it yourself"
              text="Save a password you already use"
              onClick={() => handleChoice(true)}
            />
            <OptionButton
              icon={ICONS.bolt}
              title="Generate one"
              text="Create a strong random password"
              onClick={() => handleChoice(false)}
            />
          </div>
        </Modal>
      )}

      {/* Create/Generate Modal */}
      {showCreate && (
        <Modal
          onClose={handleCloseModal}
          label={customPassword ? "Save a password" : "Generate a password"}
          maxW="max-w-xl"
        >
          {customPassword
            ? <CreateSecret onClose={handleCloseModal} onSaved={handleSecretSaved} />
            : <PasswordGenerate onClose={handleCloseModal} onSaved={handleSecretSaved} />}
        </Modal>
      )}

      {/* Toast */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4"
      >
        {toast && (
          <div className="modal-in flex items-center gap-2.5 rounded-full bg-[#0E1726] px-5 py-3 text-sm font-medium text-white shadow-2xl">
            <Icon d={ICONS.check} className="h-4 w-4 text-[#D4A24C]" />
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}

export default Page