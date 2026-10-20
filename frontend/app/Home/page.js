"use client"
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { usePassword } from '../Context/passwordContext'
import CreateSecret from './createsecret'
import PasswordGenerate from './passwordgenerate'
import ShowSecret from './showsecret'

const Page = () => {
  const router = useRouter();
  const { encryptionKey, sessionToken } = usePassword();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [showChoice, setShowChoice] = useState(false);
  const [customPassword, setCustomPassword] = useState(true);
  const email = useSelector((state) => state.session.email);

  useEffect(() => {
    if (!encryptionKey || !sessionToken) {
      router.replace('/Login');
    }
  }, [encryptionKey, router, sessionToken]);

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

  const handleSecretSaved = () => {
    handleCloseModal();
    setRefreshKey((key) => key + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/50">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Secure Vault</h1>
                <p className="text-purple-300 text-xs">{email}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowChoice(true)}
              className="cursor-pointer px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/50 transition-all duration-200 hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Password
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ShowSecret refreshKey={refreshKey} />
      </main>

      {/* Choice Modal */}
      {showChoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={handleCloseModal}>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Create New Password</h2>
                <p className="text-purple-200 text-sm">Choose how you'd like to create your password</p>
              </div>
              <button onClick={handleCloseModal} className="text-purple-300 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => handleChoice(true)}
                className="cursor-pointer w-full p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-xl transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600/30 transition-colors">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-white font-semibold mb-1 group-hover:text-purple-300 transition-colors">Custom Password</h3>
                    <p className="text-purple-300 text-sm">Enter your own password manually</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => handleChoice(false)}
                className="cursor-pointer w-full p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-xl transition-all group"
              >
                <div className="flex items-start gap-4 ">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600/30 transition-colors">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-left flex-1 ">
                    <h3 className="text-white font-semibold mb-1 group-hover:text-purple-300 transition-colors ">Generate Password</h3>
                    <p className="text-purple-300 text-sm">Create a strong random password</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Generate Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={handleCloseModal}>
          <div className="my-8" onClick={(e) => e.stopPropagation()}>
            {customPassword
              ? <CreateSecret onClose={handleCloseModal} onSaved={handleSecretSaved} />
              : <PasswordGenerate onClose={handleCloseModal} onSaved={handleSecretSaved} />}
          </div>
        </div>
      )}
    </div>
  )
}

export default Page