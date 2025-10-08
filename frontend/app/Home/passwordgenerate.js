"use client"
import React, { useState } from 'react'
import { usePassword } from '../Context/passwordContext';
import { useSelector } from 'react-redux';

const PasswordGenerate = ({ onClose }) => {
    const { masterPassword } = usePassword();
    const email = useSelector((state) => state.session.email);
    const [label, setLabel] = useState("");
    const [length, setLength] = useState(16);
    const [username, setUsername] = useState("");
    const [url, setUrl] = useState("");
    const [note, setNote] = useState("");
    const [useUppercase, setUseUppercase] = useState(true);
    const [useLowercase, setUseLowercase] = useState(true);
    const [useNumbers, setUseNumbers] = useState(true);
    const [useSpecialCharacters, setUseSpecialCharacters] = useState(true);
    const [useLookAlikes, setUseLookAlikes] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCreateSecret = async () => {
        if (!label.trim()) {
            setError("Label is required");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const response = await fetch(`https://password-vault-ylej.onrender.com/generatepassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailid: email,
                    masterPassword: masterPassword,
                    label: label,
                    username: username,
                    url: url,
                    note: note,
                    length: parseInt(length),
                    useUppercase: useUppercase,
                    useLowercase: useLowercase,
                    useNumbers: useNumbers,
                    useSpecial: useSpecialCharacters,
                    useLookAlikes: useLookAlikes,
                })
            });
            if (response.status === 201) {
                const data = await response.json();
                setLabel("");
                if (onClose) onClose();
                alert('Password generated and saved!');
                window.location.reload();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to generate password');
            }
        } catch (error) {
            console.error('Error creating secret:', error);
            setError('Server error. Please reload try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 scrollbar-thin scrollbar-thumb-purple-700/40 scrollbar-track-transparent">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Generate Password</h2>
                    <p className="text-purple-200 text-sm">Create a secure random password</p>
                </div>
                <button onClick={onClose} className="text-purple-300 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-red-200 text-sm flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </p>
                </div>
            )}

            <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateSecret();
            }} className="space-y-6">

                {/* Label */}
                <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                        Label / Site Name *
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., Netflix, Gmail, Facebook"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                </div>
                {/* Username */}
                <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                        Username / Email *
                    </label>
                    <input
                        type="text"
                        placeholder="Your username or email"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                </div>
                {/* URL */}
                <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                        Website URL *
                    </label>
                    <input
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                </div>
                {/* Note */}
                <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                        Notes (Optional)
                    </label>
                    <textarea
                        placeholder="Add any additional notes..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    />
                </div>
                {/* Password Length */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-purple-200 text-sm font-medium">
                            Password Length
                        </label>
                        <span className="text-purple-300 font-mono text-lg font-semibold">{length}</span>
                    </div>
                    <input
                        type="range"
                        min="8"
                        max="64"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="flex justify-between text-purple-400 text-xs mt-1">
                        <span>8</span>
                        <span>64</span>
                    </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                    <p className="text-purple-200 text-sm font-medium mb-3">Character Types</p>

                    {/* Uppercase */}
                    <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${useUppercase ? 'bg-purple-600 border-purple-600' : 'border-white/30'
                                }`}>
                                {useUppercase && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-white font-medium">Uppercase Letters</span>
                        </div>
                        <span className="text-purple-400 font-mono text-sm">A-Z</span>
                        <input
                            type="checkbox"
                            checked={useUppercase}
                            onChange={(e) => setUseUppercase(e.target.checked)}
                            className="sr-only"
                        />
                    </label>

                    {/* Lowercase */}
                    <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${useLowercase ? 'bg-purple-600 border-purple-600' : 'border-white/30'
                                }`}>
                                {useLowercase && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-white font-medium">Lowercase Letters</span>
                        </div>
                        <span className="text-purple-400 font-mono text-sm">a-z</span>
                        <input
                            type="checkbox"
                            checked={useLowercase}
                            onChange={(e) => setUseLowercase(e.target.checked)}
                            className="sr-only"
                        />
                    </label>

                    {/* Numbers */}
                    <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${useNumbers ? 'bg-purple-600 border-purple-600' : 'border-white/30'
                                }`}>
                                {useNumbers && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-white font-medium">Numbers</span>
                        </div>
                        <span className="text-purple-400 font-mono text-sm">0-9</span>
                        <input
                            type="checkbox"
                            checked={useNumbers}
                            onChange={(e) => setUseNumbers(e.target.checked)}
                            className="sr-only"
                        />
                    </label>

                    {/* Special Characters */}
                    <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${useSpecialCharacters ? 'bg-purple-600 border-purple-600' : 'border-white/30'
                                }`}>
                                {useSpecialCharacters && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-white font-medium">Special Characters</span>
                        </div>
                        <span className="text-purple-400 font-mono text-sm">!@#$%</span>
                        <input
                            type="checkbox"
                            checked={useSpecialCharacters}
                            onChange={(e) => setUseSpecialCharacters(e.target.checked)}
                            className="sr-only"
                        />
                    </label>

                    {/* Look-alikes */}
                    <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${useLookAlikes ? 'bg-purple-600 border-purple-600' : 'border-white/30'
                                }`}>
                                {useLookAlikes && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-white font-medium">Include Look-alikes</span>
                        </div>
                        <span className="text-purple-400 font-mono text-sm">0OIl</span>
                        <input
                            type="checkbox"
                            checked={useLookAlikes}
                            onChange={(e) => setUseLookAlikes(e.target.checked)}
                            className="sr-only"
                        />
                    </label>
                </div>

                {/* Info Box */}
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-purple-200 text-sm font-medium mb-1">Password Tips</p>
                            <p className="text-purple-300 text-xs">
                                For maximum security, use at least 16 characters with all character types enabled.
                                Disable look-alikes if you need to type the password manually.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg border border-white/10 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="cursor-pointer flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg shadow-purple-500/50 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Generate & Save
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default PasswordGenerate